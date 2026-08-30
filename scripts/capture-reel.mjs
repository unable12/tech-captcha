#!/usr/bin/env node
/*
 * Renders docs/reel.html to a gif and an mp4.
 *
 *   npm run dev
 *   node scripts/capture-reel.mjs [--url=http://localhost:5173] [--seed=7] [--fps=12] [--seconds=16.7]
 *
 * One Chrome, one page, driven over CDP. The first version of this spawned a
 * browser per frame with --virtual-time-budget, which stalls on the Google
 * Fonts request because virtual time does not advance during network waits: it
 * managed five frames in fifteen minutes. Node has a global WebSocket, so
 * talking to Chrome directly costs nothing and takes about a fifth of a second
 * a frame.
 */
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback

const URL_BASE = arg('url', 'http://localhost:5173')
const SEED = arg('seed', '7')
const FPS = Number(arg('fps', '12'))
const SECONDS = Number(arg('seconds', '16.7'))
const TOTAL = Math.round(SECONDS * FPS)
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function findPort(chrome) {
  // Chrome prints the devtools endpoint to stderr once it is listening.
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not start')), 20000)
    chrome.stderr.on('data', (chunk) => {
      const match = String(chunk).match(/ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/(\S+)/)
      if (match) {
        clearTimeout(timer)
        resolve(match[0])
      }
    })
  })
}

class Cdp {
  #ws
  #id = 0
  #pending = new Map()

  static async connect(url) {
    const cdp = new Cdp()
    cdp.#ws = new WebSocket(url)
    cdp.#ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      const resolve = cdp.#pending.get(msg.id)
      if (!resolve) return
      cdp.#pending.delete(msg.id)
      resolve(msg.error ? Promise.reject(new Error(msg.error.message)) : msg.result)
    })
    await new Promise((r, j) => {
      cdp.#ws.addEventListener('open', r, { once: true })
      cdp.#ws.addEventListener('error', j, { once: true })
    })
    return cdp
  }

  send(method, params = {}, sessionId) {
    const id = ++this.#id
    return new Promise((resolve) => {
      this.#pending.set(id, resolve)
      this.#ws.send(JSON.stringify({ id, method, params, sessionId }))
    })
  }

  close() { this.#ws.close() }
}

const profile = await mkdtemp(join(tmpdir(), 'reel-'))
const frames = await mkdtemp(join(tmpdir(), 'reel-frames-'))
const chrome = spawn(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--window-size=1080,1080',
  'about:blank',
])

let cdp
try {
  const browserWs = await findPort(chrome)
  cdp = await Cdp.connect(browserWs)

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const on = (method, params) => cdp.send(method, params, sessionId)

  await on('Page.enable')
  await on('Runtime.enable')
  await on('Emulation.setDeviceMetricsOverride', {
    width: 1080, height: 1080, deviceScaleFactor: 1, mobile: false,
  })

  const url = `${URL_BASE}/docs/reel.html?capture=1&seed=${SEED}&fps=${FPS}`
  await on('Page.navigate', { url })

  /* Fail loudly when the page is not the reel. An earlier version polled for
     readiness, gave up quietly, and captured two hundred frames of Chrome's
     "This site can't be reached" page, then reported success. A capture script
     that cannot tell a product demo from an error page is worse than no
     capture script. */
  let ready = false
  for (let i = 0; i < 100; i++) {
    const { result } = await on('Runtime.evaluate', {
      expression:
        'document.documentElement.dataset.ready === "1" && typeof window.__frame === "function"',
    })
    if (result.value) { ready = true; break }
    await sleep(100)
  }
  if (!ready) {
    const { result } = await on('Runtime.evaluate', { expression: 'document.title' })
    throw new Error(
      `${url} is not the reel (title: ${JSON.stringify(result.value)}). Is \`npm run dev\` running on that port?`,
    )
  }
  // Fonts must be in before the first screenshot or early frames render in a
  // fallback face and the gif visibly re-flows.
  await on('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })

  process.stdout.write(`capturing ${TOTAL} frames at ${FPS}fps `)
  for (let i = 0; i < TOTAL; i++) {
    await on('Runtime.evaluate', {
      expression: `window.__frame(${i}, ${JSON.stringify(SEED)})`,
      awaitPromise: true,
    })
    if (i === 0) {
      // One more guard: the reel loaded, but did the widget actually render.
      const { result } = await on('Runtime.evaluate', {
        expression: '!!document.querySelector("tech-captcha")?.shadowRoot?.querySelector(".tile")',
      })
      if (!result.value) throw new Error('the widget rendered no tiles; aborting')
    }
    const { data } = await on('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(join(frames, `f${String(i).padStart(4, '0')}.png`), Buffer.from(data, 'base64'))
    if (i % 20 === 0) process.stdout.write('.')
  }
  process.stdout.write(' done\n')
} finally {
  cdp?.close()
  chrome.kill('SIGKILL')
}

await mkdir(OUT, { recursive: true })
const run = (args) =>
  new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] })
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))))
  })

const pattern = join(frames, 'f%04d.png')
await run(['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', pattern,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart',
  join(OUT, 'reel.mp4')])
await run(['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', pattern,
  '-vf', 'scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
  join(OUT, 'reel.gif')])

await rm(profile, { recursive: true, force: true })
await rm(frames, { recursive: true, force: true })
console.log('wrote docs/reel.mp4 and docs/reel.gif')
