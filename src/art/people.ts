/* Torso pictograms, 100x100. The readable signal for a vest is dark body plus
   light sleeves, so sleeves are outline-only on vest figures and filled on
   everything else. */

const INK = '#3c4043'
const CUT = '#f1f3f4'

const svg = (body: string): string =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
     <g fill="${INK}">${body}</g>
   </svg>`

const HEAD = '<circle cx="50" cy="22" r="13"/>'
const BODY = '<path d="M30 100 V62 Q30 50 40 46 L50 44 L60 46 Q70 50 70 62 V100 Z"/>'

const sleeves = (filled: boolean): string => {
  const paint = filled ? `fill="${INK}"` : `fill="${CUT}" stroke="${INK}" stroke-width="3"`
  return `<rect x="15" y="49" width="14" height="44" rx="7" ${paint}/>
          <rect x="71" y="49" width="14" height="44" rx="7" ${paint}/>`
}

/** Zip down the middle plus quilting: reads as a puffer vest at tile size. */
const VEST = `
  <rect x="48.5" y="46" width="3" height="54" fill="${CUT}"/>
  <path d="M30 64 H70 M30 78 H70" stroke="${CUT}" stroke-width="2" fill="none"/>
`

const figure = (extras: string, filledSleeves = false): string =>
  svg(`${sleeves(filledSleeves)}${BODY}${HEAD}${extras}`)

export const vestShirt = figure(`${VEST}<path d="M42 45 L50 56 L58 45" fill="none" stroke="${CUT}" stroke-width="3"/>`)

export const vestHoodie = figure(`
  <path d="M36 46 Q34 30 50 30 Q66 30 64 46" fill="none" stroke="${INK}" stroke-width="6"/>
  ${VEST}
  <circle cx="44" cy="58" r="2.5" fill="${CUT}"/><circle cx="56" cy="58" r="2.5" fill="${CUT}"/>
`)

export const vestBackpack = figure(`
  ${VEST}
  <path d="M40 46 L36 100 M60 46 L64 100" stroke="${CUT}" stroke-width="4" fill="none"/>
`)

export const vestLanyard = figure(`
  ${VEST}
  <path d="M43 44 L50 66 L57 44" fill="none" stroke="${CUT}" stroke-width="2.5"/>
  <rect x="44" y="66" width="12" height="16" rx="2" fill="${CUT}"/>
`)

/* A stand collar and a stub of zip. No lapels: that is the whole difference
   between this and the suit, so both features are drawn chunky. */
export const quarterZip = figure(
  `<rect x="37" y="42" width="26" height="10" rx="5" fill="none" stroke="${CUT}" stroke-width="3"/>
   <rect x="48.5" y="52" width="3" height="16" fill="${CUT}"/>`,
  true,
)

export const suit = figure(
  `<path d="M39 44 L50 72 L61 44 Z" fill="${CUT}"/>
   <path d="M50 54 L55 61 L52 84 L48 84 L45 61 Z"/>`,
  true,
)

export const tuxedo = figure(
  `<path d="M40 45 L50 66 L60 45 L60 100 L40 100 Z" fill="${CUT}"/>
   <path d="M50 52 L58 47 L58 57 Z"/><path d="M50 52 L42 47 L42 57 Z"/>`,
  true,
)

/* A hi-vis vest is, literally, a vest. It is here to punish anyone reading the
   picture instead of the question. */
export const hiVis = figure(
  `<path d="M34 58 L66 84 M66 58 L34 84" stroke="${CUT}" stroke-width="6" fill="none"/>`,
  true,
)

export const hawaiian = figure(
  `<circle cx="40" cy="60" r="4" fill="${CUT}"/><circle cx="59" cy="70" r="4" fill="${CUT}"/>
   <circle cx="41" cy="82" r="4" fill="${CUT}"/><circle cx="60" cy="52" r="4" fill="${CUT}"/>
   <path d="M42 45 L50 56 L58 45" fill="none" stroke="${CUT}" stroke-width="3"/>`,
  true,
)
