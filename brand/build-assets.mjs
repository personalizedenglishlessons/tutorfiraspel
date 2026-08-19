/* ============================================================
   PEL visual identity: asset builder (pure Node, no deps)
   The identity IS the three letters: P E L

   Wordmark — "PEL / The Chamfered Baseline System"
   The three letters are built from the same construction
   grammar: uniform stems and bars (6u) with 45° chamfered
   terminals. The E's shortened middle bar and the L's
   chamfered foot (aligned with the E's bottom bar) give the
   lockup one shared optical shelf and one diagonal rhythm.

   Favicon — a square, condensed derivation of the SAME
   letterforms (same stems, same chamfers), on the app's
   background colour, legible down to 16px.
   ============================================================ */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)));

const C = {
  bg: '#0E0E10',
  gold: '#C8A96A',
  dark: '#17171B',
  white: '#F7F4EF',
  bronze: '#A88345',
};

/* ------------------------------------------------------------
   Geometry
   ------------------------------------------------------------ */

/* Wordmark design space: 0 0 100 30 (uniform stroke = 6) */
const WORDMARK = {
  viewBox: '0 0 100 30',
  polys: [
    /* P */
    [[4,0],[10,0],[10,30],[4,30]],     /* stem            */
    [[10,0],[24,0],[30,6],[10,6]],     /* bowl top bar    */
    [[30,6],[30,12],[24,18],[24,6]],   /* bowl right side */
    [[10,12],[24,12],[24,18],[10,18]], /* bowl bottom bar */
    /* E */
    [[34,0],[40,0],[40,30],[34,30]],   /* stem            */
    [[40,0],[58,0],[64,6],[40,6]],     /* top bar         */
    [[40,12],[51,12],[57,18],[40,18]], /* middle bar (short) */
    [[40,24],[58,24],[64,30],[40,30]], /* bottom bar      */
    /* L */
    [[68,0],[74,0],[74,27],[68,27]],   /* stem            */
    [[68,24],[92,24],[98,30],[68,30]], /* foot            */
  ],
};

/* Favicon design space: 0 0 40 40 (uniform stroke = 4) */
const FAVICON = {
  viewBox: '0 0 40 40',
  bg: true,
  polys: [
    /* P */
    [[2,4],[6,4],[6,36],[2,36]],
    [[6,4],[11,4],[15,8],[6,8]],
    [[15,8],[15,12],[11,16],[11,8]],
    [[6,12],[11,12],[11,16],[6,16]],
    /* E */
    [[17,4],[21,4],[21,36],[17,36]],
    [[21,4],[25,4],[29,8],[21,8]],
    [[21,18],[24,18],[28,22],[21,22]],
    [[21,32],[25,32],[29,36],[21,36]],
    /* L */
    [[31,4],[35,4],[35,32],[31,32]],
    [[31,32],[34,32],[38,36],[31,36]],
  ],
};

/* ------------------------------------------------------------
   SVG generation
   ------------------------------------------------------------ */

function pathD(polys) {
  return polys.map(p => 'M' + p.map(pt => pt.join(' ')).join('L') + 'Z').join('');
}

function wordmarkSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK.viewBox}" role="img" aria-label="PEL">
<path d="${pathD(WORDMARK.polys)}" fill="${color}"/>
</svg>
`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FAVICON.viewBox}" role="img" aria-label="PEL">
<rect x="0" y="0" width="40" height="40" fill="${C.bg}"/>
<path d="${pathD(FAVICON.polys)}" fill="${C.gold}"/>
</svg>
`;
}

writeFileSync(join(OUT, 'pel-wordmark.svg'), wordmarkSvg(C.gold));
writeFileSync(join(OUT, 'pel-wordmark-dark.svg'), wordmarkSvg(C.dark));
writeFileSync(join(OUT, 'pel-wordmark-white.svg'), wordmarkSvg(C.white));
writeFileSync(join(OUT, 'pel-favicon.svg'), faviconSvg());
console.log('wrote pel-wordmark.svg, pel-wordmark-dark.svg, pel-wordmark-white.svg, pel-favicon.svg');

