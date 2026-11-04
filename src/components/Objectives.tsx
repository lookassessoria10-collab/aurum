"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { objectives } from "@/content/aurum";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn, EASE_OUT, EASE_SNAP } from "@/lib/utils";

const ITEMS = objectives.items;

/**
 * Desktop: um único palco fixo; o scroll troca número e mensagem (01 → 02 → 03).
 * Mobile e movimento reduzido: lista simples, sem fixar a tela.
 */
export function Objectives() {
  const staged = useMediaQuery(MQ.desktop);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!staged) return;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const next = Math.min(ITEMS.length - 1, Math.floor(self.progress * ITEMS.length * 0.999));
          setActive((cur) => (cur === next ? cur : next));
        },
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [staged], revertOnUpdate: true },
  );

  const item = ITEMS[active];

  if (!staged) {
    return (
      <section id="objetivos" data-section aria-labelledby="objetivos-title" className="relative bg-ink py-20 container-x md:py-28">
        <SectionLabel index="05">{objectives.label}</SectionLabel>
        <RevealText id="objetivos-title" lines={objectives.title} className="display t-lg mt-10 max-w-[16ch]" />
        <ol className="mt-14">
          {ITEMS.map((it) => (
            <li key={it.n} className="border-t border-line py-12">
              <p aria-hidden className="display text-[clamp(4rem,22vw,8rem)] leading-none text-orange">
                {it.n}
              </p>
              <RevealText lines={[it.title[0], { text: it.title[1], accent: true }]} as="h3" className="display t-lg mt-6" from="left" />
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-bone/70">{it.text}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={root} id="objetivos" data-section aria-labelledby="objetivos-title" className="relative h-[180vh] bg-ink">
      <div className="sticky top-0 grid h-screen grid-cols-12 gap-8 overflow-hidden pt-28 pb-14 container-x">
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <SectionLabel index="05">{objectives.label}</SectionLabel>
            <RevealText id="objetivos-title" lines={objectives.title} className="display mt-8 text-[clamp(2rem,3.6vw,4rem)]" />
          </div>
          <div aria-hidden className="relative h-[clamp(9rem,19vw,18rem)] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={item.n}
                className="display absolute bottom-0 left-0 block text-[clamp(9rem,19vw,18rem)] leading-[0.9] text-orange"
                initial={{ y: "105%", skewX: -10 }}
                animate={{ y: "0%", skewX: 0 }}
                exit={{ y: "-105%", skewX: 10 }}
                transition={{ duration: 0.6, ease: EASE_SNAP }}
              >
                {item.n}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative col-span-7 flex flex-col justify-end border-l border-line pl-12">
          {/* linha vertical de progresso */}
          <span aria-hidden className="absolute -left-px top-0 w-[3px] bg-orange transition-[height] duration-700 ease-[var(--ease-out-expo)]" style={{ height: `${((active + 1) / ITEMS.length) * 100}%` }} />
          <ol className="mb-auto flex gap-6 pt-2">
            {ITEMS.map((it, i) => (
              <li key={it.n} className={cn("text-xs font-semibold tracking-[0.3em] tabular-nums transition-colors duration-500", i === active ? "text-orange" : "text-bone/30")}>
                {it.n}
              </li>
            ))}
          </ol>
          {/* Leitores de tela recebem as três mensagens de uma vez */}
          <ol className="sr-only">
            {ITEMS.map((it) => (
              <li key={it.n}>
                <h3>
                  {it.title[0]} {it.title[1]}
                </h3>
                <p>{it.text}</p>
              </li>
            ))}
          </ol>
          <div aria-hidden className="relative min-h-[50vh]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={item.n}
                className="absolute inset-x-0 bottom-0"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <p className="display t-lg">
                  <span className="block">{item.title[0]}</span>
                  <span className="block text-orange">{item.title[1]}</span>
                </p>
                <p className="mt-8 max-w-lg text-xl leading-relaxed text-bone/75">{item.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
