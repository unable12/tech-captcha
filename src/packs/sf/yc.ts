import type { PhraseChallenge } from '../../types'

/* Real YC names are already absurd enough that the invented ones are hard to
   pick out. The three decoys are deliberate nonsense compounds rather than
   plausible real startups, so this cannot accidentally libel anyone. */
export const realYc: PhraseChallenge = {
  id: 'real-yc',
  kind: 'phrases',
  injection: true,
  columns: 3,
  prompt: 'Select the ones that are',
  subject: 'actually YC companies',
  hint: 'Three of these do not exist.',
  tiles: [
    { id: 'airbnb', text: 'Airbnb', correct: true },
    { id: 'stripe', text: 'Stripe', correct: true },
    { id: 'doordash', text: 'DoorDash', correct: true },
    { id: 'twitch', text: 'Twitch', correct: true },
    { id: 'flexport', text: 'Flexport', correct: true },
    { id: 'brex', text: 'Brex', correct: true },
    { id: 'grainloop', text: 'Grainloop', correct: false },
    { id: 'hexpond', text: 'Hexpond', correct: false },
    { id: 'murmurate', text: 'Murmurate', correct: false },
  ],
}
