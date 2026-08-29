import { createCaptchaServer } from '../dist/server.js'
import { sanFrancisco } from '../dist/packs.js'

const SECRET = 'a-very-long-test-secret-value'
const { handler, verify } = createCaptchaServer({ secret: SECRET, packs: [sanFrancisco] })

const post = (route, body) =>
  handler(new Request(`http://x/captcha/${route}`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  })).then(async (r) => ({ status: r.status, body: await r.json() }))

const results = []
const check = (name, pass, detail) => results.push({ name, pass, detail })

/* Answers are resolved from the pack by tile id rather than by matching the
   text on screen. Tile wording changes constantly; ids do not, and neither
   does which rung of the ladder a challenge sits on. */
const source = (id) =>
  sanFrancisco.ladder.find((c) => c.id === id) ??
  (sanFrancisco.escape.challenge.id === id ? sanFrancisco.escape.challenge : null)

const isCorrect = (challengeId, tileId) =>
  source(challengeId)?.tiles?.find((t) => t.id === tileId)?.correct === true

/** Indexes of the tiles that should be selected, in the order served. */
const answerFor = (challenge) =>
  challenge.tiles
    .map((t, i) => (isCorrect(challenge.id, t.id) ? i : -1))
    .filter((i) => i >= 0)

const decoysIn = (challenge) =>
  challenge.tiles.map((t, i) => (isCorrect(challenge.id, t.id) ? -1 : i)).filter((i) => i >= 0)

const trapIn = (challenge) => Number(challenge.injection.match(/square (\d+)/)[1]) - 1

// 1. The answer key must not reach the client.
const start = await post('session', { pack: 'sf' })
const wire = start.body.challenge
check('no `correct` on any wire tile', wire.tiles.every((t) => !('correct' in t)), Object.keys(wire.tiles[0]))
check('session id issued', typeof start.body.session === 'string')
check('injection line present', typeof wire.injection === 'string')

// 2. A wrong answer fails and advances the ladder.
const wrong = await post('attempt', { session: start.body.session, action: 'answer', selected: [0] })
check('wrong answer fails', wrong.body.passed === false, wrong.body.status)
check('ladder advanced', wrong.body.challenge.id !== wire.id, `${wire.id} -> ${wrong.body.challenge.id}`)

// 3. Brute force is bounded.
const bf = await post('session', {})
let exhausted = null
for (let i = 0; i < 12; i++) {
  const r = await post('attempt', { session: bf.body.session, action: 'answer', selected: [i % 9] })
  if (r.status === 429) { exhausted = i + 1; break }
}
check('session burns after maxAttempts', exhausted === 11, `exhausted on attempt ${exhausted}`)

// 4. A dead session cannot be reused.
const dead = await post('attempt', { session: bf.body.session, action: 'answer', selected: [] })
check('burned session is gone', dead.status === 410, dead.status)

// 5. Honest pass issues a token that verifies exactly once.
const good = await post('session', {})
const passed = await post('attempt', {
  session: good.body.session,
  action: 'answer',
  selected: answerFor(good.body.challenge),
})
check('honest answer passes', passed.body.passed === true, JSON.stringify(passed.body.tier))
check('token issued', typeof passed.body.token === 'string')

const first = await verify(passed.body.token)
const second = await verify(passed.body.token)
check('token verifies once', first !== null && first.tier === 'pre-2008', JSON.stringify(first))
check('token cannot be replayed', second === null)

// 5b. The ladder walks every rung, and the copy degrades as it goes.
const ladder = await post('session', {})
const lines = []
const seen = [ladder.body.challenge.id]
for (let i = 0; i < sanFrancisco.ladder.length + 1; i++) {
  const r = await post('attempt', { session: ladder.body.session, action: 'answer', selected: [] })
  lines.push(r.body.status)
  seen.push(r.body.challenge.id)
}
check('escalation copy escalates', new Set(lines).size >= 3, lines.join(' | '))
check(
  'the ladder reaches every rung',
  sanFrancisco.ladder.every((c) => seen.includes(c.id)),
  seen.join(' -> '),
)

