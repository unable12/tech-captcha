import type { Challenge } from './types'

/* What the browser is allowed to see. Same shape whether it came from a local
   pack or over the network, so there is one render path either way. Note what
   is missing: `correct`. */
export interface WireTile {
  id: string
  /** Accessible name. For phrase tiles this is the phrase itself. */
  label: string
  /** Inline SVG, image tiles only. */
  art?: string
  /** Phrase, text tiles only. */
  text?: string
}

export interface WireChallenge {
  id: string
  kind: 'grid' | 'phrases' | 'text'
  columns?: 1 | 2 | 3
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

  if (challenge.kind === 'text') {
    return { ...base, placeholder: challenge.placeholder }
  }

  return {
    ...base,
    columns: challenge.columns ?? 3,
    tiles:
      challenge.kind === 'grid'
        ? challenge.tiles.map(({ id, art, label }) => ({ id, art, label }))
        : challenge.tiles.map(({ id, text }) => ({ id, text, label: text })),
  }
}
