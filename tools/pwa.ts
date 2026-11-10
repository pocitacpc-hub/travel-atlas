// PWA bez další knihovny: manifest, ikony a service worker se zapíšou do sestavení pluginem pro Vite.
// Instalace na Android (Chrome) i iPhone (Safari → Přidat na plochu) a prohlížení archivu offline.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

const ICONS = ["ikona-192.png", "ikona-512.png", "ikona-maskable-512.png", "apple-touch-icon.png"];
const BACKGROUND = "#f2eadb"; // --paper

export function manifest(base: string): Record<string, unknown> {
  return {
    id: base,
    name: "Cestovní atlas",
    short_name: "Atlas",
    description: "Osobní archiv uskutečněných cest: mapa, kronika a statistiky.",
    lang: "cs",
    dir: "ltr",
    start_url: base,
    scope: base,
    display: "standalone",
    orientation: "any",
    background_color: BACKGROUND,
    theme_color: BACKGROUND,
    icons: [
      { src: "ikona-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "ikona-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "ikona-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "Kronika", url: "kronika.html", icons: [{ src: "ikona-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Statistiky", url: "statistiky.html", icons: [{ src: "ikona-192.png", sizes: "192x192", type: "image/png" }] }
    ]
  };
}

/** Soubory, které se uloží hned při instalaci. Písma a obrázek pro sdílení se uloží až při prvním použití. */
export function precacheList(files: string[]): string[] {
  const skip = /\.(?:map|woff2)$|^assets\/sdileni-|^sw\.js$/u;
  // cache.addAll odmítne duplicitní požadavky, proto Set
  return ["./", ...[...new Set(files)].filter((f) => !skip.test(f)).sort()];
}

/**
 * Service worker: stránky (HTML) nejdřív ze sítě, bez připojení z mezipaměti, a to i s parametry
 * (?cesta=, ?stat=). Ostatní soubory mají v názvu otisk obsahu, proto nejdřív z mezipaměti.
 * Nová verze se aktivuje po zavření všech oken atlasu a smaže starou mezipaměť.
 */
export function serviceWorkerSource(version: string, precache: string[]): string {
  return `// Cestovní atlas – service worker (vygenerováno v tools/pwa.ts)
const CACHE = "atlas-${version}";
const PRECACHE = ${JSON.stringify(precache)};
const SCOPE = new URL("./", self.location).pathname;
// Vite načítá skripty a styly s crossorigin, takže požadavek nese Origin a odpověď může mít Vary.
// Soubory mají v názvu otisk obsahu, Vary proto při hledání v mezipaměti nehraje roli.
const MATCH = { ignoreVary: true };

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("atlas-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (key, response) => caches.open(CACHE).then((cache) => cache.put(key, response));

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;

  if (request.mode === "navigate") {
    const key = url.origin + url.pathname;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) event.waitUntil(put(key, response.clone()));
          return response;
        })
        .catch(() => caches.match(key, MATCH).then((hit) => hit || caches.match(request, { ...MATCH, ignoreSearch: true })).then((hit) => hit || caches.match(SCOPE, MATCH)))
    );
    return;
  }

  event.respondWith(
    caches.match(request, MATCH).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok) event.waitUntil(put(request, response.clone()));
      return response;
    }))
  );
});
`;
}

export function pwa(base: string): Plugin {
  return {
    name: "atlas-pwa",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler: () => [
        { tag: "link", attrs: { rel: "manifest", href: `${base}manifest.webmanifest` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: `${base}apple-touch-icon.png` }, injectTo: "head" }
      ]
    },
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const files = [...Object.keys(bundle), ...ICONS, "manifest.webmanifest"];
        for (const icon of ICONS) {
          this.emitFile({ type: "asset", fileName: icon, source: readFileSync(new URL(`../src/pwa/${icon}`, import.meta.url)) });
        }
        this.emitFile({ type: "asset", fileName: "manifest.webmanifest", source: `${JSON.stringify(manifest(base), null, 2)}\n` });
        // Verze = otisk všech souborů sestavení, takže se mění s každou změnou webu.
        const hash = createHash("sha256");
        for (const name of Object.keys(bundle).sort()) {
          const f = bundle[name]!;
          hash.update(name).update(f.type === "asset" ? f.source : f.code);
        }
        this.emitFile({ type: "asset", fileName: "sw.js", source: serviceWorkerSource(hash.digest("hex").slice(0, 12), precacheList(files)) });
      }
    }
  };
}
