export interface Tier {
  id: string
  name: string
  flavor: string
  /** Body of the rejection letter. Optional: without it every tier gets the
      same generic brush-off, which is still funny but less so. */
  letter?: string
}

/** `ranked` is best first, so index 0 is a first-attempt pass. Anyone past the
    end of the list gets the worst tier rather than nothing. */
export function pickTier(ranked: readonly Tier[], attempts: number): Tier {
  return ranked[Math.min(attempts - 1, ranked.length - 1)] ?? ranked[ranked.length - 1]!
}
