"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { definition } from "@/content/aurum";
import { CapacityGlyph } from "@/components/ui/CapacityGlyph";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn, EASE_OUT } from "@/lib/utils";

const CAPS = definition.capacities;

export function FunctionalDefinition() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(list, { amount: 0.35 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);
  const active = hovered ?? auto;

  // Sem interação, as capacidades se acendem em sequência enquanto a lista está visível
  useEffect(() => {
    if (reduce || !inView || hovered !== null) return;
    const t = setInterval(() => setAuto((a) => (a + 1) % CAPS.length), 1900);
    return () => clearInterval(t);
  }, [reduce, inView, hovered]);

  // "CIRCUITO." é riscado, empurrado e esvaziado pelo scroll
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: word.current, start: "top 80%", end: "bottom 25%", scrub: 0.5 },
        });
        tl.fromTo("[data-strike]", { scaleX: 0 }, { scaleX: 1, ease: "power3.inOut", duration: 0.3 })
          .to("[data-struck]", { xPercent: 22, skewX: -14, opacity: 0.16, ease: "power2.in", duration: 0.5 }, 0.3)
          .to("[data-strike]", { xPercent: 22, ease: "power2.in", duration: 0.5 }, 0.3)
          .fromTo("[data-system]", { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "power3.out", duration: 0.35 }, 0.55);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="funcional" data-section aria-labelledby="definicao-title" className="relative overflow-hidden bg-ink pt-20 pb-24 md:pt-28 md:pb-32">
      {/* A linha que saiu do manifesto entra pela direita e desce até o título */}
      <ScrollLine d="M 101 0 C 88 4 80 10 70 18" className="glow inset-x-0 top-0 h-40 w-full" start="top 90%" end="top 30%" strokeWidth={3} />

      <div className="container-x">
        <SectionLabel index="03">{definition.label}</SectionLabel>

        <h2 id="definicao-title" className="display mt-10">
          <RevealText as="span" lines={definition.title} className="t-xl block" />
          <span ref={word} className="relative mt-1 block w-fit">
            <span data-struck className="t-mega block pr-[0.1em] text-bone">
              {definition.struck}
            </span>
            <span
              data-strike
              aria-hidden
              className="t-mega absolute left-[-3%] top-[44%] block h-[0.12em] w-[106%] origin-left bg-orange shadow-[0_0_30px_rgba(248,120,31,0.6)]"
            />
          </span>
        </h2>

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p data-system className="text-2xl font-bold leading-snug text-bone md:text-3xl">
              {definition.lead}
            </p>
            <motion.p
              className="mt-6 text-lg leading-relaxed text-bone/70"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
            >
              {definition.body}
            </motion.p>
            <p className="eyebrow mt-10 hidden text-muted md:block">{definition.capacitiesHint}</p>
          </div>

          <ul ref={list} className="grid border-t border-l border-line sm:grid-cols-2 lg:col-span-8" onPointerLeave={() => setHovered(null)}>
            {CAPS.map((c, i) => {
              const on = active === i;
              return (
                <motion.li
                  key={c.key}
                  className="border-r border-b border-line"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: (i % 2) * 0.08 }}
                >
                  <button
                    type="button"
                    aria-pressed={on}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={() => {
                      setHovered(null);
                      setAuto(i);
                    }}
                    className={cn(
                      "relative flex h-full min-h-40 w-full flex-col justify-between gap-5 overflow-hidden p-6 text-left transition-colors duration-300 md:min-h-48 md:p-8",
                      on ? "bg-graphite-2" : "bg-transparent",
                    )}
                  >
                    {/* número grande ao fundo, aparece no item ativo */}
                    <span
                      aria-hidden
                      className={cn(
                        "display pointer-events-none absolute -right-2 -bottom-6 text-[7rem] leading-none text-orange/10 transition-all duration-500 ease-[var(--ease-out-expo)]",
                        on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="relative flex w-full items-start justify-between gap-4">
                      <span className={cn("text-xs font-semibold tracking-[0.3em] tabular-nums", on ? "text-orange" : "text-bone/40")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <CapacityGlyph kind={c.key} active={on} />
                    </span>
                    <span className="relative">
                      <span
                        className={cn(
                          "display block text-[clamp(1.6rem,2.6vw,2.6rem)] transition-all duration-500 ease-[var(--ease-out-expo)]",
                          on ? "translate-x-2 text-bone" : "text-bone/60",
                        )}
                      >
                        {c.name}
                      </span>
                      <span className={cn("block pt-3 text-sm leading-relaxed transition-colors duration-500 md:text-base", on ? "text-bone/80" : "text-bone/35")}>
                        {c.text}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-0 left-0 h-[3px] w-full origin-left bg-orange transition-transform duration-500 ease-[var(--ease-out-expo)]",
                        on ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
