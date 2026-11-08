import { defineConfig } from "vite";

export default defineConfig({
  base: "/travel-atlas/",
  // Ve fázi A se žádná veřejná data ani jiné soubory z public/ nepublikují.
  publicDir: false,
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { target: "es2022" }
});
