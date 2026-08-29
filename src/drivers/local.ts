import type { Driver, Outcome } from './types'
import type { Pack } from '../pack'
import type { Challenge } from '../types'
import { gradeSelection, sample } from '../types'
import { plantInjection } from '../injection'
import { pickTier } from '../tiers'
import { escalation, roastFor } from '../copy'
import { toWire, type WireChallenge } from '../wire'
import { drawLadder } from '../ladder'

/* Answers live in the page. Fine for entertainment, useless as a gate: anyone
   can read them out of the bundle. Use the server driver if it matters. */
export class LocalDriver implements Driver {
  readonly mode = 'local' as const

  #pack: Pack
  #ladder: Challenge[]
  #current: Challenge
  #trapIndex: number | null = null
  #attempts = 0
  #rung = 0
  #escaped = false
  #trapped = false
  #failures = 0
  #roast: string | null = null
  #startedAt = 0

  constructor(pack: Pack) {
    this.#pack = pack
    this.#ladder = drawLadder(pack)
    this.#current = this.#ladder[0]!
  }

  async start(): Promise<{ challenge: WireChallenge; escapeLabel: string }> {
    this.#startedAt = performance.now()
    return {
      challenge: this.#serve(this.#ladder[0]!),
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
      this.#current.kind === 'text'
        ? this.#current.accepts(value)
        : gradeSelection(this.#current, new Set(selected))

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
        ...(this.#roast ? { roast: this.#roast } : {}),
      }
    }

    this.#failures++
    if (this.#roast === null && this.#current.kind !== 'text') {
      this.#roast = roastFor(this.#current, selected)
    }
    if (!this.#escaped) {
      this.#rung = Math.min(this.#rung + 1, this.#ladder.length - 1)
    }

    return {
      passed: false,
      trapped: this.#trapped,
      status: this.#trapped ? 'Good bot.' : escalation(this.#failures),
      challenge: this.#serve(
        this.#escaped ? this.#pack.escape.challenge : this.#ladder[this.#rung]!,
      ),
    }
  }

  #serve(challenge: Challenge): WireChallenge {
    const served = sample(challenge)
    this.#current = served

    const injection =
      served.kind !== 'text' && served.injection ? plantInjection(served) : null
    this.#trapIndex = injection?.index ?? null

    return toWire(served, injection?.line ?? null)
  }
}