/* ------------------------------------------------------------
   PNG rendering (supersampled polygon fill)
   ------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function pngEncode(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y*(stride+1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y*stride, stride).copy(raw, y*(stride+1)+1);
  }
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function inPoly(x, y, poly) {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

/* design: [dx0, dy0, dx1, dy1] box the polys live in (maps 1:1 onto canvas) */
function renderPolys(width, height, design, polys, fg, bg, SS = 4) {
  const [dx0, dy0, dx1, dy1] = design;
  const sx = width / (dx1 - dx0);
  const sy = height / (dy1 - dy0);
  const fgR = hexRgb(fg), bgR = bg ? hexRgb(bg) : [0, 0, 0];
  const covArr = new Float32Array(width * height);
  for (const poly of polys) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [px_, py_] of poly) {
      if (px_ < minX) minX = px_; if (px_ > maxX) maxX = px_;
      if (py_ < minY) minY = py_; if (py_ > maxY) maxY = py_;
    }
    const x0 = Math.max(0, Math.floor((minX - dx0) * sx));
    const x1 = Math.min(width - 1, Math.ceil((maxX - dx0) * sx));
    const y0 = Math.max(0, Math.floor((minY - dy0) * sy));
    const y1 = Math.min(height - 1, Math.ceil((maxY - dy0) * sy));
    for (let py = y0; py <= y1; py++) {
      for (let pxx = x0; pxx <= x1; pxx++) {
        let hit = 0;
        for (let syi = 0; syi < SS; syi++) {
          const uy = (py + (syi + 0.5) / SS) / sy + dy0;
          for (let sxi = 0; sxi < SS; sxi++) {
            const ux = (pxx + (sxi + 0.5) / SS) / sx + dx0;
            if (inPoly(ux, uy, poly)) hit++;
          }
        }
        if (hit) {
          const idx = py * width + pxx;
          const cov = hit / (SS * SS);
          if (cov > covArr[idx]) covArr[idx] = cov;
        }
      }
    }
  }
  const out = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const cov = covArr[i];
    const o = i * 4;
    if (cov <= 0) {
      out[o] = bgR[0]; out[o+1] = bgR[1]; out[o+2] = bgR[2]; out[o+3] = 255;
    } else {
      out[o] = Math.round(fgR[0]*cov + bgR[0]*(1-cov));
      out[o+1] = Math.round(fgR[1]*cov + bgR[1]*(1-cov));
      out[o+2] = Math.round(fgR[2]*cov + bgR[2]*(1-cov));
      out[o+3] = 255;
    }
  }
  return out;
}

function emitFavicon(name, size) {
  const px = renderPolys(size, size, [0, 0, 40, 40], FAVICON.polys, C.gold, C.bg);
  writeFileSync(join(OUT, name), pngEncode(size, size, px));
  console.log(`wrote ${name} (${size}x${size})`);
}

emitFavicon('favicon-16.png', 16);
emitFavicon('favicon-32.png', 32);
emitFavicon('favicon-48.png', 48);
emitFavicon('apple-touch-icon.png', 180);
emitFavicon('icon-192.png', 192);
emitFavicon('icon-512.png', 512);

/* ------------------------------------------------------------
   OG image (1200x630): dark surface, gold wordmark, thin frame
   ------------------------------------------------------------ */
{
  const W = 1200, H = 630;
  const frameRgb = hexRgb(C.gold);
  const inset = 64, t = 3;
  const frame = [
    [[inset, inset], [W - inset, inset], [W - inset, inset + t], [inset, inset + t]],
    [[inset, H - inset - t], [W - inset, H - inset - t], [W - inset, H - inset], [inset, H - inset]],
    [[inset, inset], [inset + t, inset], [inset + t, H - inset], [inset, H - inset]],
    [[W - inset - t, inset], [W - inset, inset], [W - inset, H - inset], [W - inset - t, H - inset]],
  ];
  const scale = 8.2;
  const mw = 92 * scale, mh = 30 * scale;
  const mx = (W - mw) / 2, my = (H - mh) / 2;
  const mark = WORDMARK.polys.map(p => p.map(([x, y]) => [x * scale + mx, y * scale + my]));
  const px = renderPolys(W, H, [0, 0, W, H], [...frame, ...mark], C.gold, C.bg, 3);
  writeFileSync(join(OUT, 'og-image.png'), pngEncode(W, H, px));
  console.log('wrote og-image.png (1200x630)');
}

/* ------------------------------------------------------------
   Web manifest
   ------------------------------------------------------------ */
const manifest = {
  name: 'PEL · Personalized English Lessons',
  short_name: 'PEL',
  description: 'دروس انجليزي مخصصة. Personalized American English lessons, explained in Saudi Arabian Arabic.',
  start_url: '../index.html',
  scope: '../',
  display: 'standalone',
  background_color: C.bg,
  theme_color: C.bg,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
};
writeFileSync(join(OUT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
console.log('wrote manifest.webmanifest');
console.log('\nAll brand assets generated in brand/');