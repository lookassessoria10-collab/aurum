"use client";

import { motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Metric, RegionId, View } from "../types";

const ORANGE = "var(--color-orange)";
const BONE = "rgba(244,244,244,0.85)";
const DIM = "rgba(244,244,244,0.16)";

/* ——— Corpo com a região destacada ——————————————————————————— */

const PARTS = {
  head: <circle cx="30" cy="9" r="6.5" />,
  chest: <path d="M19 19 H41 L39 34 H21 Z" />,
  shoulders: (
    <>
      <circle cx="17" cy="21" r="4" />
      <circle cx="43" cy="21" r="4" />
    </>
  ),
  arms: (
    <>
      <path d="M12.5 24 L9 46 L13 46.5 L17 25 Z" />
      <path d="M47.5 24 L51 46 L47 46.5 L43 25 Z" />
    </>
  ),
  core: <path d="M21 35 H39 L38 48 H22 Z" />,
  hips: <path d="M22 49 H38 L39 55 H21 Z" />,
  legs: (
    <>
      <path d="M21 56 H29 L28 92 H22 Z" />
      <path d="M31 56 H39 L38 92 H32 Z" />
    </>
  ),
  joints: (
    <>
      {[
        [17, 21],
        [43, 21],
        [11, 35],
        [49, 35],
        [25, 56],
        [35, 56],
        [25, 74],
        [35, 74],
        [25, 91],
        [35, 91],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" />
      ))}
    </>
  ),
};

const HIGHLIGHT: Record<RegionId | "superiores" | "inferiores", (keyof typeof PARTS)[]> = {
  superiores: ["chest", "shoulders", "arms"],
  inferiores: ["hips", "legs"],
  pernas: ["hips", "legs"],
  empurrar: ["chest", "shoulders", "arms"],
  puxar: ["shoulders", "arms", "core"],
  core: ["core", "hips"],
  corpo: ["head", "chest", "shoulders", "arms", "core", "hips", "legs"],
  mobilidade: ["joints"],
};

export function RegionFigure({ region, active, className }: { region: keyof typeof HIGHLIGHT | "todos"; active?: boolean; className?: string }) {
  const on = region === "todos" ? [] : HIGHLIGHT[region];
  const base = (["head", "chest", "shoulders", "arms", "core", "hips", "legs"] as const).filter((p) => !on.includes(p));
  return (
    <svg viewBox="0 0 60 96" aria-hidden className={className}>
      <g fill={DIM}>{base.map((p) => <g key={p}>{PARTS[p]}</g>)}</g>
      <g fill={active ? ORANGE : "rgba(248,120,31,0.75)"}>{on.map((p) => <g key={p}>{PARTS[p]}</g>)}</g>
    </svg>
  );
}

/* ——— Ângulo medido (anima entre a posição inicial e o fim do movimento) ——— */

/** Converte o sinal do exercício em um ângulo interno visual (graus). */
function visualAngle(signal: string, v: number) {
  switch (signal) {
    case "kneeFlex":
    case "hipFlex":
    case "elbowFlex":
      return 180 - v;
    case "shoulder":
    case "ankle":
      return v;
    case "trunkLean":
    case "shinLean":
    case "thighAbd":
      return 180 - v;
    default:
      return null;
  }
}

