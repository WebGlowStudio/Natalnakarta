/* Natalna karta – WebGlow Studio */
(function () {
'use strict';
var C = window.AstroCore, T = window.NK_TEXT, S = window.NK_SYN, CITIES = window.NK_CITIES;
var $ = function (id) { return document.getElementById(id); };
var VS = '\uFE0E';
var PL = {
  Sun: ['Sunce', '☉'], Moon: ['Mesec', '☽'], Mercury: ['Merkur', '☿'], Venus: ['Venera', '♀'], Mars: ['Mars', '♂'],
  Jupiter: ['Jupiter', '♃'], Saturn: ['Saturn', '♄'], Uranus: ['Uran', '♅'], Neptune: ['Neptun', '♆'], Pluto: ['Pluton', '♇'],
  Node: ['Severni čvor', '☊'], ASC: ['Podznak (ASC)', 'AC'], MC: ['Sredina neba (MC)', 'MC']
};
var SG = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
var ELEM = ['Vatra', 'Zemlja', 'Vazduh', 'Voda'], MODE = ['Kardinalni', 'Fiksni', 'Promenljivi'];
var ELEM_COL = ['#ff9f7a', '#9be7b0', '#d9cffb', '#7fd1ff'];
var ASP_COL = { konjunkcija: '#e8c26a', opozicija: '#f08080', kvadrat: '#ff9f7a', trigon: '#7fd1ff', sekstil: '#9be7b0' };
var ASP_GL = { konjunkcija: '☌', opozicija: '☍', kvadrat: '□', trigon: '△', sekstil: '⚹' };
var FONT_SYM = "'Noto Sans Symbols 2','Noto Sans Symbols','Segoe UI Symbol','Apple Symbols','DejaVu Sans',sans-serif";
var MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function gl(k) { return PL[k][1].length > 1 ? PL[k][1] : PL[k][1] + VS; }
function sgl(i) { return SG[i] + VS; }
function fold(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'dj').trim(); }
function orbTxt(o) { var d = Math.floor(o), m = Math.round((o - d) * 60); if (m === 60) { d++; m = 0; } return d + '°' + (m < 10 ? '0' : '') + m + '′'; }

/* ---------- Forme ---------- */
var tzList = (function () {
  var z = {}; CITIES.forEach(function (c) { z[c[4]] = 1; });
  var all = Object.keys(z);
  try { if (Intl.supportedValuesOf) all = Intl.supportedValuesOf('timeZone'); } catch (e) {}
  if (all.indexOf('Europe/Belgrade') < 0) all.unshift('Europe/Belgrade');
  return all;
})();
function personHTML(p) {
  return '' +
    '<label class="field">Ime <span class="opt">(nije obavezno)</span><input type="text" id="' + p + '-name" maxlength="40" placeholder="npr. Milica"></label>' +
    '<label class="field">Datum rođenja<input type="date" id="' + p + '-date" required min="1800-01-01" max="2100-12-31"></label>' +
    '<label class="field">Vreme rođenja<input type="time" id="' + p + '-time" required></label>' +
    '<label class="check"><input type="checkbox" id="' + p + '-notime"> <span>Ne znam tačno vreme rođenja</span></label>' +
    '<label class="field wide">Mesto rođenja<input type="text" id="' + p + '-place" list="nk-cities" placeholder="Počni da kucaš, npr. Beograd" required>' +
    '<small class="hint">Izaberi grad sa liste ili unesi koordinate ručno.</small></label>' +
    '<label class="check wide"><input type="checkbox" id="' + p + '-manual"> <span>Unesi koordinate ručno (grad nije na listi)</span></label>' +
    '<div class="manual wide" id="' + p + '-mbox" hidden>' +
    '<label class="field">Geografska širina (°)<input type="number" inputmode="decimal" id="' + p + '-lat" step="0.0001" min="-89.9" max="89.9" placeholder="44.8176 (sever +, jug −)"></label>' +
    '<label class="field">Geografska dužina (°)<input type="number" inputmode="decimal" id="' + p + '-lon" step="0.0001" min="-180" max="180" placeholder="20.4633 (istok +, zapad −)"></label>' +
    '<label class="field wide">Vremenska zona<select id="' + p + '-tz">' + tzList.map(function (z) { return '<option' + (z === 'Europe/Belgrade' ? ' selected' : '') + '>' + z + '</option>'; }).join('') + '</select></label>' +
    '</div>';
}
function setupPerson(p) {
  $(p + '-notime').addEventListener('change', function () { $(p + '-time').disabled = this.checked; });
  $(p + '-manual').addEventListener('change', function () { $(p + '-mbox').hidden = !this.checked; $(p + '-place').required = !this.checked; });
}
function findCity(v) {
  var f = fold(v); if (!f) return null;
  for (var i = 0; i < CITIES.length; i++) { var c = CITIES[i]; if (fold(c[0] + ', ' + c[1]) === f || fold(c[0]) === f) return c; }
  var part = CITIES.filter(function (c) { return fold(c[0]).indexOf(f.split(',')[0]) === 0; });
  return part.length === 1 ? part[0] : null;
}
function readPerson(p, label) {
  var who = label ? ' (' + label + ')' : '';
  var d = $(p + '-date').value, t = $(p + '-time').value, nt = $(p + '-notime').checked, man = $(p + '-manual').checked;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw 'Unesi datum rođenja' + who + '.';
  if (!nt && !/^\d{2}:\d{2}/.test(t)) throw 'Unesi vreme rođenja' + who + ' ili označi „Ne znam tačno vreme“.';
  var dp = d.split('-').map(Number), tp = nt ? [12, 0] : t.split(':').map(Number);
  if (dp[0] < 1800 || dp[0] > 2100) throw 'Datum' + who + ' mora biti između 1800. i 2100. godine.';
  var lat, lon, tz, place;
  if (man) {
    lat = parseFloat($(p + '-lat').value); lon = parseFloat($(p + '-lon').value); tz = $(p + '-tz').value;
    if (!(Math.abs(lat) <= 89.9) || !(Math.abs(lon) <= 180)) throw 'Proveri geografsku širinu i dužinu' + who + '.';
    place = ($(p + '-place').value.trim() || 'Ručno uneto mesto') + ' (' + lat.toFixed(2) + '°, ' + lon.toFixed(2) + '°)';
  } else {
    var c = findCity($(p + '-place').value);
    if (!c) throw 'Mesto' + who + ' nije pronađeno na listi. Izaberi grad iz ponuđenih ili unesi koordinate ručno.';
    lat = c[2]; lon = c[3]; tz = c[4]; place = c[0] + ', ' + c[1];
    $(p + '-place').value = c[0] + ', ' + c[1];
  }
  return { name: $(p + '-name').value.trim(), y: dp[0], mo: dp[1], d: dp[2], h: tp[0], mi: tp[1], timeKnown: !nt, lat: lat, lon: lon, tz: tz, place: place, manual: man };
}
function fillPerson(p, o) {
  $(p + '-name').value = o.name || ''; $(p + '-date').value = o.date || ''; $(p + '-time').value = o.time || '';
  $(p + '-notime').checked = !!o.notime; $(p + '-time').disabled = !!o.notime;
  $(p + '-place').value = o.place || '';
  $(p + '-manual').checked = !!o.manual; $(p + '-mbox').hidden = !o.manual;
  if (o.manual) { $(p + '-lat').value = o.lat; $(p + '-lon').value = o.lon; $(p + '-tz').value = o.tz; }
}
function personToQuery(p, pre, q) {
  q.set(pre + 'n', $(p + '-name').value.trim()); q.set(pre + 'd', $(p + '-date').value);
  if ($(p + '-notime').checked) q.set(pre + 'nt', '1'); else q.set(pre + 't', $(p + '-time').value);
  if ($(p + '-manual').checked) { q.set(pre + 'lat', $(p + '-lat').value); q.set(pre + 'lon', $(p + '-lon').value); q.set(pre + 'tz', $(p + '-tz').value); q.set(pre + 'c', $(p + '-place').value); }
  else q.set(pre + 'c', $(p + '-place').value);
}
function queryToPerson(q, pre) {
  if (!q.get(pre + 'd')) return null;
  return { name: q.get(pre + 'n') || '', date: q.get(pre + 'd'), time: q.get(pre + 't') || '', notime: q.get(pre + 'nt') === '1', place: q.get(pre + 'c') || '',
    manual: !!q.get(pre + 'lat'), lat: q.get(pre + 'lat'), lon: q.get(pre + 'lon'), tz: q.get(pre + 'tz') || 'Europe/Belgrade' };
}

/* ---------- Proračun ---------- */
function compute(per) {
  var u = C.localToUtc(per.y, per.mo, per.d, per.h, per.mi, per.tz);
  var ch = C.computeChart({ utcMs: u.utcMs, lat: per.lat, lon: per.lon, timeKnown: per.timeKnown });
  ch.offsetMin = u.offsetMin; ch.person = per;
  if (!per.timeKnown) {
    var a = C.computeChart({ utcMs: C.localToUtc(per.y, per.mo, per.d, 0, 0, per.tz).utcMs, lat: per.lat, lon: per.lon, timeKnown: false });
    var b = C.computeChart({ utcMs: C.localToUtc(per.y, per.mo, per.d, 23, 59, per.tz).utcMs, lat: per.lat, lon: per.lon, timeKnown: false });
    var ma = Math.floor(a.planets[1].lon / 30), mb = Math.floor(b.planets[1].lon / 30);
    if (ma !== mb) ch.moonRange = [ma, mb];
  }
  return ch;
}
function pget(ch, k) { if (k === 'ASC') return ch.asc; if (k === 'MC') return ch.mc; for (var i = 0; i < ch.planets.length; i++) if (ch.planets[i].key === k) return ch.planets[i]; }
function dateTxt(per) {
  var s = per.d + '. ' + MONTHS[per.mo - 1] + ' ' + per.y + '.';
  if (per.timeKnown) s += ' u ' + (per.h < 10 ? '0' : '') + per.h + ':' + (per.mi < 10 ? '0' : '') + per.mi;
  else s += ', vreme nepoznato';
  return s + ' · ' + per.place;
}
function offTxt(m) { var s = m >= 0 ? '+' : '−', a = Math.abs(m); return 'UTC' + s + Math.floor(a / 60) + (a % 60 ? ':' + (a % 60 < 10 ? '0' : '') + a % 60 : ''); }

/* ---------- Crtanje točka ---------- */
function spread(items, minGap) {
  var n = items.length; if (!n) return;
  items.sort(function (a, b) { return a.lon - b.lon; });
  // preseci krug na najvećem razmaku, pa rasporedi linearno
  var cut = 0, big = -1;
  for (var i = 0; i < n; i++) { var g = C.norm(items[(i + 1) % n].lon - items[i].lon); if (n === 1) g = 360; if (g > big) { big = g; cut = (i + 1) % n; } }
  var lin = [], base = items[cut].lon;
  for (var k = 0; k < n; k++) { var it = items[(cut + k) % n]; it.disp = base + C.norm(it.lon - base); lin.push(it); }
  for (var iter = 0; iter < 300; iter++) {
    var moved = false;
    for (var j = 0; j < n - 1; j++) {
      var gap = lin[j + 1].disp - lin[j].disp;
      if (gap < minGap) { var sh = (minGap - gap) / 2 + 0.001; lin[j].disp -= sh; lin[j + 1].disp += sh; moved = true; }
    }
    if (!moved) break;
  }
}
function wheelSVG(A, B) {
  var bi = !!B, cx = 300, cy = 300;
  var rot = A.asc !== null ? A.asc : 0;
  function P(lon, r) { var t = (180 + lon - rot) * Math.PI / 180; return [cx + r * Math.cos(t), cy - r * Math.sin(t)]; }
  function f(n) { return n.toFixed(1); }
  var g = bi ? { z0: 250, z1: 214, sg: 232, pa: 192, la: 168, h0: 148, hn: 137, asp: 126, pb: 283, lb: 264 } :
               { z0: 292, z1: 250, sg: 271, pa: 222, la: 197, h0: 160, hn: 147, asp: 134 };
  var o = [];
  o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 648 648" role="img" aria-label="' + (bi ? 'Uporedni horoskop – dvostruki točak' : 'Natalna karta – točak') + '">');
  o.push('<defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#262070"/><stop offset="1" stop-color="#0d0b2b"/></radialGradient></defs>');
  o.push('<circle cx="300" cy="300" r="318" fill="#0d0b2b"/><circle cx="300" cy="300" r="' + (bi ? 296 : g.z0) + '" fill="url(#bg)" stroke="#e8c26a" stroke-width="1.5"/>');
  if (bi) o.push('<circle cx="300" cy="300" r="' + g.z0 + '" fill="none" stroke="#e8c26a" stroke-width="1.2"/>');
  // zodijak
  o.push('<circle cx="300" cy="300" r="' + g.z1 + '" fill="none" stroke="#e8c26a" stroke-width="1"/>');
  for (var s = 0; s < 12; s++) {
    var e = s % 4, a1 = P(s * 30, g.z1), a2 = P(s * 30, g.z0);
    var path = describeArc(s * 30, s * 30 + 30, g.z1, g.z0, P);
    o.push('<path d="' + path + '" fill="' + ELEM_COL[e] + '" fill-opacity="0.07"/>');
    o.push('<line x1="' + f(a1[0]) + '" y1="' + f(a1[1]) + '" x2="' + f(a2[0]) + '" y2="' + f(a2[1]) + '" stroke="#e8c26a" stroke-opacity=".6" stroke-width="1"/>');
    var gp = P(s * 30 + 15, g.sg);
    o.push('<text x="' + f(gp[0]) + '" y="' + f(gp[1]) + '" font-size="' + (bi ? 19 : 22) + '" fill="' + ELEM_COL[e] + '" text-anchor="middle" dominant-baseline="central" font-family="' + FONT_SYM + '">' + sgl(s) + '</text>');
  }
  for (var dgr = 0; dgr < 360; dgr += 5) {
    var t1 = P(dgr, g.z1), t2 = P(dgr, g.z1 + (dgr % 10 ? 4 : 7));
    o.push('<line x1="' + f(t1[0]) + '" y1="' + f(t1[1]) + '" x2="' + f(t2[0]) + '" y2="' + f(t2[1]) + '" stroke="#e8c26a" stroke-opacity=".5" stroke-width=".8"/>');
  }
  // kuće
  o.push('<circle cx="300" cy="300" r="' + g.h0 + '" fill="none" stroke="#b9a7f0" stroke-opacity=".5"/>');
  o.push('<circle cx="300" cy="300" r="' + g.asp + '" fill="rgba(13,11,43,.35)" stroke="#b9a7f0" stroke-opacity=".35"/>');
  if (A.houses) {
    for (var h = 0; h < 12; h++) {
      var c = A.houses[h], axis = (h === 0 || h === 3 || h === 6 || h === 9);
      var q1 = P(c, g.asp), q2 = P(c, axis ? g.z0 + (bi ? 46 : 0) : g.z1);
      o.push('<line x1="' + f(q1[0]) + '" y1="' + f(q1[1]) + '" x2="' + f(q2[0]) + '" y2="' + f(q2[1]) + '" stroke="' + (axis ? '#e8c26a' : '#b9a7f0') + '" stroke-opacity="' + (axis ? .95 : .45) + '" stroke-width="' + (axis ? 1.8 : 1) + '"/>');
      var mid = c + C.norm(A.houses[(h + 1) % 12] - c) / 2, np = P(mid, g.hn);
      o.push('<text x="' + f(np[0]) + '" y="' + f(np[1]) + '" font-size="11" fill="#b9a7f0" text-anchor="middle" dominant-baseline="central" font-family="Jost,sans-serif">' + (h + 1) + '</text>');
    }
    [['AC', A.asc], ['DC', C.norm(A.asc + 180)], ['MC', A.mc], ['IC', C.norm(A.mc + 180)]].forEach(function (x) {
      var lp = P(x[1] + 3.2, bi ? 308 : 306);
      o.push('<text x="' + f(lp[0]) + '" y="' + f(lp[1]) + '" font-size="13" font-weight="600" fill="#f5dc9a" text-anchor="middle" dominant-baseline="central" font-family="Jost,sans-serif">' + x[0] + '</text>');
    });
  }
  // aspekti
  var asps = bi ? B.syn : A.aspects;
  asps.forEach(function (x) {
    if (x.type === 'konjunkcija') return;
    var la = bi ? lonOf(A, x.a) : lonOf(A, x.a), lb = bi ? lonOf(B, x.b) : lonOf(A, x.b);
    if (la === null || lb === null) return;
    if (!bi && (x.a === 'ASC' || x.a === 'MC' || x.b === 'ASC' || x.b === 'MC' || x.a === 'Node' || x.b === 'Node')) return;
    var p1 = P(la, g.asp), p2 = P(lb, g.asp), op = Math.max(.25, 1 - x.orb / 8);
    o.push('<line x1="' + f(p1[0]) + '" y1="' + f(p1[1]) + '" x2="' + f(p2[0]) + '" y2="' + f(p2[1]) + '" stroke="' + ASP_COL[x.type] + '" stroke-opacity="' + op.toFixed(2) + '" stroke-width="' + (x.orb < 2 ? 1.6 : 1.1) + '"' + (x.type === 'sekstil' ? ' stroke-dasharray="4 3"' : '') + '/>');
  });
  // planete
  function drawPlanets(ch, rG, rL, rIn, col, size, tickFrom, tickTo) {
    var items = ch.planets.map(function (p) { return { key: p.key, lon: p.lon, retro: p.retro }; });
    spread(items, bi ? (rG > 260 ? 9.5 : 8.5) : 7.5);
    items.forEach(function (it) {
      var t1 = P(it.lon, tickFrom), t2 = P(it.lon, tickTo), gp = P(it.disp, rG), lp = P(it.disp, rL);
      o.push('<line x1="' + f(t1[0]) + '" y1="' + f(t1[1]) + '" x2="' + f(t2[0]) + '" y2="' + f(t2[1]) + '" stroke="' + col + '" stroke-width="1.6"/>');
      o.push('<circle cx="' + f(P(it.lon, rIn)[0]) + '" cy="' + f(P(it.lon, rIn)[1]) + '" r="2" fill="' + col + '"/>');
      o.push('<text x="' + f(gp[0]) + '" y="' + f(gp[1]) + '" font-size="' + size + '" fill="' + col + '" text-anchor="middle" dominant-baseline="central" font-family="' + FONT_SYM + '">' + gl(it.key) + '</text>');
      var fm = C.fmt(it.lon);
      o.push('<text x="' + f(lp[0]) + '" y="' + f(lp[1]) + '" font-size="' + (bi ? 9.5 : 10.5) + '" fill="#d9cffb" text-anchor="middle" dominant-baseline="central" font-family="Jost,sans-serif">' + fm.deg + '°' + (it.retro ? '<tspan fill="#ff9f7a"> R</tspan>' : '') + '</text>');
    });
  }
  drawPlanets(A, g.pa, g.la, g.asp, '#f5dc9a', bi ? 19 : 22, g.z1, g.z1 - 8);
  if (bi) drawPlanets(B, g.pb, g.lb, g.asp, '#c9b8ff', 17, g.z0, g.z0 + 6);
  o.push('</svg>');
  return o.join('');
}
function lonOf(ch, k) { if (k === 'ASC') return ch.asc; if (k === 'MC') return ch.mc; var p = pget(ch, k); return p ? p.lon : null; }
function describeArc(l1, l2, r1, r2, P) {
  var a = P(l1, r2), b = P(l2, r2), c = P(l2, r1), d = P(l1, r1);
  return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A' + r2 + ' ' + r2 + ' 0 0 0 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) +
    ' L' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + d[0].toFixed(1) + ' ' + d[1].toFixed(1) + 'Z';
}

