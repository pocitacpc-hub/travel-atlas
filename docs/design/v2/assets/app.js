/* Cestovní stopa – prototyp v2: sdílená kostra stránek a komponenty.
   Staví na ../assets/data.js, europe-map.js a viz.js (výpočty statistik). */
(function () {
  'use strict';
  var F = VZ.fmt, D = VZ.data, MAP = VZ.map;
  var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
  var PAGES = [['index.html', 'Přehled'], ['kronika.html', 'Kronika'], ['statistiky.html', 'Statistiky']];
  var ASOF = D.dataAsOf.split('-').reverse().map(Number).join('. ');
  var pad = function (n) { return String(n).padStart(2, '0'); };

  function shell(active) {
    var top = document.getElementById('top');
    top.className = 'top';
    top.innerHTML = '<a class="brand" href="index.html"><b>Cestovní stopa</b><span>osobní atlas cest</span></a>' +
      '<nav aria-label="Hlavní navigace">' + PAGES.map(function (p) {
        return '<a href="' + p[0] + '"' + (p[1] === active ? ' aria-current="page"' : '') + '>' + p[1] + '</a>';
      }).join('') + '</nav>';
    var foot = document.getElementById('foot');
    foot.className = 'foot';
    foot.innerHTML = '<span>Data k ' + ASOF + '</span><span>Neznámé údaje se nepočítají jako nula.</span>' +
      '<span>Body míst v prototypu jsou ilustrační.</span><a href="statistiky.html#metodika">Jak číst data</a>';
  }
  function tripUrl(t) { return 'cesta.html?id=' + t.id; }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function tripColor(t) { return t.zeme === 'CZ' ? css('--cz') : css('--abroad'); }
  function yearsSpan(c) { return c.first === null ? 'rok neznámý' : c.first === c.last ? String(c.first) : c.first + '–' + c.last; }
  function nightsCoverage(c) {
    return c.nightsKnown ? F.noci(c.nights) + (c.nightsKnown < c.count ? ' (známo u ' + c.nightsKnown + ' z ' + c.count + ')' : '') : 'noci neznámé';
  }

  // Termíny, které se překrývají (jen u přesných dat) – v prototypu se ukazují v tooltipu.
  var overlaps = {};
  (function () {
    var dt = D.trips.filter(function (t) { return t.presnost === 'den' && t.konec; });
    dt.forEach(function (a) {
      dt.forEach(function (b) {
        if (a !== b && a.zacatek < b.konec && b.zacatek < a.konec) (overlaps[a.id] = overlaps[a.id] || []).push(b);
      });
    });
  })();
  function tripTip(t) {
    var o = overlaps[t.id];
    return '<b>' + F.esc(t.nazev) + '</b><br>' + F.termin(t) + ' · ' + F.noci(t.noci) +
      (t.presnost !== 'den' ? '<br><i>' + F.presnost(t.presnost) + '</i>' : '') +
      (o ? '<br><span class="warn">Termín se překrývá: ' + o.map(function (x) { return F.esc(F.short(x)); }).join(', ') + '</span>' : '');
  }

  // ---------- Rok × měsíc (heatmapa) ----------
  function heatmap(el, s) {
    var groups = {}, Q = ['--q1', '--q2', '--q3', '--q5'];
    function cell(trips, key) {
      var n = trips.length;
      if (!n) return '<td></td>';
      var bg = css(Q[Math.min(4, n) - 1]), fg = n >= 4 ? '#fff' : '#0B2A26';
      return '<td class="v" style="background:' + bg + ';color:' + fg + '" data-tip data-k="' + key + '" tabindex="0">' + (n > 1 ? n : '') + '</td>';
    }
    var head = '<thead><tr><th class="y"></th>' + VZ.MONTHS_SHORT.map(function (m, i) { return '<th title="' + VZ.MONTHS[i] + '">' + m + '</th>'; }).join('') +
      '<th class="sep"></th><th class="q" title="měsíc neznámý">?</th></tr></thead>';
    var body = s.years.slice().reverse().map(function (y) {
      var tds = '';
      for (var m = 1; m <= 12; m++) {
        var k = y.year + '-' + m;
        groups[k] = y.trips.filter(function (t) { return t.mesic === m; });
        tds += cell(groups[k], k);
      }
      groups[y.year + '-?'] = y.trips.filter(function (t) { return !t.mesic; });
      return '<tr><th class="y">' + y.year + '</th>' + tds + '<td class="sep"></td>' + cell(groups[y.year + '-?'], y.year + '-?') + '</tr>';
    }).join('');
    groups['?-?'] = s.undatedTrips;
    body += '<tr class="unk"><th class="y">rok ?</th>' + new Array(13).join('<td></td>') + '<td class="sep"></td>' + cell(s.undatedTrips, '?-?') + '</tr>';
    el.innerHTML = '<div class="heat-scroll"><table class="heat">' + head + '<tbody>' + body + '</tbody></table></div>';
    VZ.bindTips(el, function (t) {
      var k = t.dataset.k, p = k.split('-'), tr = groups[k];
      var when = p[0] === '?' ? 'Rok neznámý' : p[1] === '?' ? p[0] + ', měsíc neznámý' : VZ.MONTHS[+p[1] - 1] + ' ' + p[0];
      return '<b>' + when + '</b> · ' + F.cesty(tr.length) + '<br>' + tr.map(function (x) { return F.esc(x.nazev); }).join('<br>');
    });
  }

  // ---------- Celé roky: každý rok jeden řádek leden–prosinec ----------
  function yearRows(el, s) {
    function doy(y, m, d) { return (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5; }
    function daysIn(y) { return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5; }
    var byId = {};
    var rows = s.years.slice().reverse().map(function (r) {
      var n = daysIn(r.year), items = [], qs = [];
      r.trips.forEach(function (t) {
        byId[t.id] = t;
        if (t.presnost === 'den') {
          var a = t.zacatek.split('-').map(Number), b = t.konec ? t.konec.split('-').map(Number) : null;
          var x1 = doy(a[0], a[1], a[2]), x2 = b && b[0] === r.year ? doy(b[0], b[1], b[2]) : n;
          items.push({ t: t, a: x1, b: Math.max(x2, x1 + 1), kind: 'den' });
        } else if (t.presnost === 'mesic') {
          items.push({ t: t, a: doy(r.year, t.mesic, 1), b: t.mesic === 12 ? n : doy(r.year, t.mesic + 1, 1), kind: 'mesic' });
        } else qs.push(t);
      });
      items.sort(function (x, y) { return x.a - y.a || (x.kind === 'den' ? -1 : 1); });
      var lanes = [];
      items.forEach(function (it) {
        for (var i = 0; i < lanes.length; i++) if (lanes[i] <= it.a) { it.lane = i; lanes[i] = it.b; return; }
        it.lane = lanes.length; lanes.push(it.b);
      });
      return { label: String(r.year), n: n, items: items, qs: qs, lanes: Math.max(1, lanes.length), empty: !r.trips.length };
    });
    s.undatedTrips.forEach(function (t) { byId[t.id] = t; });
    rows.push({ label: 'rok ?', n: 365, items: [], qs: s.undatedTrips, lanes: 1, empty: false, unknown: true });

    function draw() {
      var W = Math.max(300, el.clientWidth), narrow = W < 560;
      var L = 44, G = 10, RQ = 46, T = W - L - RQ - G * 2, x0 = L + G;
      var BH = 9, LG = 3, PAD = 7, HEAD = 22, DOT = 11;
      var cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
      var grid = [], marks = [], labels = [], y = HEAD;
      rows.forEach(function (r, ri) {
        var qLines = Math.ceil(r.qs.length / 3);
        var h = r.empty ? 18 : Math.max(r.lanes * BH + (r.lanes - 1) * LG, qLines * DOT - 2) + PAD * 2;
        if (ri % 2 === 0) grid.push('<rect class="yr-stripe" x="' + x0 + '" y="' + y + '" width="' + T + '" height="' + h + '"/>');
        labels.push('<text class="yr-label' + (r.empty ? ' is-empty' : '') + '" x="' + L + '" y="' + (y + h / 2 + 4) + '" text-anchor="end">' + r.label + '</text>');
        r.items.forEach(function (it) {
          var x = x0 + it.a / r.n * T, w = Math.max(3, (it.b - it.a) / r.n * T), yy = y + PAD + it.lane * (BH + LG), col = tripColor(it.t);
          marks.push(it.kind === 'den'
            ? '<rect class="yr-bar" x="' + x.toFixed(1) + '" y="' + yy + '" width="' + w.toFixed(1) + '" height="' + BH + '" rx="2" fill="' + col + '" data-tip data-id="' + it.t.id + '"/>'
            : '<rect class="yr-band" x="' + (x + 0.5).toFixed(1) + '" y="' + (yy + 0.5) + '" width="' + (w - 1).toFixed(1) + '" height="' + (BH - 1) + '" rx="2" fill="' + col + '" stroke="' + col + '" data-tip data-id="' + it.t.id + '"/>');
        });
        r.qs.forEach(function (t, i) {
          var cx = x0 + T + G + 8 + (i % 3) * DOT, cy = y + PAD + BH / 2 + Math.floor(i / 3) * DOT;
          marks.push('<circle class="yr-dot" cx="' + cx + '" cy="' + cy + '" r="4" fill="' + tripColor(t) + '" data-tip data-id="' + t.id + '"/>');
        });
        y += h;
      });
      var H = y + 2;
      for (var m = 0; m < 12; m++) {
        var gx = x0 + cum[m] / 365 * T, mid = x0 + (cum[m] + cum[m + 1]) / 2 / 365 * T;
        if (m) grid.push('<line class="yr-month" x1="' + gx + '" x2="' + gx + '" y1="' + (HEAD - 4) + '" y2="' + H + '"/>');
        labels.push('<text class="vz-tick" x="' + mid + '" y="14" text-anchor="middle">' + (narrow ? m + 1 : VZ.MONTHS_SHORT[m]) + '</text>');
      }
      labels.push('<text class="vz-tick" x="' + (x0 + T + G + RQ / 2) + '" y="14" text-anchor="middle">?</text>');
      grid.push('<line class="yr-month" x1="' + (x0 + T + G / 2) + '" x2="' + (x0 + T + G / 2) + '" y1="' + (HEAD - 4) + '" y2="' + H + '"/>');
      el.innerHTML = '<svg class="vz-chart yr" width="' + W + '" height="' + H + '" role="img" aria-label="Cesty v jednotlivých letech podle data">' +
        grid.join('') + marks.join('') + labels.join('') + '</svg>';
    }
    VZ.mountChart(el, draw, function (t) { return tripTip(byId[t.dataset.id]); });
    el.addEventListener('click', function (e) {
      var t = e.target.closest('[data-id]');
      if (t) location.href = tripUrl(byId[t.dataset.id]);
    });
  }

  // ---------- Státy ----------
  function statesList(el, s) {
    var max = s.countries[0].count;
    el.innerHTML = '<ul class="states">' + s.countries.map(function (c) {
      return '<li id="stat-' + c.code + '"><details><summary>' +
        '<span class="code">' + c.code + '</span><span class="nm">' + F.esc(c.name) + '</span>' +
        '<span class="sbar"><i style="width:' + (c.count / max * 100).toFixed(1) + '%;background:var(' + (c.code === 'CZ' ? '--cz' : '--abroad') + ')"></i></span>' +
        '<span class="cnt">' + c.count + '</span><span class="sub">' + nightsCoverage(c) + ' · ' + yearsSpan(c) + '</span></summary>' +
        '<ol class="strips">' + c.trips.map(function (t) {
          return '<li><a href="' + tripUrl(t) + '"><span class="w">' + F.termin(t) + '</span><b>' + F.esc(F.short(t)) + '</b><span class="n">' + (t.noci === null ? '—' : F.noci(t.noci)) + '</span></a></li>';
        }).join('') + '</ol>' +
        '<p class="more"><a class="link" href="index.html?stat=' + c.code + '">Na mapě</a> · <a class="link" href="kronika.html?stat=' + c.code + '">V kronice</a></p>' +
        '</details></li>';
    }).join('') + '</ul>';
  }

  // ---------- Délka pobytu ----------
  function lengthHist(el, s) {
    var maxB = Math.max.apply(null, s.buckets.map(function (b) { return b.count; }).concat([s.nightsUnknown]));
    el.innerHTML = '<div class="hist">' + s.buckets.map(function (b) {
      return '<div><b>' + b.count + '</b><span class="b" style="height:' + (b.count / maxB * 100).toFixed(1) + '%"></span><small>' + b.label + '</small></div>';
    }).join('') + '<div><b>' + s.nightsUnknown + '</b><span class="b unk" style="height:' + (s.nightsUnknown / maxB * 100).toFixed(1) + '%"></span><small>neznámá</small></div></div>';
  }

  // ---------- Rekordy ----------
  function records(s) {
    var abroad = s.countries.filter(function (c) { return c.code !== 'CZ'; });
    var topN = abroad[0].count, tops = abroad.filter(function (c) { return c.count === topN; }).map(function (c) { return c.name; });
    var run = 0, best = { len: 0 };
    s.years.forEach(function (r) {
      run = r.total ? run + 1 : 0;
      if (run > best.len) best = { len: run, from: r.year - run + 1, to: r.year };
    });
    var sport = D.trips.filter(function (t) { return t.sport; }).sort(function (a, b) { return b.sport.km - a.sport.km; })[0];
    return [
      [F.noci(s.longest.noci), 'nejdelší pobyt', s.longest.trips.length + '× · naposledy ' + s.longest.trips[0].rok],
      [String(s.busiest.count), 'nejvíc cest za rok', s.busiest.years.join(', ')],
      [String(s.busiestAbroad.count), 'nejvíc zahraničních cest za rok', s.busiestAbroad.years.join(', ')],
      [topN + '×', 'nejčastější zahraniční stát', tops.join(' a ')],
      [best.len + ' let', 'nepřerušená řada let s cestou', best.from + '–' + best.to],
      [F.num(sport.sport.km, 0) + ' km', 'nejvíc nahraných km na cestě', F.short(sport) + ' ' + sport.rok + ' (Strava, výběr)', tripUrl(sport)]
    ];
  }

  // ---------- výřez mapy pro detail cesty ----------
  function cropFor(code, pts) {
    var W = MAP.width, H = MAP.height, xs = [], ys = [];
    var nums = (MAP.countries[code] || '').match(/-?\d+(\.\d+)?/g) || [];
    for (var i = 0; i + 1 < nums.length; i += 2) {
      var x = +nums[i], y = +nums[i + 1];
      if (x >= 0 && x <= W && y >= 0 && y <= H) { xs.push(x); ys.push(y); }
    }
    (pts || []).forEach(function (p) { xs.push(p.x); ys.push(p.y); });
    var x1 = Math.min.apply(null, xs), x2 = Math.max.apply(null, xs), y1 = Math.min.apply(null, ys), y2 = Math.max.apply(null, ys);
    var w = Math.max(240, (x2 - x1) * 1.35), h = Math.max(180, (y2 - y1) * 1.35);
    if (w / h > 4 / 3) h = w * 3 / 4; else w = h * 4 / 3;
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    return [Math.round(cx - w / 2), Math.round(cy - h / 2), Math.round(w), Math.round(h)];
  }

  window.APP = {
    css: css, shell: shell, tripUrl: tripUrl, param: param, tripColor: tripColor, yearsSpan: yearsSpan, nightsCoverage: nightsCoverage,
    tripTip: tripTip, overlaps: overlaps, heatmap: heatmap, yearRows: yearRows, statesList: statesList, lengthHist: lengthHist,
    records: records, cropFor: cropFor, ASOF: ASOF, pad: pad
  };
})();
