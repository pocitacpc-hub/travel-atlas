import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));
const BASE = "/travel-atlas/";
/** Veřejná adresa webu na GitHub Pages. Sociální sítě potřebují v náhledu odkazu absolutní adresy. */
const SITE = "https://pocitacpc-hub.github.io/travel-atlas/";

/** Open Graph: v sestavení udělá z og:image absolutní adresu a doplní og:url stránky. */
function openGraph(): Plugin {
  return {
    name: "atlas-open-graph",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const file = basename(ctx.filename);
        const url = SITE + (file === "index.html" ? "" : file);
        return html.replace(/(<meta property="og:type"[^>]*>)/u, `$1\n  <meta property="og:url" content="${url}">`);
      }
    },
    // Adresu obrázku doplní Vite až při zápisu souborů, proto se převádí na absolutní až tady.
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type !== "asset" || !file.fileName.endsWith(".html")) continue;
          file.source = String(file.source).replace(new RegExp(`(<meta property="og:image" content=")${BASE}`, "u"), `$1${SITE}`);
        }
      }
    }
  };
}

export default defineConfig({
  base: BASE,
  plugins: [openGraph()],
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
