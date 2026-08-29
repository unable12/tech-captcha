/* Flat pictograms, 120x80. Recognition lives in the silhouette plus one
   distinguishing feature, so these stay legible at tile size. */

const INK = '#3c4043'
const CUT = '#f1f3f4' // matches tile background, used to punch out windows

const svg = (body: string): string =>
  `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
     <g fill="${INK}">${body}</g>
   </svg>`

const wheels = (a: number, b: number): string =>
  `<circle cx="${a}" cy="62" r="8"/><circle cx="${b}" cy="62" r="8"/>
   <circle cx="${a}" cy="62" r="3.5" fill="${CUT}"/><circle cx="${b}" cy="62" r="3.5" fill="${CUT}"/>`

const SEDAN = 'M12 60 V50 Q12 46 16 45 L34 42 L46 28 Q48 25 52 25 H74 Q78 25 80 28 L92 42 L106 45 Q110 46 110 50 V60 Z'
const SEDAN_GLASS = `<path d="M50 30 H60 V41 L40 43 Z" fill="${CUT}"/><path d="M64 30 H73 Q75 30 76 31 L85 41 H64 Z" fill="${CUT}"/>`

const HATCH = 'M12 60 V50 Q12 46 16 45 L32 42 L44 28 Q46 25 50 25 H70 Q74 25 77 28 L94 44 Q96 46 96 48 V60 Z'
const HATCH_GLASS = `<path d="M48 30 H58 V41 L38 43 Z" fill="${CUT}"/><path d="M62 30 H70 L84 43 H62 Z" fill="${CUT}"/>`

export const waymo = svg(`
  <path d="M46 12 Q40 6 34 8 M76 12 Q82 6 88 8" stroke="${INK}" stroke-width="2" fill="none"/>
  <circle cx="61" cy="10" r="7"/>
  <rect x="53" y="14" width="16" height="10" rx="2"/>
  <path d="${SEDAN}"/>
  <rect x="28" y="35" width="8" height="6" rx="2"/>
  ${SEDAN_GLASS}
  ${wheels(32, 88)}
`)

/* Zoox: no hood, no boot, symmetric both ends. Nothing else on the road
   looks like a toaster, which is what makes it readable at tile size. */
export const zoox = svg(`
  <circle cx="20" cy="22" r="4"/><circle cx="100" cy="22" r="4"/>
  <rect x="14" y="24" width="92" height="34" rx="10"/>
  <rect x="22" y="30" width="32" height="17" rx="3" fill="${CUT}"/>
  <rect x="66" y="30" width="32" height="17" rx="3" fill="${CUT}"/>
  ${wheels(32, 88)}
`)

export const rideshare = svg(`
  <path d="${HATCH}"/>
  ${HATCH_GLASS}
  <rect x="47" y="31" width="12" height="8" rx="1.5"/>
  ${wheels(32, 84)}
`)

export const cybertruck = svg(`
  <path d="M6 60 V46 L64 16 L114 34 V60 Z"/>
  <path d="M50 34 L64 26 L100 40 H50 Z" fill="${CUT}"/>
  <rect x="8" y="41" width="20" height="3" fill="${CUT}"/>
  ${wheels(32, 92)}
`)

export const muni = svg(`
  <path d="M60 18 L96 2" stroke="${INK}" stroke-width="2.5" fill="none"/>
  <path d="M52 18 L88 4" stroke="${INK}" stroke-width="2.5" fill="none"/>
  <rect x="8" y="18" width="104" height="42" rx="5"/>
  <rect x="14" y="24" width="20" height="13" rx="2" fill="${CUT}"/>
  <rect x="38" y="24" width="20" height="13" rx="2" fill="${CUT}"/>
  <rect x="62" y="24" width="20" height="13" rx="2" fill="${CUT}"/>
  <rect x="86" y="24" width="20" height="13" rx="2" fill="${CUT}"/>
  ${wheels(30, 92)}
`)

export const smashed = svg(`
  <path d="${SEDAN}"/>
  <path d="M50 30 H60 V41 L40 43 Z" fill="${CUT}"/>
  <path d="M63 28 H76 Q79 28 80 30 L88 42 H63 Z"/>
  <path d="M66 31 L84 40 M82 31 L69 40" stroke="${CUT}" stroke-width="2" fill="none"/>
  <circle cx="97" cy="70" r="2.5"/><circle cx="105" cy="72" r="1.8"/><circle cx="89" cy="72" r="1.8"/>
  <circle cx="112" cy="69" r="1.5"/>
  ${wheels(32, 88)}
`)

export const yellowCab = svg(`
  <rect x="48" y="14" width="26" height="10" rx="2"/>
  <rect x="52" y="17" width="5" height="4" fill="${CUT}"/>
  <rect x="62" y="17" width="5" height="4" fill="${CUT}"/>
  <path d="${SEDAN}"/>
  ${SEDAN_GLASS}
  ${wheels(32, 88)}
`)

export const limo = svg(`
  <path d="M4 60 V50 Q4 46 8 45 L22 42 L32 30 Q34 27 38 27 H54 Q58 27 60 30 L68 42 L112 45 Q116 46 116 50 V60 Z"/>
  <path d="M36 32 H46 V42 L26 43 Z" fill="${CUT}"/>
  <rect x="72" y="36" width="9" height="7" rx="1.5" fill="${CUT}"/>
  <rect x="85" y="36" width="9" height="7" rx="1.5" fill="${CUT}"/>
  <rect x="98" y="36" width="9" height="7" rx="1.5" fill="${CUT}"/>
  ${wheels(24, 98)}
`)

export const pickup = svg(`
  <path d="M10 60 V48 Q10 44 14 43 L26 41 L36 27 Q38 24 42 24 H60 Q64 24 66 27 L74 41 H110 Q114 41 114 45 V60 Z"/>
  <path d="M40 29 H50 V40 L30 42 Z" fill="${CUT}"/>
  <path d="M54 29 H60 L68 40 H54 Z" fill="${CUT}"/>
  <path d="M78 41 V22 M92 41 V22 M78 27 H92 M78 33 H92" stroke="${INK}" stroke-width="2.5" fill="none"/>
  ${wheels(30, 92)}
`)
