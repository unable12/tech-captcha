import type { TextChallenge } from '../../types'

/* The way out for anyone who has never been here. It is not a punishment
   route and it is not a joke at their expense: it is trivially passable,
   needs no images, and works on a screen reader. */
export const escapeHatch: TextChallenge = {
  id: 'escape-hatch',
  kind: 'text',
  prompt: 'Type the word',
  subject: 'human',
  hint: 'That is the entire challenge.',
  placeholder: 'human',
  accepts: (value) => value.trim().toLowerCase() === 'human',
}
