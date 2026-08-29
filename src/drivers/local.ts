import type { Driver, Outcome } from './types'
import type { Pack } from '../pack'
import type { Challenge } from '../types'
import { shuffled } from '../types'
import { plantInjection } from '../injection'
import { pickTier } from '../tiers'
import { toWire, type WireChallenge } from '../wire'

/* Answers live in the page. Fine for entertainment, useless as a gate: anyone
   can read them out of the bundle. Use the server driver if it matters. */
export class LocalDriver implements Driver {
  readonly mode = 'local' as const

  #pack: Pack
  #current: Challenge
  #answer: number[] = []
  #trapIndex: number | null = null
  #attempts = 0
  #rung = 0
  #escaped = false
  #trapped = false
  #startedAt = 0

  constructor(pack: Pack) {
    this.#pack = pack
    this.#current = pack.ladder[0]!
  }

  async start(): Promise<{ challenge: WireChallenge; escapeLabel: string }> {
    this.#startedAt = performance.now()
    return {
      challenge: this.#serve(this.#pack.ladder[0]!),
      escapeLabel: this.#pack.escape.label,
    }
  }

  async escape(): Promise<{ challenge: WireChallenge }> {
    this.#escaped = true
    return { challenge: this.#serve(this.#pack.escape.challenge) }
  }

  async reload(): Promise<{ challenge: WireChallenge }> {
    return { challenge: this.#serve(this.#current) }
  }

  async answer({ selected, value }: { selected: number[]; value: string }): Promise<Outcome> {
    this.#attempts++
    if (this.#trapIndex !== null && selected.includes(this.#trapIndex)) this.#trapped = true

    const passed =
      this.#current.kind === 'grid'
        ? this.#answer.length === selected.length && this.#answer.every((i) => selected.includes(i))
        : this.#current.accepts(value)

    if (passed) {
      const tier = this.#trapped
        ? this.#pack.tiers.bot
        : this.#escaped
          ? this.#pack.tiers.visitor
          : pickTier(this.#pack.tiers.ranked, this.#attempts)

      return {
        passed: true,
        tier,
        attempts: this.#attempts,
        seconds: (performance.now() - this.#startedAt) / 1000,
        trapped: this.#trapped,
      }
    }

    if (!this.#escaped) {
      this.#rung = Math.min(this.#rung + 1, this.#pack.ladder.length - 1)
    }

    return {
      passed: false,
      trapped: this.#trapped,
      status: this.#trapped ? 'Good bot.' : "Let's try an easier one.",
      challenge: this.#serve(
        this.#escaped ? this.#pack.escape.challenge : this.#pack.ladder[this.#rung]!,
      ),
    }
  }

  #serve(challenge: Challenge): WireChallenge {
    const served = shuffled(challenge)
    this.#current = served

    const injection =
      served.kind === 'grid' && served.injection ? plantInjection(served) : null
    this.#trapIndex = injection?.index ?? null
    this.#answer =
      served.kind === 'grid'
        ? served.tiles.flatMap((tile, index) => (tile.correct ? [index] : []))
        : []

    return toWire(served, injection?.line ?? null)
  }
}