export function AngleGlyph({ metric, play = true, className }: { metric: Metric; play?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const a0 = visualAngle(metric.signal, metric.relative ? 0 : metric.rest);
  const a1 = visualAngle(metric.signal, metric.peak);
  const arm = useRef<SVGLineElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const txt = useRef<SVGTextElement>(null);
  const bar = useRef<SVGRectElement>(null);
  const angular = a0 !== null && a1 !== null && !metric.relative;
  const deg = (play && !reduce ? a0 : a1) ?? 0;

  // O texto é escrito direto no elemento (a animação também escreve nele)
  useEffect(() => {
    if (angular && txt.current) txt.current.textContent = `${Math.round(deg)}°`;
  }, [angular, deg]);

  useAnimationFrame((time) => {
    if (reduce || !play) return;
    const k = (1 - Math.cos((time / 1900) * Math.PI * 2)) / 2; // 0→1→0
    if (angular) {
      const deg = a0 + (a1 - a0) * k;
      const rad = (deg * Math.PI) / 180;
      const x = 60 + Math.cos(rad) * 46;
      const y = 62 - Math.sin(rad) * 46;
      arm.current?.setAttribute("x2", x.toFixed(2));
      arm.current?.setAttribute("y2", y.toFixed(2));
      const ax = 60 + Math.cos(rad) * 22;
      const ay = 62 - Math.sin(rad) * 22;
      arc.current?.setAttribute("d", `M 60 62 L 82 62 A 22 22 0 0 0 ${ax.toFixed(2)} ${ay.toFixed(2)} Z`);
      if (txt.current) txt.current.textContent = `${Math.round(deg)}°`;
    } else if (bar.current) {
      const hgt = 8 + 44 * k;
      bar.current.setAttribute("y", (62 - hgt).toFixed(2));
      bar.current.setAttribute("height", hgt.toFixed(2));
    }
  });

  if (!angular) {
    return (
      <svg viewBox="0 0 120 72" aria-hidden className={className}>
        <line x1="20" y1="64" x2="100" y2="64" stroke={DIM} strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="10" x2="60" y2="62" stroke={DIM} strokeWidth="2" strokeDasharray="3 5" />
        <rect ref={bar} x="50" y="30" width="20" height="32" fill={ORANGE} />
        <path d="M 60 4 L 52 14 H 68 Z" fill={BONE} />
      </svg>
    );
  }

  const rad = (deg * Math.PI) / 180;
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={className}>
      <line x1="60" y1="62" x2="106" y2="62" stroke={BONE} strokeWidth="4" strokeLinecap="round" />
      <path d="M 106 62 A 46 46 0 0 0 14 62" fill="none" stroke={DIM} strokeWidth="2" strokeDasharray="3 6" />
      <path ref={arc} d={`M 60 62 L 82 62 A 22 22 0 0 0 ${60 + Math.cos(rad) * 22} ${62 - Math.sin(rad) * 22} Z`} fill="rgba(248,120,31,0.25)" stroke={ORANGE} strokeWidth="2" />
      <line ref={arm} x1="60" y1="62" x2={60 + Math.cos(rad) * 46} y2={62 - Math.sin(rad) * 46} stroke={ORANGE} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="60" cy="62" r="6" fill={ORANGE} stroke="#0a0a0a" strokeWidth="2" />
      <text ref={txt} x="60" y="16" textAnchor="middle" className="fill-bone" style={{ font: "italic 900 13px var(--font-display)" }} />
    </svg>
  );
}

/* ——— Onde colocar o celular (vista de cima) ——————————————————— */

export function CameraDiagram({ view, className }: { view: View; className?: string }) {
  const lateral = view === "lateral";
  return (
    <svg viewBox="0 0 160 110" aria-hidden className={className}>
      <rect x="1" y="1" width="158" height="108" rx="6" fill="none" stroke={DIM} strokeDasharray="3 5" />
      {/* pessoa vista de cima: ombros + cabeça, olhando para a direita (lateral) ou para baixo (frontal) */}
      <g transform={lateral ? "translate(56 40) rotate(-90)" : "translate(56 40)"}>
        <ellipse cx="0" cy="0" rx="16" ry="7" fill={BONE} opacity="0.85" />
        <circle cx="0" cy="0" r="6" fill="#0a0a0a" stroke={BONE} strokeWidth="2" />
        <path d="M -4 8 L 0 14 L 4 8" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* celular */}
      <rect x="47" y="91" width="18" height="10" rx="2" fill={ORANGE} />
      <motion.path
        d="M 49 90 L 22 18 M 63 90 L 90 18"
        stroke={ORANGE}
        strokeWidth="1.5"
        strokeDasharray="2 4"
        fill="none"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <text x="104" y="40" className="fill-muted" style={{ font: "600 8px var(--font-sans)", letterSpacing: "0.12em" }}>
        {lateral ? "DE LADO" : "DE FRENTE"}
      </text>
      <text x="104" y="52" className="fill-muted" style={{ font: "500 7px var(--font-sans)" }}>
        2 a 3 m
      </text>
    </svg>
  );
}

