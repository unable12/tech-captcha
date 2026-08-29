export interface Tier {
  id: string
  name: string
  flavor: string
}

/* Ranked by how many rungs of the ladder it took. Failing is not a soft
   failure here, it is the score. */
const TIERS: readonly Tier[] = [
  { id: 'pre-2008', name: 'PRE-2008', flavor: 'You were here before the money was.' },
  { id: 'local', name: 'LOCAL', flavor: 'You live here. It shows.' },
  { id: 'transplant', name: 'TRANSPLANT', flavor: 'You have been here about eighteen months.' },
  { id: 'tourist', name: 'TOURIST', flavor: 'You have been to Pier 39 recently.' },
]

/* Taking the escape hatch is an honest answer, so it does not get scored as a
   failure. */
export const VISITOR: Tier = {
  id: 'visitor',
  name: 'VISITOR',
  flavor: 'No notes. Come by sometime.',
}

export function tierFor(attempts: number): Tier {
  return TIERS[Math.min(attempts - 1, TIERS.length - 1)] ?? TIERS[TIERS.length - 1]!
}
