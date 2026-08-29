import type { Challenge, TextChallenge } from './types'
import type { Tier } from './tiers'

/* A pack is one scene's worth of captcha: its challenges, its way out, and its
   own names for how well you did. Nothing in here is San Francisco specific,
   which is the point. */
export interface Pack {
  id: string
  /** Human name of the scene, e.g. "San Francisco". */
  name: string
  /** The straight challenges, ordered easiest first. A run draws from these
      rather than serving all of them, so a second run is a different ladder. */
  ladder: readonly Challenge[]
  /** How many rungs a run serves, including the finale. Omit to use them all. */
  rungs?: number
  /** Every run ends on one of these. The point is that the captcha stops
      pretending to verify anything, so it has to be reachable rather than
      buried at the bottom of a ladder nobody finishes. */
  finale?: readonly Challenge[]
  escape: {
    /** Text of the opt-out link, e.g. "I have never been to San Francisco". */
    label: string
    challenge: TextChallenge
  }
  tiers: {
    /** Best first. A first-attempt pass gets ranked[0]. */
    ranked: readonly Tier[]
    /** Awarded for following the planted injection. Overrides everything. */
    bot: Tier
    /** Awarded for taking the escape hatch. Never a punishment. */
    visitor: Tier
  }
}

const packs = new Map<string, Pack>()

export function registerPack(pack: Pack): void {
  packs.set(pack.id, pack)
}

export function getPack(id: string): Pack | undefined {
  return packs.get(id)
}

export function packIds(): string[] {
  return [...packs.keys()]
}
