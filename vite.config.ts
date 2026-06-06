import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/codechef': {
        target: 'https://www.codechef.com',
        changeOrigin: true,
        rewrite: (path) => {
          const match = path.match(/^\/api\/codechef\?username=(.*)$/);
          return match ? `/users/${match[1]}` : path;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    }
  }
})
