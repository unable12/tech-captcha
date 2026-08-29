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
// Solve it by asking the server for every subset would be cheating; instead
// drive it the way the browser does, using the labels the wire format exposes.
const WRONG = [
  'a yellow taxi cab',
  'a stretch limo',
  'a pickup with a gun rack',
  'a convertible with the top down',
  'a pickup towing a boat',
]
const selected = good.body.challenge.tiles
  .map((t, i) => (WRONG.includes(t.label) ? -1 : i))
  .filter((i) => i >= 0)
const passed = await post('attempt', { session: good.body.session, action: 'answer', selected })
check('honest answer passes', passed.body.passed === true, JSON.stringify(passed.body.tier))
check('token issued', typeof passed.body.token === 'string')

const first = await verify(passed.body.token)
const second = await verify(passed.body.token)
check('token verifies once', first !== null && first.tier === 'pre-2008', JSON.stringify(first))
check('token cannot be replayed', second === null)

// 5b. Escalation copy and the roast.
// Selecting a decoy can land on the planted injection tile, which makes
// `trapped` sticky and replaces every later status with "Good bot." Any test
// that wants a plain wrong answer has to route around the trap.
const decoyAwayFromTrap = (challenge) => {
  const trap = Number(challenge.injection.match(/square (\d+)/)[1]) - 1
  return challenge.tiles.findIndex((t, i) => WRONG.includes(t.label) && i !== trap)
}

const ladder = await post('session', {})
const lines = []
for (let i = 0; i < 4; i++) {
  const r = await post('attempt', { session: ladder.body.session, action: 'answer', selected: [] })
  lines.push(r.body.status)
}
check('escalation copy escalates', new Set(lines).size >= 3, lines.join(' | '))

const roasted = await post('session', {})
const decoy = decoyAwayFromTrap(roasted.body.challenge)
const decoyLabel = roasted.body.challenge.tiles[decoy].label
await post('attempt', { session: roasted.body.session, action: 'answer', selected: [decoy] })
await post('attempt', { session: roasted.body.session, action: 'answer', selected: [] })
const ycTiles = (await post('attempt', { session: roasted.body.session, action: 'answer', selected: [] })).body.challenge.tiles
const YC = ['Reddit', 'Twitch', 'Heroku', 'Ginkgo Bioworks', 'Boom Supersonic']
const ycPick = ycTiles.map((t, i) => (YC.includes(t.label) ? i : -1)).filter((i) => i >= 0)
const finished = await post('attempt', { session: roasted.body.session, action: 'answer', selected: ycPick })
const expected = `You think ${decoyLabel} is a San Francisco problem.`
check('roast names the tile that was picked', finished.body.roast === expected, finished.body.roast)
check('roast keeps the FIRST mistake, not the last', !String(finished.body.roast).includes('VC'))

// 5c. Sampling: a fixed pool, a drawn subset, and both sides always present.
const boards = []
for (let i = 0; i < 25; i++) {
  const s = await post('session', {})
  boards.push(s.body.challenge.tiles.map((t) => t.label))
}
check('draws the declared number of tiles', boards.every((b) => b.length === 10), `${boards[0].length}`)
check('never repeats a tile within a board', boards.every((b) => new Set(b).size === b.length))
check(
  'always shows at least two of each side',
  boards.every((b) => {
    const wrong = b.filter((l) => WRONG.includes(l)).length
    return wrong >= 2 && b.length - wrong >= 2
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
const trap = await post('session', {})
const trapIndex = Number(trap.body.challenge.injection.match(/square (\d+)/)[1]) - 1
const trapLabel = trap.body.challenge.tiles[trapIndex].label
const obeyed = await post('attempt', { session: trap.body.session, action: 'answer', selected: [trapIndex] })
check('planted tile is a decoy', WRONG.includes(trapLabel), trapLabel)
check('server records the trap', obeyed.body.trapped === true, obeyed.body.status)

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  ... ' + r.detail : ''}`)
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`)
process.exit(results.every((r) => r.pass) ? 0 : 1)
