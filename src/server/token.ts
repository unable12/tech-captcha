/* Web Crypto rather than node:crypto so the same build runs on Node, Deno,
   Bun and Workers. */

export interface TokenPayload {
  pack: string
  tier: string
  attempts: number
  trapped: boolean
  escaped: boolean
  /** Token id. Recorded on verify so a token cannot be spent twice. */
  jti: string
  /** Epoch milliseconds. */
  exp: number
}

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

/** Compares every byte regardless of where the first mismatch is. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a[i]! ^ b[i]!
  return difference === 0
}

export async function signToken(payload: TokenPayload, secret: string): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

export async function readToken(token: string, secret: string): Promise<TokenPayload | null> {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(body))
  let provided: Uint8Array
  try {
    provided = fromBase64Url(signature)
  } catch {
    return null
  }
  if (!constantTimeEqual(new Uint8Array(expected), provided)) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload
    return payload.exp > Date.now() ? payload : null
  } catch {
    return null
  }
}

export function randomId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(16)))
}