/* ---------- Natalna karta: prikaz ---------- */
var current = { n: null, s: null };
function balance(ch) {
  var el = [0, 0, 0, 0], md = [0, 0, 0], tot = 0;
  ch.planets.forEach(function (p) {
    if (p.key === 'Node') return;
    var w = (p.key === 'Sun' || p.key === 'Moon') ? 2 : 1, s = Math.floor(p.lon / 30);
    el[s % 4] += w; md[s % 3] += w; tot += w;
  });
  if (ch.asc !== null) { var s2 = Math.floor(ch.asc / 30); el[s2 % 4] += 2; md[s2 % 3] += 2; tot += 2; }
  return { el: el, md: md, tot: tot };
}
var ELEM_DESC = ['strast, hrabrost i inicijativa', 'praktičnost, stabilnost i istrajnost', 'ideje, komunikacija i radoznalost', 'osećajnost, intuicija i empatija'];
var MODE_DESC = ['voliš da pokreneš stvari', 'istrajavaš i gradiš dugoročno', 'lako se prilagođavaš promenama'];
function balanceHTML(b) {
  function rows(arr, names, cols) {
    return arr.map(function (v, i) {
      var pc = Math.round(v / b.tot * 100);
      return '<div class="bal"><span>' + names[i] + '</span><div class="bar"><span style="width:' + pc + '%;background:' + cols[i] + '"></span></div><span>' + pc + '%</span></div>';
    }).join('');
  }
  var ei = b.el.indexOf(Math.max.apply(null, b.el)), mi = b.md.indexOf(Math.max.apply(null, b.md));
  return rows(b.el, ELEM, ELEM_COL) + '<div style="height:.6rem"></div>' + rows(b.md, MODE, ['#e8c26a', '#b9a7f0', '#7fd1ff']) +
    '<p class="bal-sum">Najizraženiji element je <b>' + ELEM[ei] + '</b> (' + ELEM_DESC[ei] + '), a kvalitet <b>' + MODE[mi].toLowerCase() + '</b>: ' + MODE_DESC[mi] + '.</p>';
}
function renderNatal(ch, isExample) {
  current.n = ch;
  var per = ch.person;
  $('n-badge').hidden = !isExample;
  $('n-title').textContent = per.name ? 'Natalna karta: ' + per.name : 'Natalna karta';
  $('n-meta').textContent = dateTxt(per) + ' (' + offTxt(ch.offsetMin) + ')';
  var warn = [];
  if (!per.timeKnown) warn.push('Bez tačnog vremena rođenja ne mogu da se izračunaju podznak (ascendent), MC i kuće, pa ih ovde izostavljamo. Planete su računate za podne.');
  if (ch.moonRange) warn.push('Mesec je tog dana prešao iz znaka ' + T.signGen[ch.moonRange[0]] + ' u znak ' + T.signGen[ch.moonRange[1]] + ', pa bez tačnog vremena ne možemo sa sigurnošću da kažemo u kom je znaku.');
  $('n-warn').hidden = !warn.length; $('n-warn').textContent = warn.join(' ');
  $('n-wheel').innerHTML = wheelSVG(ch);
  var rows = ch.planets.map(function (p) {
    var fm = C.fmt(p.lon);
    return '<tr><td><span class="gl">' + gl(p.key) + '</span>' + PL[p.key][0] + '</td><td><span class="gl">' + sgl(fm.sign) + '</span>' + fm.signName + '</td><td>' + fm.text + (p.retro ? '<span class="r" title="retrogradno">R</span>' : '') + '</td><td>' + (p.house || '–') + '</td></tr>';
  });
  if (ch.asc !== null) ['ASC', 'MC'].forEach(function (k) {
    var fm = C.fmt(k === 'ASC' ? ch.asc : ch.mc);
    rows.push('<tr><td><span class="gl sm">' + PL[k][1] + '</span>' + PL[k][0] + '</td><td><span class="gl">' + sgl(fm.sign) + '</span>' + fm.signName + '</td><td>' + fm.text + '</td><td>' + (k === 'ASC' ? 1 : 10) + '</td></tr>');
  });
  $('n-planets').tBodies[0].innerHTML = rows.join('');
  $('n-hnote').textContent = ch.asc !== null ? 'Sistem kuća: ' + (ch.houseSystem === 'Placidus' ? 'Placidus' : 'Cele kuće (Whole Sign) – Placidus ne radi iznad polarnog kruga') + ' · R = retrogradno kretanje · tropski zodijak.' : 'R = retrogradno kretanje · tropski zodijak.';
  $('n-balance').innerHTML = balanceHTML(balance(ch));
  $('n-aspects').innerHTML = ch.aspects.filter(function (x) { return x.orb <= 6 || ['Sun', 'Moon', 'ASC'].indexOf(x.a) >= 0; }).map(function (x) {
    return '<li><span class="dot" style="background:' + ASP_COL[x.type] + '"></span><span class="gl">' + gl(x.a) + '</span>' + PL[x.a][0] + ' ' + x.type + ' <span class="gl">' + gl(x.b) + '</span>' + PL[x.b][0] + ' <span class="orb">(orb ' + orbTxt(x.orb) + ' · ' + T.aspects[x.type] + ')</span></li>';
  }).join('') || '<li>Nema glavnih aspekata u okviru orbisa.</li>';
  $('n-interp').innerHTML = natalInterp(ch);
}
function natalInterp(ch) {
  var o = [], sun = pget(ch, 'Sun'), moon = pget(ch, 'Moon');
  var ss = Math.floor(sun.lon / 30), ms = Math.floor(moon.lon / 30);
  o.push('<h4><span class="gl">' + gl('Sun') + '</span> Sunce u ' + T.signLoc[ss] + ' – tvoja suština</h4><p>' + T.sun[ss] + '</p>');
  if (sun.house) o.push('<p class="house">Sunce u ' + T.houses[sun.house - 1].name + ': ' + T.houses[sun.house - 1].sun + '.</p>');
  o.push('<h4><span class="gl">' + gl('Moon') + '</span> Mesec u ' + T.signLoc[ms] + ' – tvoja osećanja</h4><p>' + T.moon[ms] + '</p>');
  if (ch.moonRange) o.push('<p class="house">Ako je Mesec ipak bio u znaku ' + T.signGen[ch.moonRange[0] === ms ? ch.moonRange[1] : ch.moonRange[0]] + ', pročitaj i taj opis u nekoj od sledećih karata – tačno vreme rešava dilemu.</p>');
  if (moon.house) o.push('<p class="house">Mesec u ' + T.houses[moon.house - 1].name + ': ' + T.houses[moon.house - 1].moon + '.</p>');
  if (ch.asc !== null) {
    var as = Math.floor(ch.asc / 30);
    o.push('<h4>AC Podznak u ' + T.signLoc[as] + ' – kako te drugi vide</h4><p>' + T.asc[as] + '</p>');
  } else o.push('<h4>AC Podznak</h4><p>Za podznak je potrebno tačno vreme rođenja (često piše u izvodu iz matične knjige rođenih ili ga zna neko od starijih u porodici). Kada ga saznaš, vrati se i dopuni podatke.</p>');
  o.push('<h4>Ostale planete</h4><ul>');
  ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Node'].forEach(function (k) {
    var p = pget(ch, k), s = Math.floor(p.lon / 30);
    o.push('<li><span class="gl">' + gl(k) + '</span> ' + T.planet[k]({ gen: T.signGen[s], style: T.signStyle[s] }) + (p.retro && k !== 'Node' ? ' <span class="r">R</span> Retrogradno kretanje daje ovoj energiji više unutrašnjeg, promišljenog izraza.' : '') + '</li>');
  });
  o.push('</ul>');
  return o.join('');
}

