/**
 * Sinais biomecânicos calculados a cada quadro a partir dos pontos do corpo.
 *
 * Os pontos chegam normalizados (0–1) na largura e na altura do vídeo. Antes de
 * medir ângulos, o eixo X é multiplicado pela proporção do quadro para que os
 * ângulos sejam reais (um vídeo 16:9 não "achata" o corpo).
 *
 * Convenções (graus):
 * - kneeFlex / hipFlex / elbowFlex: 0 = articulação estendida; sobe ao flexionar.
 * - shoulder: ângulo quadril–ombro–cotovelo (0 = braço ao lado do corpo, 180 = acima da cabeça).
 * - trunkLean: inclinação do tronco em relação à vertical (0 = em pé, 90 = deitado).
 * - bodyLine: desvio do alinhamento ombro–quadril–tornozelo (+ quadril caindo, − quadril alto).
 */
import type { Key, Landmarks, Pt } from "./pose";

export type Side = "L" | "R";
export type SideMode = "near" | "max" | "min" | "avg" | "L" | "R";
export type Signals = Record<string, number>;

/** Sinais medidos dos dois lados do corpo (leitura com sufixo .L / .R). */
export const SIDED = new Set([
  "kneeFlex",
  "hipFlex",
  "elbowFlex",
  "shoulder",
  "ankle",
  "shinLean",
  "thighAbd",
  "kneeRise",
  "forearmTilt",
  "bodyLine",
  "bodyLineKnee",
  "heelRise",
]);

/** Sinais medidos em graus (os demais são proporções do corpo). */
export const ANGLE_SIGNALS = new Set([
  "kneeFlex",
  "hipFlex",
  "elbowFlex",
  "shoulder",
  "ankle",
  "shinLean",
  "thighAbd",
  "forearmTilt",
  "bodyLine",
  "bodyLineKnee",
  "trunkLean",
  "torsoRise",
]);

const RAD = 180 / Math.PI;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface P {
  x: number;
  y: number;
}

