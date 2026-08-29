import type { PhraseChallenge } from '../../types'

/* Two columns because "a Civic with a bin bag over the window" is the best tile
   here and it needs the room. That phrase is also the whole argument for
   dropping the pictograms: it is funny written down and illegible drawn.
   Ten tiles, not nine: an odd count in two columns leaves an orphan on the
   last row. */
export const carsOfSF: PhraseChallenge = {
  id: 'cars-of-sf',
  kind: 'phrases',
  injection: true,
  columns: 2,
  prompt: 'Select everything that is',
  subject: 'a car you would see in San Francisco',
  hint: 'Click verify once there are none left.',
  tiles: [
    { id: 'waymo', text: 'A Waymo with nobody in it', correct: true },
    { id: 'civic', text: 'A Civic with a bin bag taped over the window', correct: true },
    { id: 'muni', text: 'A Muni bus', correct: true },
    { id: 'cybertruck', text: 'A Cybertruck', correct: true },
    { id: 'van', text: 'A double-parked delivery van', correct: true },
    { id: 'zoox', text: 'A Zoox', correct: true },
    { id: 'glovebox', text: 'A parked car with the glovebox left open', correct: true },
    { id: 'cab', text: 'A yellow taxi cab', correct: false },
    { id: 'limo', text: 'A stretch limo', correct: false },
    { id: 'pickup', text: 'A pickup with a gun rack', correct: false },
  ],
}
