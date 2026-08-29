import type { PhraseChallenge } from '../../types'

/* The first version used invented names as the wrong answers, which tested
   nothing: spotting a made-up word is a word-shape task, not knowledge. Every
   decoy here is a real, well-known company that did not do YC, so the only way
   through is knowing the portfolio.
   The correct answers are deliberately the surprising ones. Airbnb and Stripe
   are not here because everybody already knows those.
   Every tile has to be beyond dispute. A name anyone argues about is a broken
   answer key, not a hard question, so it comes out. */
export const realYc: PhraseChallenge = {
  id: 'real-yc',
  kind: 'phrases',
  injection: true,
  columns: 3,
  prompt: 'Select the ones that',
  subject: 'actually went through YC',
  hint: 'The obvious ones are not on this list.',
  tiles: [
    { id: 'reddit', text: 'Reddit', correct: true },
    { id: 'twitch', text: 'Twitch', correct: true },
    { id: 'heroku', text: 'Heroku', correct: true },
    { id: 'ginkgo', text: 'Ginkgo Bioworks', correct: true },
    { id: 'boom', text: 'Boom Supersonic', correct: true },
    { id: 'figma', text: 'Figma', correct: false },
    { id: 'notion', text: 'Notion', correct: false },
    { id: 'plaid', text: 'Plaid', correct: false },
    { id: 'robinhood', text: 'Robinhood', correct: false },
  ],
}
