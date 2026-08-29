import { TechCaptchaElement } from './element'

export { TechCaptchaElement }

if (!customElements.get('tech-captcha')) {
  customElements.define('tech-captcha', TechCaptchaElement)
}
