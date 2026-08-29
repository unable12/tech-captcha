import { defineConfig, type Connect, type Plugin } from 'vite'
import { createCaptchaServer } from './src/server/index'
import { sanFrancisco } from './src/packs/sf'
import { example } from './src/packs/example'

/* Runs the real handler behind the dev server so the demo can exercise server
   mode. The secret here is a demo value and is meant to be seen. */
function demoCaptchaServer(): Plugin {
  const captcha = createCaptchaServer({
    secret: 'demo-secret-not-for-production-use',
    packs: [sanFrancisco, example],
  })

  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    void (async () => {
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk as Buffer)

      const result = await captcha.handler(
        new Request(`http://localhost${request.url ?? '/'}`, {
          method: request.method ?? 'POST',
          headers: { 'content-type': 'application/json' },
          body: chunks.length > 0 ? Buffer.concat(chunks).toString() : undefined,
        }),
      )

      response.statusCode = result.status
      response.setHeader('content-type', 'application/json')
      response.end(await result.text())
    })().catch(next)
  }

  return {
    name: 'tech-captcha-demo-server',
    configureServer(server) {
      server.middlewares.use('/captcha', middleware)
    },
  }
}

export default defineConfig({
  plugins: [demoCaptchaServer()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TechCaptcha',
      fileName: 'tech-captcha',
      formats: ['es', 'umd'],
    },
  },
})
