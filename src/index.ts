import { TechCaptchaElement } from './element'
import { registerPack } from './pack'
import { sanFrancisco } from './packs/sf'
import { example } from './packs/example'

export { TechCaptchaElement }
export { registerPack, getPack, packIds, type Pack } from './pack'
export type { Tier } from './tiers'
export type { Challenge, GridChallenge, TextChallenge, Tile } from './types'
export { sanFrancisco, example }

registerPack(sanFrancisco)
registerPack(example)

if (!customElements.get('tech-captcha')) {
  customElements.define('tech-captcha', TechCaptchaElement)
}