/* ---------- Uporedni horoskop ---------- */
var SYN_PTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
var OUTER = { Uranus: 1, Neptune: 1, Pluto: 1 };
var SYN_ASP = [['konjunkcija', 0, 7], ['opozicija', 180, 7], ['trigon', 120, 6], ['kvadrat', 90, 6], ['sekstil', 60, 4]];
function imp(k) { return { Sun: 2, Moon: 2, Venus: 2, Mars: 2, ASC: 2, Mercury: 1, Jupiter: 1, Saturn: 1 }[k] || 0.5; }
function synAspects(A, B) {
  var pa = SYN_PTS.slice(), pb = SYN_PTS.slice();
  if (A.asc !== null) pa.push('ASC');
  if (B.asc !== null) pb.push('ASC');
  var out = [];
  pa.forEach(function (ka) {
    pb.forEach(function (kb) {
      if (OUTER[ka] && OUTER[kb]) return;
      if (ka === 'ASC' && kb === 'ASC') return;
      var la = lonOf(A, ka), lb = lonOf(B, kb), sep = Math.abs(C.lonDiff(la, lb));
      SYN_ASP.forEach(function (as) {
        var orb = as[2] + ((ka === 'Sun' || ka === 'Moon' || kb === 'Sun' || kb === 'Moon') ? 1 : 0);
        if (ka === 'ASC' || kb === 'ASC') orb = 5;
        if (OUTER[ka] || OUTER[kb]) orb = Math.min(orb, 4);
        var d = Math.abs(sep - as[1]);
        if (d <= orb) out.push({ a: ka, b: kb, type: as[0], orb: d, max: orb });
      });
    });
  });
  out.sort(function (x, y) { return (imp(y.a) + imp(y.b)) - (imp(x.a) + imp(x.b)) || x.orb - y.orb; });
  return out;
}
var PTS = { trigon: 3, sekstil: 2, konjunkcija: 2, kvadrat: -2, opozicija: -1.5 };
function elemRel(a, b) { var ea = a % 4, eb = b % 4; if (ea === eb) return 'same'; if ((ea + eb) % 2 === 0) return 'comp'; return 'diff'; }
function synScore(A, B, asp) {
  var raw = 0, nh = 0, nc = 0, nk = 0;
  asp.forEach(function (x) {
    var w = (imp(x.a) + imp(x.b)) / 2, tight = 0.5 + 0.5 * (1 - x.orb / x.max);
    raw += PTS[x.type] * w * tight;
    if (x.type === 'trigon' || x.type === 'sekstil') nh++; else if (x.type === 'konjunkcija') nk++; else nc++;
  });
  var sA = Math.floor(pget(A, 'Sun').lon / 30), mA = Math.floor(pget(A, 'Moon').lon / 30), sB = Math.floor(pget(B, 'Sun').lon / 30), mB = Math.floor(pget(B, 'Moon').lon / 30);
  var pairs = [['Sunce A – Sunce B', sA, sB], ['Mesec A – Mesec B', mA, mB], ['Sunce A – Mesec B', sA, mB], ['Mesec A – Sunce B', mA, sB]];
  var elem = 0, eRows = pairs.map(function (p) { var r = elemRel(p[1], p[2]); elem += { same: 2, comp: 1.5, diff: -0.5 }[r]; return { label: p[0], a: p[1], b: p[2], rel: r }; });
  var score = Math.round(50 + 42 * Math.tanh(raw / 30) + elem);
  score = Math.max(1, Math.min(99, score));
  return { score: score, raw: raw, elem: elem, nh: nh, nc: nc, nk: nk, eRows: eRows };
}
function pairKey(a, b) {
  var keys = ['Sun-Moon', 'Venus-Mars', 'Moon-Moon', 'Sun-Sun', 'Venus-Venus', 'Mars-Mars'];
  if (keys.indexOf(a + '-' + b) >= 0) return a + '-' + b;
  if (keys.indexOf(b + '-' + a) >= 0) return b + '-' + a;
  return null;
}
function kind(t) { return t === 'konjunkcija' ? 'k' : (t === 'trigon' || t === 'sekstil') ? 'h' : 'c'; }
var KIND_TAG = { k: '<span class="tag k">spajanje</span>', h: '<span class="tag h">skladno</span>', c: '<span class="tag c">izazov i rast</span>' };
function renderSyn(A, B, isExample) {
  var asp = synAspects(A, B); B.syn = asp; current.s = { A: A, B: B };
  var nA = A.person.name || 'Osoba A', nB = B.person.name || 'Osoba B';
  $('s-badge').hidden = !isExample;
  $('s-title').textContent = 'Uporedni horoskop: ' + nA + ' i ' + nB;
  $('s-meta').innerHTML = '<b class="ga">A</b> ' + esc(nA) + ': ' + esc(dateTxt(A.person)) + '<br><b class="gb">B</b> ' + esc(nB) + ': ' + esc(dateTxt(B.person));
  var warn = [];
  [[A, nA], [B, nB]].forEach(function (x) {
    if (!x[0].person.timeKnown) warn.push('Za ' + x[1] + ' vreme rođenja nije poznato, pa podznak i kuće nisu uključeni (planete računate za podne).');
    if (x[0].moonRange) warn.push('Mesec osobe ' + x[1] + ' je tog dana menjao znak, pa je njegov tačan položaj nesiguran.');
  });
  $('s-warn').hidden = !warn.length; $('s-warn').textContent = warn.join(' ');
  $('s-wheel').innerHTML = wheelSVG(A, B);
  $('s-aspects').tBodies[0].innerHTML = asp.map(function (x) {
    return '<tr><td><span class="gl">' + gl(x.a) + '</span>' + PL[x.a][0].replace(' (ASC)', '') + '</td><td><span class="dot" style="background:' + ASP_COL[x.type] + '"></span>' + x.type + '</td><td><span class="gl" style="color:#c9b8ff">' + gl(x.b) + '</span>' + PL[x.b][0].replace(' (ASC)', '') + '</td><td>' + orbTxt(x.orb) + '</td></tr>';
  }).join('') || '<tr><td colspan="4">Nema glavnih aspekata u okviru orbisa.</td></tr>';
  var keys = SYN_PTS.concat(['Node']);
  var rows = keys.map(function (k) {
    var a = C.fmt(pget(A, k).lon), b = C.fmt(pget(B, k).lon);
    return '<tr><td><span class="gl">' + gl(k) + '</span>' + PL[k][0] + '</td><td><span class="gl">' + sgl(a.sign) + '</span>' + a.text + (pget(A, k).retro ? '<span class="r">R</span>' : '') + '</td><td><span class="gl" style="color:#c9b8ff">' + sgl(b.sign) + '</span>' + b.text + (pget(B, k).retro ? '<span class="r">R</span>' : '') + '</td></tr>';
  });
  rows.push('<tr><td><span class="gl sm">AC</span>Podznak</td><td>' + (A.asc !== null ? '<span class="gl">' + sgl(Math.floor(A.asc / 30)) + '</span>' + C.fmt(A.asc).text : '–') + '</td><td>' + (B.asc !== null ? '<span class="gl" style="color:#c9b8ff">' + sgl(Math.floor(B.asc / 30)) + '</span>' + C.fmt(B.asc).text : '–') + '</td></tr>');
  $('s-planets').tBodies[0].innerHTML = rows.join('');
  var sc = synScore(A, B, asp);
  var lbl = S.scoreLabels.filter(function (l) { return sc.score >= l[0]; })[0][1];
  $('s-score').innerHTML = '<div class="score"><div class="score-num">' + sc.score + '<small>/100</small></div><div class="score-label">' + lbl + '</div></div>' +
    '<div class="score-bar"><span style="width:' + sc.score + '%"></span></div>' +
    '<p class="small">Između vas je <b>' + sc.nh + '</b> skladnih aspekata, <b>' + sc.nk + '</b> konjunkcija i <b>' + sc.nc + '</b> izazovnih aspekata. Izazovni aspekti nisu „loši“ – često donose privlačnost, strast i rast.</p>' +
    '<details class="how"><summary>Kako računamo slaganje?</summary><p>Krećemo od 50 poena. Svaki aspekt između vaših planeta nosi poene: trigon +3, sekstil +2, konjunkcija +2, kvadrat −2, opozicija −1,5. Važnije tačke (Sunce, Mesec, Venera, Mars i podznak) nose dvostruku težinu, Merkur, Jupiter i Saturn običnu, a spore planete pola. Tesniji aspekt (manji orb) vredi do dva puta više od labavog. Zbir ' + sc.raw.toFixed(1).replace('.', ',') + ' se blago „sabija“ (da jedan ogroman broj aspekata ne bi probio skalu) i dodaje na osnovnih 50, uz najviše ±42 poena. Na kraju dodajemo slaganje elemenata Sunca i Meseca (isti element +2, elementi koji se dopunjuju +1,5, različiti −0,5, za 4 para): ovde ' + (sc.elem >= 0 ? '+' : '') + sc.elem.toString().replace('.', ',') + '. Rezultat je razigran pokazatelj, a ne presuda – prava veza se gradi, ne računa.</p></details>';
  $('s-elements').innerHTML = sc.eRows.map(function (r) {
    return '<p class="small" style="margin:.4rem 0"><b>' + r.label + '</b>: ' + ELEM[r.a % 4] + ' i ' + ELEM[r.b % 4] + ' – ' + S.elements[r.rel] + '</p>';
  }).join('');
  $('s-interp').innerHTML = synInterp(A, B, asp, nA, nB, sc);
}
function synInterp(A, B, asp, nA, nB, sc) {
  var o = [], seen = {};
  var sA = Math.floor(pget(A, 'Sun').lon / 30), sB = Math.floor(pget(B, 'Sun').lon / 30);
  o.push('<p>' + esc(nA) + ' je Sunce u ' + T.signLoc[sA] + ', a ' + esc(nB) + ' Sunce u ' + T.signLoc[sB] + '. ' +
    { same: 'Vaša Sunca dele isti element, pa se lako prepoznajete i imate sličan ritam.', comp: 'Vaša Sunca su u elementima koji se dopunjuju – jedno drugo podstičete i hranite.', diff: 'Vaša Sunca su u različitim elementima: drugačije pristupate životu, a upravo zato možete mnogo da naučite jedno od drugog.' }[elemRel(sA, sB)] + '</p>');
  asp.forEach(function (x) {
    var pk = pairKey(x.a, x.b), kd = kind(x.type);
    if (pk) {
      var id = pk + kd; if (seen[id]) return; seen[id] = 1;
      var title = PL[x.a][0] + ' (' + nA + ') ' + x.type + ' ' + PL[x.b][0] + ' (' + nB + ')';
      o.push('<h4>' + '<span class="gl">' + gl(x.a) + '</span>' + ASP_GL[x.type] + '<span class="gl" style="color:#c9b8ff">' + gl(x.b) + '</span> ' + esc(title) + KIND_TAG[kd] + '</h4><p>' + S[pk][kd] + ' <span class="orb small">(orb ' + orbTxt(x.orb) + ')</span></p>');
    } else if ((x.a === 'ASC' || x.b === 'ASC') && ['Sun', 'Moon', 'Venus', 'Mars'].indexOf(x.a === 'ASC' ? x.b : x.a) >= 0) {
      var pl = x.a === 'ASC' ? x.b : x.a, who = x.a === 'ASC' ? nB : nA, id2 = 'ASC' + pl + who;
      if (seen[id2]) return; seen[id2] = 1;
      o.push('<h4><span class="gl">' + gl(pl) + '</span>' + ASP_GL[x.type] + ' AC ' + esc(PL[pl][0] + ' (' + who + ') ' + x.type + ' podznak') + KIND_TAG[kd] + '</h4><p>' + esc(S.ASC[kd](PL[pl][0], who)) + '</p>');
    }
  });
  if (o.length === 1) o.push('<p>Ključne planete (Sunce, Mesec, Venera, Mars) nemaju tesne međusobne aspekte. To znači da vaš odnos više zavisi od zajedničkih vrednosti i svakodnevnog truda nego od „instant hemije“ – a takve veze često budu najstabilnije.</p>');
  o.push('<h4>Ukratko</h4><p>' + (sc.score >= 65 ? 'Između vas ima mnogo prirodne lakoće i razumevanja. Negujte ono što vas spaja, a male razlike neka budu začin.' : sc.score >= 45 ? 'Imate lepu osnovu i nekoliko tačaka na kojima zajedno rastete. Razgovor i strpljenje pretvaraju razlike u snagu.' : 'Vaše karte su prilično različite, pa odnos traži više razumevanja – ali upravo takvi parovi često najviše nauče jedno od drugog.') + '</p>');
  return o.join('');
}

