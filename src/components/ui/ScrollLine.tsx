"use client";

import { useRef } from "react";
import { scalePath, useElementSize } from "@/lib/geometry";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * Caminho em coordenadas normalizadas 0–100 (x e y), apenas comandos absolutos
   * M, L, C, Q. É convertido para pixels reais para o traço não deformar.
   */
  d: string;
  className?: string;
  strokeWidth?: number;
  /** Elemento que controla o desenho; por padrão a <section> mais próxima */
  trigger?: React.RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  /** Ponto laranja que acompanha a ponta da linha */
  head?: boolean;
  color?: string;
};

/**
 * A linha laranja de movimento. Atravessa as seções e é desenhada pelo scroll.
 * Sem JS ou com movimento reduzido, aparece completa.
 */
export function ScrollLine({
  d,
  className,
  strokeWidth = 2.5,
  trigger,
  start = "top 75%",
  end = "bottom 35%",
  head = false,
  color = "var(--color-orange)",
}: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);
  const size = useElementSize(svg);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const triggerEl = trigger?.current ?? svg.current?.closest("section") ?? svg.current;
        const p = path.current;
        if (!p) return;
        const st = { trigger: triggerEl, start, end, scrub: 0.6 };
        gsap.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: st });
        if (head && dot.current) {
          const total = p.getTotalLength();
          const state = { t: 0 };
          gsap.to(state, {
            t: 1,
            ease: "none",
            scrollTrigger: st,
            onUpdate: () => {
              const pt = p.getPointAtLength(state.t * total);
              dot.current?.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
              dot.current?.setAttribute("opacity", state.t > 0.01 ? "1" : "0");
            },
          });
        }
      });
      return () => mm.revert();
    },
    { dependencies: [size.w, size.h], revertOnUpdate: true },
  );

  return (
    <svg
      ref={svg}
      aria-hidden
      className={cn("pointer-events-none absolute overflow-visible", className)}
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="none"
    >
      <path
        ref={path}
        d={scalePath(d, size.w, size.h)}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={0}
        className={color.includes("orange") ? "glow" : undefined}
      />
      {head && (
        <g ref={dot} opacity={0}>
          <circle r={14} fill="none" stroke={color} strokeOpacity={0.35} />
          <circle r={5.5} fill={color} />
        </g>
      )}
    </svg>
  );
}