function dist(a: P, b: P) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mid(a: P, b: P): P {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Ângulo em B formado por A–B–C. */
export function angleAt(a: P, b: P, c: P) {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (d === 0) return 180;
  return Math.acos(clamp((v1x * v2x + v1y * v2y) / d, -1, 1)) * RAD;
}

/** Ângulo do segmento A→B em relação à vertical (0 = alinhado, 90 = horizontal). */
function fromVertical(a: P, b: P) {
  return Math.atan2(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) * RAD;
}

/** Desvio do ponto B em relação à reta A–C: + quando B está abaixo da reta (no sentido da gravidade). */
function lineDeviation(a: P, b: P, c: P) {
  const dev = 180 - angleAt(a, b, c);
  const cross = (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
  const dir = c.x - a.x >= 0 ? 1 : -1;
  return cross * dir >= 0 ? dev : -dev;
}

export function visibilityOf(lm: Landmarks, keys: Key[]) {
  let s = 0;
  for (const k of keys) s += lm[k].visibility ?? 0;
  return s / keys.length;
}

const SIDE_KEYS = {
  L: ["leftShoulder", "leftElbow", "leftWrist", "leftHip", "leftKnee", "leftAnkle"],
  R: ["rightShoulder", "rightElbow", "rightWrist", "rightHip", "rightKnee", "rightAnkle"],
} as const satisfies Record<Side, Key[]>;

/** Lado mais visível para a câmera (usado nos exercícios filmados de perfil). */
export function nearestSide(lm: Landmarks): Side {
  return visibilityOf(lm, [...SIDE_KEYS.L]) >= visibilityOf(lm, [...SIDE_KEYS.R]) ? "L" : "R";
}

export function computeSignals(lm: Landmarks, aspect: number): Signals {
  // Coordenadas em escala real (X corrigido pela proporção do quadro)
  const p = {} as Record<Key, P>;
  for (const k of Object.keys(lm) as Key[]) p[k] = { x: lm[k].x * aspect, y: lm[k].y };

  const s: Signals = {};
  const shoulderW = Math.max(dist(p.leftShoulder, p.rightShoulder), 1e-4);
  const sMid = mid(p.leftShoulder, p.rightShoulder);
  const hMid = mid(p.leftHip, p.rightHip);
  const torso = Math.max(dist(sMid, hMid), 1e-4);
  const thighLen = Math.max(dist(p.leftHip, p.leftKnee), dist(p.rightHip, p.rightKnee), 1e-4);
  const upperArm = Math.max(dist(p.leftShoulder, p.leftElbow), dist(p.rightShoulder, p.rightElbow), 1e-4);

  for (const side of ["L", "R"] as const) {
    const pre = side === "L" ? "left" : "right";
    const sh = p[`${pre}Shoulder` as Key];
    const el = p[`${pre}Elbow` as Key];
    const wr = p[`${pre}Wrist` as Key];
    const hip = p[`${pre}Hip` as Key];
    const kn = p[`${pre}Knee` as Key];
    const an = p[`${pre}Ankle` as Key];
    const ft = p[`${pre}Foot` as Key];
    const he = p[`${pre}Heel` as Key];

    s[`kneeFlex.${side}`] = 180 - angleAt(hip, kn, an);
    s[`hipFlex.${side}`] = 180 - angleAt(sh, hip, kn);
    s[`elbowFlex.${side}`] = 180 - angleAt(sh, el, wr);
    s[`shoulder.${side}`] = angleAt(hip, sh, el);
    s[`ankle.${side}`] = angleAt(kn, an, ft);
    s[`shinLean.${side}`] = fromVertical(an, kn);
    s[`thighAbd.${side}`] = fromVertical(hip, kn);
    s[`kneeRise.${side}`] = 1 + (hip.y - kn.y) / thighLen;
    s[`forearmTilt.${side}`] = fromVertical(el, wr);
    s[`bodyLine.${side}`] = lineDeviation(sh, hip, an);
    s[`bodyLineKnee.${side}`] = lineDeviation(sh, hip, kn);
    // Calcanhar acima da ponta do pé (≈ seno da inclinação do pé)
    s[`heelRise.${side}`] = (ft.y - he.y) / Math.max(dist(he, ft), 1e-4);
  }

  // Tronco
  s.trunkLean = Math.atan2(Math.abs(sMid.x - hMid.x), hMid.y - sMid.y) * RAD;
  s.torsoRise = Math.atan2(hMid.y - sMid.y, Math.abs(sMid.x - hMid.x)) * RAD;

  // Posição e larguras (vistas de frente)
  s.hipY = hMid.y / shoulderW;
  s.earGap = (sMid.y - mid(p.leftEar, p.rightEar).y) / shoulderW;
  const ankleW = Math.max(dist(p.leftAnkle, p.rightAnkle), 1e-4);
  s.kneeWidth = dist(p.leftKnee, p.rightKnee) / ankleW;
  s.feetWidth = ankleW / shoulderW;
  const wMid = mid(p.leftWrist, p.rightWrist);
  s.twist = Math.abs(wMid.x - hMid.x) / shoulderW;
  s.handLift = Math.abs(p.leftWrist.y - p.rightWrist.y) / upperArm;
  s.chinOverBar = (wMid.y - p.nose.y) / shoulderW;
  s.wristsOverHead = (p.nose.y - wMid.y) / torso;

  // Simetria entre os lados
  s.shoulderSym = Math.abs(s["shoulder.L"] - s["shoulder.R"]);
  s.elbowSym = Math.abs(s["elbowFlex.L"] - s["elbowFlex.R"]);

  // Escala do corpo no quadro (para o cálculo de movimento/estabilidade)
  s.scale = torso;
  return s;
}

export function read(sig: Signals, key: string, mode: SideMode = "near", near: Side = "L"): number {
  if (!SIDED.has(key)) return sig[key] ?? 0;
  const l = sig[`${key}.L`] ?? 0;
  const r = sig[`${key}.R`] ?? 0;
  switch (mode) {
    case "L":
      return l;
    case "R":
      return r;
    case "max":
      return Math.max(l, r);
    case "min":
      return Math.min(l, r);
    case "avg":
      return (l + r) / 2;
    default:
      return near === "L" ? l : r;
  }
}

/** Movimento médio dos pontos entre dois quadros, relativo ao tamanho do tronco. */
export function motionBetween(a: Landmarks, b: Landmarks, aspect: number, scale: number) {
  const keys: Key[] = ["leftShoulder", "rightShoulder", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftWrist", "rightWrist"];
  let sum = 0;
  for (const k of keys) sum += Math.hypot((a[k].x - b[k].x) * aspect, a[k].y - b[k].y);
  return sum / keys.length / Math.max(scale, 1e-4);
}

export type { Pt };
