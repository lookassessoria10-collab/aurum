/**
 * Desenho do esqueleto sobre o vídeo, na identidade AURUM:
 * linhas claras, articulação medida em laranja com o arco do ângulo,
 * segmentos com problema em vermelho-alaranjado.
 */
import type { Key, Landmarks } from "./pose";
import { SKELETON } from "./pose";
import { SIGNAL_JOINTS } from "./engine";
import type { Side, SideMode } from "./signals";

const BONE = "rgba(244,244,244,0.72)";
const BONE_DIM = "rgba(244,244,244,0.35)";
const ORANGE = "#f8781f";
const ALERT = "#ff4b3a";

const k = (side: Side, joint: string) => `${side === "L" ? "left" : "right"}${joint}` as Key;

/** Família da Montserrat carregada pelo next/font (nome gerado no build). */
let fontFamily = "system-ui, sans-serif";
export function setCanvasFont(family: string) {
  if (family) fontFamily = family;
}

export interface DrawOpts {
  signal: string;
  side: SideMode | "each";
  near: Side;
  view: "frontal" | "lateral";
  /** Sinais com correção ativa (desenhados em alerta). */
  problems: string[];
  active: boolean;
}

/** Ângulo interno da articulação B (graus), em pixels reais. */
function inner(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const v1 = Math.atan2(a.y - b.y, a.x - b.x);
  const v2 = Math.atan2(c.y - b.y, c.x - b.x);
  let d = Math.abs(v1 - v2);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return { deg: (d * 180) / Math.PI, v1, v2 };
}

