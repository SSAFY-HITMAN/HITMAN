/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// PWA 설정 파일을 별도로 분리하기 위해 manifest.json 파일을 import합니다.
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest,
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
