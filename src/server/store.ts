export interface Session {
  pack: string
  /** Which rung of this run's ladder is currently being served. */
  rung: number
  /** Challenge ids for this run, drawn at session start. Stored rather than
      recomputed so a reload cannot reroll into an easier ladder. */
  rungIds: string[]
  attempts: number
  trapped: boolean
  escaped: boolean
  failures: number
  /** First mistake of the run, kept for the result card. */
  roast: string | null
  challengeId: string
  kind: 'grid' | 'phrases' | 'text'
  /** Indexes of the correct tiles, in the order the browser received them. */
  answer: number[]
  /** Tile ids in the order the browser received them. Selections come back as
      indexes into this, so anything that needs to name a tile has to map
      through it rather than through the pack's own order. */
  tileIds: string[]
  /** Index of the planted injection tile, in the same order. */
  trapIndex: number | null
  expiresAt: number
}

/** Async so a Redis or Postgres implementation drops straight in. */
export interface SessionStore {
  get(id: string): Promise<Session | undefined>
  set(id: string, session: Session): Promise<void>
  delete(id: string): Promise<void>
  /** Returns false if the id was already consumed. Used to spend tokens once. */
  consume(id: string, ttlMs: number): Promise<boolean>
}

/* Fine for one process. Anything running more than one instance needs a shared
   store, which is the entire reason this is an interface. */
export class MemoryStore implements SessionStore {
  #sessions = new Map<string, Session>()
  #spent = new Map<string, number>()

  async get(id: string): Promise<Session | undefined> {
    const session = this.#sessions.get(id)
    if (!session) return undefined
    if (session.expiresAt <= Date.now()) {
      this.#sessions.delete(id)
      return undefined
    }
    return session
  }

  async set(id: string, session: Session): Promise<void> {
    this.#sweep()
    this.#sessions.set(id, session)
  }

  async delete(id: string): Promise<void> {
    this.#sessions.delete(id)
  }

  async consume(id: string, ttlMs: number): Promise<boolean> {
    this.#sweep()
    if (this.#spent.has(id)) return false
    this.#spent.set(id, Date.now() + ttlMs)
    return true
  }

  /** Lazy eviction. Nothing here schedules a timer, so the process can exit. */
  #sweep(): void {
    const now = Date.now()
    for (const [id, session] of this.#sessions) {
      if (session.expiresAt <= now) this.#sessions.delete(id)
    }
    for (const [id, expiresAt] of this.#spent) {
      if (expiresAt <= now) this.#spent.delete(id)
    }
  }
}
