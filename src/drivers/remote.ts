import type { Driver, Outcome } from './types'
import type { WireChallenge } from '../wire'

interface StartResponse {
  session: string
  escapeLabel: string
  challenge: WireChallenge
}

interface AttemptResponse {
  passed: boolean
  status?: string
  challenge?: WireChallenge
  tier?: Outcome['tier']
  attempts?: number
  trapped?: boolean
  token?: string
  error?: string
}

/* The browser never sees which tiles are correct. It posts what was selected
   and is told yes or no. */
export class RemoteDriver implements Driver {
  readonly mode = 'server' as const

  #endpoint: string
  #packId: string | null
  #session = ''
  #startedAt = 0

  constructor(endpoint: string, packId: string | null) {
    this.#endpoint = endpoint.replace(/\/$/, '')
    this.#packId = packId
  }

  async start(): Promise<{ challenge: WireChallenge; escapeLabel: string }> {
    this.#startedAt = performance.now()
    const data = await this.#post<StartResponse>('session', {
      ...(this.#packId ? { pack: this.#packId } : {}),
    })
    this.#session = data.session
    return { challenge: data.challenge, escapeLabel: data.escapeLabel }
  }

  async escape(): Promise<{ challenge: WireChallenge }> {
    const data = await this.#attempt({ action: 'escape' })
    return { challenge: data.challenge! }
  }

  async reload(): Promise<{ challenge: WireChallenge }> {
    const data = await this.#attempt({ action: 'reload' })
    return { challenge: data.challenge! }
  }

  async answer({ selected, value }: { selected: number[]; value: string }): Promise<Outcome> {
    const data = await this.#attempt({ action: 'answer', selected, value })

    if (!data.passed) {
      return {
        passed: false,
        status: data.status,
        challenge: data.challenge,
        trapped: data.trapped,
      }
    }

    return {
      passed: true,
      tier: data.tier,
      attempts: data.attempts,
      seconds: (performance.now() - this.#startedAt) / 1000,
      trapped: data.trapped ?? false,
      token: data.token,
    }
  }

  #attempt(body: Record<string, unknown>): Promise<AttemptResponse> {
    return this.#post<AttemptResponse>('attempt', { session: this.#session, ...body })
  }

  async #post<T>(route: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.#endpoint}/${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      // 410 expired, 429 exhausted. Both mean: start over.
      throw new Error(`tech-captcha: ${route} failed with ${response.status}`)
    }
    return (await response.json()) as T
  }
}
