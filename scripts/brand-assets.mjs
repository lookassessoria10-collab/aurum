/**
 * Gera os assets da marca a partir das peças oficiais em /brand-source.
 *
 * Nada aqui redesenha a marca: logotipo, ícone, wordmark e frase são recortados
 * pixel a pixel do PNG transparente oficial (marca 2026, "Movimento que se constrói.").
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

/** Recorta uma área do PNG transparente oficial e remove as bordas vazias. */
async function crop(file, area) {
  const part = await sharp(file).extract(area).png().toBuffer();
  return sharp(part).trim({ threshold: 10 }).png({ compressionLevel: 9 }).toBuffer();
}

async function brand() {
  await mkdir(out("public/aurum/brand"), { recursive: true });
  // Marca 2026: ícone claro, AURUM laranja e "Movimento que se constrói." (PNG 2000x2000 transparente)
  const master = src("marca-2026-transparente.png");
  const pieces = {
    // Assinatura completa: ícone + AURUM + frase
    "aurum-lockup-2026.png": { left: 300, top: 380, width: 1400, height: 1000 },
    // Ícone isolado
    "aurum-symbol-2026.png": { left: 760, top: 400, width: 480, height: 560 },
    // AURUM + frase
    "aurum-wordmark-2026.png": { left: 300, top: 1000, width: 1400, height: 380 },
    // Só AURUM (usos pequenos)
    "aurum-wordmark-solo-2026.png": { left: 420, top: 1000, width: 1160, height: 255 },
    // Só a frase, na tipografia original da marca
    "aurum-tagline-2026.png": { left: 300, top: 1270, width: 1400, height: 110 },
  };
  for (const [name, area] of Object.entries(pieces)) {
    const buf = await crop(master, area);
    await writeFile(out("public/aurum/brand", name), buf);
    const m = await sharp(buf).metadata();
    console.log(`brand/${name}`, m.width, "x", m.height);
  }
}

async function icons() {
  const symbol = await sharp(out("public/aurum/brand/aurum-symbol-2026.png")).resize(360).toBuffer();
  const tile = (size, pad) =>
    sharp({ create: { width: 512, height: 512, channels: 4, background: INK } })
      .composite([{ input: symbol, gravity: "center" }])
      .png()
      .toBuffer()
      .then((b) => sharp(b).resize(size - pad * 2).extend({ top: pad, bottom: pad, left: pad, right: pad, background: INK }).png().toBuffer());
  await writeFile(out("src/app/icon.png"), await tile(512, 0));
  await writeFile(out("src/app/apple-icon.png"), await tile(180, 0));
  await writeFile(out("public/aurum/icons/aurum-icone-2026-512.png"), await tile(512, 0));
  console.log("icons ok");
}

async function openGraph() {
  const W = 1200, H = 630;
  const lockup = await sharp(out("public/aurum/brand/aurum-lockup-2026.png")).resize({ height: 360 }).toBuffer();
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
