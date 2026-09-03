import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Keeps API calls same-origin in dev so auth cookies work with
      // SameSite=Lax without needing SameSite=None.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Splits third-party deps out of the app chunk so route-level
        // code-splitting (React.lazy) isn't defeated by everything being
        // re-bundled into one large vendor blob.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined

          if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) {
            return "react-vendor"
          }

          // Kept separate from ui-vendor: recharts is only pulled in by the
          // (lazy-loaded) Analítica page, whereas lucide-react/@base-ui/react
          // are used across the whole app, including outside lazy routes.
          if (/node_modules\/recharts\//.test(id)) {
            return "charts-vendor"
          }

          if (
            /node_modules\/(lucide-react|@base-ui\/react|sonner)\//.test(id)
          ) {
            return "ui-vendor"
          }

          return undefined
        },
      },
    },
  },
})
