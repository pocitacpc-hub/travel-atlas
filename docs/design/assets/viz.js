/* Sdílené pomocné funkce pro UI makety Cestovní stopy.
   Výpočty statistik, formátování a vykreslení mapy a grafů. Nejde o produkční kód –
   jen o ukázku, že všechna čísla v maketách se počítají z dat (data.js). */
(function () {
  'use strict';
  var D = window.TRAVEL_DATA;
  var MAP = window.EUROPE_MAP;

  var NAMES = {
    CZ: 'Česko', IT: 'Itálie', HR: 'Chorvatsko', SK: 'Slovensko', ES: 'Španělsko', GR: 'Řecko',
    PL: 'Polsko', SI: 'Slovinsko', AT: 'Rakousko', IE: 'Irsko', BG: 'Bulharsko', PT: 'Portugalsko',
    NO: 'Norsko', GB: 'Velká Británie', DE: 'Německo'
  };
  var MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  var MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
  var NB = ' ';

  // ---------- formátování ----------
  function plural(n, one, few, many) {
    if (n !== Math.floor(n)) return few;
    var x = Math.abs(n);
    return x === 1 ? one : x >= 2 && x <= 4 ? few : many;
  }
  function num(n, d) {
    return n.toLocaleString('cs-CZ', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  var fmt = {
    cesty: function (n) { return n + NB + plural(n, 'cesta', 'cesty', 'cest'); },
    noci: function (n) { return n === null ? 'nocí neznámo' : n + NB + plural(n, 'noc', 'noci', 'nocí'); },
    pct: function (a, b) { return Math.round(a / b * 100) + NB + '%'; },
    termin: function (t) {
      if (t.presnost === 'den') {
        var a = t.zacatek.split('-').map(Number), b = t.konec ? t.konec.split('-').map(Number) : null;
        if (!b) return a[2] + '.' + NB + a[1] + '.' + NB + a[0];
        if (a[0] === b[0] && a[1] === b[1]) return a[2] + '.–' + b[2] + '.' + NB + a[1] + '.' + NB + a[0];
        if (a[0] === b[0]) return a[2] + '.' + NB + a[1] + '. – ' + b[2] + '.' + NB + b[1] + '.' + NB + a[0];
        return a[2] + '.' + NB + a[1] + '.' + NB + a[0] + ' – ' + b[2] + '.' + NB + b[1] + '.' + NB + b[0];
      }
      if (t.presnost === 'mesic') return MONTHS[t.mesic - 1] + NB + t.rok;
      if (t.presnost === 'rok') return String(t.rok);
      return 'rok neznámý';
    },
    // „Itálie – Řím“ → „Řím“ (jen když předpona je název hlavní země; „Pasohlávky – Apalucha“ zůstane)
    short: function (t) {
      var pre = NAMES[t.zeme] + ' – ';
      return t.nazev.indexOf(pre) === 0 ? t.nazev.slice(pre.length) : t.nazev;
    },
    presnost: function (p) {
      return { den: 'přesný termín', mesic: 'známý měsíc', rok: 'jen rok', neznamy: 'bez data' }[p];
    },
    num: num,
    esc: esc
  };

  function sortKey(t) {
    if (t.zacatek) return t.zacatek;
    if (t.rok) return t.rok + '-' + String(t.mesic || 0).padStart(2, '0') + '-00';
    return '0000';
  }
  var byId = {};
  D.trips.forEach(function (t) { byId[t.id] = t; });

  // ---------- statistiky (vše se počítá z jednotlivých záznamů) ----------
  function stats(trips) {
    var s = { total: trips.length, cz: 0, abroad: 0, nightsSum: 0, nightsKnown: 0, undated: 0, monthsKnown: 0 };
    var byC = {}, byY = {}, months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], nights = [];
    trips.forEach(function (t) {
      if (t.zeme === 'CZ') s.cz++; else s.abroad++;
      if (t.noci !== null) { s.nightsSum += t.noci; s.nightsKnown++; nights.push(t.noci); }
      if (t.rok === null) s.undated++;
      if (t.mesic) { months[t.mesic - 1]++; s.monthsKnown++; }
      var c = byC[t.zeme] || (byC[t.zeme] = { code: t.zeme, name: NAMES[t.zeme], count: 0, nights: 0, nightsKnown: 0, first: null, last: null, trips: [] });
      c.count++; c.trips.push(t);
      if (t.noci !== null) { c.nights += t.noci; c.nightsKnown++; }
      if (t.rok !== null) {
        c.first = c.first === null ? t.rok : Math.min(c.first, t.rok);
        c.last = c.last === null ? t.rok : Math.max(c.last, t.rok);
        var y = byY[t.rok] || (byY[t.rok] = { year: t.rok, cz: 0, abroad: 0, total: 0, nights: 0, nightsKnown: 0, trips: [] });
        y.total++; y.trips.push(t);
        if (t.zeme === 'CZ') y.cz++; else y.abroad++;
        if (t.noci !== null) { y.nights += t.noci; y.nightsKnown++; }
      }
    });
    var desc = function (a, b) { return sortKey(b).localeCompare(sortKey(a)); };
    s.countries = Object.keys(byC).map(function (k) { return byC[k]; }).sort(function (a, b) {
      return b.count - a.count || b.nights - a.nights || a.name.localeCompare(b.name, 'cs');
    });
    s.countries.forEach(function (c) { c.trips.sort(desc); });
    s.countryCount = s.countries.length;
    s.abroadCountryCount = s.countries.filter(function (c) { return c.code !== 'CZ'; }).length;
    var ys = Object.keys(byY).map(Number);
    s.minYear = Math.min.apply(null, ys); s.maxYear = Math.max.apply(null, ys);
    s.years = [];
    for (var y = s.minYear; y <= s.maxYear; y++) {
      var row = byY[y] || { year: y, cz: 0, abroad: 0, total: 0, nights: 0, nightsKnown: 0, trips: [] };
      row.trips.sort(function (a, b) { return sortKey(a).localeCompare(sortKey(b)); });
      s.years.push(row);
    }
    s.undatedTrips = trips.filter(function (t) { return t.rok === null; });
    s.months = months;
    nights.sort(function (a, b) { return a - b; });
    var n = nights.length;
    s.median = n ? (n % 2 ? nights[(n - 1) / 2] : (nights[n / 2 - 1] + nights[n / 2]) / 2) : null;
    s.mean = n ? s.nightsSum / n : null;
    s.buckets = [['1', 1, 1], ['2', 2, 2], ['3–4', 3, 4], ['5–7', 5, 7], ['8–10', 8, 10], ['11+', 11, 1e9]].map(function (b) {
      return { label: b[0], count: nights.filter(function (v) { return v >= b[1] && v <= b[2]; }).length };
    });
    s.nightsUnknown = s.total - s.nightsKnown;
    s.firstVisits = s.countries.map(function (c) { return { code: c.code, name: c.name, year: c.first, count: c.count }; })
      .sort(function (a, b) { return (a.year === null) - (b.year === null) || a.year - b.year || a.name.localeCompare(b.name, 'cs'); });
    var maxN = n ? nights[n - 1] : null;
    s.longest = { noci: maxN, trips: trips.filter(function (t) { return t.noci === maxN; }).sort(desc) };
    var maxT = Math.max.apply(null, s.years.map(function (r) { return r.total; }));
    var maxA = Math.max.apply(null, s.years.map(function (r) { return r.abroad; }));
    s.busiest = { count: maxT, years: s.years.filter(function (r) { return r.total === maxT; }).map(function (r) { return r.year; }) };
    s.busiestAbroad = { count: maxA, years: s.years.filter(function (r) { return r.abroad === maxA; }).map(function (r) { return r.year; }) };
    s.recent = trips.filter(function (t) { return t.rok !== null; }).sort(desc);
    s.currentYear = Number(D.dataAsOf.slice(0, 4));
    s.thisYear = trips.filter(function (t) { return t.rok === s.currentYear; }).length;
    var sp = trips.filter(function (t) { return t.sport; });
    s.sport = {
      trips: sp.length,
      aktivit: sp.reduce(function (a, t) { return a + t.sport.aktivit; }, 0),
      km: sp.reduce(function (a, t) { return a + t.sport.km; }, 0),
      prevyseni: sp.reduce(function (a, t) { return a + t.sport.prevyseni; }, 0)
    };
    // první návštěva země v rámci datovaných cest → „nová země“ na kartě cesty
    s.firstTripOfCountry = {};
    s.countries.forEach(function (c) {
      var dated = c.trips.filter(function (t) { return t.rok !== null; });
      if (dated.length) s.firstTripOfCountry[dated[dated.length - 1].id] = c.code;
    });
    return s;
  }

  function places(trips) {
    var ids = {};
    trips.forEach(function (t) { ids[t.id] = true; });
    return D.places.map(function (p) {
      var tr = p.cesty.filter(function (id) { return ids[id]; }).map(function (id) { return byId[id]; });
      var xy = MAP.project(p.lon, p.lat);
      return { id: p.id, nazev: p.nazev, zeme: p.zeme, presnost: p.presnost, trips: tr, x: xy[0], y: xy[1] };
    }).filter(function (p) { return p.trips.length; }).sort(function (a, b) { return b.trips.length - a.trips.length; });
  }

  // ---------- tooltip ----------
  var tipEl = null;
  function showTip(html, x, y) {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'vz-tip';
      tipEl.setAttribute('role', 'status');
      document.body.appendChild(tipEl);
    }
    tipEl.innerHTML = html;
    tipEl.style.display = 'block';
    var r = tipEl.getBoundingClientRect();
    var left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - 14;
    tipEl.style.left = Math.max(8, left) + 'px';
    tipEl.style.top = Math.max(8, top) + 'px';
  }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }
  function bindTips(root, html) {
    root.addEventListener('pointermove', function (e) {
      var t = e.target.closest('[data-tip]');
      if (t && root.contains(t)) showTip(html(t), e.clientX, e.clientY); else hideTip();
    });
    root.addEventListener('pointerleave', hideTip);
    root.addEventListener('focusin', function (e) {
      var t = e.target.closest('[data-tip]');
      if (!t) return;
      var r = t.getBoundingClientRect();
      showTip(html(t), r.left + r.width / 2, r.top + r.height / 2);
    });
    root.addEventListener('focusout', hideTip);
  }

  // ---------- mapa ----------
  // opts: fill(code) → barva | null (nenavštívené), places: [..], placeR(p), onCountry(code), onPlace(p), label
  function renderMap(el, s, opts) {
    var W = MAP.width, H = MAP.height, out = [];
    var crop = opts.crop || [0, 0, W, H];
    out.push('<svg class="vz-map" viewBox="' + crop.join(' ') + '" role="group" aria-label="' + esc(opts.label || 'Mapa navštívených států') + '">');
    var visited = [];
    Object.keys(MAP.countries).forEach(function (k) {
      var f = NAMES[k] && opts.fill(k);
      if (f) visited.push(k);
      else out.push('<path class="vz-land" d="' + MAP.countries[k] + '"/>');
    });
    var cs = {};
    s.countries.forEach(function (c) { cs[c.code] = c; });
    visited.forEach(function (k) {
      var c = cs[k];
      out.push('<path class="vz-visited' + (opts.selected === k ? ' is-selected' : '') + '" d="' + MAP.countries[k] + '" fill="' + opts.fill(k) +
        '" data-tip data-code="' + k + '" tabindex="0" role="button" aria-label="' + esc(c.name + ', ' + fmt.cesty(c.count)) + '"/>');
    });
    (opts.places || []).forEach(function (p, i) {
      var r = opts.placeR ? opts.placeR(p) : 4;
      out.push('<circle class="vz-place' + (p.presnost === 'oblast' ? ' is-region' : '') + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) +
        '" r="' + r + '" data-tip data-place="' + i + '"/>');
    });
    out.push('</svg>');
    el.innerHTML = out.join('');
    el._vz = { cs: cs, opts: opts };   // aktuální stav; posluchače se navazují jen jednou
    if (el._vzBound) return;
    el._vzBound = true;
    bindTips(el, function (t) {
      var v = el._vz;
      if (t.dataset.code) {
        var c = v.cs[t.dataset.code];
        return '<b>' + esc(c.name) + '</b><br>' + fmt.cesty(c.count) + ' · ' + (c.first !== null ? 'poprvé ' + c.first : 'rok první cesty neznámý') +
          '<br>' + (c.nightsKnown ? fmt.noci(c.nights) + ' (známo u ' + c.nightsKnown + ' z ' + c.count + ')' : 'noci neznámé');
      }
      var p = v.opts.places[+t.dataset.place];
      return '<b>' + esc(p.nazev) + '</b>' + (p.presnost === 'oblast' ? ' <i>(oblast)</i>' : '') + '<br>' + fmt.cesty(p.trips.length) + ': ' +
        p.trips.slice(0, 4).map(function (t) { return t.rok || '?'; }).join(', ') + (p.trips.length > 4 ? ' …' : '');
    });
    el.addEventListener('click', function (e) {
      var o = el._vz.opts;
      var t = e.target.closest('[data-code]');
      if (t && o.onCountry) o.onCountry(t.dataset.code);
      var p = e.target.closest('[data-place]');
      if (p && o.onPlace) o.onPlace(o.places[+p.dataset.place]);
    });
    el.addEventListener('keydown', function (e) {
      var o = el._vz.opts;
      var t = e.target.closest('[data-code]');
      if (t && (e.key === 'Enter' || e.key === ' ') && o.onCountry) { e.preventDefault(); o.onCountry(t.dataset.code); }
    });
  }

  // Vykreslí graf a při změně šířky ho překreslí – vždy s posledními daty (draw se přepisuje).
  function mountChart(el, draw, tip) {
    el._draw = draw;
    el._tip = tip;
    draw();
    if (el._vzBound) return;
    el._vzBound = true;
    bindTips(el, function (t) { return el._tip(t); });
    if (window.ResizeObserver) {
      var w = el.clientWidth;
      new ResizeObserver(function () { if (el.clientWidth !== w) { w = el.clientWidth; el._draw(); } }).observe(el);
    }
  }

  // ---------- graf: cesty po letech (Česko / zahraničí) ----------
  function roundTop(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z';
  }
  function niceMax(v) { return v <= 5 ? 5 : v <= 10 ? 10 : Math.ceil(v / 5) * 5; }

  // opts: height, colors {cz, abroad}, unknown (bool), mirrored (bool)
  function yearsChart(el, s, opts) {
    function draw() {
      var W = Math.max(280, el.clientWidth), H = opts.height || 200;
      var m = { l: 26, r: 6, t: 10, b: 22 };
      var rows = s.years.slice();
      if (opts.unknown && s.undated) rows.push({ year: null, cz: s.undatedTrips.filter(function (t) { return t.zeme === 'CZ'; }).length, abroad: s.undatedTrips.filter(function (t) { return t.zeme !== 'CZ'; }).length, total: s.undated, nights: 0, trips: s.undatedTrips });
      var slots = rows.length + (opts.unknown ? 1 : 0);
      var slot = (W - m.l - m.r) / slots, bw = Math.max(3, Math.min(18, slot * 0.68));
      var out = ['<svg class="vz-chart" width="' + W + '" height="' + H + '" role="img" aria-label="Počet cest po letech, Česko a zahraničí">'];
      var max, y0, scale, ticks;
      if (opts.mirrored) {
        var mx = Math.max.apply(null, rows.map(function (r) { return Math.max(r.cz, r.abroad); }));
        max = niceMax(mx); y0 = m.t + (H - m.t - m.b) / 2; scale = (H - m.t - m.b) / 2 / max;
        ticks = [-max, 0, max];
      } else {
        max = niceMax(Math.max.apply(null, rows.map(function (r) { return r.total; })));
        y0 = H - m.b; scale = (H - m.t - m.b) / max; ticks = [0, max / 2, max];
      }
      ticks.forEach(function (v) {
        var y = y0 - v * scale;
        out.push('<line class="vz-grid' + (v === 0 ? ' is-base' : '') + '" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '"/>');
        out.push('<text class="vz-tick" x="' + (m.l - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.abs(v) + '</text>');
      });
      rows.forEach(function (r, i) {
        var idx = r.year === null ? i + 1 : i;
        var x = m.l + idx * slot + (slot - bw) / 2;
        var hc = r.cz * scale, ha = r.abroad * scale;
        if (opts.mirrored) {
          if (r.cz) out.push('<path class="vz-bar" fill="' + opts.colors.cz + '" d="' + roundTop(x, y0 - hc - 1, bw, hc, 4) + '"/>');
          if (r.abroad) out.push('<path class="vz-bar" fill="' + opts.colors.abroad + '" transform="translate(0 ' + (2 * y0) + ') scale(1 -1)" d="' + roundTop(x, y0 - ha - 1, bw, ha, 4) + '"/>');
        } else {
          if (r.cz) out.push(r.abroad
            ? '<rect class="vz-bar" fill="' + opts.colors.cz + '" x="' + x + '" y="' + (y0 - hc) + '" width="' + bw + '" height="' + hc + '"/>'
            : '<path class="vz-bar" fill="' + opts.colors.cz + '" d="' + roundTop(x, y0 - hc, bw, hc, 4) + '"/>');
          if (r.abroad) out.push('<path class="vz-bar" fill="' + opts.colors.abroad + '" d="' + roundTop(x, y0 - hc - ha - (r.cz ? 2 : 0), bw, ha, 4) + '"/>');
        }
        out.push('<rect class="vz-hit" x="' + (m.l + idx * slot) + '" y="' + m.t + '" width="' + slot + '" height="' + (H - m.t - m.b) + '" data-tip data-i="' + i + '" tabindex="-1"/>');
        var lab = r.year === null ? '?' : (r.year % 5 === 0 || r.year === s.minYear) ? String(r.year) : '';
        if (lab) out.push('<text class="vz-tick" x="' + (x + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + lab + '</text>');
      });
      out.push('</svg>');
      el.innerHTML = out.join('');
      el._rows = rows;
    }
    mountChart(el, draw, function (t) {
      var r = el._rows[+t.dataset.i];
      var head = r.year === null ? 'Rok neznámý' : String(r.year);
      if (!r.total) return '<b>' + head + '</b><br>bez záznamu';
      return '<b>' + head + '</b> · ' + fmt.cesty(r.total) + '<br>Česko ' + r.cz + ' · zahraničí ' + r.abroad +
        (r.year === null ? '' : '<br>' + (r.nightsKnown ? r.nights + ' známých nocí' : 'noci neznámé'));
    });
  }

  // ---------- graf: měsíce ----------
  function monthsChart(el, s, opts) {
    function draw() {
      var W = Math.max(220, el.clientWidth), H = opts.height || 150, m = { l: 22, r: 4, t: 8, b: 20 };
      var max = niceMax(Math.max.apply(null, s.months)), slot = (W - m.l - m.r) / 12, bw = Math.min(22, slot * 0.66);
      var sc = (H - m.t - m.b) / max, out = ['<svg class="vz-chart" width="' + W + '" height="' + H + '" role="img" aria-label="Počet cest podle měsíce začátku">'];
      [0, max].forEach(function (v) {
        var y = H - m.b - v * sc;
        out.push('<line class="vz-grid' + (v === 0 ? ' is-base' : '') + '" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '"/>');
        out.push('<text class="vz-tick" x="' + (m.l - 5) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '</text>');
      });
      s.months.forEach(function (v, i) {
        var x = m.l + i * slot + (slot - bw) / 2, h = v * sc;
        if (v) out.push('<path class="vz-bar" fill="' + opts.color + '" d="' + roundTop(x, H - m.b - h, bw, h, 4) + '"/>');
        out.push('<rect class="vz-hit" x="' + (m.l + i * slot) + '" y="' + m.t + '" width="' + slot + '" height="' + (H - m.t - m.b) + '" data-tip data-i="' + i + '"/>');
        out.push('<text class="vz-tick" x="' + (x + bw / 2) + '" y="' + (H - 5) + '" text-anchor="middle">' + (opts.short ? String(i + 1) : MONTHS_SHORT[i]) + '</text>');
      });
      out.push('</svg>');
      el.innerHTML = out.join('');
    }
    mountChart(el, draw, function (t) { var i = +t.dataset.i; return '<b>' + MONTHS[i] + '</b><br>' + fmt.cesty(s.months[i]) + ' začalo v tomto měsíci'; });
  }

  window.VZ = {
    data: D, map: MAP, NAMES: NAMES, MONTHS: MONTHS, MONTHS_SHORT: MONTHS_SHORT,
    fmt: fmt, plural: plural, stats: stats, places: places, sortKey: sortKey, byId: byId,
    renderMap: renderMap, yearsChart: yearsChart, monthsChart: monthsChart, mountChart: mountChart, bindTips: bindTips, roundTop: roundTop
  };
})();
