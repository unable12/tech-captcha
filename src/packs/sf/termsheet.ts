import type { PhraseChallenge } from '../../types'

/* The deepest insider test in the pack, and the only one that asks for
   judgement rather than recall. Anyone who has raised knows full ratchet is a
   knife. Anyone who has not sees fourteen pieces of Latin.
   Every clause here is either market standard or plainly founder-hostile, with
   nothing in the contested middle, because a tile people argue about is a
   broken answer key. */
export const termSheet: PhraseChallenge = {
  id: 'term-sheet',
  kind: 'phrases',
  injection: true,
  columns: 2,
  show: 10,
  prompt: 'Select everything in this term sheet that is',
  subject: 'working against you',
  hint: 'The rest of it is market standard.',
  roast: {
    picked: 'You would walk away over {}.',
    missed: 'You would have signed {}.',
  },
  tiles: [
    { id: 'participating', text: '2x participating preferred', correct: true },
    { id: 'ratchet', text: 'full ratchet anti-dilution', correct: true },
    { id: 'redemption', text: 'redemption rights', correct: true },
    { id: 'dividends', text: 'cumulative dividends', correct: true },
    { id: 'revest', text: 'founder vesting restarting at close', correct: true },
    { id: 'noshop-long', text: 'a 120-day no-shop', correct: true },
    { id: 'board', text: 'investor control of the board at seed', correct: true },
    { id: 'nonparticipating', text: '1x non-participating preferred', correct: false },
    { id: 'weighted', text: 'broad-based weighted average anti-dilution', correct: false },
    { id: 'prorata', text: 'pro rata rights', correct: false },
    { id: 'noshop-short', text: 'a 30-day no-shop', correct: false },
    { id: 'drag', text: 'drag-along rights', correct: false },
    { id: 'vest', text: 'a four-year vest with a one-year cliff', correct: false },
    { id: 'info', text: 'information rights', correct: false },
  ],
}
