import type { SelectionChallenge, Tile } from './types'

/* The bit never changes: every rung claims to be easier than the last one.
   It just gets less plausible each time. */
const ESCALATION = [
  "Let's try an easier one.",
  "Let's try an easier one.",
  'This one is easier.',
  'We are running out of easier ones.',
  'This is the easiest one we have.',
]

export function escalation(failures: number): string {
  return ESCALATION[Math.min(Math.max(failures, 1) - 1, ESCALATION.length - 1)]!
}

function label(tile: Tile): string {
  return 'text' in tile ? tile.text : tile.label
}

/* Tiles are written to stand alone ("A stretch limo"), but a roast drops them
   mid-sentence. A leading article is a reliable tell that the phrase is a
   common noun rather than a name, so only those get lowered: "a stretch limo"
   and "the Rosewood", but Figma stays Figma. */
function inSentence(text: string): string {
  return /^(A|An|The) /.test(text) ? text[0]!.toLowerCase() + text.slice(1) : text
}

/** The first mistake of a run, phrased by whichever challenge caught it.
    Picking a decoy is more damning than missing an answer, so it wins. */
export function roastFor(
  challenge: SelectionChallenge,
  selected: readonly number[],
): string | null {
  if (!challenge.roast) return null
  const chosen = new Set(selected)

  const picked = challenge.tiles.find((tile, index) => !tile.correct && chosen.has(index))
  if (picked) return challenge.roast.picked.replace('{}', inSentence(label(picked)))

  const missed = challenge.tiles.find((tile, index) => tile.correct && !chosen.has(index))
  if (missed) return challenge.roast.missed.replace('{}', inSentence(label(missed)))

  return null
}
