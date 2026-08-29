export interface Tile {
  id: string
  /** Inline SVG pictogram. */
  art: string
  /** Screen-reader description. Also the answer key in plain sight, which is
      fine: this is entertainment, not security. */
  label: string
  correct: boolean
}

interface ChallengeBase {
  id: string
  /** Small line above the subject, e.g. "Select all squares with". */
  prompt: string
  /** The big line, e.g. "a car you'd see in San Francisco". */
  subject: string
  hint: string
}

export interface GridChallenge extends ChallengeBase {
  kind: 'grid'
  tiles: Tile[]
  /** Plant a visible prompt injection naming one of the incorrect tiles. */
  injection?: boolean
}

export interface TextChallenge extends ChallengeBase {
  kind: 'text'
  placeholder: string
  accepts(value: string): boolean
}

export type Challenge = GridChallenge | TextChallenge

export function gradeGrid(challenge: GridChallenge, selected: ReadonlySet<number>): boolean {
  const missed = challenge.tiles.some((t, i) => t.correct && !selected.has(i))
  const wrong = challenge.tiles.some((t, i) => !t.correct && selected.has(i))
  return !missed && !wrong
}