export function drawOverlay(ctx: CanvasRenderingContext2D, lm: Landmarks, w: number, h: number, o: DrawOpts) {
  ctx.clearRect(0, 0, w, h);
  const P = (key: Key) => ({ x: lm[key].x * w, y: lm[key].y * h });
  const unit = Math.max(2, Math.min(w, h) * 0.006);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const sides: Side[] =
    o.side === "L" || o.side === "R" ? [o.side] : o.view === "lateral" && (o.side === "near" || o.side === undefined) ? [o.near] : ["L", "R"];

  // Segmentos em alerta
  const alertKeys = new Set<Key>();
  for (const sig of o.problems) {
    const j = SIGNAL_JOINTS[sig];
    if (j) for (const s of sides) j.forEach((n) => alertKeys.add(k(s, n)));
    if (sig === "trunkLean" || sig === "torsoRise") ["leftShoulder", "rightShoulder", "leftHip", "rightHip"].forEach((n) => alertKeys.add(n as Key));
    if (sig === "kneeWidth") ["leftKnee", "rightKnee", "leftHip", "rightHip", "leftAnkle", "rightAnkle"].forEach((n) => alertKeys.add(n as Key));
    if (sig === "shoulderSym" || sig === "elbowSym") ["leftElbow", "rightElbow", "leftShoulder", "rightShoulder", "leftWrist", "rightWrist"].forEach((n) => alertKeys.add(n as Key));
  }

  // Esqueleto base
  for (const [a, b] of SKELETON) {
    const pa = P(a);
    const pb = P(b);
    const vis = Math.min(lm[a].visibility ?? 1, lm[b].visibility ?? 1);
    if (vis < 0.3) continue;
    const alert = alertKeys.has(a) && alertKeys.has(b);
    ctx.strokeStyle = alert ? ALERT : vis < 0.6 ? BONE_DIM : BONE;
    ctx.lineWidth = alert ? unit * 1.8 : unit;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Cabeça
  const nose = P("nose");
  if ((lm.nose.visibility ?? 1) > 0.4) {
    ctx.strokeStyle = BONE;
    ctx.lineWidth = unit;
    const r = Math.max(unit * 4, Math.hypot(lm.leftEar.x * w - lm.rightEar.x * w, lm.leftEar.y * h - lm.rightEar.y * h) * 0.75);
    ctx.beginPath();
    ctx.arc(nose.x, nose.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (!o.active) {
    drawJoints(ctx, lm, w, h, unit, alertKeys);
    return;
  }

  // Articulação medida
  const joints = SIGNAL_JOINTS[o.signal];
  const isLine = o.signal === "bodyLine" || o.signal === "bodyLineKnee";
  if (joints && !isLine) {
    sides.forEach((s, i) => {
      const [A, B, C] = joints.map((n) => P(k(s, n)));
      const vis = lm[k(s, joints[1])].visibility ?? 1;
      if (vis < 0.35) return;
      const color = alertKeys.has(k(s, joints[1])) ? ALERT : ORANGE;
      ctx.save();
      ctx.shadowColor = "rgba(248,120,31,0.6)";
      ctx.shadowBlur = unit * 3;
      ctx.strokeStyle = color;
      ctx.lineWidth = unit * 2.2;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.stroke();
      ctx.restore();

      const ang = inner(A, B, C);
      const r = Math.min(Math.hypot(A.x - B.x, A.y - B.y), Math.hypot(C.x - B.x, C.y - B.y)) * 0.42;
      let start = ang.v1;
      let end = ang.v2;
      let diff = end - start;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      end = start + diff;
      if (diff < 0) [start, end] = [end, start];
      ctx.fillStyle = "rgba(248,120,31,0.22)";
      ctx.beginPath();
      ctx.moveTo(B.x, B.y);
      ctx.arc(B.x, B.y, r, start, end);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = unit;
      ctx.beginPath();
      ctx.arc(B.x, B.y, r, start, end);
      ctx.stroke();

      if (i === 0 || o.side === "each" || o.view === "frontal") {
        const mid = (start + end) / 2 + Math.PI;
        const tx = B.x + Math.cos(mid) * (r * 0.55 + unit * 9);
        const ty = B.y + Math.sin(mid) * (r * 0.55 + unit * 9);
        label(ctx, `${Math.round(ang.deg)}°`, tx, ty, unit);
      }
      dot(ctx, B, unit * 2.4, color);
    });
  } else if (isLine && joints) {
    // Linha de referência ombro → tornozelo (ou joelho) e o quadril medido
    for (const s of sides.slice(0, 1)) {
      const [A, B, C] = joints.map((n) => P(k(s, n)));
      ctx.save();
      ctx.setLineDash([unit * 3, unit * 3]);
      ctx.strokeStyle = "rgba(248,120,31,0.8)";
      ctx.lineWidth = unit;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(C.x, C.y);
      ctx.stroke();
      ctx.restore();
      dot(ctx, B, unit * 2.6, alertKeys.has(k(s, joints[1])) ? ALERT : ORANGE);
    }
  } else if (o.signal === "trunkLean" || o.signal === "torsoRise") {
    const sMid = mid(P("leftShoulder"), P("rightShoulder"));
    const hMid = mid(P("leftHip"), P("rightHip"));
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = unit * 2.2;
    ctx.beginPath();
    ctx.moveTo(hMid.x, hMid.y);
    ctx.lineTo(sMid.x, sMid.y);
    ctx.stroke();
    dot(ctx, hMid, unit * 2.4, ORANGE);
  } else {
    const keys: Key[] =
      o.signal === "kneeRise" ? ["leftKnee", "rightKnee"]
      : o.signal === "twist" || o.signal === "handLift" ? ["leftWrist", "rightWrist"]
      : o.signal === "earGap" ? ["leftShoulder", "rightShoulder"]
      : ["leftHip", "rightHip"];
    for (const key of keys) dot(ctx, P(key), unit * 2.6, ORANGE);
  }

  drawJoints(ctx, lm, w, h, unit, alertKeys);
}

function drawJoints(ctx: CanvasRenderingContext2D, lm: Landmarks, w: number, h: number, unit: number, alert: Set<Key>) {
  const keys: Key[] = ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
  for (const key of keys) {
    if ((lm[key].visibility ?? 1) < 0.4) continue;
    ctx.fillStyle = alert.has(key) ? ALERT : "#f4f4f4";
    ctx.beginPath();
    ctx.arc(lm[key].x * w, lm[key].y * h, unit * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function dot(ctx: CanvasRenderingContext2D, p: { x: number; y: number }, r: number, color: string) {
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, unit: number) {
  const size = Math.max(12, unit * 6);
  ctx.font = `italic 900 ${size}px ${fontFamily}`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.35;
  ctx.fillStyle = "rgba(10,10,10,0.82)";
  ctx.beginPath();
  ctx.roundRect(x - tw / 2 - pad, y - size / 2 - pad * 0.7, tw + pad * 2, size + pad * 1.4, 4);
  ctx.fill();
  ctx.fillStyle = "#f8781f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + size * 0.04);
}

function mid(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