/* ——— Figura do hero: agachamento com o ângulo do joelho medido ———————— */

type Pose = { shin: number; thigh: number; torso: number; head: number; upper: number; fore: number };
const STAND: Pose = { shin: 3.6, thigh: -3.4, torso: 1.6, head: 0, upper: 178.5, fore: 177 };
const SQUAT: Pose = { shin: 32, thigh: -96, torso: 42, head: 28, upper: 86, fore: 92 };
const LEN = { shin: 48, thigh: 50, torso: 72, head: 30, upper: 38, fore: 34 };

function step(p: { x: number; y: number }, deg: number, len: number) {
  const r = (deg * Math.PI) / 180;
  return { x: p.x + Math.sin(r) * len, y: p.y - Math.cos(r) * len };
}

function solve(k: number) {
  const q = {} as Pose;
  for (const key of Object.keys(STAND) as (keyof Pose)[]) q[key] = STAND[key] + (SQUAT[key] - STAND[key]) * k;
  const ankle = { x: 92, y: 236 };
  const knee = step(ankle, q.shin, LEN.shin);
  const hip = step(knee, q.thigh, LEN.thigh);
  const shoulder = step(hip, q.torso, LEN.torso);
  const head = step(shoulder, q.head, LEN.head);
  const elbow = step(shoulder, q.upper, LEN.upper);
  const wrist = step(elbow, q.fore, LEN.fore);
  return { ankle, knee, hip, shoulder, head, elbow, wrist };
}

