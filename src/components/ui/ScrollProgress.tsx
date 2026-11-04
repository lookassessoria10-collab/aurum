"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { sectionNames } from "@/content/aurum";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Barra de progresso vertical na borda direita + indicador editorial da seção atual.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState({ index: 1, id: "topo" });
  const total = Object.keys(sectionNames).length;

  useGSAP(() => {
    gsap.fromTo(
      bar.current,
      { scaleY: 0 },
      { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
    );
  });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setCurrent({ index: sections.indexOf(el) + 1, id: el.id });
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden w-10 md:block">
      <div className="absolute right-4 top-24 bottom-24 w-px bg-bone/10">
        <div ref={bar} className="absolute inset-0 origin-top bg-orange" style={{ transform: "scaleY(0)" }} />
      </div>
      <div className="fixed bottom-6 left-10 hidden items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-bone/60 lg:flex">
        <span className="tabular-nums text-orange">{pad(current.index)}</span>
        <span className="tabular-nums">/ {pad(total)}</span>
        <span className="h-px w-6 bg-bone/30" />
        <span className="relative h-4 w-56 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current.id}
              className="absolute inset-0"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {sectionNames[current.id] ?? ""}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}
