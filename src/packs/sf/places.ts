import type { PhraseChallenge } from '../../types'

/* The wrong answers are all tourist traps, which is the entire joke and also a
   real filter: they are the places someone who has only visited would pick.
   Nine shown from sixteen, so a second run is a different board. */
export const vcSpots: PhraseChallenge = {
  id: 'vc-spots',
  kind: 'phrases',
  injection: true,
  columns: 3,
  show: 9,
  prompt: 'Select everywhere you might',
  subject: 'run into a VC',
  hint: 'Some of these are for tourists.',
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
    { id: 'bucks', text: "Buck's of Woodside", correct: true },
    { id: 'battery', text: 'The Battery', correct: true },
    { id: 'ritual', text: 'Ritual Coffee', correct: true },
    { id: 'hayes', text: 'Hayes Valley', correct: true },
    { id: 'pier-39', text: 'Pier 39', correct: false },
    { id: 'alcatraz', text: 'Alcatraz', correct: false },
    { id: 'ghirardelli', text: 'Ghirardelli Square', correct: false },
    { id: 'wharf', text: "Fisherman's Wharf", correct: false },
    { id: 'lombard', text: 'Lombard Street', correct: false },
    { id: 'full-house', text: 'the Full House house', correct: false },
  ],
}
