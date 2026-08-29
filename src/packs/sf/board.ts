import type { GridChallenge } from '../../types'
import * as art from './art/people'

/* Knowledge, not perception. "Select the vests" is something anyone can do.
   Knowing that the suit is the one person definitely not going to a board
   meeting is the actual filter. The hi-vis vest is there for anyone reading
   the pictures instead of the question. */
export const boardMeeting: GridChallenge = {
  id: 'board-meeting',
  kind: 'grid',
  injection: true,
  prompt: 'Select everyone who is',
  subject: 'on their way to a board meeting',
  hint: 'Dress code is a real thing here.',
  tiles: [
    { id: 'vest-shirt', art: art.vestShirt, label: 'Puffer vest over a collared shirt', correct: true },
    { id: 'vest-hoodie', art: art.vestHoodie, label: 'Puffer vest over a hoodie', correct: true },
    { id: 'vest-backpack', art: art.vestBackpack, label: 'Puffer vest with backpack straps', correct: true },
    { id: 'vest-lanyard', art: art.vestLanyard, label: 'Puffer vest with a conference lanyard', correct: true },
    { id: 'quarter-zip', art: art.quarterZip, label: 'Quarter-zip fleece', correct: true },
    { id: 'suit', art: art.suit, label: 'Full suit and tie', correct: false },
    { id: 'tuxedo', art: art.tuxedo, label: 'Tuxedo with a bow tie', correct: false },
    { id: 'hi-vis', art: art.hiVis, label: 'High-visibility safety vest', correct: false },
    { id: 'hawaiian', art: art.hawaiian, label: 'Hawaiian shirt', correct: false },
  ],
}
