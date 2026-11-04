"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { kids } from "@/content/aurum";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

type Pt = [number, number];

// Três arranjos do circuito (x, y em %). Mesma ordem de estações em cada um.
const WIDE: Pt[][] = [
  [[8, 70], [24, 28], [42, 66], [58, 24], [76, 62], [92, 26]],
  [[10, 30], [28, 72], [46, 34], [62, 76], [78, 38], [90, 74]],
  [[12, 52], [30, 20], [38, 78], [60, 50], [74, 18], [90, 60]],
];
const TALL: Pt[][] = [
  [[22, 8], [74, 22], [26, 40], [76, 56], [24, 74], [72, 92]],
  [[74, 8], [24, 24], [70, 40], [28, 58], [76, 74], [30, 92]],
  [[50, 6], [20, 28], [78, 40], [36, 60], [70, 78], [26, 94]],
];

/** Marcadores geométricos: escada, trave, cone, quadrado, barreira, arco. */
function Marker({ kind, on }: { kind: number; on: boolean }) {
  const s = on ? "var(--color-orange)" : "var(--color-bone)";
  const p = { fill: "none", stroke: s, strokeWidth: 3 };
  return (
    <svg aria-hidden viewBox="0 0 40 40" className="size-11 transition-transform duration-300 md:size-16">
      {kind === 0 && (
        <g {...p}>
          <path d="M10 4 V36 M30 4 V36" />
          <path d="M10 12 H30 M10 20 H30 M10 28 H30" />
        </g>
      )}
      {kind === 1 && (
        <g {...p}>
          <path d="M4 30 H36" />
          <circle cx={20} cy={20} r={5} fill={s} />
        </g>
      )}
      {kind === 2 && <path d="M20 5 L34 34 H6 Z" {...p} />}
      {kind === 3 && <rect x={8} y={8} width={24} height={24} {...p} transform="rotate(12 20 20)" />}
      {kind === 4 && <path d="M6 34 V12 H34 V34" {...p} />}
      {kind === 5 && <circle cx={20} cy={20} r={14} {...p} />}
    </svg>
  );
}

/**
 * Circuito de movimento: as estações se reorganizam (saltando) e um ponto laranja
 * percorre o caminho. Reorganiza sozinho enquanto visível; botão para o usuário.
 */
export function KidsCircuit() {
  const reduce = useReducedMotion();
  const tall = useMediaQuery("(max-width: 767px)");
  const layouts = tall ? TALL : WIDE;
  const [layout, setLayout] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.4 });

  const pts = layouts[layout % layouts.length];
  const d = "M " + pts.map(([x, y]) => `${x} ${y}`).join(" L ");

  useEffect(() => {
    if (reduce || !inView || paused) return;
    const t = setInterval(() => setLayout((l) => (l + 1) % 3), 3600);
    return () => clearInterval(t);
  }, [reduce, inView, paused]);

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow text-muted">{kids.circuitLabel}</p>
        <button
          type="button"
          onClick={() => setLayout((l) => (l + 1) % 3)}
          className="group flex min-h-11 items-center gap-3 border border-bone/25 px-5 text-[0.68rem] font-bold uppercase tracking-[0.24em] transition-colors hover:border-orange hover:text-orange"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 transition-transform duration-500 group-hover:rotate-180">
            <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" strokeWidth={2} />
          </svg>
          {kids.circuitShuffle}
        </button>
      </div>

      <div
        ref={box}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative aspect-[3/4] w-full border border-line bg-ink/60 md:aspect-[16/7]"
      >
        {/* piso com linhas diagonais */}
        <div aria-hidden className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(-60deg,transparent_0_22px,rgba(244,244,244,0.06)_22px_23px)]" />

        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <motion.path
            d={d}
            animate={{ d }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            fill="none"
            stroke="var(--color-orange)"
            strokeWidth={2.5}
            strokeDasharray="10 8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* ponto que percorre o circuito */}
        {!reduce && (
          <motion.span
            key={`${tall}-${layout}`}
            aria-hidden
            className="absolute z-10 size-6 -translate-x-1/2 -translate-y-1/2 bg-orange shadow-[0_0_28px_rgba(248,120,31,0.9)]"
            style={{ clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)" }}
            initial={{ left: `${pts[0][0]}%`, top: `${pts[0][1]}%` }}
            animate={{ left: pts.map((p) => `${p[0]}%`), top: pts.map((p) => `${p[1]}%`) }}
            transition={{ duration: 3.2, ease: "easeInOut", delay: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
          />
        )}

        <ol className="absolute inset-0">
          {kids.stations.map((name, i) => {
            const [x, y] = pts[i];
            const on = hovered === i;
            return (
              <motion.li
                key={name}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                initial={false}
                animate={{ left: `${x}%`, top: `${y}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.04 }}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                <motion.div
                  className="flex flex-col items-center gap-2"
                  animate={reduce ? undefined : { y: [0, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                  key={layout}
                >
                  <Marker kind={i} on={on} />
                  <span
                    className={cn(
                      "max-w-[10rem] text-center text-[0.6rem] font-bold leading-tight tracking-[0.2em] transition-colors md:text-xs",
                      on ? "text-orange" : "text-bone/85",
                    )}
                  >
                    {name}
                  </span>
                </motion.div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
