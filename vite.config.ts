import { defineConfig } from "vite";

export default defineConfig({
  base: "/travel-atlas/",
  // Do nasazení webu s daty se public/ nekopíruje do sestavení.
  publicDir: false,
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { target: "es2022" }
});
