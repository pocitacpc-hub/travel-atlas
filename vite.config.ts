import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: "/travel-atlas/",
  // Veřejná data se vkládají do sestavení importem ze src/lib/data.ts. Adresář public/ se nekopíruje.
  publicDir: false,
  // Licence flag-icons (/*! … */) musí zůstat ve výsledném CSS.
  esbuild: { legalComments: "inline" },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        prehled: page("index.html"),
        kronika: page("kronika.html"),
        statistiky: page("statistiky.html"),
        cesta: page("cesta.html")
      }
    }
  }
});
