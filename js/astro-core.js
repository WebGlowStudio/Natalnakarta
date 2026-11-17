/* Natalna karta – proračun (WebGlow Studio). Koristi astronomy-engine 2.1.19 (MIT, Don Cross). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('astronomy-engine'));
  else root.AstroCore = factory(root.Astronomy);
})(typeof self !== 'undefined' ? self : this, function (A) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sind(x) { return Math.sin(x * D2R); }
  function cosd(x) { return Math.cos(x * D2R); }
  function tand(x) { return Math.tan(x * D2R); }

  /* ---------- Vremenska zona: lokalno -> UTC preko IANA podataka (Intl) ---------- */
  var dtfCache = {};
  function tzOffsetMinutes(tz, utcMs) {
    var f = dtfCache[tz] || (dtfCache[tz] = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    }));
    var p = {};
    f.formatToParts(new Date(utcMs)).forEach(function (x) { p[x.type] = x.value; });
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    var base = new Date(utcMs); base.setUTCMilliseconds(0);
    return Math.round((asUtc - base.getTime()) / 60000);
  }
  function makeUtcMs(y, mo, d, h, mi) {
    var dt = new Date(0); dt.setUTCFullYear(y, mo - 1, d); dt.setUTCHours(h, mi, 0, 0); return dt.getTime();
  }
  /* Vraća {utcMs, offsetMin}. Iteracija oko prelaza na letnje računanje vremena. */
  function localToUtc(y, mo, d, h, mi, tz) {
    var wall = makeUtcMs(y, mo, d, h, mi);
    var off = tzOffsetMinutes(tz, wall);
    for (var i = 0; i < 4; i++) {
      var off2 = tzOffsetMinutes(tz, wall - off * 60000);
      if (off2 === off) break;
      off = off2;
    }
    return { utcMs: wall - off * 60000, offsetMin: off };
  }

  /* ---------- Planete ---------- */
  var BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  function eclLon(body, time) {
    if (body === 'Moon') return norm(A.EclipticGeoMoon(time).lon);
    if (body === 'Sun') return norm(A.SunPosition(time).elon);
    var v = A.GeoVector(A.Body[body], time, true);
    return norm(A.Ecliptic(v).elon); // pravi ekliptički datum (tropski)
  }
  function meanNode(time) {
    var T = time.tt / 36525; // Meeus, gl. 47
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000);
  }
  function trueNode(time) {
    // Pravi (oskulatorni) čvor: iz Mesečevog vektora položaja i brzine, ekliptika datuma
    var s = A.GeoMoonState(time), R = A.Rotation_EQJ_ECT(time);
    var r = A.RotateVector(R, new A.Vector(s.x, s.y, s.z, time));
    var v = A.RotateVector(R, new A.Vector(s.vx, s.vy, s.vz, time));
    var hx = r.y * v.z - r.z * v.y, hy = r.z * v.x - r.x * v.z;
    return { mean: meanNode(time), true: norm(Math.atan2(hx, -hy) * R2D) };
  }
  function lonDiff(a, b) { var d = norm(a - b); return d > 180 ? d - 360 : d; }

  /* ---------- Kuće ---------- */
  function obliquity(time) {
    var r = A.Rotation_EQD_ECT(time).rot;
    return Math.atan2(Math.abs(r[1][2]), r[1][1]) * R2D;
  }
  function raToEcl(ra, eps) { return norm(Math.atan2(sind(ra), cosd(ra) * cosd(eps)) * R2D); }
  function ascendant(ramc, eps, lat) {
    return norm(Math.atan2(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))) * R2D);
  }
  function placidusCusp(ramc, eps, lat, frac, above) {
    // frac: deo polu-luka; above=true za kuće 11/12, false za 2/3
    var ra = above ? ramc + 90 * frac : ramc + 180 - 90 * frac, lam = raToEcl(ra, eps);
    for (var i = 0; i < 60; i++) {
      var dec = Math.asin(sind(eps) * sind(lam)) * R2D;
      var x = tand(lat) * tand(dec);
      if (Math.abs(x) >= 1) return NaN;
      var ad = Math.asin(x) * R2D;
      ra = above ? ramc + frac * (90 + ad) : ramc + 180 - frac * (90 - ad);
      var nl = raToEcl(ra, eps);
      if (Math.abs(lonDiff(nl, lam)) < 1e-9) { lam = nl; break; }
      lam = nl;
    }
    return lam;
  }

  var SIGNS = ['Ovan', 'Bik', 'Blizanci', 'Rak', 'Lav', 'Devica', 'Vaga', 'Škorpija', 'Strelac', 'Jarac', 'Vodolija', 'Ribe'];

  function computeChart(opts) {
    // opts: {utcMs, lat, lon, timeKnown}
    var time = A.MakeTime(new Date(opts.utcMs));
    var res = { utcMs: opts.utcMs, planets: [], houses: null, asc: null, mc: null, houseSystem: null };
    BODIES.forEach(function (b) {
      var lon = eclLon(b, time);
      var speed = (b === 'Sun' || b === 'Moon') ? null :
        lonDiff(eclLon(b, time.AddDays(0.5)), eclLon(b, time.AddDays(-0.5)));
      res.planets.push({ key: b, lon: lon, retro: speed !== null && speed < 0, speed: speed });
    });
    var nodes = trueNode(time);
    var nodeSpeed = lonDiff(trueNode(time.AddDays(0.5)).true, trueNode(time.AddDays(-0.5)).true);
    res.planets.push({ key: 'Node', lon: nodes.true, retro: nodeSpeed < 0, speed: nodeSpeed, mean: nodes.mean });

    if (opts.timeKnown) {
      var eps = obliquity(time);
      var ramc = norm(A.SiderealTime(time) * 15 + opts.lon);
      var mc = raToEcl(ramc, eps);
      var asc = ascendant(ramc, eps, opts.lat);
      var cusps = new Array(12), system = 'Placidus';
      if (Math.abs(opts.lat) < 66) {
        var c11 = placidusCusp(ramc, eps, opts.lat, 1 / 3, true), c12 = placidusCusp(ramc, eps, opts.lat, 2 / 3, true);
        var c2 = placidusCusp(ramc, eps, opts.lat, 2 / 3, false), c3 = placidusCusp(ramc, eps, opts.lat, 1 / 3, false);
        if ([c11, c12, c2, c3].some(isNaN)) system = null;
        else cusps = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
      } else system = null;
      if (!system) {
        system = 'Whole Sign';
        var s0 = Math.floor(asc / 30) * 30;
        for (var i = 0; i < 12; i++) cusps[i] = norm(s0 + 30 * i);
      }
      res.asc = asc; res.mc = mc; res.houses = cusps; res.houseSystem = system; res.ramc = ramc; res.eps = eps;
      res.planets.forEach(function (p) { p.house = houseOf(p.lon, cusps); });
    }
    res.aspects = aspects(res);
    return res;
  }
  function houseOf(lon, cusps) {
    for (var i = 0; i < 12; i++) {
      var a = cusps[i], b = cusps[(i + 1) % 12];
      var span = norm(b - a), d = norm(lon - a);
      if (d < span) return i + 1;
    }
    return 1;
  }
  var ASPECTS = [
    { key: 'konjunkcija', angle: 0, orb: 8 }, { key: 'opozicija', angle: 180, orb: 8 },
    { key: 'trigon', angle: 120, orb: 7 }, { key: 'kvadrat', angle: 90, orb: 7 }, { key: 'sekstil', angle: 60, orb: 5 }
  ];
  function aspects(res) {
    var pts = res.planets.map(function (p) { return { key: p.key, lon: p.lon }; });
    if (res.asc !== null) { pts.push({ key: 'ASC', lon: res.asc }); pts.push({ key: 'MC', lon: res.mc }); }
    var out = [];
    for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++) {
      var a = pts[i], b = pts[j];
      if ((a.key === 'ASC' || a.key === 'MC') && (b.key === 'ASC' || b.key === 'MC')) continue;
      var sep = Math.abs(lonDiff(a.lon, b.lon));
      ASPECTS.forEach(function (as) {
        var orb = as.orb;
        if (a.key === 'Node' || b.key === 'Node' || a.key === 'ASC' || b.key === 'ASC' || a.key === 'MC' || b.key === 'MC') orb = Math.min(orb, 5);
        if (a.key === 'Sun' || b.key === 'Sun' || a.key === 'Moon' || b.key === 'Moon') orb += 1;
        var d = Math.abs(sep - as.angle);
        if (d <= orb) out.push({ a: a.key, b: b.key, type: as.key, angle: as.angle, orb: d });
      });
    }
    out.sort(function (x, y) { return x.orb - y.orb; });
    return out;
  }
  function fmt(lon) {
    var s = Math.floor(lon / 30), d = lon - s * 30, deg = Math.floor(d), min = Math.floor((d - deg) * 60 + 1e-9);
    return { sign: s, signName: SIGNS[s], deg: deg, min: min, text: deg + '°' + (min < 10 ? '0' : '') + min + '\'' };
  }
  return { localToUtc: localToUtc, tzOffsetMinutes: tzOffsetMinutes, computeChart: computeChart, fmt: fmt, norm: norm, SIGNS: SIGNS, lonDiff: lonDiff, houseOf: houseOf };
});
