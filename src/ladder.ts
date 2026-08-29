import type { Pack } from './pack'
import type { Challenge } from './types'

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Every challenge a pack can serve, for resolving a stored rung id. */
export function allChallenges(pack: Pack): readonly Challenge[] {
  return [...pack.ladder, ...(pack.finale ?? []), pack.escape.challenge]
}

export function challengeById(pack: Pack, id: string): Challenge | null {
  return allChallenges(pack).find((challenge) => challenge.id === id) ?? null
}

/* Draws one run's worth of rungs: a random subset of the straight challenges
   kept in their declared order so difficulty still climbs, then one finale.
   Keeping the order matters. Shuffling the ladder outright would open on the
   term sheet, which is a wall rather than a warm-up. */
export function drawLadder(pack: Pack): Challenge[] {
  const finale = pack.finale?.length ? [shuffle(pack.finale)[0]!] : []
  const want = Math.max(1, (pack.rungs ?? pack.ladder.length + finale.length) - finale.length)

  const positions = shuffle(pack.ladder.map((_, index) => index))
    .slice(0, Math.min(want, pack.ladder.length))
    .sort((a, b) => a - b)

  return [...positions.map((index) => pack.ladder[index]!), ...finale]
}
