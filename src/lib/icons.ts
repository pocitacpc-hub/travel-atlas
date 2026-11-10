// Jednoduché čárové ikony (24 × 24, barva textu). Vždy jen doplňují text, proto aria-hidden.
const PATHS = {
  noc: '<path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"/>',
  trasa: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16"/>',
  hora: '<path d="M3 19.5 9.5 8l4 6.5 2.5-3.5 5 8.5z"/>',
  misto: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  termin: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  aktivita: '<path d="M3 12h4l2.5-6.5 5 13 2.5-6.5h4"/>'
} as const;

export type IconName = keyof typeof PATHS;

export const icon = (name: IconName) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name]}</svg>`;
