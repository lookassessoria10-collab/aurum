"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { bodySystem } from "@/content/aurum";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { EASE_OUT } from "@/lib/utils";

/*
 * Corpo abstrato em postura de avanço com alcance: articulações (círculos) e
 * segmentos (linhas). No início estão dispersos; o scroll os conecta.
 * Coordenadas no viewBox 0 0 400 600.
 */
const J = {
  head: [214, 64],
  neck: [206, 130],
  shL: [160, 146],
  shR: [252, 140],
  elL: [118, 222],
  elR: [306, 112],
  haL: [96, 298],
  haR: [352, 70],
  core: [200, 258],
  hiL: [172, 330],
  hiR: [232, 336],
  knL: [114, 418],
  knR: [282, 432],
  ftL: [70, 528],
  ftR: [338, 536],
} as const;
type JointKey = keyof typeof J;

// Deslocamento inicial (estado "separado") de cada articulação
const SCATTER: Record<JointKey, [number, number]> = {
  head: [40, -50], neck: [-30, -20], shL: [-90, -30], shR: [80, -60], elL: [-120, 20], elR: [110, -20],
  haL: [-80, 90], haR: [40, -40], core: [0, 0], hiL: [-70, 40], hiR: [90, 30], knL: [-110, 10],
  knR: [120, -20], ftL: [-40, 50], ftR: [60, 40],
};

const BONES: Array<[JointKey, JointKey]> = [
  ["head", "neck"], ["neck", "shL"], ["neck", "shR"], ["shL", "elL"], ["elL", "haL"], ["shR", "elR"],
  ["elR", "haR"], ["neck", "core"], ["shL", "core"], ["shR", "core"], ["core", "hiL"], ["core", "hiR"],
  ["hiL", "hiR"], ["hiL", "knL"], ["knL", "ftL"], ["hiR", "knR"], ["knR", "ftR"],
];

// Rótulos ligados a uma articulação: [joint, texto, posição do rótulo]
const LABELS: Array<{ joint: JointKey; text: string; x: number; y: number; anchor: "start" | "end" }> = [
  { joint: "shR", text: bodySystem.tags[0], x: 530, y: 150, anchor: "end" },
  { joint: "knL", text: bodySystem.tags[1], x: -130, y: 430, anchor: "start" },
  { joint: "knR", text: bodySystem.tags[2], x: 530, y: 410, anchor: "end" },
  { joint: "elL", text: bodySystem.tags[3], x: -130, y: 250, anchor: "start" },
  { joint: "ftR", text: bodySystem.tags[4], x: 530, y: 516, anchor: "end" },
];

