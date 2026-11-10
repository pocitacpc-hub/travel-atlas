// Detail cesty jako samostatná stránka: cesta.html?id=t-xxxxxx (stabilní ID ze zdroje).
// Ostatní stránky otevírají stejný obsah v plovoucím okně (src/lib/tripDialog.ts).
import "../generated/vlajky.css";
import "../styles/trip.css";
import { tripById } from "../lib/data";
import { $, param, tripName } from "../lib/dom";
import { drawTripMap, tripDetailHtml, tripNotFoundHtml } from "../lib/trip";
import { registerServiceWorker } from "../lib/pwa";

registerServiceWorker();

const id = param("id");
const t = id ? tripById.get(id) : undefined;
const root = $("trip");

// Zpět: na předchozí stránku atlasu, při příchodu odjinud do Kroniky.
const back = $<HTMLAnchorElement>("back");
back.addEventListener("click", (e) => {
  if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault();
    history.back();
  }
});

if (!t) {
  document.title = "Cesta nenalezena · Cestovní atlas";
  root.innerHTML = tripNotFoundHtml();
} else {
  document.title = `${tripName(t)} · Cestovní atlas`;
  root.innerHTML = tripDetailHtml(t);
  drawTripMap(root, t);
}
