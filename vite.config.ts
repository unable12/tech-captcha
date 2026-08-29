import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TechCaptcha',
      fileName: 'tech-captcha',
      formats: ['es', 'umd'],
    },
  },
})
