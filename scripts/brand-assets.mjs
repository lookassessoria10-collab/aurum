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
 * Uso: node scripts/brand-assets.mjs [--placeholders]
 */
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
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
  const lockup = await sharp(out("public/aurum/brand/aurum-lockup.png")).resize({ height: 330 }).toBuffer();
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
    .composite([{ input: lockup, top: 120, left: Math.round((W - (await sharp(lockup).metadata()).width) / 2) }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  await writeFile(out("src/app/opengraph-image.jpg"), buf);
  await writeFile(out("src/app/opengraph-image.alt.txt"), "AURUM — Ritmo que se constrói. Funcional e Funcional Kids.");
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

/** Placeholders claramente identificados para as fotos que a AURUM vai enviar. */
const PHOTOS = [
  ["functional-adult-01", 1600, 2000, "Adulto · agachamento com kettlebell"],
  ["functional-adult-02", 2000, 1300, "Adulto · empurrar / puxar com orientação"],
  ["functional-adult-03", 2400, 1200, "Adulto · deslocamento ou salto controlado"],
  ["functional-adult-04", 1600, 2000, "Adulto · mobilidade / avanço"],
  ["functional-kids-01", 1600, 2000, "Kids · equilíbrio em circuito"],
  ["functional-kids-02", 2000, 1300, "Kids · saltando pequenos obstáculos"],
  ["functional-kids-03", 1600, 2000, "Kids · correndo e mudando de direção"],
];

async function placeholders(force) {
  await mkdir(out("public/aurum/photos"), { recursive: true });
  for (const [name, w, h, subject] of PHOTOS) {
    const file = out("public/aurum/photos", `${name}.jpg`);
    if (!force) {
      try {
        await access(file);
        console.log(`photos/${name}.jpg existe — mantido`);
        continue;
      } catch {}
    }
    const s = Math.min(w, h) / 1000;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="100%" height="100%" fill="#1C1C1C"/>
      <g stroke="#2B2B2B" stroke-width="${2 * s}">
        ${Array.from({ length: 40 }, (_, i) => `<line x1="${i * 90 * s - h}" y1="${h}" x2="${i * 90 * s}" y2="0"/>`).join("")}
      </g>
      <rect x="${60 * s}" y="${60 * s}" width="${w - 120 * s}" height="${h - 120 * s}" fill="none" stroke="#3A3A3A" stroke-width="${2 * s}" stroke-dasharray="${14 * s} ${10 * s}"/>
      <rect x="${100 * s}" y="${120 * s}" width="${70 * s}" height="${8 * s}" fill="${ORANGE}"/>
      <text x="${100 * s}" y="${190 * s}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${44 * s}" fill="#F4F4F4" letter-spacing="${4 * s}">FOTO PENDENTE</text>
      <text x="${100 * s}" y="${255 * s}" font-family="Arial, Helvetica, sans-serif" font-size="${34 * s}" fill="#9A9A9A">/public/aurum/photos/${name}.jpg</text>
      <text x="${100 * s}" y="${310 * s}" font-family="Arial, Helvetica, sans-serif" font-size="${34 * s}" fill="${ORANGE}">${subject}</text>
    </svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 80, mozjpeg: true }).toFile(file);
    console.log(`photos/${name}.jpg placeholder`);
  }
}

await brand();
await icons();
await openGraph();
await textures();
await placeholders(process.argv.includes("--placeholders"));
