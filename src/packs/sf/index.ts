import type { Pack } from '../../pack'
import { carsOfSF } from './cars'
import { vcSpots } from './places'
import { realYc } from './yc'
import { escapeHatch } from './escape'

export const sanFrancisco: Pack = {
  id: 'sf',
  name: 'San Francisco',
  ladder: [carsOfSF, vcSpots, realYc],
  escape: {
    label: 'I have never been to San Francisco',
    challenge: escapeHatch,
  },
  tiers: {
    ranked: [
      { id: 'pre-2008', name: 'PRE-2008', flavor: 'You were here before the money was.' },
      { id: 'local', name: 'LOCAL', flavor: 'You live here. It shows.' },
      { id: 'transplant', name: 'TRANSPLANT', flavor: 'You have been here about eighteen months.' },
      { id: 'tourist', name: 'TOURIST', flavor: 'You have been to Pier 39 recently.' },
    ],
    bot: {
      id: 'bot',
      name: 'BOT',
      flavor: 'You followed instructions you found on the page.',
    },
    visitor: {
      id: 'visitor',
      name: 'VISITOR',
      flavor: 'No notes. Come by sometime.',
    },
  },
}
