import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from "vite-plugin-pwa";

export default {
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "BlueChat",
        short_name: "BlueChat",
        display: "standalone",
        background_color: "#fff",
        theme_color: "#2563eb",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
};



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