// 5b2. The roast names the FIRST mistake, whatever rung it happened on.
// Selecting a decoy can land on the planted injection tile, which makes
// `trapped` sticky and replaces every later status with "Good bot.", so any
// test wanting a plain wrong answer has to route around the trap.
const roasted = await post('session', {})
const trap = trapIn(roasted.body.challenge)
const decoy = decoysIn(roasted.body.challenge).find((i) => i !== trap)
const decoyLabel = roasted.body.challenge.tiles[decoy].label
let step = await post('attempt', { session: roasted.body.session, action: 'answer', selected: [decoy] })
// Fail through the middle of the ladder, then solve whatever rung we land on.
while (step.body.passed === false && step.body.challenge.id !== sanFrancisco.ladder.at(-1).id) {
  step = await post('attempt', { session: roasted.body.session, action: 'answer', selected: [] })
}
const finished = await post('attempt', {
  session: roasted.body.session,
  action: 'answer',
  selected: answerFor(step.body.challenge),
})
check('run finishes on the last rung', finished.body.passed === true, JSON.stringify(finished.body.tier?.id))
check(
  'roast names the tile that was picked',
  finished.body.roast === `You think ${decoyLabel} is a San Francisco problem.`,
  finished.body.roast,
)
check('roast keeps the FIRST mistake, not the last', !String(finished.body.roast).includes('term sheet'))

// 5c. Sampling: a fixed pool, a drawn subset, and both sides always present.
const boardTiles = []
for (let i = 0; i < 25; i++) {
  const s = await post('session', {})
  boardTiles.push(s.body.challenge.tiles)
}
const boards = boardTiles.map((tiles) => tiles.map((t) => t.id))
check('draws the declared number of tiles', boards.every((b) => b.length === 10), `${boards[0].length}`)
check('never repeats a tile within a board', boards.every((b) => new Set(b).size === b.length))
check(
  'always shows at least two of each side',
  boardTiles.every((tiles) => {
    const wrong = tiles.filter((t) => !isCorrect('cars-of-sf', t.id)).length
    return wrong >= 2 && tiles.length - wrong >= 2
  }),
)
check('boards differ between runs', new Set(boards.map((b) => [...b].sort().join('|'))).size > 1, `${new Set(boards.map((b) => [...b].sort().join('|'))).size} distinct of 25`)

// 6. Forgery.
const [body] = passed.body.token.split('.')
check('bad signature rejected', (await verify(`${body}.AAAA`)) === null)
const tampered = Buffer.from(JSON.stringify({ ...first, tier: 'pre-2008', jti: 'x', exp: Date.now() + 1e6 })).toString('base64url')
check('unsigned payload rejected', (await verify(`${tampered}.AAAA`)) === null)

// 7. Escape hatch goes through the server too.
const esc = await post('session', {})
const escaped = await post('attempt', { session: esc.body.session, action: 'escape' })
check('escape serves the text challenge', escaped.body.challenge.kind === 'text', escaped.body.challenge.subject)
const escPass = await post('attempt', { session: esc.body.session, action: 'answer', value: '  HUMAN ' })
check('escape scores as visitor', escPass.body.tier?.id === 'visitor', JSON.stringify(escPass.body.tier))

// 8. Following the injection is recorded server-side.
const trapRun = await post('session', {})
const trapIndex = trapIn(trapRun.body.challenge)
const trapLabel = trapRun.body.challenge.tiles[trapIndex].label
const obeyed = await post('attempt', { session: trapRun.body.session, action: 'answer', selected: [trapIndex] })
check('planted tile is a decoy', !isCorrect('cars-of-sf', trapRun.body.challenge.tiles[trapIndex].id), trapLabel)
check('server records the trap', obeyed.body.trapped === true, obeyed.body.status)

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  ... ' + r.detail : ''}`)
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`)
process.exit(results.every((r) => r.pass) ? 0 : 1)
