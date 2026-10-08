/* ---------- 물고기 일러스트 (SVG 생성) ----------
 * 종마다 체형(body) · 등지느러미(dorsal) · 뒷지느러미(anal) · 꼬리(tail) · 입(mouth) · 무늬(pat)를 받아 그린다.
 * 머리는 왼쪽, viewBox 200×100. 광어(form:'flat')와 갈치(form:'ribbon')는 체형이 달라 따로 그린다.
 * 지느러미는 몸통 뒤에 그리고 밑변을 몸통 안쪽까지 넣어서 몸에 붙어 보이게 한다. */
(function (root) {
  const DEF = { x0: 14, xT: 150, h: 24, hb: .9, hump: .38, sn: .35, ped: 6, head: .27, eye: .2, mo: 2 };
  const f1 = n => +n.toFixed(1);
  const P = p => p.map(f1).join(' ');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DARK = '#1B2430';

  function cubic(p0, p1, p2, p3, n = 32) {
    const o = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
              u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return o;
  }
  // x → y 조회 (윤곽선 위의 점들을 선형 보간)
  function lookup(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0]);
    return x => {
      if (x <= pts[0][0]) return pts[0][1];
      for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
        const [xa, ya] = pts[i - 1], [xb, yb] = pts[i];
        return xb === xa ? yb : ya + (yb - ya) * (x - xa) / (xb - xa);
      }
      return pts[pts.length - 1][1];
    };
  }
  // 점들을 지나는 부드러운 곡선 (Catmull-Rom → 베지어)
  function smooth(pts) {
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
    }
    return d;
  }
  // 종마다 고정된 의사난수 (무늬 위치가 매번 같게)
  const rnd = (id, i, k) => { const x = Math.sin((id * 31 + i) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

  /* ---------- 몸통 ---------- */
  function bodyGeo(b) {
    const { x0, xT, h, hb, hump, sn, ped, mo } = b, yN = 50 + mo, H2 = h * hb;
    const mx = x0 + (xT - x0) * hump, bx = x0 + (xT - x0) * Math.min(.6, hump + .06);
    const N = [x0, yN];
    const T1 = [x0 + (mx - x0) * (.32 - .3 * sn), yN - h * (.22 + .95 * sn)], T2 = [mx - (mx - x0) * (.55 - .25 * sn), 50 - h], M = [mx, 50 - h];
    const T3 = [mx + (xT - mx) * .45, 50 - h], T4 = [xT - (xT - mx) * .32, 50 - ped], PT = [xT, 50 - ped], PB = [xT, 50 + ped];
    const B1 = [xT - (xT - bx) * .32, 50 + ped], B2 = [bx + (xT - bx) * .45, 50 + H2], B = [bx, 50 + H2];
    const B3 = [bx - (bx - x0) * .5, 50 + H2], B4 = [x0 + (bx - x0) * .1, yN + H2 * (.18 + .5 * sn)];
    const d = `M${P(N)} C${P(T1)} ${P(T2)} ${P(M)} C${P(T3)} ${P(T4)} ${P(PT)} L${P(PB)} C${P(B1)} ${P(B2)} ${P(B)} C${P(B3)} ${P(B4)} ${P(N)}Z`;
    return {
      d, yN,
      top: lookup([...cubic(N, T1, T2, M), ...cubic(M, T3, T4, PT)]),
      bot: lookup([...cubic(PB, B1, B2, B), ...cubic(B, B3, B4, N)]),
    };
  }

  /* ---------- 꼬리 ---------- */
  function tailGeo(t, b) {
    const { xT, ped } = b, L = t.len, th = t.h, f = t.fork || 0, x = xT - 6, e = xT + L;
    let d, rays = [];
    if (t.t === 'round') {
      d = `M${x} ${50 - ped} C${f1(xT + L * .5)} ${f1(50 - th * 1.05)} ${e} ${f1(50 - th * .8)} ${e} 50 C${e} ${f1(50 + th * .8)} ${f1(xT + L * .5)} ${f1(50 + th * 1.05)} ${x} ${50 + ped}Z`;
      for (let k = -2; k <= 2; k++) rays.push([xT + 1, 50 + k * ped * .25, e - 3 - Math.abs(k) * 2, 50 + k * th * .36]);
    } else if (t.t === 'trunc') {
      d = `M${x} ${50 - ped} C${f1(xT + L * .45)} ${f1(50 - th * .85)} ${e - 3} ${50 - th} ${e} ${50 - th} C${f1(e - 2.5)} ${f1(50 - th * .35)} ${f1(e - 2.5)} ${f1(50 + th * .35)} ${e} ${50 + th} C${e - 3} ${50 + th} ${f1(xT + L * .45)} ${f1(50 + th * .85)} ${x} ${50 + ped}Z`;
      for (let k = -2; k <= 2; k++) rays.push([xT + 1, 50 + k * ped * .25, e - 3, 50 + k * th * .42]);
    } else {
      d = `M${x} ${f1(50 - ped + .5)} C${f1(xT + L * .35)} ${f1(50 - ped - th * .12)} ${f1(xT + L * .72)} ${f1(50 - th * .78)} ${e} ${50 - th} C${f1(e - f * .35)} ${f1(50 - th * .6)} ${f1(e - f)} ${f1(50 - th * .25)} ${f1(e - f)} 50 C${f1(e - f)} ${f1(50 + th * .25)} ${f1(e - f * .35)} ${f1(50 + th * .6)} ${e} ${50 + th} C${f1(xT + L * .72)} ${f1(50 + th * .78)} ${f1(xT + L * .35)} ${f1(50 + ped + th * .12)} ${x} ${f1(50 + ped - .5)}Z`;
      for (let k = -2; k <= 2; k++) rays.push([xT + 1, 50 + k * ped * .25, e - 3 - f * (1 - Math.abs(k) / 2) * .9, 50 + k * th * .4]);
    }
    return { d, rays };
  }

  /* ---------- 지느러미 ---------- */
  // 등지느러미: 가시(spiny) + 연조(soft) / 두 개로 갈라진(double) / 연조만(soft) / 낮고 긴(long)
  function dorsalGeo(dz, b, g) {
    const { x0, xT } = b, top = g.top, X = u => x0 + (xT - x0) * u, out = [], spines = [];
    const base = x => [x, top(x) + 3];
    const spiny = (xa, xm, hs, n, close) => {
      const tips = [];
      for (let i = 0; i < n; i++) {
        const u = (i + .5) / n, x = xa + (xm - xa) * u;
        const env = u < .3 ? .6 + u / .3 * .4 : 1 - (u - .3) * .45;
        tips.push([x, top(x) - hs * env]);
      }
      let d = `M${P(base(xa))} L${P(tips[0])}`;
      for (let i = 1; i < tips.length; i++) {
        const xm2 = (tips[i - 1][0] + tips[i][0]) / 2, dip = (top(tips[i - 1][0]) - tips[i - 1][1]) * .5;
        d += ` Q${P([xm2, top(xm2) - dip * .55])} ${P(tips[i])}`;
      }
      tips.forEach(t => spines.push([t[0], t[1], t[0] + 1.2, top(t[0]) + 1]));
      return { d, tips, close: close ? ` L${P(base(xm))} L${f1(xm)} 53 L${f1(xa)} 53Z` : '' };
    };
    const softPts = (xa, xb, hs, shape) => {
      const pr = shape === 'long' ? [[.1, 1], [.4, .62], [.75, .5], [.97, .3]]
        : shape === 'rear' ? [[.3, 1], [.7, .7], [.98, .3]]
        : [[.22, 1], [.55, .72], [.88, .38]];
      return [base(xa), ...pr.map(([u, k]) => { const x = xa + (xb - xa) * u; return [x, top(x) - hs * k]; }), base(xb)];
    };
    const closeAt = (xa, xb) => ` L${f1(xb)} 53 L${f1(xa)} 53Z`;

    if (dz.t === 'spiny') {
      const xa = X(dz.a), xm = X(dz.m), xb = X(dz.b), s = spiny(xa, xm, dz.hs, dz.n, false);
      const last = s.tips[s.tips.length - 1];
      const soft = [last, [xm + (xb - xm) * .3, top(xm + (xb - xm) * .3) - dz.hsoft], [xm + (xb - xm) * .75, top(xm + (xb - xm) * .75) - dz.hsoft * .75], base(xb)];
      out.push(s.d + smooth(soft) + closeAt(xa, xb));
    } else if (dz.t === 'double') {
      const xa = X(dz.a), xm = X(dz.m), xg = X(dz.g), xb = X(dz.b), s = spiny(xa, xm, dz.hs, dz.n, true);
      out.push(s.d + s.close);
      const p = softPts(xg, xb, dz.hsoft, 'tri');
      out.push(`M${P(p[0])}` + smooth(p) + closeAt(xg, xb));
    } else if (dz.t === 'long') {
      const xa = X(dz.a), xb = X(dz.b), hs = dz.hs;
      const p = [base(xa), ...[[.08, .8], [.3, 1], [.46, .7], [.52, .55], [.62, .95], [.85, .85], [.97, .4]].map(([u, k]) => { const x = xa + (xb - xa) * u; return [x, top(x) - hs * k]; }), base(xb)];
      out.push(`M${P(p[0])}` + smooth(p) + closeAt(xa, xb));
    } else {
      const xa = X(dz.a), xb = X(dz.b), p = softPts(xa, xb, dz.hs, dz.shape);
      out.push(`M${P(p[0])}` + smooth(p) + closeAt(xa, xb));
    }
    if (dz.adipose) { // 기름지느러미 (송어류)
      const x = X(.86), p = [base(x - 4), [x - 1, top(x - 1) - 4], [x + 4, top(x + 4) - 3], base(x + 6)];
      out.push(`M${P(p[0])}` + smooth(p) + closeAt(x - 4, x + 6));
    }
    if (dz.finlets) { // 토막지느러미 (고등어)
      const xs = X(dz.b) + 4, step = (xT - 4 - xs) / dz.finlets;
      for (let i = 0; i < dz.finlets; i++) { const x = xs + step * i; out.push(`M${f1(x)} ${f1(top(x) + 2)} L${f1(x + step * .9)} ${f1(top(x + step) - 3)} L${f1(x + step * .9)} ${f1(top(x + step) + 2)}Z`); }
    }
    return { paths: out, spines };
  }
  function analGeo(az, b, g) {
    const { x0, xT } = b, bot = g.bot, X = u => x0 + (xT - x0) * u, out = [];
    const xa = X(az.a), xb = X(az.b), h = az.h;
    const p = [[xa, bot(xa) - 3], ...[[.22, 1], [.55, .75], [.9, .35]].map(([u, k]) => { const x = xa + (xb - xa) * u; return [x, bot(x) + h * k]; }), [xb, bot(xb) - 3]];
    out.push(`M${P(p[0])}` + smooth(p) + ` L${f1(xb)} 47 L${f1(xa)} 47Z`);
    if (az.finlets) {
      const xs = xb + 4, step = (xT - 4 - xs) / az.finlets;
      for (let i = 0; i < az.finlets; i++) { const x = xs + step * i; out.push(`M${f1(x)} ${f1(bot(x) - 2)} L${f1(x + step * .9)} ${f1(bot(x + step) + 3)} L${f1(x + step * .9)} ${f1(bot(x + step) - 2)}Z`); }
    }
    // 배지느러미
    const px = X(az.pelvic ?? .32), ph = Math.max(4, h * .9);
    const pp = [[px - 3, bot(px - 3) - 2], [px + 3, bot(px + 3) + ph], [px + 10, bot(px + 10) + ph * .8], [px + 7, bot(px + 7) - 2]];
    out.push(`M${P(pp[0])}` + smooth(pp) + 'Z');
    return out;
  }

  /* ---------- 무늬 (몸통 안으로 잘라서 그림) ---------- */
  function patterns(s, b, g, gx) {
    const list = [].concat(s.pat || []), { x0, xT } = b, top = g.top, bot = g.bot, X = u => x0 + (xT - x0) * u;
    const mid = (x, k) => top(x) + (bot(x) - top(x)) * k;
    let o = '';
    list.forEach(p => {
      if (p.t === 'bands') for (let i = 0; i < p.n; i++) {
        const x = X(p.a) + (X(p.b) - X(p.a)) * (p.n > 1 ? i / (p.n - 1) : 0), w = p.w / 2;
        o += `<path d="M${f1(x - w)} 0 C${f1(x - w + 3)} 35 ${f1(x - w - 3)} 65 ${f1(x - w)} 100 L${f1(x + w)} 100 C${f1(x + w - 3)} 65 ${f1(x + w + 3)} 35 ${f1(x + w)} 0Z" fill="${p.col}" opacity="${p.o}"/>`;
      }
      if (p.t === 'spots') for (let i = 0; i < p.n; i++) {
        const x = (p.zone === 'all' ? x0 + 8 : gx) + rnd(s.id, i, 0) * (xT - 4 - (p.zone === 'all' ? x0 + 8 : gx));
        const y = top(x) + 2 + rnd(s.id, i, 1) * ((p.zone === 'top' ? mid(x, .5) : bot(x) - 2) - top(x) - 2);
        o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(p.r * (.7 + rnd(s.id, i, 2) * .6))}" fill="${p.col}" opacity="${p.o}"/>`;
      }
      if (p.t === 'mottle') for (let i = 0; i < p.n; i++) {
        const x = gx - 4 + rnd(s.id, i, 0) * (xT - gx), y = mid(x, .1 + rnd(s.id, i, 1) * .65);
        o += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 + rnd(s.id, i, 2) * 6)}" ry="${f1(3 + rnd(s.id, i, 3) * 4)}" fill="${p.col}" opacity="${p.o}"/>`;
      }
      if (p.t === 'wave') for (let i = 0; i < p.n; i++) {
        const x = gx + 4 + i * (xT - gx - 10) / (p.n - 1), y0 = top(x) - 1, y1 = mid(x, .45), hh = (y1 - y0) / 3;
        o += `<path d="M${f1(x)} ${f1(y0)} q 3 ${f1(hh * .5)} -1 ${f1(hh)} q -4 ${f1(hh * .5)} 1 ${f1(hh)} q 4 ${f1(hh * .5)} -1 ${f1(hh)}" stroke="${p.col}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="${p.o}"/>`;
      }
      if (p.t === 'stripe') {
        const pts = []; for (let x = x0 + 4; x <= xT + 2; x += 4) pts.push([x, mid(x, p.yf)]);
        if (p.blotch) pts.forEach(([x, y], i) => { if (i % 3 === 0 && x > gx) o += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(p.w * .9)}" ry="${f1(p.w * .75)}" fill="${p.col}" opacity="${p.o}"/>`; });
        else o += `<path d="M${pts.map(P).join(' L')}" stroke="${p.col}" stroke-width="${p.w}" fill="none" stroke-linecap="round" opacity="${p.o}"/>`;
      }
      if (p.t === 'scutes') { // 전갱이 모비늘
        const pts = []; for (let x = X(.45); x <= xT + 1; x += 3) pts.push([x, mid(x, .42)]);
        o += `<path d="M${pts.map(P).join(' L')}" stroke="${p.col}" stroke-width="2.6" stroke-dasharray="2 1.2" fill="none" opacity="${p.o}"/>`;
      }
      if (p.t === 'scale') for (let x = gx + 3; x < xT; x += 7) for (let y = top(x) + 1, r = 0; y < bot(x) - 3; y += 6, r++) {
        o += `<path d="M${f1(x + (r % 2) * 3.5)} ${f1(y)} q 3.6 3 0 6" stroke="${p.col}" stroke-width=".8" fill="none" opacity="${p.o}"/>`;
      }
    });
    return o;
  }

  /* ---------- 일반 체형 ---------- */
  function standard(s, opt) {
    const id = 'f' + Math.random().toString(36).slice(2, 8), sil = !!opt.sil;
    const b = { ...DEF, ...s.body }, g = bodyGeo(b), [c1, c2, cf] = s.c;
    const tail = tailGeo(s.tail || { t: 'fork', len: 36, h: 24, fork: 14 }, b);
    const dors = dorsalGeo(s.dorsal || { t: 'soft', a: .35, b: .7, hs: 9 }, b, g);
    const anal = analGeo(s.anal || { a: .62, b: .8, h: 7 }, b, g);
    const { x0, xT, h } = b, gx = x0 + (xT - x0) * b.head;
    const r = clamp(h * b.eye, 2.2, 8), ex = x0 + (gx - x0) * (b.ex || .42);
    const ey = clamp(50 - h * .28 + b.mo * .3, g.top(ex) + r + 1.4, 50);
    const pect = (() => { const sz = clamp(h * .7, 7, 18), x = gx + 3, y = 50 + h * .2; return `M${f1(x)} ${f1(y)} Q${f1(x + sz * .5)} ${f1(y - sz * .32)} ${f1(x + sz)} ${f1(y + sz * .12)} Q${f1(x + sz * .5)} ${f1(y + sz * .4)} ${f1(x)} ${f1(y)}Z`; })();

    if (sil) {
      const st = 'fill:var(--sil)';
      return `<svg viewBox="0 0 200 100" aria-hidden="true"><path d="${tail.d}" style="${st}"/>${dors.paths.map(d => `<path d="${d}" style="${st}"/>`).join('')}${anal.map(d => `<path d="${d}" style="${st}"/>`).join('')}<path d="${g.d}" style="${st}"/><text x="${f1((x0 + xT) / 2)}" y="57" text-anchor="middle" style="fill:var(--paper);font:700 17px var(--f-mono)">?</text></svg>`;
    }

    // 입
    const yN = g.yN; let mouth = '';
    const line = (d, w = 1.2) => `<path d="${d}" stroke="${DARK}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity=".72"/>`;
    if (s.mouth === 'big') mouth = line(`M${x0 + .5} ${f1(yN - .5)} Q${f1((x0 + ex) / 2)} ${f1(yN + 2.6)} ${f1(ex + r * .3)} ${f1(yN + 1.2)}`, 1.3);
    else if (s.mouth === 'wavy') mouth = line(`M${x0 + .5} ${f1(yN - 1)} q 3.5 2.6 7 .8 q 3.5 -1.6 7 1.4`, 1.3);
    else if (s.mouth === 'beak') mouth = `<path d="M${x0 + 3} ${f1(yN + .2)} L4 ${f1(yN + 2.1)} L${x0 + 3} ${f1(yN + 2.8)}Z" fill="${cf}"/><path d="M4 ${f1(yN + 2.1)} L10 ${f1(yN + 1.4)} L10 ${f1(yN + 2.7)}Z" fill="#E2553F"/>` + line(`M${x0} ${f1(yN + .3)} l 4 1`, 1);
    else mouth = line(`M${x0 + .6} ${f1(yN + .3)} q 2.6 1.9 5.6 .3`);
    if (s.mouth === 'barbel') mouth += `<path d="M${x0 + 3} ${f1(yN + 1.6)} q -1.5 4 1.5 6.5 M${x0 + 6} ${f1(yN + 1.8)} q -.5 3 2 4.5" stroke="${cf}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;

    // 가슴지느러미 뒤 옆줄
    const lat = []; for (let x = gx + 4; x <= xT; x += 5) lat.push([x, g.top(x) + (g.bot(x) - g.top(x)) * .32]);
    const extra = [].concat(s.extra || []);
    let ext = '';
    if (extra.includes('opercle')) ext += `<circle cx="${f1(gx - 2.5)}" cy="${f1(ey + r * .9)}" r="2.3" fill="#3E7FC1"/><circle cx="${f1(gx - 2.5)}" cy="${f1(ey + r * .9)}" r="1" fill="#9FD0F2"/>`;
    if (extra.includes('spines')) ext += `<path d="M${f1(gx - 2)} ${f1(ey - r)} l 3 -3 M${f1(gx)} ${f1(ey + 2)} l 4 -1.5 M${f1(gx - 1)} ${f1(ey + 6)} l 4 .5" stroke="${cf}" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>`;
    let tailExtra = '';
    if (extra.includes('tailspots')) for (let i = 0; i < 9; i++) tailExtra += `<circle cx="${f1(xT + 4 + rnd(s.id, i, 5) * (s.tail.len - 10))}" cy="${f1(50 + (rnd(s.id, i, 6) - .5) * s.tail.h * 1.2)}" r=".8" fill="#2E352B" opacity=".7"/>`;

    return `<svg viewBox="0 0 200 100" role="img" aria-label="${s.name}">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".58" stop-color="${c2}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="${id}c"><path d="${g.d}"/></clipPath><clipPath id="${id}t"><path d="${tail.d}"/></clipPath></defs>
<g fill="${cf}"><path d="${tail.d}" opacity=".95"/>${dors.paths.map(d => `<path d="${d}" opacity=".92"/>`).join('')}${anal.map(d => `<path d="${d}" opacity=".88"/>`).join('')}</g>
<g stroke="${DARK}" stroke-width=".7" opacity=".22" clip-path="url(#${id}t)">${tail.rays.map(([a, b2, c, d]) => `<path d="M${f1(a)} ${f1(b2)} L${f1(c)} ${f1(d)}"/>`).join('')}</g><g clip-path="url(#${id}t)">${tailExtra}</g>
<g stroke="${DARK}" stroke-width=".8" opacity=".3">${dors.spines.map(([a, b2, c, d]) => `<path d="M${f1(a)} ${f1(b2)} L${f1(c)} ${f1(d)}"/>`).join('')}</g>
<path d="${g.d}" fill="url(#${id})"/>
<g clip-path="url(#${id}c)">${patterns(s, b, g, gx)}<ellipse cx="${f1((x0 + xT) * .48)}" cy="${f1(50 - h * .55)}" rx="${f1((xT - x0) * .3)}" ry="${f1(h * .2)}" fill="#fff" opacity=".16"/>
<path d="M${lat.map(P).join(' L')}" stroke="${c1}" stroke-width=".8" fill="none" opacity=".35"/></g>
<path d="${g.d}" fill="none" stroke="${cf}" stroke-width=".9" opacity=".35"/>
<path d="M${f1(gx)} ${f1(g.top(gx) + 3)} Q${f1(gx + h * .22)} ${f1(50 + b.mo * .5)} ${f1(gx - 1)} ${f1(g.bot(gx) - 3)}" stroke="${cf}" stroke-width="1.2" fill="none" opacity=".4"/>
${ext}<path d="${pect}" fill="${cf}" opacity=".62"/>
${h >= 14 ? `<ellipse cx="${f1(ex + r * .7)}" cy="${f1(ey + r * 1.5)}" rx="${f1(r * .72)}" ry="${f1(r * .4)}" fill="#FF9DB0" opacity=".45"/>` : ''}
<circle cx="${f1(ex)}" cy="${f1(ey)}" r="${f1(r)}" fill="#fff"/><circle cx="${f1(ex - r * .08)}" cy="${f1(ey + r * .05)}" r="${f1(r * .66)}" fill="${DARK}"/><circle cx="${f1(ex + r * .18)}" cy="${f1(ey - r * .28)}" r="${f1(r * .24)}" fill="#fff"/>
${mouth}
</svg>`;
  }

  /* ---------- 광어: 위에서 본 납작한 몸, 눈 두 개가 한쪽에 ---------- */
  function flat(s, opt) {
    const id = 'f' + Math.random().toString(36).slice(2, 8), [c1, c2, cf] = s.c;
    const body = 'M24 54 C22 34 56 22 98 22 C138 22 158 36 160 50 C158 64 138 78 98 78 C56 78 26 72 24 54Z';
    const fringe = 'M18 52 C18 28 56 13 98 13 C142 13 166 31 167 50 C166 69 142 87 98 87 C56 87 20 76 18 52Z';
    const tail = 'M156 44 C170 30 192 33 194 50 C192 67 170 70 156 56Z';
    if (opt.sil) { const st = 'fill:var(--sil)'; return `<svg viewBox="0 0 200 100" aria-hidden="true"><path d="${tail}" style="${st}"/><path d="${fringe}" style="${st}"/><text x="95" y="57" text-anchor="middle" style="fill:var(--paper);font:700 17px var(--f-mono)">?</text></svg>`; }
    let rays = '';
    for (let i = 0; i < 36; i++) { const a = Math.PI * (.62 + i / 36 * 1.76), cx = 94, cy = 50; rays += `<path d="M${f1(cx + Math.cos(a) * 64)} ${f1(cy + Math.sin(a) * 27)} L${f1(cx + Math.cos(a) * 75)} ${f1(cy + Math.sin(a) * 37)}"/>`; }
    let spots = '';
    for (let i = 0; i < 22; i++) { const x = 46 + rnd(s.id, i, 0) * 106, y = 30 + rnd(s.id, i, 1) * 40; spots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.4 + rnd(s.id, i, 2) * 2.2)}" fill="${cf}" opacity=".4"/>`; }
    return `<svg viewBox="0 0 200 100" role="img" aria-label="${s.name}">
<defs><radialGradient id="${id}" cx=".45" cy=".42" r=".7"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient><clipPath id="${id}c"><path d="${body}"/></clipPath></defs>
<path d="${tail}" fill="${cf}" opacity=".92"/><path d="M160 50 L190 41 M160 50 L192 50 M160 50 L190 59" stroke="${DARK}" stroke-width=".7" opacity=".2"/>
<path d="${fringe}" fill="${cf}" opacity=".9"/><g stroke="${DARK}" stroke-width=".6" opacity=".2">${rays}</g>
<path d="${body}" fill="url(#${id})"/><g clip-path="url(#${id}c)">${spots}</g>
<path d="${body}" fill="none" stroke="${cf}" stroke-width=".9" opacity=".4"/>
<path d="M58 47 Q74 34 92 48 L156 50" stroke="${cf}" stroke-width=".9" fill="none" opacity=".45"/>
<path d="M50 34 Q58 50 50 68" stroke="${cf}" stroke-width="1.2" fill="none" opacity=".4"/>
<path d="M60 56 Q70 52 78 58 Q70 62 60 56Z" fill="${cf}" opacity=".55"/>
<circle cx="38" cy="40" r="4.4" fill="#fff"/><circle cx="37.8" cy="40.3" r="2.9" fill="${DARK}"/><circle cx="39" cy="39" r="1" fill="#fff"/>
<circle cx="45" cy="49" r="4.4" fill="#fff"/><circle cx="44.8" cy="49.3" r="2.9" fill="${DARK}"/><circle cx="46" cy="48" r="1" fill="#fff"/>
<ellipse cx="44" cy="59" rx="3.4" ry="1.9" fill="#FF9DB0" opacity=".4"/>
<path d="M25 56 q 3 3.2 7.5 1.6" stroke="${DARK}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
</svg>`;
  }

  /* ---------- 갈치: 리본처럼 긴 몸, 꼬리지느러미 없음 ---------- */
  function ribbon(s, opt) {
    const id = 'f' + Math.random().toString(36).slice(2, 8), [c1, c2, cf] = s.c;
    const body = 'M10 51 C12 45.5 20 42.3 34 41.6 L150 43.4 C170 45 186 49 198 50.4 C186 51.6 170 54.4 150 56 L34 58.2 C21 58 13 55.5 10 51Z';
    const fin = 'M34 42.4 C40 35.6 140 35.8 193 49.8 L150 44.4 L34 43.6Z';
    if (opt.sil) { const st = 'fill:var(--sil)'; return `<svg viewBox="0 0 200 100" aria-hidden="true"><path d="${fin}" style="${st}"/><path d="${body}" style="${st}"/><text x="90" y="56" text-anchor="middle" style="fill:var(--paper);font:700 17px var(--f-mono)">?</text></svg>`; }
    let rays = ''; for (let x = 40; x < 186; x += 5) rays += `<path d="M${x} ${f1(42.4 + (x - 34) * .012)} l 1.5 ${f1(-5.4 + (x - 34) * .033)}"/>`;
    return `<svg viewBox="0 0 200 100" role="img" aria-label="${s.name}">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
<path d="${fin}" fill="${cf}" opacity=".8"/><g stroke="#7E929B" stroke-width=".6" opacity=".8">${rays}</g>
<path d="${body}" fill="url(#${id})"/><path d="M36 47 L170 49.6" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>
<path d="${body}" fill="none" stroke="${cf}" stroke-width=".8" opacity=".5"/>
<path d="M38 43 Q41.5 50 38 57.4" stroke="${cf}" stroke-width="1.1" fill="none" opacity=".55"/>
<path d="M10.5 51 L27 49.6" stroke="${DARK}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/><path d="M15 50.6 l1 1.8 l1 -2 M19.5 50.2 l1 1.8 l1 -2" fill="#fff" stroke="#fff" stroke-width=".5"/>
<circle cx="28" cy="46.6" r="3.7" fill="#fff"/><circle cx="27.8" cy="46.8" r="2.5" fill="${DARK}"/><circle cx="28.9" cy="45.7" r=".9" fill="#fff"/>
</svg>`;
  }

  root.fishSVG = function fishSVG(s, opt = {}) {
    if (s.form === 'flat') return flat(s, opt);
    if (s.form === 'ribbon') return ribbon(s, opt);
    return standard(s, opt);
  };
})(window);
