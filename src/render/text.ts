import type { WireChallenge } from '../wire'

export function buildTextInput(
  challenge: WireChallenge,
  onSubmit: () => void,
): HTMLDivElement {
  const wrap = document.createElement('div')
  wrap.className = 'text-answer'

  const input = document.createElement('input')
  input.className = 'answer'
  input.type = 'text'
  input.autocomplete = 'off'
  input.spellcheck = false
  input.placeholder = challenge.placeholder ?? ''
  input.setAttribute('aria-label', `${challenge.prompt} ${challenge.subject}`)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  })

  wrap.append(input)
  return wrap
}