export function HeroFigure({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const refs = useRef<Record<string, SVGElement | null>>({});
  const reps = useRef(0);
  const wasDown = useRef(false);

  const set = (id: string, attrs: Record<string, string | number>) => {
    const el = refs.current[id];
    if (!el) return;
    for (const [a, v] of Object.entries(attrs)) el.setAttribute(a, typeof v === "number" ? v.toFixed(2) : v);
  };

  const render = (k: number) => {
    const p = solve(k);
    set("leg", { d: `M ${p.ankle.x} ${p.ankle.y} L ${p.knee.x} ${p.knee.y} L ${p.hip.x} ${p.hip.y}` });
    set("torso", { x1: p.hip.x, y1: p.hip.y, x2: p.shoulder.x, y2: p.shoulder.y });
    set("arm", { d: `M ${p.shoulder.x} ${p.shoulder.y} L ${p.elbow.x} ${p.elbow.y} L ${p.wrist.x} ${p.wrist.y}` });
    set("head", { cx: p.head.x, cy: p.head.y });
    set("knee", { cx: p.knee.x, cy: p.knee.y });
    set("hipdot", { cx: p.hip.x, cy: p.hip.y });
    // ângulo interno do joelho
    const a1 = Math.atan2(p.hip.y - p.knee.y, p.hip.x - p.knee.x);
    const a2 = Math.atan2(p.ankle.y - p.knee.y, p.ankle.x - p.knee.x);
    let d = Math.abs(a1 - a2);
    if (d > Math.PI) d = 2 * Math.PI - d;
    const deg = Math.round((d * 180) / Math.PI);
    const r = 20;
    const s = { x: p.knee.x + Math.cos(a1) * r, y: p.knee.y + Math.sin(a1) * r };
    const e = { x: p.knee.x + Math.cos(a2) * r, y: p.knee.y + Math.sin(a2) * r };
    let diff = a2 - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const sweep = diff > 0 ? 1 : 0;
    set("arc", { d: `M ${p.knee.x} ${p.knee.y} L ${s.x} ${s.y} A ${r} ${r} 0 0 ${sweep} ${e.x} ${e.y} Z` });
    set("deg", { x: p.knee.x + 30, y: p.knee.y - 8 });
    const t = refs.current.deg;
    if (t) t.textContent = `${deg}°`;
    // contador de repetições
    if (k > 0.9) wasDown.current = true;
    if (k < 0.1 && wasDown.current) {
      wasDown.current = false;
      reps.current = (reps.current % 12) + 1;
      const c = refs.current.count;
      if (c) c.textContent = String(reps.current).padStart(2, "0");
    }
  };

  useAnimationFrame((time) => {
    if (reduce) return;
    const phase = (time / 2600) % 1;
    // desce em 45%, segura, sobe mais rápido
    const k = phase < 0.45 ? easeInOut(phase / 0.45) : phase < 0.55 ? 1 : phase < 0.85 ? 1 - easeInOut((phase - 0.55) / 0.3) : 0;
    render(k);
  });

  const init = solve(reduce ? 1 : 0);
  return (
    <svg viewBox="0 0 220 260" aria-hidden className={className}>
      {/* chão e grade de leitura */}
      <line x1="10" y1="242" x2="210" y2="242" stroke={DIM} strokeWidth="2" />
      {[60, 110, 160].map((y) => (
        <line key={y} x1="10" x2="210" y1={y} y2={y} stroke="rgba(244,244,244,0.05)" />
      ))}
      <path d="M 84 242 L 122 242" stroke={BONE} strokeWidth="5" strokeLinecap="round" />
      <path ref={(el) => void (refs.current.arc = el)} fill="rgba(248,120,31,0.28)" stroke={ORANGE} strokeWidth="1.5" />
      <path
        ref={(el) => void (refs.current.leg = el)}
        d={`M ${init.ankle.x} ${init.ankle.y} L ${init.knee.x} ${init.knee.y} L ${init.hip.x} ${init.hip.y}`}
        fill="none"
        stroke={ORANGE}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="glow"
      />
      <line ref={(el) => void (refs.current.torso = el)} x1={init.hip.x} y1={init.hip.y} x2={init.shoulder.x} y2={init.shoulder.y} stroke={BONE} strokeWidth="5" strokeLinecap="round" />
      <path
        ref={(el) => void (refs.current.arm = el)}
        d={`M ${init.shoulder.x} ${init.shoulder.y} L ${init.elbow.x} ${init.elbow.y} L ${init.wrist.x} ${init.wrist.y}`}
        fill="none"
        stroke={BONE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle ref={(el) => void (refs.current.head = el)} cx={init.head.x} cy={init.head.y} r="12" fill="none" stroke={BONE} strokeWidth="4" />
      <circle ref={(el) => void (refs.current.hipdot = el)} cx={init.hip.x} cy={init.hip.y} r="4" fill="#f4f4f4" />
      <circle ref={(el) => void (refs.current.knee = el)} cx={init.knee.x} cy={init.knee.y} r="6" fill={ORANGE} stroke="#0a0a0a" strokeWidth="2.5" />
      <text ref={(el) => void (refs.current.deg = el)} x={init.knee.x + 30} y={init.knee.y - 8} style={{ font: "italic 900 16px var(--font-display)" }} fill={ORANGE}>
        {reduce ? "90°" : "175°"}
      </text>
      <text x="206" y="30" textAnchor="end" className="fill-muted" style={{ font: "600 7px var(--font-sans)", letterSpacing: "0.2em" }}>
        REPETIÇÕES
      </text>
      <text ref={(el) => void (refs.current.count = el)} x="206" y="62" textAnchor="end" className="fill-bone" style={{ font: "italic 900 34px var(--font-display)" }}>
        00
      </text>
    </svg>
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
