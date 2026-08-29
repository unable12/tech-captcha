import type { Pack } from '../../pack'
import type { GridChallenge, TextChallenge } from '../../types'

/* A copy-me template, not a real scene. It is the smallest thing that exercises
   both challenge kinds, and it is deliberately solvable by anyone so it can sit
   in the demo without needing local knowledge of anywhere. */

const shape = (body: string): string =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
     <g fill="#3c4043">${body}</g>
   </svg>`

const corners: GridChallenge = {
  id: 'corners',
  kind: 'grid',
  injection: true,
  prompt: 'Select all the shapes with',
  subject: 'corners',
  hint: 'This pack is a template. Replace it with something people can be wrong about.',
  tiles: [
    { id: 'square', art: shape('<rect x="22" y="22" width="56" height="56"/>'), label: 'Square', correct: true },
    { id: 'triangle', art: shape('<path d="M50 20 L82 78 H18 Z"/>'), label: 'Triangle', correct: true },
    { id: 'diamond', art: shape('<path d="M50 16 L84 50 L50 84 L16 50 Z"/>'), label: 'Diamond', correct: true },
    { id: 'circle', art: shape('<circle cx="50" cy="50" r="30"/>'), label: 'Circle', correct: false },
    { id: 'ellipse', art: shape('<ellipse cx="50" cy="50" rx="34" ry="22"/>'), label: 'Ellipse', correct: false },
    { id: 'ring', art: shape('<path d="M50 18a32 32 0 1 0 0.1 0zm0 16a16 16 0 1 1-0.1 0z"/>'), label: 'Ring', correct: false },
  ],
}

const wayOut: TextChallenge = {
  id: 'example-escape',
  kind: 'text',
  prompt: 'Type the word',
  subject: 'human',
  hint: 'That is the entire challenge.',
  placeholder: 'human',
  accepts: (value) => value.trim().toLowerCase() === 'human',
}

export const example: Pack = {
  id: 'example',
  name: 'Example',
  ladder: [corners],
  escape: { label: 'I would rather not', challenge: wayOut },
  tiers: {
    ranked: [
      { id: 'first', name: 'FIRST TRY', flavor: 'Shapes remain straightforward.' },
      { id: 'eventually', name: 'EVENTUALLY', flavor: 'You got there.' },
    ],
    bot: { id: 'bot', name: 'BOT', flavor: 'You followed instructions you found inside a picture.' },
    visitor: { id: 'visitor', name: 'VISITOR', flavor: 'Fair enough.' },
  },
}
