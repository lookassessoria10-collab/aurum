/**
 * Gera os assets da marca a partir das peças oficiais em /brand-source.
 *
 * Nada aqui redesenha a marca: o logotipo, o símbolo e o wordmark são recortados
 * pixel a pixel da lâmina "Conceito da marca" e da peça "Outras aplicações",
 * e só o fundo escuro é removido (chave por luminância).
 *
 * Quando a AURUM enviar os arquivos vetoriais originais (SVG/AI/PDF), substitua
 * os PNGs em /public/aurum/brand e não rode mais a etapa de recorte.
 *
 * Uso: node scripts/brand-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = (f) => path.join(root, "brand-source", f);
const out = (...p) => path.join(root, ...p);

const INK = "#0A0A0A";
const ORANGE = "#F8781F";

/** Remove o fundo escuro texturizado preservando branco e laranja. */
async function keyed(file, crop, { bg = 27, lo = 50, hi = 150 } = {}) {
  const { data, info } = await sharp(file)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const a = Math.min(1, Math.max(0, (max - lo) / (hi - lo)));
    if (a > 0) {
      for (let k = 0; k < 3; k++) {
        data[i + k] = Math.max(0, Math.min(255, Math.round((data[i + k] - bg * (1 - a)) / a)));
      }
    }
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toBuffer();
}

async function brand() {
  await mkdir(out("public/aurum/brand"), { recursive: true });
  const concept = src("conceito-da-marca.webp");
  const others = src("outras-aplicacoes.webp");
  const pieces = {
    // Assinatura principal (vertical): símbolo + AURUM + "Ritmo que se constrói."
    "aurum-lockup.png": [concept, { left: 975, top: 250, width: 820, height: 565 }],
    // Símbolo isolado
    "aurum-symbol.png": [concept, { left: 1175, top: 250, width: 370, height: 295 }],
    // Wordmark com assinatura
    "aurum-wordmark.png": [concept, { left: 975, top: 570, width: 820, height: 240 }],
    // Wordmark sem a frase (usos pequenos)
    "aurum-wordmark-solo.png": [concept, { left: 975, top: 570, width: 820, height: 165 }],
    // Assinatura horizontal, como aplicada nas peças da marca
    "aurum-lockup-horizontal.png": [others, { left: 88, top: 52, width: 530, height: 130 }],
  };
  for (const [name, [file, crop]] of Object.entries(pieces)) {
    const buf = await keyed(file, crop);
    await writeFile(out("public/aurum/brand", name), buf);
    const m = await sharp(buf).metadata();
    console.log(`brand/${name}`, m.width, "x", m.height);
  }
}

async function icons() {
  const symbol = await sharp(out("public/aurum/brand/aurum-symbol.png")).resize(360).toBuffer();
  const tile = (size, pad) =>
    sharp({ create: { width: 512, height: 512, channels: 4, background: INK } })
      .composite([{ input: symbol, gravity: "center" }])
      .png()
      .toBuffer()
      .then((b) => sharp(b).resize(size - pad * 2).extend({ top: pad, bottom: pad, left: pad, right: pad, background: INK }).png().toBuffer());
  await writeFile(out("src/app/icon.png"), await tile(512, 0));
  await writeFile(out("src/app/apple-icon.png"), await tile(180, 0));
  await writeFile(out("public/aurum/icons/aurum-symbol-512.png"), await tile(512, 0));
  console.log("icons ok");
}

async function openGraph() {
  const W = 1200, H = 630;
  // símbolo + wordmark (as versões com frase trazem a assinatura antiga desenhada)
  const symbol = await sharp(out("public/aurum/brand/aurum-symbol.png")).resize({ width: 230 }).toBuffer();
  const word = await sharp(out("public/aurum/brand/aurum-wordmark-solo.png")).resize({ width: 520 }).toBuffer();
  const sm = await sharp(symbol).metadata();
  const wm = await sharp(word).metadata();
  const lockup = await sharp({ create: { width: 520, height: sm.height + 36 + wm.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: symbol, top: 0, left: Math.round((520 - sm.width) / 2) },
      { input: word, top: sm.height + 36, left: 0 },
    ])
    .png()
    .toBuffer();
  const bars = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${INK}"/>
      <g stroke="#2B2B2B" stroke-width="1">
        ${Array.from({ length: 14 }, (_, i) => `<line x1="${-200 + i * 26}" y1="${H}" x2="${180 + i * 26}" y2="0"/>`).join("")}
      </g>
      <polygon points="0,${H - 120} 0,${H} 260,${H} 520,${H - 120}" fill="${ORANGE}" opacity="0.95"/>
      <line x1="760" y1="${H}" x2="1200" y2="140" stroke="${ORANGE}" stroke-width="2"/>
    </svg>`;
  const buf = await sharp(Buffer.from(bars))
    .composite([{ input: lockup, top: 150, left: Math.round((W - (await sharp(lockup).metadata()).width) / 2) }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  await writeFile(out("src/app/opengraph-image.jpg"), buf);
  await writeFile(out("src/app/opengraph-image.alt.txt"), "AURUM — Movimento que se constrói. Funcional e Funcional Kids.");
  console.log("open graph ok");
}

async function textures() {
  await mkdir(out("public/aurum/textures"), { recursive: true });
  const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
  <filter id="n" x="0" y="0"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/></filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`;
  await writeFile(out("public/aurum/textures/grain.svg"), grain);
  console.log("textures ok");
}

await brand();
await icons();
await openGraph();
await textures();
