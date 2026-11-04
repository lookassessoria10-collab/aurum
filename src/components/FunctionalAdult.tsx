"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { functionalAdult } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { EASE_OUT } from "@/lib/utils";

// A linha vira trajetória corporal: desce (agachar), sobe (saltar) e aterrissa.
const BODY_PATH = "M 102 6 C 88 8 82 46 68 54 C 58 60 52 40 46 22 C 40 4 30 4 25 22 C 21 36 12 42 -2 42";

export function FunctionalAdult() {
  const motionOk = useMediaQuery(MQ.motion);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const words = functionalAdult.movements;

  // Palavras de movimento entram e saem rapidamente enquanto o palco está fixo
  useGSAP(
    () => {
      if (!motionOk || !stage.current) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: stage.current, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });
      const items = gsap.utils.toArray<HTMLElement>("[data-move]");
      items.forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        tl.fromTo(
          el,
          { xPercent: 110 * dir, skewX: -24 * dir, opacity: 0 },
          { xPercent: 0, skewX: 0, opacity: 1, duration: 0.45, ease: "power4.out" },
          i,
        )
          .fromTo(el.querySelector("[data-uline]"), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.out" }, i + 0.15)
          .to(el, { xPercent: -110 * dir, skewX: 24 * dir, opacity: 0, duration: 0.45, ease: "power4.in" }, i + 0.6);
      });
      tl.fromTo("[data-move-bar]", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: items.length + 0.1 }, 0);
    },
    { scope: root, dependencies: [motionOk], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="vida-real" data-section aria-labelledby="vida-real-title" className="relative overflow-x-clip bg-ink">
      <div className="relative pt-20 pb-12 container-x md:pt-28">
        <ScrollLine d={BODY_PATH} className="inset-x-0 top-0 h-[70%] w-full" start="top 85%" end="center 30%" strokeWidth={3} head />

        <div className="relative grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <SectionLabel index="07">{functionalAdult.label}</SectionLabel>
            <RevealText id="vida-real-title" lines={functionalAdult.title} className="display t-xl mt-10" />
            <div className="mt-10 max-w-lg space-y-3 text-lg leading-relaxed text-bone/70 md:text-xl">
              {functionalAdult.subtitle.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.1 }}
                  className={i === 1 ? "text-bone" : undefined}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
          <AnimatedImage
            photo={functionalAdult.photo}
            sizes="(min-width: 1024px) 34vw, 90vw"
            className="aspect-square w-full max-w-md justify-self-end lg:col-span-5 lg:max-w-none"
          />
        </div>
      </div>

      {/* Padrões de movimento */}
      {motionOk ? (
        <div ref={stage} className="relative h-[200vh]">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <p className="eyebrow absolute top-24 left-0 text-muted container-x">Padrões fundamentais do movimento</p>
            <ul className="relative h-[1em] w-full t-word">
              {words.map((w, i) => (
                <li key={w} data-move className="display absolute inset-x-0 top-0 flex items-baseline justify-center gap-[0.15em] opacity-0">
                  <span className="text-[0.16em] not-italic font-sans font-bold tracking-[0.3em] text-orange">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={i % 3 === 2 ? "relative text-orange" : "relative"}>
                    {w}
                    <span data-uline aria-hidden className="glow absolute -bottom-[0.06em] left-0 h-[0.07em] w-full origin-left bg-orange" />
                  </span>
                </li>
              ))}
            </ul>
            <span aria-hidden className="absolute bottom-16 left-1/2 h-[2px] w-[min(60vw,520px)] -translate-x-1/2 bg-bone/10">
              <span data-move-bar className="absolute inset-0 origin-left bg-orange" />
            </span>
          </div>
        </div>
      ) : (
        <ul className="flex flex-wrap gap-x-8 gap-y-2 py-16 container-x">
          {words.map((w, i) => (
            <li key={w} className={i % 3 === 2 ? "display t-lg text-orange" : "display t-lg"}>
              {w}
            </li>
          ))}
        </ul>
      )}

      {/* Capacidades aplicadas à vida */}
      <div className="py-16 container-x md:py-24">
        <ul className="border-b border-line">
          {functionalAdult.capacities.map((c, i) => (
            <motion.li
              key={c.strong}
              className="group relative flex flex-wrap items-baseline gap-x-5 border-t border-line py-5 md:py-6"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.05 }}
            >
              <span className="text-xs font-semibold tracking-[0.3em] text-bone/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-[clamp(1.9rem,5vw,5rem)] text-orange transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-3">
                {c.strong}
              </span>
              <span className="text-[clamp(1.2rem,2.6vw,2.4rem)] font-medium text-bone/85">{c.rest}</span>
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-orange transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            </motion.li>
          ))}
        </ul>

        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12">
          <AnimatedImage
            photo={functionalAdult.photoSecondary}
            sizes="(min-width: 1024px) 30vw, 70vw"
            accent="left"
            className="aspect-[4/5] w-1/2 max-w-xs lg:col-span-3 lg:w-full"
          />
          <RevealText lines={functionalAdult.closing} as="p" className="display t-lg self-end lg:col-span-8 lg:col-start-5" stagger={0.14} />
        </div>
      </div>
    </section>
  );
}
