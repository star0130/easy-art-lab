import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { createRequire } from 'node:module'

// 로컬 전용 관리자 API — `npm run dev`에서만 동작하고, 프로덕션 빌드(dist)에는 포함되지 않는다.
// admin-api.cjs는 vite.config.js 설정 로딩(esbuild 번들링) 단계가 아니라, 서버가 실제로
// 뜬 뒤(configureServer 콜백 안)에만 require해야 xlsx 같은 CJS 네이티브 의존성이 깨지지 않는다.
function adminApiPlugin() {
  return {
    name: 'easy-art-lab-admin-api',
    apply: 'serve',
    configureServer(server) {
      const require = createRequire(import.meta.url)
      const { createAdminMiddleware } = require('./scripts/admin-api.cjs')
      server.middlewares.use(createAdminMiddleware())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminApiPlugin()],
})
