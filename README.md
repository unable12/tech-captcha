# tech-captcha

A captcha for people who have opinions about Sand Hill Road.

Instead of asking you to find the bicycles, it asks whether you would recognise
a car with a bin bag taped over the smashed window, and whether you know that
the person in the full suit is the one who is definitely not going to a board
meeting. Then it ranks you.

One custom element, no runtime dependencies, about 6.5 kB gzipped.

## This is not security

Say it plainly before anyone ships it: the answers are in the client bundle,
and any language model already knows which coffee shop the VCs drink at. A
knowledge-gated challenge is easy for a model and hard for an out-of-group
human, which is exactly backwards for a bot filter.

What it is good for is delight, brand, and turning a dead step in a signup flow
into something people screenshot. If you need a real filter, keep your honeypot
field and your submit-timing check and treat this as decoration on top.

## Use it

```html
<script type="module" src="/tech-captcha.js"></script>

<tech-captcha></tech-captcha>
```

```js
document.querySelector('tech-captcha').addEventListener('verified', (event) => {
  // { attempts: 2, seconds: 8.4, tier: 'local' }
  console.log(event.detail)
})
```

The element renders into a shadow root, so your page styles cannot reach it and
its styles cannot reach your page. It is a plain custom element, so it works in
React, Vue, Rails, or a static HTML file without a wrapper.

Not published to npm yet. Build it with `npm run build` and serve
`dist/tech-captcha.js` yourself.

## The challenges

| Challenge | The actual test |
| --- | --- |
| Cars you would see in San Francisco | Waymo, Zoox, Cybertruck, a Muni bus, a rideshare Prius and a sedan with the rear window covered over. The wrong answers are a yellow cab, a limo and a pickup with a gun rack: vehicles that exist, just not here. |
| On their way to a board meeting | The vests and the quarter-zip. The full suit and the tuxedo are wrong. The hi-vis vest is there for anyone matching on the picture instead of the question. |

Fail one and you get *"Let's try an easier one."* It is not easier. That happens
from the very first failure.

## Tiers

| Tier | How |
| --- | --- |
| `PRE-2008` | First attempt |
| `LOCAL` | Second |
| `TRANSPLANT` | Third |
| `TOURIST` | Fourth or worse |
| `VISITOR` | Took the escape hatch |

Passing draws a 1200x630 PNG you can download and post.

## Writing a challenge

A challenge is data. Grid challenges need nine tiles and an inline SVG each:

```ts
import type { GridChallenge } from './types'

export const yourChallenge: GridChallenge = {
  id: 'your-challenge',
  kind: 'grid',
  prompt: 'Select all squares with',
  subject: 'something only locals would know',
  hint: 'Click verify once there are none left.',
  tiles: [
    { id: 'a', art: '<svg …>', label: 'Described for screen readers', correct: true },
    // …eight more
  ],
}
```

Then add it to `LADDER` in `src/challenges/index.ts`.

The one rule that matters: **difficulty must come from obscurity, never from
ambiguity.** Twice during the build a correct tile and an incorrect tile were
drawn so similarly that the challenge became unfair rather than hard. Check
every new tile against its nearest neighbour in the opposite set.

## Accessibility

A joke captcha that locks people out is just a broken captcha.

- **The escape hatch.** A link under the grid reading *"I have never been to San
  Francisco"* serves a plain text challenge instead. It scores as `VISITOR`, not
  `TOURIST`.
- Everything is reachable by keyboard in reading order, with visible focus.
- The header is a live region, so a new challenge is announced.
- Known limitation: tile `aria-label`s describe the pictures, so a screen reader
  user can solve any challenge by reading them. That is the same fact as the
  answer key being in the bundle, and it is fine for as long as this is
  entertainment.

## Not built yet

Server-side verification, the prompt-injection honeypot tile, timing signals,
and a loadable pack format so a scene other than San Francisco can ship its own
challenges.

## Development

```bash
npm install
npm run dev        # demo page, deliberately hostile page CSS to prove isolation
npm run build
npm run typecheck
```

There is no test suite yet.

## License

MIT
