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
const everyChallenge = [
  ...sanFrancisco.ladder,
  ...(sanFrancisco.finale ?? []),
  sanFrancisco.escape.challenge,
]
const source = (id) => everyChallenge.find((c) => c.id === id) ?? null

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

/** Mirrors copy.ts: a leading article means a common noun, so it gets lowered. */
const inSentence = (text) =>
  /^(A|An|The) /.test(text) ? text[0].toLowerCase() + text.slice(1) : text

const expectedRoast = (challenge, tileLabel) =>
  source(challenge.id).roast.picked.replace('{}', inSentence(tileLabel))

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
// Selecting every tile is the one answer guaranteed to be wrong on any board,
// since every challenge carries at least one decoy. A single-tile guess is not
// safe here: the finale challenges have exactly one correct answer, so a guess
// can pass the run and delete the session before the limit is reached.
const bf = await post('session', {})
let exhausted = null
let board = bf.body.challenge
for (let i = 0; i < 12; i++) {
  const r = await post('attempt', {
    session: bf.body.session,
    action: 'answer',
    selected: board.tiles.map((_, index) => index),
  })
  if (r.status === 429) { exhausted = i + 1; break }
  if (r.body.challenge) board = r.body.challenge
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

// 5b. A run draws its own ladder, always ending on a finale challenge.
const runs = []
for (let i = 0; i < 20; i++) {
  const run = await post('session', {})
  const ids = [run.body.challenge.id]
  for (let step = 0; step < 6; step++) {
    const r = await post('attempt', { session: run.body.session, action: 'answer', selected: [] })
    if (r.body.challenge && ids.at(-1) !== r.body.challenge.id) ids.push(r.body.challenge.id)
    else break
  }
  runs.push(ids)
}
const finaleIds = (sanFrancisco.finale ?? []).map((c) => c.id)
check('a run serves the declared number of rungs', runs.every((r) => r.length === sanFrancisco.rungs), `${runs[0].length} of ${sanFrancisco.rungs}`)
check('every run ends on a finale challenge', runs.every((r) => finaleIds.includes(r.at(-1))), runs[0].join(' -> '))
check('no finale challenge appears before the end', runs.every((r) => r.slice(0, -1).every((id) => !finaleIds.includes(id))))
check('straight rungs keep their declared order', runs.every((r) => {
  const positions = r.slice(0, -1).map((id) => sanFrancisco.ladder.findIndex((c) => c.id === id))
  return positions.every((v, i) => i === 0 || positions[i - 1] < v)
}), runs[0].join(' -> '))
check('ladders differ between runs', new Set(runs.map((r) => r.join('|'))).size > 1, `${new Set(runs.map((r) => r.join('|'))).size} distinct of 20`)

// A single-correct challenge must never be sampled down to zero correct tiles.
const finaleBoards = []
for (let i = 0; i < 20; i++) {
  const run = await post('session', {})
  let r = { body: run.body }
  while (!finaleIds.includes(r.body.challenge.id)) {
    r = await post('attempt', { session: run.body.session, action: 'answer', selected: [] })
  }
  finaleBoards.push(r.body.challenge)
}
check(
  'a one-answer challenge always includes its answer',
  finaleBoards.every((c) => c.tiles.some((t) => isCorrect(c.id, t.id))),
  `${finaleBoards.length} finale boards checked`,
)

const lines = []
const copyRun = await post('session', {})
for (let i = 0; i < 5; i++) {
  const r = await post('attempt', { session: copyRun.body.session, action: 'answer', selected: [] })
  lines.push(r.body.status)
}
check('escalation copy escalates', new Set(lines).size >= 3, lines.join(' | '))

// 5b2. The roast names the FIRST mistake, whatever rung it happened on.
// Selecting a decoy can land on the planted injection tile, which makes
// `trapped` sticky and replaces every later status with "Good bot.", so any
// test wanting a plain wrong answer has to route around the trap.
const roasted = await post('session', {})
const trap = trapIn(roasted.body.challenge)
const decoy = decoysIn(roasted.body.challenge).find((i) => i !== trap)
const decoyLabel = roasted.body.challenge.tiles[decoy].label
let step = await post('attempt', { session: roasted.body.session, action: 'answer', selected: [decoy] })
// Fail on down to the finale, then solve whatever we land on.
while (step.body.passed === false && !finaleIds.includes(step.body.challenge.id)) {
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
  finished.body.roast === expectedRoast(roasted.body.challenge, decoyLabel),
  `${finished.body.roast}  (expected: ${expectedRoast(roasted.body.challenge, decoyLabel)})`,
)
check(
  'roast keeps the FIRST mistake, not the last',
  finished.body.roast === expectedRoast(roasted.body.challenge, decoyLabel),
  `first rung was ${roasted.body.challenge.id}`,
)

// 5c. Sampling: a fixed pool, a drawn subset, and both sides always present.
const boardTiles = []
const boardIds = []
for (let i = 0; i < 25; i++) {
  const s = await post('session', {})
  boardTiles.push(s.body.challenge.tiles)
  boardIds.push(s.body.challenge.id)
}
const boards = boardTiles.map((tiles) => tiles.map((t) => t.id))
check(
  'draws the declared number of tiles',
  boardTiles.every((tiles, i) => tiles.length === (source(boardIds[i]).show ?? source(boardIds[i]).tiles.length)),
  boardTiles.map((t) => t.length).join(','),
)
check('never repeats a tile within a board', boards.every((b) => new Set(b).size === b.length))
check(
  'always shows as much of each side as the pool allows',
  boardTiles.every((tiles, i) => {
    const id = boardIds[i]
    const pool = source(id).tiles
    const want = (side) => Math.min(2, pool.filter((t) => t.correct === side).length)
    const right = tiles.filter((t) => isCorrect(id, t.id)).length
    return right >= want(true) && tiles.length - right >= want(false)
  }),
)
check(
  'boards differ between runs',
  new Set(boards.map((b) => [...b].sort().join('|'))).size > 5,
  `${new Set(boards.map((b) => [...b].sort().join('|'))).size} distinct of 25`,
)

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
check(
  'planted tile is a decoy',
  !isCorrect(trapRun.body.challenge.id, trapRun.body.challenge.tiles[trapIndex].id),
  `${trapRun.body.challenge.id}: ${trapLabel}`,
)
check('server records the trap', obeyed.body.trapped === true, obeyed.body.status)

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  ... ' + r.detail : ''}`)
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`)
process.exit(results.every((r) => r.pass) ? 0 : 1)
