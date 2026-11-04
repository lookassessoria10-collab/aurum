"use client";

import { motion } from "motion/react";

type Props = { kind: string; active: boolean };

const ON = "var(--color-orange)";
const OFF = "rgba(244,244,244,0.55)";
const TRACK = "rgba(244,244,244,0.14)";
const SNAP = [0.7, 0, 0.2, 1] as const;

// Pontos do arco de mobilidade (pivô 60,62; raio 44), da direita até a esquerda passando pelo topo
const ARC = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (i / 8);
  return { x: 60 + 44 * Math.cos(a), y: 62 - 44 * Math.sin(a) };
});

/**
 * Animações geométricas para cada capacidade física. Linhas e formas simples,
 * em escala legível; ganham movimento e laranja quando o item está ativo.
 * viewBox 0 0 120 72.
 */
export function CapacityGlyph({ kind, active }: Props) {
  const stroke = active ? ON : OFF;
  const line = { fill: "none", stroke, strokeWidth: 3, strokeLinecap: "round" as const };
  const loop = { repeat: Infinity, ease: "easeInOut" as const };

  let body: React.ReactNode = null;
  switch (kind) {
    case "forca": {
      // Bloco pesado empurrado do chão para cima
      const y = active ? 10 : 40;
      const spring = { type: "spring" as const, stiffness: 200, damping: 13 };
      body = (
        <>
          <line x1={8} y1={68} x2={112} y2={68} {...line} stroke={TRACK} />
          <motion.line x1={42} x2={42} y1={68} y2={y + 10} {...line} initial={false} animate={{ y2: y + 10 }} transition={spring} />
          <motion.line x1={78} x2={78} y1={68} y2={y + 10} {...line} initial={false} animate={{ y2: y + 10 }} transition={spring} />
          <motion.rect x={22} y={y} width={76} height={10} fill={stroke} initial={false} animate={{ y }} transition={spring} />
        </>
      );
      break;
    }
    case "mobilidade": {
      // Segmento que gira em torno da articulação e desenha a amplitude
      const end = active ? ARC.map((p) => p.x) : ARC[0].x;
      const endY = active ? ARC.map((p) => p.y) : ARC[0].y;
      body = (
        <>
          <path d="M 104 62 A 44 44 0 0 0 16 62" fill="none" stroke={TRACK} strokeWidth={3} strokeDasharray="3 6" />
          <motion.path
            d="M 104 62 A 44 44 0 0 0 16 62"
            {...line}
            initial={false}
            animate={{ pathLength: active ? 1 : 0.02 }}
            transition={{ duration: 1, ease: SNAP }}
          />
          <motion.line
            x1={60}
            y1={62}
            x2={ARC[0].x}
            y2={ARC[0].y}
            {...line}
            strokeWidth={4}
            initial={false}
            animate={{ x2: end, y2: endY }}
            transition={{ duration: 1, ease: SNAP }}
          />
          <circle cx={60} cy={62} r={6} fill={stroke} />
        </>
      );
      break;
    }
    case "estabilidade": {
      // Plataforma que oscila e se estabiliza sobre o apoio
      const a = active ? [40, 26, 50, 34, 44, 40] : 40;
      const b = active ? [40, 54, 30, 46, 36, 40] : 40;
      const t = { duration: 1.4, ease: "easeOut" as const };
      body = (
        <>
          <line x1={8} y1={68} x2={112} y2={68} {...line} stroke={TRACK} />
          <path d="M 60 44 L 48 68 H 72 Z" fill={stroke} />
          <motion.line x1={14} x2={106} y1={40} y2={40} {...line} strokeWidth={4} initial={false} animate={{ y1: a, y2: b }} transition={t} />
          <motion.rect x={52} y={22} width={16} height={16} fill={stroke} initial={false} animate={{ y: active ? [22, 14, 26, 18, 23, 22] : 22 }} transition={t} />
        </>
      );
      break;
    }
    case "coordenacao": {
      // Dois pontos em trajetórias cruzadas, sincronizados
      const xs = [10, 35, 60, 85, 110];
      const t = active ? { duration: 1.3, ...loop, repeatType: "reverse" as const } : { duration: 0.4 };
      body = (
        <>
          <path d="M 10 12 C 50 12 70 60 110 60 M 10 60 C 50 60 70 12 110 12" fill="none" stroke={active ? "rgba(248,120,31,0.35)" : TRACK} strokeWidth={2} />
          <motion.circle r={7} fill={stroke} cx={10} cy={12} initial={false} animate={active ? { cx: xs, cy: [12, 18, 36, 54, 60] } : { cx: 10, cy: 12 }} transition={t} />
          <motion.circle r={7} fill="none" stroke={stroke} strokeWidth={3} cx={10} cy={60} initial={false} animate={active ? { cx: xs, cy: [60, 54, 36, 18, 12] } : { cx: 10, cy: 60 }} transition={t} />
        </>
      );
      break;
    }
    case "resistencia": {
      // Onda longa que continua em frente
      body = (
        <>
          <path d="M 4 36 C 16 10 28 10 40 36 C 52 62 64 62 76 36 C 88 10 100 10 116 36" fill="none" stroke={TRACK} strokeWidth={3} />
          <motion.path
            d="M 4 36 C 16 10 28 10 40 36 C 52 62 64 62 76 36 C 88 10 100 10 116 36"
            {...line}
            strokeDasharray="14 10"
            initial={false}
            animate={active ? { strokeDashoffset: [0, -48] } : { strokeDashoffset: 0 }}
            transition={active ? { duration: 0.9, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
          />
        </>
      );
      break;
    }
    case "potencia": {
      // Linhas de velocidade + diagonal que dispara (eco do símbolo AURUM)
      body = (
        <>
          {[20, 34, 48].map((y, i) => (
            <motion.line
              key={y}
              y1={y}
              y2={y}
              x1={22 + i * 6}
              x2={48 - i * 4}
              {...line}
              initial={false}
              animate={active ? { x1: [36, 4 + i * 4], x2: [50, 54 - i * 6] } : { x1: 22 + i * 6, x2: 48 - i * 4 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: SNAP }}
            />
          ))}
          <motion.path
            d="M 58 66 L 112 10 M 88 10 H 112 V 34"
            {...line}
            strokeWidth={4}
            initial={false}
            animate={{ pathLength: active ? 1 : 0.55 }}
            transition={{ duration: 0.5, ease: SNAP }}
          />
        </>
      );
      break;
    }
  }

  return (
    <svg aria-hidden viewBox="0 0 120 72" className="h-14 w-24 shrink-0 overflow-visible md:h-[4.5rem] md:w-32">
      {body}
    </svg>
  );
}
