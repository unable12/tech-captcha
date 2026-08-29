import { STYLES } from './styles'
import { buildGrid } from './render/grid'
import { buildTextInput } from './render/text'
import { drawTierCard, downloadCard } from './render/tier-card'
import { getPack, packIds, type Pack } from './pack'
import { LocalDriver } from './drivers/local'
import { RemoteDriver } from './drivers/remote'
import type { Driver, Outcome } from './drivers/types'
import type { WireChallenge } from './wire'

const DEFAULT_PACK = 'sf'

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
  static readonly observedAttributes = ['pack', 'endpoint']

  #shadow: ShadowRoot
  #driver: Driver | null = null
  #current: WireChallenge | null = null
  #selected = new Set<number>()

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    if (this.#shadow.childElementCount === 0) void this.#build()
  }

  attributeChangedCallback(name: string, previous: string | null, next: string | null): void {
    if (previous !== next && this.#shadow.childElementCount > 0 && TechCaptchaElement.observedAttributes.includes(name)) {
      void this.#build()
    }
  }

  /** Falls back rather than throwing: a captcha that explodes takes the host
      page's signup form down with it. */
  #localPack(): Pack | null {
    const requested = this.getAttribute('pack')
    const pack = getPack(requested ?? DEFAULT_PACK)
    if (pack) return pack

    const fallback = getPack(DEFAULT_PACK) ?? getPack(packIds()[0] ?? '')
    if (!fallback) {
      console.warn('tech-captcha: no packs registered, rendering nothing')
      return null
    }
    console.warn(`tech-captcha: unknown pack "${requested}", falling back to "${fallback.id}"`)
    return fallback
  }

  #makeDriver(): Driver | null {
    const endpoint = this.getAttribute('endpoint')
    if (endpoint) return new RemoteDriver(endpoint, this.getAttribute('pack'))
    const pack = this.#localPack()
    return pack ? new LocalDriver(pack) : null
  }

  async #build(): Promise<void> {
    this.#driver = this.#makeDriver()
    if (!this.#driver) {
      this.#shadow.replaceChildren()
      return
    }

    const style = document.createElement('style')
    style.textContent = STYLES

    const card = document.createElement('div')
    card.className = 'card'
    card.setAttribute('role', 'group')
    card.setAttribute('aria-label', 'Captcha challenge')
    // Serving a new challenge swaps the header text with no focus change, so
    // without a live region a screen reader never hears that it changed.
    card.innerHTML = `
      <div class="brief" aria-live="polite" aria-atomic="true">
        <div class="header">
          <div class="prompt"></div>
          <div class="subject"></div>
          <div class="hint"></div>
        </div>
        <div class="injection" hidden></div>
      </div>
      <div class="body"></div>
      <div class="escape"><button class="link" type="button"></button></div>
      <div class="footer">
        ${icon(ICONS.reload, 'Get a new challenge')}
        ${icon(ICONS.audio, 'Get an audio challenge')}
        ${icon(ICONS.info, 'About this challenge')}
        <div class="status" role="status" aria-live="polite"></div>
        <button class="verify" type="button">Verify</button>
      </div>
    `

    card.querySelector('.verify')!.addEventListener('click', () => void this.#verify())
    card.querySelector('.icon')!.addEventListener('click', () => void this.#run(() => this.#driver!.reload()))
    card.querySelector('.link')!.addEventListener('click', () => {
      card.querySelector('.escape')!.remove()
      void this.#run(() => this.#driver!.escape())
    })

    this.#shadow.replaceChildren(style, card)

    try {
      const { challenge, escapeLabel } = await this.#driver.start()
      ;(card.querySelector('.link') as HTMLButtonElement).textContent = escapeLabel
      this.#render(challenge)
    } catch (error) {
      this.#showBroken(error)
    }
  }

  async #run(action: () => Promise<{ challenge: WireChallenge }>): Promise<void> {
    try {
      this.#render((await action()).challenge)
    } catch (error) {
      this.#showBroken(error)
    }
  }

  #render(challenge: WireChallenge): void {
    this.#current = challenge
    this.#selected.clear()

    const card = this.#shadow.querySelector('.card')!
    card.querySelector('.prompt')!.textContent = challenge.prompt
    card.querySelector('.subject')!.textContent = challenge.subject
    card.querySelector('.hint')!.textContent = challenge.hint

    const injectionEl = card.querySelector('.injection') as HTMLDivElement
    injectionEl.textContent = challenge.injection ?? ''
    injectionEl.hidden = challenge.injection === null

    card.querySelector('.body')!.replaceChildren(
      challenge.kind === 'grid'
        ? buildGrid(challenge.tiles ?? [], (index, pressed) => {
            if (pressed) this.#selected.add(index)
            else this.#selected.delete(index)
          })
        : buildTextInput(challenge, () => void this.#verify()),
    )
  }

  async #verify(): Promise<void> {
    if (!this.#driver || !this.#current) return

    const input = this.#shadow.querySelector('.answer') as HTMLInputElement | null
    let outcome: Outcome
    try {
      outcome = await this.#driver.answer({
        selected: [...this.#selected],
        value: input?.value ?? '',
      })
    } catch (error) {
      this.#showBroken(error)
      return
    }

    if (outcome.passed) {
      this.#showResult(outcome)
      return
    }

    const status = this.#shadow.querySelector('.status') as HTMLDivElement
    status.textContent = outcome.status ?? 'Please try again.'
    status.className = 'status is-error'
    if (outcome.challenge) this.#render(outcome.challenge)
    ;(this.#shadow.querySelector('.answer') as HTMLInputElement | null)?.focus()
  }

  #showResult(outcome: Outcome): void {
    const tier = outcome.tier!
    const attempts = outcome.attempts ?? 0
    const seconds = outcome.seconds ?? 0

    const card = this.#shadow.querySelector('.card')!
    card.querySelector('.prompt')!.textContent = 'Verified. You are'
    card.querySelector('.subject')!.textContent = tier.name
    card.querySelector('.hint')!.textContent = tier.flavor

    const canvas = drawTierCard(tier, attempts, seconds)
    canvas.className = 'tier-card'
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', `${tier.name}. ${tier.flavor}`)
    card.querySelector('.body')!.replaceChildren(canvas)
    card.querySelector('.escape')?.remove()
    ;(card.querySelector('.injection') as HTMLDivElement).hidden = true

    const footer = card.querySelector('.footer')!
    footer.innerHTML = `
      <button class="ghost" type="button">Try again</button>
      <div class="status"></div>
      <button class="verify" type="button">Download card</button>
    `
    footer.querySelector('.verify')!.addEventListener('click', () => downloadCard(canvas, tier))
    footer.querySelector('.ghost')!.addEventListener('click', () => void this.#build())

    this.dispatchEvent(
      new CustomEvent('verified', {
        bubbles: true,
        composed: true,
        detail: {
          mode: this.#driver!.mode,
          attempts,
          seconds,
          tier: tier.id,
          trapped: outcome.trapped ?? false,
          ...(outcome.token ? { token: outcome.token } : {}),
        },
      }),
    )
  }

  /** Expired or exhausted sessions are recoverable, so offer the way back
      rather than leaving a dead widget on the page. */
  #showBroken(error: unknown): void {
    console.warn(error)
    const card = this.#shadow.querySelector('.card')
    if (!card) return

    card.querySelector('.prompt')!.textContent = 'Something went wrong'
    card.querySelector('.subject')!.textContent = 'Start over'
    card.querySelector('.hint')!.textContent = 'That challenge expired or ran out of attempts.'
    card.querySelector('.body')!.replaceChildren()
    card.querySelector('.escape')?.remove()
    ;(card.querySelector('.injection') as HTMLDivElement).hidden = true

    const footer = card.querySelector('.footer')!
    footer.innerHTML = `<div class="status"></div><button class="verify" type="button">Start over</button>`
    footer.querySelector('.verify')!.addEventListener('click', () => void this.#build())
  }
}
