"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { manifesto } from "@/content/aurum";
import { KineticText } from "@/components/ui/KineticText";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { scalePath, useElementSize } from "@/lib/geometry";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn, EASE_OUT } from "@/lib/utils";

// Trajetórias que nascem diferentes e convergem para o mesmo ponto (84, 52).
const PATHS = [
  "M 0 6 C 30 4 52 40 84 52",
  "M 0 22 C 22 32 48 18 84 52",
  "M 0 38 C 26 62 54 60 84 52",
  "M 0 50 C 30 42 60 56 84 52",
  "M 0 64 C 18 38 50 72 84 52",
  "M 0 80 C 34 98 58 48 84 52",
  "M 0 95 C 30 80 64 78 84 52",
];
const EXIT = "M 84 52 C 90 52 95 47 101 38";
const LEAD = 3;

// Palavras posicionadas ao longo das trajetórias (em % do palco)
const WORD_POS = [
  { left: "1rem", top: "-4%" },
  { left: "20%", top: "90%" },
  { left: "44%", top: "8%" },
  { left: "66%", top: "70%" },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const size = useElementSize(svg);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const paths = gsap.utils.toArray<SVGPathElement>("[data-path]", root.current);
        const dots = gsap.utils.toArray<SVGCircleElement>("[data-dot]", root.current);
        const lengths = paths.map((p) => p.getTotalLength());
        const run = { t: 0 };

        const tl = gsap.timeline({
          scrollTrigger: { trigger: stage.current, start: "top 85%", end: "bottom 50%", scrub: 0.6 },
        });
        tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 0.9 }, 0)
          .fromTo(
            run,
            { t: 0 },
            {
              t: 1,
              ease: "none",
              duration: 0.9,
              onUpdate: () => {
                paths.forEach((p, i) => {
                  const pt = p.getPointAtLength(run.t * lengths[i]);
                  dots[i]?.setAttribute("cx", String(pt.x));
                  dots[i]?.setAttribute("cy", String(pt.y));
                });
              },
            },
            0,
          )
          .fromTo("[data-word]", { opacity: 0.1, x: -24 }, { opacity: 1, x: 0, stagger: 0.2, duration: 0.18 }, 0.05)
          .fromTo("[data-meet]", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.14, ease: "back.out(3)" }, 0.88)
          .fromTo("[data-exit]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 0.2 }, 0.95);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [size.w, size.h], revertOnUpdate: true },
  );

  const meet = { x: size.w * 0.84, y: size.h * 0.52 };

  return (
    <section ref={root} id="aurum" data-section aria-labelledby="manifesto-title" className="relative overflow-hidden bg-ink pt-16 pb-16 md:pt-20">
      {/* Tipografia cinética: duas faixas em sentidos opostos */}
      <div className="flex flex-col gap-1 pb-16 md:pb-24">
        <KineticText words={manifesto.kinetic} from={0} to={-45} className="text-[clamp(3.2rem,10vw,10rem)] text-bone" />
        <KineticText words={[...manifesto.kinetic].reverse()} from={-45} to={0} outline className="text-[clamp(3.2rem,10vw,10rem)] text-orange" />
      </div>

      <div className="grid gap-12 container-x lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <SectionLabel index="02">{manifesto.label}</SectionLabel>
          <RevealText id="manifesto-title" lines={manifesto.title} className="display t-lg mt-8" />
        </div>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-bone/75 lg:col-span-5 lg:pt-16 md:text-xl">
          {manifesto.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.08 }}
            >
              {p}
            </motion.p>
          ))}
          <motion.p
            className="mt-4 border-l-2 border-orange pl-5 text-2xl font-bold leading-snug text-bone md:text-3xl"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            {manifesto.principle[0]}
            <span className="mt-2 block text-orange">{manifesto.principle[1]}</span>
          </motion.p>
        </div>
      </div>

      {/* Trajetórias convergentes */}
      <div ref={stage} className="relative mt-16 h-[44vh] min-h-[300px] md:mt-20 md:h-[52vh]">
        <svg ref={svg} aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
          {PATHS.map((d, i) => (
            <path
              key={i}
              data-path
              d={scalePath(d, size.w, size.h)}
              pathLength={1}
              strokeDasharray="1 1"
              fill="none"
              stroke={i === LEAD ? "var(--color-orange)" : "rgba(244,244,244,0.45)"}
              strokeWidth={i === LEAD ? 3 : 1.5}
              className={i === LEAD ? "glow" : undefined}
            />
          ))}
          {PATHS.map((_, i) => (
            <circle key={i} data-dot r={i === LEAD ? 6 : 4} cx={-20} cy={-20} fill={i === LEAD ? "var(--color-orange)" : "var(--color-bone)"} />
          ))}
          <path
            data-exit
            d={scalePath(EXIT, size.w, size.h)}
            pathLength={1}
            strokeDasharray="1 1"
            fill="none"
            stroke="var(--color-orange)"
            strokeWidth={5}
            strokeLinecap="round"
            className="glow"
          />
          <g data-meet>
            <circle cx={meet.x} cy={meet.y} r={46} fill="none" stroke="var(--color-orange)" strokeOpacity={0.2} />
            <circle cx={meet.x} cy={meet.y} r={26} fill="none" stroke="var(--color-orange)" strokeOpacity={0.5} />
            <circle cx={meet.x} cy={meet.y} r={9} fill="var(--color-orange)" />
          </g>
        </svg>
        <ul className="absolute inset-0 container-x" aria-label="Princípios">
          {manifesto.sideWords.map((w, i) => (
            <li
              key={w}
              data-word
              className={cn(
                "display absolute text-[clamp(1rem,1.8vw,1.75rem)]",
                i === manifesto.sideWords.length - 1 ? "text-orange" : "text-bone",
              )}
              style={WORD_POS[i]}
            >
              <span className="mr-2 align-middle font-sans text-[0.55em] not-italic tracking-[0.3em] text-orange">
                {String(i + 1).padStart(2, "0")}
              </span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
