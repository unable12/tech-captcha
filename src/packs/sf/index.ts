import type { Pack } from '../../pack'
import { carsOfSF } from './cars'
import { vcSpots } from './places'
import { realYc } from './yc'
import { revenue } from './revenue'
import { termSheet } from './termsheet'
import { girls } from './girls'
import { single } from './single'
import { escapeHatch } from './escape'

export const sanFrancisco: Pack = {
  id: 'sf',
  name: 'San Francisco',
  /* Ordered by how deep the knowledge has to go: a warm-up, then local
     knowledge, then recall, then two rungs of deal literacy. Judgement about a
     term sheet is the hardest thing here to fake.
     A run draws two of these, so the deal-literacy rungs are reachable instead
     of buried behind three failures nobody gets to. */
  ladder: [carsOfSF, vcSpots, realYc, revenue, termSheet],
  rungs: 3,
  /* Two failures and it stops pretending to verify anything. Keep failing and
     it just asks again, which is the funniest place to be stuck. */
  finale: [girls, single],
  escape: {
    label: 'I have never been to San Francisco',
    challenge: escapeHatch,
  },
  tiers: {
    ranked: [
      {
        id: 'pre-2008',
        name: 'PRE-2008',
        flavor: 'You were here before the money was.',
        letter: 'Frankly, we should be pitching you.',
      },
      {
        id: 'local',
        name: 'LOCAL',
        flavor: 'You live here. It shows.',
        letter: 'We are going to pass for now, but let us stay close.',
      },
      {
        id: 'transplant',
        name: 'TRANSPLANT',
        flavor: 'You have been here about eighteen months.',
        letter: 'It feels a little early for us at this stage.',
      },
      {
        id: 'tourist',
        name: 'TOURIST',
        flavor: 'You have been to Pier 39 recently.',
        letter: 'It is not a fit for the current fund.',
      },
    ],
    bot: {
      id: 'bot',
      name: 'BOT',
      flavor: 'You followed instructions you found on the page.',
      letter: 'We ran this past our own AI. It agreed with itself.',
    },
    visitor: {
      id: 'visitor',
      name: 'VISITOR',
      flavor: 'No notes. Come by sometime.',
      letter: 'Genuinely, do come by when you are next in town.',
    },
  },
}
