import type { PhraseChallenge } from '../../types'

/* One correct tile, so the grid is multiple choice without needing a new
   challenge kind. The answer is not derivable from anything, which is fine
   here for the reason the "select nothing" idea was not: the joke is in the
   options. You read six of these and laugh before you pick one, so a wrong
   answer still paid out.
   "enough, the problem is you" is load-bearing. Without a tile that turns it
   on the person answering, "seven" reads as a joke about there being no women
   rather than a joke about the men counting. */
export const girls: PhraseChallenge = {
  id: 'girls',
  kind: 'phrases',
  injection: true,
  columns: 2,
  show: 6,
  prompt: 'Answer honestly:',
  subject: 'how many girls are there in San Francisco?',
  hint: 'One of these is correct.',
  roast: {
    picked: 'You went with {}.',
    missed: 'The answer was {}.',
  },
  tiles: [
    { id: 'seven', text: 'seven', correct: true },
    { id: 'census', text: 'about four hundred thousand', correct: false },
    { id: 'nine', text: 'nine, but two are visiting', correct: false },
    { id: 'party', text: 'there is one and she is at every party', correct: false },
    { id: 'you', text: 'enough, the problem is you', correct: false },
    { id: 'ipo', text: 'ask again after the IPO', correct: false },
    { id: 'waymos', text: 'fewer than there are Waymos', correct: false },
    { id: 'meta', text: 'this is not a real question', correct: false },
  ],
}