export function BodySystem() {
  const root = useRef<HTMLElement>(null);
  const figure = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const build = (trigger: Element | null, start: string, end: string) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: 0.6 } });
        (Object.keys(J) as JointKey[]).forEach((k) => {
          const [dx, dy] = SCATTER[k];
          tl.fromTo(
            `[data-joint="${k}"]`,
            { x: dx, y: dy, opacity: 0.35 },
            { x: 0, y: 0, opacity: 1, ease: "power2.out", duration: 0.45 },
            0,
          );
        });
        tl.fromTo("[data-bone]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.02, duration: 0.25, ease: "none" }, 0.38)
          .fromTo("[data-ground]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "50% 50%", duration: 0.2 }, 0.5)
          .fromTo("[data-label]", { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.12 }, 0.62)
          .fromTo("[data-core-ring]", { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.18 }, 0.78)
          .fromTo("[data-core-text]", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.86);
      };
      mm.add(MQ.desktop, () => build(root.current, "top top", "bottom bottom"));
      mm.add(MQ.mobile, () => build(figure.current, "top 85%", "bottom 55%"));
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="sistema"
      data-section
      aria-labelledby="sistema-title"
      className="relative bg-ink-2 motion-safe:lg:h-[190vh]"
    >
      <div className="grid items-center gap-10 py-24 container-x lg:sticky lg:top-0 lg:h-screen lg:grid-cols-12 lg:gap-8 lg:py-0">
        <div className="lg:col-span-5">
          <SectionLabel index="04">{bodySystem.label}</SectionLabel>
          <RevealText id="sistema-title" lines={bodySystem.title} className="display mt-8 text-[clamp(2.4rem,5.6vw,6rem)]" stagger={0.1} />
          <div className="mt-10 max-w-md space-y-4 text-base leading-relaxed text-bone/70 md:text-lg">
            {bodySystem.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.1 }}
              >
                {p}
              </motion.p>
            ))}
            <motion.p
              className="pt-2 font-semibold text-bone"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
            >
              {bodySystem.closing[0]} <span className="text-orange">{bodySystem.closing[1]}</span>
            </motion.p>
          </div>
        </div>

        <div className="relative lg:col-span-7 lg:h-[88vh]">
          <svg
            ref={figure}
            role="img"
            aria-label={`Representação abstrata do corpo: ${bodySystem.tags.join(", ")} conectadas pelo ${bodySystem.core}.`}
            viewBox="-140 0 680 600"
            className="mx-auto block aspect-[680/600] w-full overflow-visible lg:aspect-auto lg:h-full"
          >
            {/* grade discreta */}
            <g stroke="rgba(244,244,244,0.05)">
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`v${i}`} x1={i * 50 - 100} y1={0} x2={i * 50 - 100} y2={600} />
              ))}
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`h${i}`} x1={-100} y1={i * 50} x2={500} y2={i * 50} />
              ))}
            </g>

            {/* chão */}
            <line data-ground x1={30} y1={556} x2={380} y2={556} stroke="rgba(244,244,244,0.25)" strokeWidth={1} />

            {/* anéis do core */}
            {[34, 58, 86].map((r, i) => (
              <circle key={r} data-core-ring cx={J.core[0]} cy={J.core[1]} r={r} fill="none" stroke="var(--color-orange)" strokeOpacity={0.5 - i * 0.14} strokeDasharray={i === 1 ? "3 6" : undefined} />
            ))}

            {/* segmentos */}
            {BONES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                data-bone
                x1={J[a][0]}
                y1={J[a][1]}
                x2={J[b][0]}
                y2={J[b][1]}
                pathLength={1}
                strokeDasharray="1 1"
                stroke={a === "core" || b === "core" ? "var(--color-orange)" : "rgba(244,244,244,0.75)"}
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}

            {/* rótulos */}
            {LABELS.map((l) => {
              const [jx, jy] = J[l.joint];
              return (
                <g key={l.text} data-label className="max-lg:hidden">
                  <line x1={jx} y1={jy} x2={l.anchor === "end" ? l.x - 4 : l.x + 4} y2={l.y + 8} stroke="rgba(244,244,244,0.3)" strokeDasharray="2 4" />
                  <text x={l.x} y={l.y} textAnchor={l.anchor} className="fill-bone font-sans text-[13px] font-bold tracking-[0.28em]">
                    {l.text}
                  </text>
                </g>
              );
            })}

            {/* articulações */}
            {(Object.keys(J) as JointKey[]).map((k) => (
              <g key={k} data-joint={k}>
                <circle
                  cx={J[k][0]}
                  cy={J[k][1]}
                  r={k === "head" ? 24 : k === "core" ? 16 : 7}
                  fill={k === "core" ? "var(--color-orange)" : "var(--color-ink-2)"}
                  stroke={k === "core" ? "none" : "var(--color-bone)"}
                  strokeWidth={3}
                />
              </g>
            ))}

            <text data-core-text x={J.core[0] + 26} y={J.core[1] + 5} className="display fill-orange text-[22px]">
              {bodySystem.core}
            </text>
          </svg>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:hidden">
            {bodySystem.tags.map((t) => (
              <li key={t} className="text-[0.65rem] font-bold tracking-[0.28em] text-bone/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
