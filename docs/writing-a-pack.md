# Writing a pack

A pack is one scene's worth of captcha: its challenges, its way out, and its
own names for how well you did. It is one object, and nothing in the core is
San Francisco specific, so a new scene needs no changes to it.

```ts
import { registerPack, type Pack } from 'tech-captcha'

const london: Pack = {
  id: 'london',
  name: 'London',
  ladder: [placesYouMightMeetAVc],
  escape: {
    label: 'I have never been to London',
    challenge: typeTheWordHuman,
  },
  tiers: {
    ranked: [
      { id: 'zone-1', name: 'ZONE 1', flavor: '...', letter: '...' },
      { id: 'zone-4', name: 'ZONE 4', flavor: '...', letter: '...' },
    ],
    bot: { id: 'bot', name: 'BOT', flavor: '...', letter: '...' },
    visitor: { id: 'visitor', name: 'VISITOR', flavor: '...', letter: '...' },
  },
}

registerPack(london)
```

```html
<tech-captcha pack="london"></tech-captcha>
```

A challenge is data too. Phrase challenges need no art at all:

```ts
const vcSpots: PhraseChallenge = {
  id: 'vc-spots',
  kind: 'phrases',
  injection: true,
  columns: 3,          // 3 for short names, 2 for sentences, 1 for anything longer
  prompt: 'Select everywhere you might',
  subject: 'run into a VC',
  hint: 'Some of these are for tourists.',
  show: 9,             // drawn from a bigger pool, so every run is a new board
  roast: {
    picked: 'You would look for a VC at {}.',
    missed: 'You have never been to {}.',
  },
  tiles: [
    { id: 'south-park', text: 'South Park', correct: true },
    { id: 'pier-39', text: 'Pier 39', correct: false },
    // ...
  ],
}
```

## Write more tiles than you show

`show` draws a subset of the pool on every run, always keeping at least two
correct and two incorrect tiles so the question stays a question. Sixteen tiles
showing nine means the second person to try it gets a different board, which is
most of what makes it worth passing along. It is the highest-leverage thing you
can do for a pack.

Two consequences worth knowing. `show` should be even for a two-column
challenge, or the last row is left with an orphan. And a hint cannot state a
count any more: San Francisco's says *"Some of these are for tourists"* rather
than *"Three of these"*, because the number now varies.

Pick `columns` to fit the phrases rather than trimming phrases to fit a grid.
Image challenges use `kind: 'grid'` and take an inline SVG plus a screen-reader
`label` per tile.

`src/packs/example` is a working template with both challenge kinds in about
fifty lines. Copy it.

## Three rules that matter

- **Difficulty comes from obscurity, never from ambiguity.** If a solver has to
  ask "does that count?", the tile is broken rather than hard. Check every new
  tile against its nearest neighbour in the opposite set.
- **Decoys have to be real.** A decoy a stranger can eliminate on sight is not a
  decoy. See the design notes in the
  [README](../README.md#design-notes).
- **The escape hatch is not optional.** Gating a form on local knowledge locks
  out everyone who does not have it. Give your pack a real way out and score it
  as its own thing, not as a failure.
- **Every challenge must be answerable from knowledge.** A challenge whose
  answer is "none of them", or that turns on spotting a meta-joke, is a riddle
  rather than a shibboleth. Someone who fails it learns nothing and feels
  tricked, which is the opposite of the effect you want.

Start phrases lowercase unless they begin with a proper noun. Ten tiles that
each open with a capital "A" read as ten shouted sentences; lowercase makes each
one a continuation of the prompt above it.