/* ---------- PNG i štampa ---------- */
function downloadPNG(which) {
  var svg = $(which === 'n' ? 'n-wheel' : 's-wheel').querySelector('svg'); if (!svg) return;
  var title = $(which + '-title').textContent, meta = $(which + '-meta').innerText;
  var xml = new XMLSerializer().serializeToString(svg);
  var img = new Image();
  var url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  img.onload = function () {
    var W = 1400, H = 1640, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    var gr = x.createRadialGradient(W / 2, 0, 50, W / 2, H / 2, H);
    gr.addColorStop(0, '#2b2380'); gr.addColorStop(1, '#0d0b2b'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = '#f5dc9a'; x.textAlign = 'center';
    x.font = '600 52px "Playfair Display", Georgia, serif'; x.fillText(title, W / 2, 90);
    x.fillStyle = '#d9cffb'; x.font = '400 28px Jost, sans-serif';
    meta.split('\n').forEach(function (l, i) { x.fillText(l, W / 2, 140 + i * 38); });
    x.drawImage(img, 70, 220, 1260, 1260);
    x.fillStyle = '#a9a6cf'; x.font = '400 24px Jost, sans-serif';
    x.fillText('Napravio: WebGlow Studio · webglowstudio.github.io/Natalnakarta', W / 2, H - 50);
    URL.revokeObjectURL(url);
    cv.toBlob(function (b) {
      var a = document.createElement('a'); a.href = URL.createObjectURL(b);
      a.download = (which === 'n' ? 'natalna-karta' : 'uporedni-horoskop') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, 'image/png');
  };
  img.src = url;
}
function copyLink(which, btn) {
  var q = new URLSearchParams();
  if (which === 'n') { q.set('m', 'n'); personToQuery('n', '', q); }
  else { q.set('m', 's'); personToQuery('a', 'a', q); personToQuery('b', 'b', q); }
  var link = location.origin + location.pathname + '?' + q.toString();
  var done = function () { var t = btn.textContent; btn.textContent = 'Link je kopiran ✓'; setTimeout(function () { btn.textContent = t; }, 2000); };
  if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, function () { prompt('Kopiraj link:', link); });
  else prompt('Kopiraj link:', link);
}

/* ---------- Tabovi ---------- */
var TABS = ['natal', 'syn', 'kristal', 'solja'];
function showTab(id, push) {
  TABS.forEach(function (t) {
    var on = t === id; $('tab-' + t).hidden = !on;
    var b = $('tab-btn-' + t); b.classList.toggle('active', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  if (push) history.replaceState(null, '', location.pathname + location.search + (id === 'natal' ? '' : '#' + id));
  if (id === 'kristal') initCrystal();
  if (id === 'solja') initCup();
}

/* ---------- Kristal za tebe ---------- */
var crysInit = false, crysAngle = 0, spinning = false;
function initCrystal() {
  if (crysInit) return; crysInit = true;
  var L = window.NK_CRYSTALS, n = L.length, seg = 360 / n, o = [];
  o.push('<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Točak kristala"><g class="rot" id="c-rot">');
  L.forEach(function (c, i) {
    var a1 = (i * seg - 90 - seg / 2) * Math.PI / 180, a2 = ((i + 1) * seg - 90 - seg / 2) * Math.PI / 180;
    var x1 = 200 + 190 * Math.cos(a1), y1 = 200 + 190 * Math.sin(a1), x2 = 200 + 190 * Math.cos(a2), y2 = 200 + 190 * Math.sin(a2);
    o.push('<path d="M200 200 L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A190 190 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'Z" fill="' + c.color + '" stroke="#0d0b2b" stroke-width="1.5"/>');
    var mid = i * seg - 90, light = luminance(c.color) > 0.55, flip = Math.cos(mid * Math.PI / 180) < -0.01;
    o.push('<text transform="rotate(' + (flip ? mid + 180 : mid) + ' 200 200)" x="' + (flip ? 22 : 378) + '" y="200" text-anchor="' + (flip ? 'start' : 'end') + '" dominant-baseline="central" font-family="Jost,sans-serif" font-weight="600" font-size="' + (c.name.length > 11 ? 13 : 14.5) + '" fill="' + (light ? '#1b1650' : '#ffffff') + '">' + esc(c.name) + '</text>');
  });
  o.push('</g><circle cx="200" cy="200" r="192" fill="none" stroke="#e8c26a" stroke-width="4"/><circle cx="200" cy="200" r="34" fill="#0d0b2b" stroke="#e8c26a" stroke-width="3"/><text x="200" y="201" text-anchor="middle" dominant-baseline="central" font-size="24" fill="#e8c26a">✦</text></svg>');
  $('c-wheel').innerHTML = o.join('');
  $('c-spin').addEventListener('click', spinCrystal);
}
function luminance(hex) { var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255; return 0.299 * r + 0.587 * g + 0.114 * b; }
function spinCrystal() {
  if (spinning) return; spinning = true;
  var L = window.NK_CRYSTALS, n = L.length, seg = 360 / n, idx = Math.floor(Math.random() * n);
  var jitter = (Math.random() - 0.5) * seg * 0.6;
  var target = -idx * seg + jitter;              // segment idx pod pokazivačem (gore)
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start = crysAngle, end = target - 360 * (reduce ? 0 : 6);
  while (end > start - (reduce ? 0 : 360 * 5)) end -= 360;
  var dur = reduce ? 0 : 4200, t0 = performance.now(), g = $('c-rot');
  $('c-result').hidden = true;
  function step(now) {
    var p = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 4);
    var a = start + (end - start) * e; g.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' 200 200)');
    if (p < 1) requestAnimationFrame(step);
    else { crysAngle = C.norm(end); g.setAttribute('transform', 'rotate(' + crysAngle.toFixed(2) + ' 200 200)'); spinning = false; showCrystal(L[idx]); }
  }
  requestAnimationFrame(step);
}
function showCrystal(c) {
  var r = $('c-result');
  r.innerHTML = '<div class="c-gem" style="background:radial-gradient(circle at 35% 30%,#fff8,' + c.color + ' 55%)"></div><h3>' + esc(c.name) + '</h3><p>' + esc(c.text) + '</p><p class="c-tip"><b>Savet:</b> ' + esc(c.tip) + '</p>';
  r.hidden = false; $('c-spin').textContent = 'Zavrti ponovo ✦';
}

/* ---------- Gledanje u šolju ---------- */
var cupInit = false;
function rnd(a, b) { return a + Math.random() * (b - a); }
function cupSVG() {
  var o = ['<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Šolja za kafu">',
    '<defs><radialGradient id="cupin" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#fbf4ea"/><stop offset=".8" stop-color="#efe3d2"/><stop offset="1" stop-color="#d9c6ad"/></radialGradient></defs>',
    '<g class="cupside">',
    '<ellipse cx="200" cy="318" rx="150" ry="26" fill="#efe6f7" stroke="#e8c26a" stroke-width="3"/><ellipse cx="200" cy="314" rx="95" ry="13" fill="#d9cffb" opacity=".6"/>',
    '<path d="M95 160 Q100 300 200 306 Q300 300 305 160Z" fill="#fbf7f1" stroke="#e8c26a" stroke-width="3"/>',
    '<path d="M303 190 q58 -8 52 40 q-6 42 -64 40" fill="none" stroke="#e8c26a" stroke-width="11" stroke-linecap="round"/><path d="M303 190 q58 -8 52 40 q-6 42 -64 40" fill="none" stroke="#fbf7f1" stroke-width="6" stroke-linecap="round"/>',
    '<ellipse cx="200" cy="160" rx="105" ry="22" fill="#4a2c1d" stroke="#e8c26a" stroke-width="3"/><ellipse cx="185" cy="157" rx="40" ry="6" fill="#7a4a30" opacity=".6"/>',
    '<path d="M120 215 q80 18 160 0" stroke="#b9a7f0" stroke-width="5" fill="none" opacity=".7"/><circle cx="200" cy="245" r="5" fill="#e8c26a"/><circle cx="170" cy="240" r="3" fill="#e8c26a"/><circle cx="230" cy="240" r="3" fill="#e8c26a"/>',
    '<path d="M170 120 q-14 -20 0 -40 q14 -20 0 -40" stroke="#d9cffb" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/><path d="M210 125 q-14 -20 0 -40 q14 -20 0 -40" stroke="#d9cffb" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>',
    '</g><g class="inside" id="cup-in"></g></svg>'];
  return o.join('');
}
function initCup() {
  if (cupInit) return; cupInit = true;
  $('cup').innerHTML = cupSVG();
  $('cup-btn').addEventListener('click', tipCup);
  $('cup-again').addEventListener('click', resetCup);
}
function resetCup() {
  var c = $('cup'); c.classList.remove('revealed'); c.classList.remove('tipped');
  $('cup-result').hidden = true; $('cup-again').hidden = true; $('cup-btn').hidden = false; $('cup-btn').disabled = false;
}
function tipCup() {
  var K = window.NK_CUP, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('cup-btn').disabled = true;
  // izaberi 2–3 simbola iz različitih oblasti
  var pool = K.symbols.slice().sort(function () { return Math.random() - 0.5; }), pick = [], areas = {};
  var count = Math.random() < 0.5 ? 2 : 3;
  pool.forEach(function (s) { if (pick.length < count && !areas[s.area]) { pick.push(s); areas[s.area] = 1; } });
  // talog
  var o = ['<circle cx="200" cy="200" r="175" fill="#fbf7f1" stroke="#e8c26a" stroke-width="4"/><circle cx="200" cy="200" r="160" fill="url(#cupin)"/>'];
  var slots = [0, 1, 2].map(function (k) { var a = (k * 120 + rnd(-25, 25) - 90) * Math.PI / 180, r = rnd(88, 108); return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }).sort(function () { return Math.random() - 0.5; });
  function nearSlot(x, y) { for (var q = 0; q < pick.length; q++) if (Math.hypot(x - slots[q][0], y - slots[q][1]) < 34) return true; return false; }
  for (var i = 0; i < 260; i++) {
    var a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 150, x = 200 + r * Math.cos(a), y = 200 + r * Math.sin(a);
    if (nearSlot(x, y)) continue;
    o.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rnd(0.8, r < 40 ? 7 : 4).toFixed(1) + '" fill="#4a2c1d" opacity="' + rnd(0.25, 0.85).toFixed(2) + '"/>');
  }
  for (var j = 0; j < 14; j++) {
    var a0 = rnd(0, Math.PI * 2), r0 = rnd(40, 145), x0 = 200 + r0 * Math.cos(a0), y0 = 200 + r0 * Math.sin(a0);
    if (nearSlot(x0, y0)) continue;
    o.push('<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' q' + rnd(-25, 25).toFixed(1) + ' ' + rnd(-25, 25).toFixed(1) + ' ' + rnd(-40, 40).toFixed(1) + ' ' + rnd(-40, 40).toFixed(1) + '" stroke="#5a3624" stroke-width="' + rnd(2, 6).toFixed(1) + '" fill="none" stroke-linecap="round" opacity="' + rnd(0.3, 0.7).toFixed(2) + '"/>');
  }
  o.push('<circle cx="200" cy="200" r="34" fill="#3b2216" opacity=".85"/>');
  pick.forEach(function (s, k) {
    var p = slots[k], rotA = rnd(-30, 30).toFixed(0);
    o.push('<g transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + rotA + ') scale(1.75)" fill="#3b2216" stroke="#3b2216" opacity=".92">' + s.d + '</g>');
    o.push('<g class="hl"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="36" fill="none" stroke="#e8c26a" stroke-width="2.5" stroke-dasharray="6 4"/><circle cx="' + (p[0] + 28).toFixed(1) + '" cy="' + (p[1] - 28).toFixed(1) + '" r="11" fill="#e8c26a"/><text x="' + (p[0] + 28).toFixed(1) + '" y="' + (p[1] - 27).toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Jost,sans-serif" font-weight="600" font-size="13" fill="#1b1650">' + (k + 1) + '</text></g>');
  });
  $('cup-in').innerHTML = o.join('');
  var c = $('cup');
  c.classList.add('tipped');
  setTimeout(function () {
    c.classList.add('revealed');
    var html = '<h3>Šta kaže šolja</h3>' + pick.map(function (s, k) {
      return '<div class="cup-sym"><span class="num">' + (k + 1) + '</span><div><b>' + s.name + '</b> <span class="tag k">' + s.area + '</span><br>' + esc(s.text) + '</div></div>';
    }).join('');
    html += '<ul class="cup-areas">' + Object.keys(K.areas).map(function (ar) { var l = K.areas[ar]; return '<li><b>' + ar + ':</b> ' + l[Math.floor(Math.random() * l.length)] + '</li>'; }).join('') + '</ul>';
    $('cup-result').innerHTML = html; $('cup-result').hidden = false;
    $('cup-btn').hidden = true; $('cup-again').hidden = false;
  }, reduce ? 50 : 1500);
}

/* ---------- Start ---------- */
function init() {
  $('nk-cities').innerHTML = CITIES.map(function (c) { return '<option value="' + esc(c[0] + ', ' + c[1]) + '"></option>'; }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.person'), function (el) { el.innerHTML = personHTML(el.getAttribute('data-p')); setupPerson(el.getAttribute('data-p')); });
  TABS.forEach(function (t) { $('tab-btn-' + t).addEventListener('click', function () { showTab(t, true); }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-png]'), function (b) { b.addEventListener('click', function () { downloadPNG(b.getAttribute('data-png')); }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-print]'), function (b) { b.addEventListener('click', function () { window.print(); }); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-link]'), function (b) { b.addEventListener('click', function () { copyLink(b.getAttribute('data-link'), b); }); });

  $('nk-form').addEventListener('submit', function (e) {
    e.preventDefault(); var err = $('n-error'); err.hidden = true;
    try { renderNatal(compute(readPerson('n')), false); $('result').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    catch (x) { err.textContent = typeof x === 'string' ? x : 'Došlo je do greške u proračunu. Proveri unete podatke.'; err.hidden = false; if (typeof x !== 'string') console.warn(x); }
  });
  $('s-form').addEventListener('submit', function (e) {
    e.preventDefault(); var err = $('s-error'); err.hidden = true;
    try { renderSyn(compute(readPerson('a', 'osoba A')), compute(readPerson('b', 'osoba B')), false); $('s-wheel').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    catch (x) { err.textContent = typeof x === 'string' ? x : 'Došlo je do greške u proračunu. Proveri unete podatke.'; err.hidden = false; if (typeof x !== 'string') console.warn(x); }
  });

  var q = new URLSearchParams(location.search);
  var nP = q.get('m') === 'n' ? queryToPerson(q, '') : null;
  var aP = q.get('m') === 's' ? queryToPerson(q, 'a') : null, bP = q.get('m') === 's' ? queryToPerson(q, 'b') : null;
  fillPerson('n', nP || { name: 'Primer', date: '1995-02-14', time: '08:30', place: 'Beograd, Srbija' });
  fillPerson('a', aP || { name: 'Mila (primer)', date: '1993-04-12', time: '09:15', place: 'Beograd, Srbija' });
  fillPerson('b', bP || { name: 'Luka (primer)', date: '1991-10-03', time: '18:40', place: 'Novi Sad, Srbija' });
  try { renderNatal(compute(readPerson('n')), !nP); } catch (x) { fillPerson('n', { name: 'Primer', date: '1995-02-14', time: '08:30', place: 'Beograd, Srbija' }); renderNatal(compute(readPerson('n')), true); }
  try { renderSyn(compute(readPerson('a')), compute(readPerson('b')), !(aP && bP)); } catch (x) { console.warn(x); }
  var h = location.hash.replace('#', '');
  if (q.get('m') === 's') h = 'syn';
  showTab(TABS.indexOf(h) >= 0 ? h : 'natal', false);
  window.addEventListener('hashchange', function () { var t = location.hash.replace('#', ''); showTab(TABS.indexOf(t) >= 0 ? t : 'natal', false); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
