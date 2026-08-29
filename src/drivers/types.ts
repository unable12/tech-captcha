import type { Tier } from '../tiers'
import type { WireChallenge } from '../wire'

export interface Outcome {
  passed: boolean
  /** Copy for the footer when the attempt failed. */
  status?: string
  challenge?: WireChallenge
  tier?: Tier
  attempts?: number
  seconds?: number
  trapped?: boolean
  /** Names the run's first mistake. Replaces the tier's flavour line. */
  roast?: string
  /** Present only in server mode. Hand this to your own backend. */
  token?: string
}

/* Everything the element needs, whether the answers live in the page or on a
   server. The element renders and calls these; it does no grading of its own. */
export interface Driver {
  readonly mode: 'local' | 'server'
  start(): Promise<{ challenge: WireChallenge; escapeLabel: string }>
  answer(input: { selected: number[]; value: string }): Promise<Outcome>
  escape(): Promise<{ challenge: WireChallenge }>
  reload(): Promise<{ challenge: WireChallenge }>
}
