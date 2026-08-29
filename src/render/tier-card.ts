import type { Tier } from '../tiers'

const W = 1200
const H = 630
const FONT = 'Roboto, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'

/** Open Graph sized so it survives being dropped into a tweet or a Slack. */
export function drawTierCard(tier: Tier, attempts: number, seconds: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#202124'
  ctx.fillRect(0, 0, W, H)

  // 3x3 of tiles echoing the widget, one of them selected.
  const size = 34
  const gap = 8
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i === 4 ? '#1a73e8' : '#3c4043'
    ctx.beginPath()
    ctx.roundRect(80 + (i % 3) * (size + gap), 80 + Math.floor(i / 3) * (size + gap), size, size, 4)
    ctx.fill()
  }

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#9aa0a6'
  ctx.font = `500 28px ${FONT}`
  ctx.letterSpacing = '6px'
  ctx.fillText('TECH-CAPTCHA', 232, 130)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#fff'
  ctx.font = `700 148px ${FONT}`
  ctx.fillText(tier.name, 80, 340)

  ctx.fillStyle = '#bdc1c6'
  ctx.font = `400 40px ${FONT}`
  ctx.fillText(tier.flavor, 80, 404)

  ctx.fillStyle = '#9aa0a6'
  ctx.font = `400 28px ${FONT}`
  const plural = attempts === 1 ? 'attempt' : 'attempts'
  ctx.fillText(`verified in ${attempts} ${plural} · ${seconds.toFixed(1)}s`, 80, 540)

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
