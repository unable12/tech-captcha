export interface Tile {
  id: string
  /** Inline SVG pictogram. */
  art: string
  /** Screen-reader description. Also the answer key in plain sight, which is
      fine: this is entertainment, not security. */
  label: string
  correct: boolean
}

export interface Challenge {
  id: string
  /** Small line above the subject, e.g. "Select all squares with". */
  prompt: string
  /** The big line, e.g. "a car you'd see in San Francisco". */
  subject: string
  hint: string
  tiles: Tile[]
}

export type Grade = 'pass' | 'fail'

export function grade(challenge: Challenge, selected: ReadonlySet<number>): Grade {
  const missed = challenge.tiles.some((t, i) => t.correct && !selected.has(i))
  const wrong = challenge.tiles.some((t, i) => !t.correct && selected.has(i))
  return missed || wrong ? 'fail' : 'pass'
}
