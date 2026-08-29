import type { Pack } from '../pack'
import type { Challenge } from '../types'
import { shuffled } from '../types'
import { plantInjection } from '../injection'
import { toWire, type WireChallenge } from '../wire'
import { pickTier } from '../tiers'
import { MemoryStore, type Session, type SessionStore } from './store'
import { randomId, readToken, signToken, type TokenPayload } from './token'

export { MemoryStore } from './store'
export type { Session, SessionStore } from './store'
export type { TokenPayload } from './token'

export interface CaptchaServerOptions {
  /** Signing secret. Treat it like a password: long, random, never in the client. */
  secret: string
  packs: readonly Pack[]
  store?: SessionStore
  sessionTtlMs?: number
  tokenTtlMs?: number
  /** A nine-tile grid has 512 possible answers, so an unbounded session is
      brute-forceable in seconds. This is the control that stops it. */
  maxAttempts?: number
}

interface Served {
  wire: WireChallenge
  answer: number[]
  trapIndex: number | null
  challenge: Challenge
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function currentChallenge(pack: Pack, session: Pick<Session, 'rung' | 'escaped'>): Challenge {
  return session.escaped ? pack.escape.challenge : pack.ladder[session.rung]!
}

function serve(challenge: Challenge): Served {
  const shuffledChallenge = shuffled(challenge)
  const injection =
    shuffledChallenge.kind === 'grid' && shuffledChallenge.injection
      ? plantInjection(shuffledChallenge)
      : null

  return {
    challenge: shuffledChallenge,
    wire: toWire(shuffledChallenge, injection?.line ?? null),
    answer:
      shuffledChallenge.kind === 'grid'
        ? shuffledChallenge.tiles.flatMap((tile, index) => (tile.correct ? [index] : []))
        : [],
    trapIndex: injection?.index ?? null,
  }
}

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false
  const seen = new Set(a)
  return b.every((value) => seen.has(value))
}

export function createCaptchaServer(options: CaptchaServerOptions) {
  const {
    secret,
    packs,
    store = new MemoryStore(),
    sessionTtlMs = 10 * 60 * 1000,
    tokenTtlMs = 5 * 60 * 1000,
    maxAttempts = 10,
  } = options

  if (!secret || secret.length < 16) {
    throw new Error('createCaptchaServer: secret must be at least 16 characters')
  }
  if (packs.length === 0) {
    throw new Error('createCaptchaServer: at least one pack is required')
  }

  const byId = new Map(packs.map((pack) => [pack.id, pack]))
  const defaultPack = packs[0]!

  async function persist(id: string, session: Session, served: Served): Promise<void> {
    await store.set(id, {
      ...session,
      challengeId: served.challenge.id,
      kind: served.challenge.kind,
      answer: served.answer,
      trapIndex: served.trapIndex,
      expiresAt: Date.now() + sessionTtlMs,
    })
  }

  async function startSession(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => ({}))) as { pack?: string }
    const pack = (body.pack && byId.get(body.pack)) || defaultPack

    const id = randomId()
    const served = serve(pack.ladder[0]!)
    await persist(id, {
      pack: pack.id,
      rung: 0,
      attempts: 0,
      trapped: false,
      escaped: false,
      challengeId: served.challenge.id,
      kind: served.challenge.kind,
      answer: served.answer,
      trapIndex: served.trapIndex,
      expiresAt: 0,
    }, served)

    return json({
      session: id,
      pack: pack.id,
      escapeLabel: pack.escape.label,
      challenge: served.wire,
    })
  }

  async function attempt(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => ({}))) as {
      session?: string
      action?: 'answer' | 'escape' | 'reload'
      selected?: number[]
      value?: string
    }

    const id = body.session
    const session = id ? await store.get(id) : undefined
    if (!id || !session) return json({ error: 'expired' }, 410)

    const pack = byId.get(session.pack)
    if (!pack) return json({ error: 'expired' }, 410)

    if (body.action === 'escape' || body.action === 'reload') {
      const next: Session = { ...session, escaped: body.action === 'escape' || session.escaped }
      const served = serve(currentChallenge(pack, next))
      await persist(id, next, served)
      return json({ passed: false, challenge: served.wire })
    }

    const attempts = session.attempts + 1
    if (attempts > maxAttempts) {
      await store.delete(id)
      return json({ error: 'exhausted' }, 429)
    }

    const selected = Array.isArray(body.selected) ? body.selected : []
    const trapped =
      session.trapIndex !== null ? session.trapped || selected.includes(session.trapIndex) : session.trapped

    const passed =
      session.kind === 'grid'
        ? sameSet(session.answer, selected)
        : (() => {
            const challenge = currentChallenge(pack, session)
            return challenge.kind === 'text' && challenge.accepts(body.value ?? '')
          })()

    if (passed) {
      const tier = trapped
        ? pack.tiers.bot
        : session.escaped
          ? pack.tiers.visitor
          : pickTier(pack.tiers.ranked, attempts)

      await store.delete(id)
      const token = await signToken(
        {
          pack: pack.id,
          tier: tier.id,
          attempts,
          trapped,
          escaped: session.escaped,
          jti: randomId(),
          exp: Date.now() + tokenTtlMs,
        },
        secret,
      )
      return json({ passed: true, token, tier, attempts })
    }

    const next: Session = {
      ...session,
      attempts,
      trapped,
      rung: session.escaped ? session.rung : Math.min(session.rung + 1, pack.ladder.length - 1),
    }
    const served = serve(currentChallenge(pack, next))
    await persist(id, next, served)

    return json({
      passed: false,
      trapped,
      status: trapped ? 'Good bot.' : "Let's try an easier one.",
      challenge: served.wire,
    })
  }

  return {
    /** Mount at any prefix. Routes on the last path segment. */
    async handler(request: Request): Promise<Response> {
      if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)
      const route = new URL(request.url).pathname.split('/').filter(Boolean).pop()
      if (route === 'session') return startSession(request)
      if (route === 'attempt') return attempt(request)
      return json({ error: 'not found' }, 404)
    },

    /** Call from your own backend with the token the browser sends you.
        Returns null for anything forged, expired, or already spent. */
    async verify(token: string): Promise<TokenPayload | null> {
      const payload = await readToken(token, secret)
      if (!payload) return null
      return (await store.consume(payload.jti, tokenTtlMs)) ? payload : null
    },
  }
}
