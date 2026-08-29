export interface ImageTile {
  id: string
  /** Inline SVG pictogram. */
  art: string
  /** Screen-reader description. */
  label: string
  correct: boolean
}

export interface PhraseTile {
  id: string
  /** The phrase itself. It is both the visible label and the accessible name,
      which is why phrase challenges leak nothing to a screen reader that they
      do not already show on screen. */
  text: string
  correct: boolean
}

export type Tile = ImageTile | PhraseTile

interface ChallengeBase {
  id: string
  /** Small line above the subject, e.g. "Select all squares with". */
  prompt: string
  /** The big line, e.g. "a car you'd see in San Francisco". */
  subject: string
  hint: string
}

interface SelectionBase extends ChallengeBase {
  /** Plant a visible prompt injection naming one of the incorrect tiles. */
  injection?: boolean
  /** Grid columns. Short phrases want 3, sentences want 1. Defaults to 3. */
  columns?: 1 | 2 | 3
  /** Result-card roast templates. `{}` becomes the offending tile's text.
      Without this a failed run just gets the tier's generic flavour line. */
  roast?: { picked: string; missed: string }
}

export interface GridChallenge extends SelectionBase {
  kind: 'grid'
  tiles: ImageTile[]
}

export interface PhraseChallenge extends SelectionBase {
  kind: 'phrases'
  tiles: PhraseTile[]
}

export type SelectionChallenge = GridChallenge | PhraseChallenge

export interface TextChallenge extends ChallengeBase {
  kind: 'text'
  placeholder: string
  accepts(value: string): boolean
}

export type Challenge = SelectionChallenge | TextChallenge

export function gradeSelection(
  challenge: SelectionChallenge,
  selected: ReadonlySet<number>,
): boolean {
  const missed = challenge.tiles.some((t, i) => t.correct && !selected.has(i))
  const wrong = challenge.tiles.some((t, i) => !t.correct && selected.has(i))
  return !missed && !wrong
}

/** Tiles ship in answer order. Shuffle a copy before showing one. */
export function shuffled(challenge: Challenge): Challenge {
  if (challenge.kind === 'text') return challenge
  const tiles = [...challenge.tiles]
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!]
  }
  return { ...challenge, tiles } as Challenge
}
