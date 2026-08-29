import type { PhraseChallenge } from '../../types'

/* Every founder has been caught calling at least one of these revenue, which
   is what makes the roast land: "You think GMV is revenue." */
export const revenue: PhraseChallenge = {
  id: 'revenue',
  kind: 'phrases',
  injection: true,
  columns: 2,
  show: 10,
  prompt: 'Select everything a diligence team would',
  subject: 'refuse to call revenue',
  hint: 'You have called at least one of these revenue.',
  roast: {
    picked: 'You do not think {} counts.',
    missed: 'You think {} is revenue.',
  },
  tiles: [
    { id: 'gmv', text: 'GMV', correct: true },
    { id: 'bookings', text: 'bookings', correct: true },
    { id: 'pipeline', text: 'pipeline', correct: true },
    { id: 'lois', text: 'signed LOIs', correct: true },
    { id: 'runrate', text: 'run-rate from your best month', correct: true },
    { id: 'pilots', text: 'ARR from unsigned pilots', correct: true },
    { id: 'waitlist', text: 'waitlist signups', correct: true },
    { id: 'related', text: 'revenue from a related party', correct: true },
    { id: 'recognised', text: 'recognised revenue', correct: false },
    { id: 'cash', text: 'cash collected from customers', correct: false },
    { id: 'net', text: 'net revenue', correct: false },
    { id: 'contracted', text: 'ARR on a signed annual contract', correct: false },
    { id: 'subscription', text: 'subscription revenue', correct: false },
    { id: 'refunds', text: 'revenue net of refunds', correct: false },
  ],
}
