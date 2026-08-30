# Security

## What is not a vulnerability

**Local mode does not protect anything, by design.** It is the default, it needs
no backend, and the answers are in the bundle where anyone with devtools can
read them. That is documented in the README under Two modes. Reports that the
answer key is readable, or that the widget can be bypassed by calling the host
page's own callback, are not vulnerabilities. Local mode is entertainment.

**Knowledge challenges are easy for a language model.** A model already knows
which coffee shop the VCs drink at. Server mode stops answer scraping, replay
and unbounded brute force. It does not make the questions hard for software, and
the README says so rather than implying otherwise.

**The injection honeypot is a signal, not a wall.** It catches an agent that
reads the page and follows what it finds. It will not catch one that has been
hardened against injection, or a script that never reads the text at all.

## What is

Server mode issues HMAC-signed, single-use tokens and grades on the server, so
anything that breaks those properties is worth reporting:

- Forging a token that `verify()` accepts
- Replaying a token that has already been spent
- Passing a challenge without submitting the correct answer
- Reading the answer key out of a `/session` or `/attempt` response
- Getting past `maxAttempts` within one session
- Reading or writing another session through the store interface

Also worth reporting: anything that lets a pack, a tile, or a server response
inject markup or script into the host page. The widget renders into a shadow
root and sets tile text with `textContent` rather than `innerHTML`, so that
should not be reachable, but it is the thing most worth being wrong about.

## Reporting

Open a [security advisory](../../security/advisories/new) rather than a public
issue. There is no bounty and no formal response window; this is a side project
maintained by one person, so expect a reply in days rather than hours.

## If you deploy server mode

Two things the library cannot do for you:

- **`MemoryStore` is correct for one process and wrong for several.** A session
  created on one instance is invisible to another. Implement `SessionStore`
  against a shared store before you run more than one.
- **There is no rate limiting by IP.** `maxAttempts` bounds a single session,
  not a client opening a thousand of them. Put your usual limiter in front.
