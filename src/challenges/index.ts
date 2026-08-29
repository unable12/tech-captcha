import type { Challenge } from '../types'
import { carsOfSF } from './cars'
import { boardMeeting } from './board'

export { carsOfSF, boardMeeting }

/** Every rung claims to be easier than the last one. None of them are. */
export const LADDER: readonly Challenge[] = [carsOfSF, boardMeeting]

/** Tiles ship in answer order. Shuffle a copy before showing one. */
export function shuffled(challenge: Challenge): Challenge {
  const tiles = [...challenge.tiles]
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!]
  }
  return { ...challenge, tiles }
}
