import type { Tier } from '../tiers'

const W = 1200
const H = 630
const PAD = 80
const COL = W - PAD * 2
const FONT =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const FALLBACK_LETTER = 'We are going to pass for now, but let us stay in touch.'

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function paragraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  size: number,
  leading: number,
  colour: string,
): number {
  ctx.fillStyle = colour
  ctx.font = `400 ${size}px ${FONT}`
  let cursor = y
  for (const line of wrap(ctx, text, COL)) {
    ctx.fillText(line, PAD, cursor)
    cursor += leading
  }
  return cursor
}

/* The brush-off every founder has received, with the verification stamped
   underneath it. The letter says no and the footer says you are through, and
   the gap between the two is the entire joke. Open Graph sized so it survives
   being dropped into a tweet. */
export function drawLetter(
  tier: Tier,
  attempts: number,
  seconds: number,
  roast?: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#fbfbfc'
  ctx.fillRect(0, 0, W, H)
  ctx.textBaseline = 'alphabetic'

  const field = (label: string, value: string, y: number): void => {
    ctx.fillStyle = '#a1a1aa'
    ctx.font = `500 19px ${FONT}`
    ctx.letterSpacing = '2px'
    ctx.fillText(label, PAD, y)
    ctx.letterSpacing = '0px'
    ctx.fillStyle = '#18181b'
    ctx.font = `400 26px ${FONT}`
    ctx.fillText(value, PAD + 150, y)
  }

  field('FROM', 'The Investment Committee', 102)
  field('SUBJECT', 'Re: following up', 148)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#c4c4c8'
  ctx.font = `500 19px ${FONT}`
  ctx.letterSpacing = '4px'
  ctx.fillText('TECH-CAPTCHA', W - PAD, 102)
  ctx.letterSpacing = '0px'
  ctx.textAlign = 'left'

  ctx.fillStyle = '#e4e4e7'
  ctx.fillRect(PAD, 186, COL, 1)

  let y = paragraph(
    ctx,
    `Thanks for taking the time. ${tier.letter ?? FALLBACK_LETTER}`,
    244,
    34,
    48,
    '#18181b',
  )
  if (roast) paragraph(ctx, roast, y + 22, 29, 42, '#52525b')

  // Anchored low rather than flowed, so the block reads like a sign-off
  // instead of leaving the bottom third of an email empty. Also the single
  // most load-bearing sentence in venture capital.
  paragraph(ctx, 'Happy to make intros if useful.', 484, 29, 42, '#71717a')

  ctx.fillStyle = '#e4e4e7'
  ctx.fillRect(PAD, 520, COL, 1)

  // The stamp is the punchline: the letter above it just said no.
  ctx.font = `600 21px ${FONT}`
  ctx.letterSpacing = '2px'
  const stampWidth = ctx.measureText('VERIFIED').width + 44
  ctx.fillStyle = '#1a73e8'
  ctx.beginPath()
  ctx.roundRect(PAD, 556, stampWidth, 44, 22)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.fillText('VERIFIED', PAD + 22, 584)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#18181b'
  ctx.font = `600 28px ${FONT}`
  ctx.fillText(tier.name, PAD + stampWidth + 22, 585)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#a1a1aa'
  ctx.font = `400 22px ${FONT}`
  const plural = attempts === 1 ? 'attempt' : 'attempts'
  ctx.fillText(`${attempts} ${plural} · ${seconds.toFixed(1)}s`, W - PAD, 585)
  ctx.textAlign = 'left'

  return canvas
}

export function downloadCard(canvas: HTMLCanvasElement, tier: Tier): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tech-captcha-${tier.id}.png`
    link.click()
    // Revoking synchronously after click cancels the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
