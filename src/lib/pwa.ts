/// <reference types="vite/client" />
// Registrace service workeru (tools/pwa.ts). Jen v sestavení, vývojový server sw.js nemá.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Bez service workeru web funguje dál, jen ne offline.
    });
  });
}
