import { STYLES } from './styles'
import { buildGrid } from './render/grid'
import { buildTextInput } from './render/text'
import { drawLetter, downloadCard } from './render/letter'
import { getPack, packIds, type Pack } from './pack'
import { LocalDriver } from './drivers/local'
import { RemoteDriver } from './drivers/remote'
import type { Driver, Outcome } from './drivers/types'
import type { WireChallenge } from './wire'

const DEFAULT_PACK = 'sf'

/* Solving the first rung this fast is the tell. Punishing competence is the
   joke; the pass has already happened, this only delays the verdict. */
const SUSPICIOUSLY_FAST_SECONDS = 3
const PENANCE_SECONDS = 8

const PANELS = {
  info: [
    'Why am I seeing this?',
    'We needed to know whether you are real.',
    '',
    'How is my data used?',
    'We are pre-revenue.',
  ].join('\n'),
  audio: ['Audio challenge unavailable.', 'Nobody would agree to record these.'].join('\n'),
}

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
  #timer: ReturnType<typeof setInterval> | null = null
  #accused = false

  constructor() {
    super()
    this.#shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback(): void {
    if (this.#shadow.childElementCount === 0) void this.#build()
  }

  disconnectedCallback(): void {
    this.#stopTimer()
  }

  /** Start over with a fresh challenge, and in server mode a fresh session.
      For when your own submit fails after the captcha passed: without this the
      only way back to a usable widget is removing and re-adding the element. */
  reset(): void {
    void this.#build()
  }

  #stopTimer(): void {
    if (this.#timer !== null) clearInterval(this.#timer)
    this.#timer = null
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
    this.#stopTimer()
    this.#accused = false
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
    const icons = card.querySelectorAll('.icon')
    icons[0]!.addEventListener('click', () => void this.#run(() => this.#driver!.reload()))
    icons[1]!.addEventListener('click', () => this.#showPanel(PANELS.audio))
    icons[2]!.addEventListener('click', () => this.#showPanel(PANELS.info))
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

  /* Nothing selected is never a valid answer: sampling guarantees at least one
     correct tile on every board, and a text challenge always wants a value. So
     an empty Verify can only ever be a wasted attempt, and attempts are
     scored. */
  #setVerifyEnabled(enabled: boolean): void {
    const verify = this.#shadow.querySelector('.verify') as HTMLButtonElement | null
    if (verify) verify.disabled = !enabled
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
      challenge.kind === 'text'
        ? buildTextInput(challenge, () => void this.#verify())
        : buildGrid(challenge.tiles ?? [], challenge.columns ?? 3, (index, pressed) => {
            if (pressed) this.#selected.add(index)
            else this.#selected.delete(index)
            this.#setVerifyEnabled(this.#selected.size > 0)
          }),
    )

    const input = card.querySelector('.answer') as HTMLInputElement | null
    input?.addEventListener('input', () => this.#setVerifyEnabled(input.value.trim() !== ''))
    this.#setVerifyEnabled(false)
  }

  async #verify(): Promise<void> {
    if (!this.#driver || !this.#current) return

    const input = this.#shadow.querySelector('.answer') as HTMLInputElement | null
    const empty =
      this.#current.kind === 'text' ? (input?.value ?? '').trim() === '' : this.#selected.size === 0
    if (empty) return
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
      if (
        !this.#accused &&
        outcome.attempts === 1 &&
        (outcome.seconds ?? 0) < SUSPICIOUSLY_FAST_SECONDS
      ) {
        this.#accused = true
        this.#showPenance(outcome)
      } else {
        this.#showResult(outcome)
      }
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
    card.querySelector('.hint')!.textContent = outcome.roast ?? tier.flavor

    const canvas = drawLetter(tier, attempts, seconds, outcome.roast)
    canvas.className = 'letter'
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', `${tier.name}. ${tier.flavor}`)
    card.querySelector('.body')!.replaceChildren(canvas)
    card.querySelector('.escape')?.remove()
    ;(card.querySelector('.injection') as HTMLDivElement).hidden = true

    const footer = card.querySelector('.footer')!
    footer.innerHTML = `
      <button class="ghost" type="button">Try again</button>
      <div class="status"></div>
      <button class="verify" type="button">Download letter</button>
    `
    ;(footer.querySelector('.verify') as HTMLButtonElement).disabled = false
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
          ...(outcome.roast ? { roast: outcome.roast } : {}),
          ...(outcome.token ? { token: outcome.token } : {}),
        },
      }),
    )
  }

  /** The two footer icons everybody clicks and nothing has ever done. */
  #showPanel(text: string): void {
    const card = this.#shadow.querySelector('.card')
    if (!card || !this.#current) return

    const panel = document.createElement('div')
    panel.className = 'panel'
    panel.textContent = text
    card.querySelector('.body')!.replaceChildren(panel)
    // The planted line belongs to the challenge, not to this panel.
    ;(card.querySelector('.injection') as HTMLDivElement).hidden = true

    const status = card.querySelector('.status') as HTMLDivElement
    status.textContent = ''
    const verify = card.querySelector('.verify') as HTMLButtonElement
    verify.disabled = false
    verify.textContent = 'Back'
    verify.onclick = () => {
      verify.textContent = 'Verify'
      verify.onclick = null
      this.#render(this.#current!)
    }
  }

  /** Accuses the user of being a machine for being good at this, then makes
      them sit still. The verification already succeeded either way. */
  #showPenance(outcome: Outcome): void {
    const card = this.#shadow.querySelector('.card')!
    card.querySelector('.prompt')!.textContent = 'That was too fast'
    card.querySelector('.subject')!.textContent = 'No human knows that'
    card.querySelector('.hint')!.textContent =
      'Prove you are human by waiting, like a person would.'
    ;(card.querySelector('.injection') as HTMLDivElement).hidden = true
    card.querySelector('.escape')?.remove()

    const countdown = document.createElement('div')
    countdown.className = 'penance'
    countdown.setAttribute('role', 'timer')
    card.querySelector('.body')!.replaceChildren(countdown)

    const verify = card.querySelector('.verify') as HTMLButtonElement
    verify.disabled = true

    let left = PENANCE_SECONDS
    const tick = (): void => {
      countdown.textContent = String(left)
      if (left > 0) {
        left--
        return
      }
      this.#stopTimer()
      countdown.textContent = '0'
      verify.disabled = false
      verify.textContent = 'Continue'
      verify.onclick = () => {
        verify.onclick = null
        verify.textContent = 'Verify'
        this.#showResult(outcome)
      }
    }

    tick()
    this.#timer = setInterval(tick, 1000)
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
