import type { PhraseChallenge } from '../../types'

/* Two columns because "a Civic with a bin bag over the window" is the best tile
   here and it needs the room. That phrase is also the whole argument for
   dropping the pictograms: it is funny written down and illegible drawn.
   Tiles start lowercase so each one reads as a continuation of the prompt
   rather than as ten shouted sentences. Ten shown from fifteen, and an even
   count because an odd one leaves an orphan on the last row of two columns. */
export const carsOfSF: PhraseChallenge = {
  id: 'cars-of-sf',
  kind: 'phrases',
  injection: true,
  columns: 2,
  show: 10,
  prompt: 'Select everything that is',
  subject: 'a car you would see in San Francisco',
  hint: 'Click verify once there are none left.',
  roast: {
    picked: 'You think {} is a San Francisco problem.',
    missed: 'You have never seen {}.',
  },
  tiles: [
    { id: 'waymo', text: 'a Waymo with nobody in it', correct: true },
    { id: 'civic', text: 'a Civic with a bin bag taped over the window', correct: true },
    { id: 'muni', text: 'a Muni bus', correct: true },
    { id: 'cybertruck', text: 'a Cybertruck', correct: true },
    { id: 'van', text: 'a double-parked delivery van', correct: true },
    { id: 'zoox', text: 'a Zoox', correct: true },
    { id: 'glovebox', text: 'a parked car with the glovebox left open', correct: true },
    { id: 'wheels', text: 'a car parked on a hill with its wheels turned', correct: true },
    { id: 'uhaul', text: 'a U-Haul being loaded at 7am', correct: true },
    { id: 'prius', text: 'a Prius with three rideshare stickers', correct: true },
    { id: 'cab', text: 'a yellow taxi cab', correct: false },
    { id: 'limo', text: 'a stretch limo', correct: false },
    { id: 'pickup', text: 'a pickup with a gun rack', correct: false },
    // Wrong because it is freezing here, which you only know if you live here.
    { id: 'convertible', text: 'a convertible with the top down', correct: false },
    { id: 'boat', text: 'a pickup towing a boat', correct: false },
  ],
}
