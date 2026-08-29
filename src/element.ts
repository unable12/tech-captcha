import { STYLES } from './styles'
import { buildGrid } from './render/grid'
import { LADDER, shuffled } from './challenges'
import { grade, type Challenge } from './types'

const ICONS = {
  reload:
    'M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  audio:
    'M12 1a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z',
  info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
}

function icon(path: string, label: string): string {
  return `<button class="icon" type="button" aria-label="${label}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>
  </button>`
}

export class TechCaptchaElement extends HTMLElement {
  #shadow: ShadowRoot
  #challenge: Challenge = shuffled(LADDER[0]!)
  #selected = new Set<number>()
  #attempts = 0
  #rung = 0

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    if (this.#shadow.childElementCount === 0) this.#build()
  }

  get attempts(): number {
    return this.#attempts
  }

  #build(): void {
    const style = document.createElement('style')
    style.textContent = STYLES

    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <div class="header">
        <div class="prompt"></div>
        <div class="subject"></div>
        <div class="hint"></div>
      </div>
      <div class="grid-slot"></div>
      <div class="footer">
        ${icon(ICONS.reload, 'Get a new challenge')}
        ${icon(ICONS.audio, 'Get an audio challenge')}
        ${icon(ICONS.info, 'About this challenge')}
        <div class="status" role="status" aria-live="polite"></div>
        <button class="verify" type="button">Verify</button>
      </div>
    `

    card.querySelector('.verify')!.addEventListener('click', () => this.#verify())
    card.querySelector('.icon')!.addEventListener('click', () => this.#serve(this.#challenge))

    this.#shadow.append(style, card)
    this.#serve(LADDER[0]!)
  }

  #serve(challenge: Challenge): void {
    this.#challenge = shuffled(challenge)
    this.#selected.clear()

    const card = this.#shadow.querySelector('.card')!
    card.querySelector('.prompt')!.textContent = this.#challenge.prompt
    card.querySelector('.subject')!.textContent = this.#challenge.subject
    card.querySelector('.hint')!.textContent = this.#challenge.hint

    const slot = card.querySelector('.grid-slot')!
    slot.replaceChildren(
      buildGrid(this.#challenge.tiles, (index, pressed) => {
        if (pressed) this.#selected.add(index)
        else this.#selected.delete(index)
      }),
    )
  }

  #verify(): void {
    this.#attempts++
    const result = grade(this.#challenge, this.#selected)
    const status = this.#shadow.querySelector('.status') as HTMLDivElement

    if (result === 'fail') {
      // Always claims to be easier. Always is not.
      this.#rung = Math.min(this.#rung + 1, LADDER.length - 1)
      status.textContent = "Let's try an easier one."
      status.className = 'status is-error'
      this.#serve(LADDER[this.#rung]!)
      return
    }

    status.textContent = ''
    this.dispatchEvent(
      new CustomEvent('verified', {
        bubbles: true,
        composed: true,
        detail: { attempts: this.#attempts },
      }),
    )
  }
}
