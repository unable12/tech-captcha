import type { PhraseChallenge } from '../../types'

/* The other half of the pair. By the time the captcha is asking this it has
   stopped pretending to verify anything. */
export const single: PhraseChallenge = {
  id: 'single',
  kind: 'phrases',
  injection: true,
  columns: 2,
  show: 6,
  prompt: 'Be realistic:',
  subject: 'how long are you going to be single?',
  hint: 'One of these is correct.',
  roast: {
    picked: 'You said {}.',
    missed: 'The answer was {}.',
  },
  tiles: [
    { id: 'series-b', text: 'until Series B', correct: true },
    { id: 'cliff', text: 'until the cliff vests', correct: false },
    { id: 'runway', text: 'eighteen months, same as the runway', correct: false },
    { id: 'cofounder', text: 'you are not single, you have a co-founder', correct: false },
    { id: 'marina', text: 'until you move out of the Marina', correct: false },
    { id: 'substack', text: 'until someone reads your Substack', correct: false },
    { id: 'therapist', text: 'that is between you and your therapist', correct: false },
    { id: 'meta', text: 'this is a captcha', correct: false },
  ],
}
