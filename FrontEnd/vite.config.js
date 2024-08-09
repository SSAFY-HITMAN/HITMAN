/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        start_url: "/",
        name: "HITMAN",
        short_name: "HITMAN",
        background_color: "#131419",
        theme_color: "#04479C",
        description: "앱 설명",
        dir: "auto",
        display: "standalone",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  // SockJS 라이브러리가 Node.js 환경에서 사용되는 global 객체 참조 시 에러 수정
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT) || 5080,
    host: "0.0.0.0", // Bind to all network interfaces
  },
});
