import type { GridChallenge } from '../../types'
import * as art from './art/cars'

/* The point of this one: recognising a Waymo is a vision task anyone passes.
   Knowing that a Civic with a trash bag taped over the window is a San
   Francisco car is a knowledge task. The wrong answers are all vehicles that
   exist, just not here. */
export const carsOfSF: GridChallenge = {
  id: 'cars-of-sf',
  kind: 'grid',
  injection: true,
  prompt: 'Select all squares with',
  subject: 'a car you would see in San Francisco',
  hint: 'Click verify once there are none left.',
  tiles: [
    { id: 'waymo', art: art.waymo, label: 'Sedan with a spinning sensor on the roof', correct: true },
    { id: 'zoox', art: art.zoox, label: 'Symmetrical box-shaped shuttle with no front or back', correct: true },
    { id: 'rideshare', art: art.rideshare, label: 'Hatchback with a placard in the windshield', correct: true },
    { id: 'cybertruck', art: art.cybertruck, label: 'Angular stainless steel truck', correct: true },
    { id: 'muni', art: art.muni, label: 'Bus with overhead trolley poles', correct: true },
    { id: 'smashed', art: art.smashed, label: 'Sedan with the rear window covered over and glass on the ground', correct: true },
    { id: 'yellow-cab', art: art.yellowCab, label: 'Yellow taxi with a checkered roof sign', correct: false },
    { id: 'limo', art: art.limo, label: 'Stretch limousine', correct: false },
    { id: 'pickup', art: art.pickup, label: 'Pickup truck with a gun rack', correct: false },
  ],
}
