import type { Pack } from '../../pack'
import { carsOfSF } from './cars'
import { boardMeeting } from './board'
import { escapeHatch } from './escape'

export const sanFrancisco: Pack = {
  id: 'sf',
  name: 'San Francisco',
  ladder: [carsOfSF, boardMeeting],
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
      flavor: 'You followed instructions you found inside a picture.',
    },
    visitor: {
      id: 'visitor',
      name: 'VISITOR',
      flavor: 'No notes. Come by sometime.',
    },
  },
}
