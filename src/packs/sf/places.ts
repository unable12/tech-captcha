import type { PhraseChallenge } from '../../types'

/* The wrong answers are all tourist traps, which is the entire joke and also a
   real filter: they are the places someone who has only visited would pick. */
export const vcSpots: PhraseChallenge = {
  id: 'vc-spots',
  kind: 'phrases',
  injection: true,
  columns: 3,
  prompt: 'Select everywhere you might',
  subject: 'run into a VC',
  hint: 'Three of these are for tourists.',
  roast: {
    picked: 'You would look for a VC at {}.',
    missed: 'You have never been to {}.',
  },
  tiles: [
    { id: 'south-park', text: 'South Park', correct: true },
    { id: 'blue-bottle', text: 'Blue Bottle', correct: true },
    { id: 'sand-hill', text: 'Sand Hill Road', correct: true },
    { id: 'rosewood', text: 'The Rosewood', correct: true },
    { id: 'sightglass', text: 'Sightglass', correct: true },
    { id: 'barrys', text: "Barry's, 6am", correct: true },
    { id: 'pier-39', text: 'Pier 39', correct: false },
    { id: 'alcatraz', text: 'Alcatraz', correct: false },
    { id: 'ghirardelli', text: 'Ghirardelli Square', correct: false },
  ],
}
