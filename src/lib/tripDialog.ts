// Detail cesty v plovoucím okně (Přehled, Kronika, Statistiky).
// Odkazy cesta.html?id=… se otevřou v okně nad stránkou. Adresa dostane ?cesta=ID, takže jde sdílet
// a tlačítko Zpět v prohlížeči nebo telefonu okno zavře. Okno zavře i křížek, Esc a klik mimo okno.
// Samostatná stránka cesta.html zůstává pro přímé odkazy.
import "../styles/trip.css";
import { tripById } from "./data";
import { hideTip, setTripOpener } from "./dom";
import type { Trip } from "./model";

// Obsah detailu (s mapou) se stáhne až při prvním otevření okna.
let tripModule: Promise<typeof import("./trip")> | null = null;
const loadTrip = () => (tripModule ??= import("./trip"));

interface TripState { atlasTrip: string; atlasInitial?: boolean }

export function initTripDialog(): void {
  const dialog = document.createElement("dialog");
  dialog.className = "trip-dialog";
  dialog.setAttribute("aria-labelledby", "td-title");
  dialog.innerHTML =
    '<button type="button" class="td-close" data-close aria-label="Zavřít" title="Zavřít">×</button>' +
    '<div class="td-scroll"><article class="td-content"></article></div>';
  document.body.appendChild(dialog);
  const scroll = dialog.querySelector<HTMLElement>(".td-scroll")!;
  const content = dialog.querySelector<HTMLElement>(".td-content")!;
  let shownId: string | null = null;
  let wanted: string | null = null; // poslední požadavek, aby pozdě načtený obsah nepřepsal zavření

  const url = (id: string | null) => {
    const u = new URL(location.href);
    if (id) u.searchParams.set("cesta", id);
    else u.searchParams.delete("cesta");
    return u.pathname + u.search + u.hash;
  };

  const show = async (t: Trip) => {
    wanted = t.id;
    const { drawTripMap, tripDetailHtml } = await loadTrip();
    if (wanted !== t.id) return;
    if (shownId !== t.id) {
      content.innerHTML = tripDetailHtml(t);
      shownId = t.id;
    }
    if (!dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add("has-dialog");
    }
    scroll.scrollTop = 0;
    drawTripMap(content, t);
  };

  const hide = () => {
    wanted = null;
    hideTip();
    if (dialog.open) dialog.close();
    document.documentElement.classList.remove("has-dialog");
    shownId = null;
  };

  const open = (t: Trip) => {
    if (dialog.open && shownId === t.id) return;
    history.pushState({ atlasTrip: t.id } satisfies TripState, "", url(t.id));
    void show(t);
  };

  // Okno otevřené kliknutím vrátí krok v historii, okno z odkazu ?cesta= jen odstraní parametr.
  const requestClose = () => {
    const state = history.state as Partial<TripState> | null;
    if (state?.atlasTrip && !state.atlasInitial) history.back();
    else {
      history.replaceState(null, "", url(null));
      hide();
    }
  };

  setTripOpener(open);

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    const m = a && !a.target ? /^cesta\.html\?id=([^&#]+)$/u.exec(a.getAttribute("href")!) : null;
    const t = m ? tripById.get(decodeURIComponent(m[1]!)) : undefined;
    if (!t) return;
    e.preventDefault();
    open(t);
  });

  for (const b of dialog.querySelectorAll("[data-close]")) b.addEventListener("click", requestClose);
  // Klik na ztmavené pozadí: cílem je samotný <dialog>, obsah okna ho celý vyplňuje.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) requestClose();
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    requestClose();
  });

  window.addEventListener("popstate", () => {
    const id = new URLSearchParams(location.search).get("cesta");
    const t = id ? tripById.get(id) : undefined;
    if (t) void show(t);
    else hide();
  });

  const initial = new URLSearchParams(location.search).get("cesta");
  const t0 = initial ? tripById.get(initial) : undefined;
  if (t0) {
    history.replaceState({ atlasTrip: t0.id, atlasInitial: true } satisfies TripState, "", location.href);
    void show(t0);
  }
}
