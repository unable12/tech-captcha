import { defineConfig } from 'vite'

/* Separate build so nothing in src/server can end up in the browser bundle,
   and so the packs can be imported without the custom element. */
export default defineConfig({
  build: {
    target: 'node18',
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: {
        server: 'src/server/index.ts',
        packs: 'src/packs/index.ts',
      },
      formats: ['es'],
    },
  },
})
