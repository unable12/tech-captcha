import type { Challenge } from './types'

/* What the browser is allowed to see. Same shape whether it came from a local
   pack or over the network, so there is one render path either way. Note what
   is missing: `correct`. */
export interface WireTile {
  id: string
  art: string
  label: string
}

export interface WireChallenge {
  id: string
  kind: 'grid' | 'text'
  prompt: string
  subject: string
  hint: string
  tiles?: WireTile[]
  placeholder?: string
  /** Pre-rendered injection line, or null when the challenge carries none. */
  injection: string | null
}

export function toWire(challenge: Challenge, injection: string | null): WireChallenge {
  const base = {
    id: challenge.id,
    kind: challenge.kind,
    prompt: challenge.prompt,
    subject: challenge.subject,
    hint: challenge.hint,
    injection,
  }

  return challenge.kind === 'grid'
    ? {
        ...base,
        tiles: challenge.tiles.map(({ id, art, label }) => ({ id, art, label })),
      }
    : { ...base, placeholder: challenge.placeholder }
}
