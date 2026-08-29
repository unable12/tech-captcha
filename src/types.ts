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
  /** How many tiles to show from the pool. Omit to show all of them.
      A pool bigger than what it shows is what makes a second run different
      from the first, so it is worth writing more tiles than fit. */
  show?: number
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

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Both sides need enough tiles to stay a question rather than a formality,
    and the injection needs a decoy to hide behind. */
const MIN_EACH = 2

/** Shuffles, and draws a subset when the challenge declares one. Tiles ship in
    answer order, so nothing may be shown to a browser without going through
    here first. */
export function sample(challenge: Challenge): Challenge {
  if (challenge.kind === 'text') return challenge

  const pool: Tile[] = challenge.tiles
  const show = Math.min(challenge.show ?? pool.length, pool.length)
  if (show >= pool.length) {
    return { ...challenge, tiles: shuffle(pool) } as Challenge
  }

  const correct = shuffle(pool.filter((tile) => tile.correct))
  const wrong = shuffle(pool.filter((tile) => !tile.correct))

  const minWrong = Math.min(MIN_EACH, wrong.length)
  const maxWrong = Math.min(wrong.length, show - Math.min(MIN_EACH, correct.length))
  const wrongCount =
    maxWrong <= minWrong
      ? minWrong
      : minWrong + Math.floor(Math.random() * (maxWrong - minWrong + 1))

  let taken = [...correct.slice(0, show - wrongCount), ...wrong.slice(0, wrongCount)]
  // A short correct pool leaves a gap; fill it from whichever side has spare.
  if (taken.length < show) {
    const spare = [...correct.slice(show - wrongCount), ...wrong.slice(wrongCount)]
    taken = [...taken, ...spare.slice(0, show - taken.length)]
  }

  return { ...challenge, tiles: shuffle(taken) } as Challenge
}
