"use client";

import { motion } from "motion/react";
import { phases } from "@/content/aurum";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EASE_OUT } from "@/lib/utils";

// Adulto: uma trajetória ampla e contínua. Kids: vários quiques curtos e exploratórios.
const ADULT = "M 0 90 C 30 90 40 10 70 12 C 86 13 94 40 100 60";
const KIDS = "M 0 90 Q 8 40 16 90 Q 24 52 32 90 Q 40 30 48 90 Q 56 60 64 90 Q 72 36 80 90 Q 88 56 96 90 L 100 90";

export function Phases() {
  return (
    <section id="fases" data-section aria-labelledby="fases-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="container-x">
        <SectionLabel index="10">{phases.label}</SectionLabel>
        <h2 id="fases-title" className="sr-only">
          {phases.heading}
        </h2>
      </div>

      <div className="relative mt-10 grid md:grid-cols-2">
        {/* Divisória diagonal desenhada pelo scroll */}
        <ScrollLine d="M 56 0 L 44 100" className="inset-0 hidden h-full w-full md:block" start="top 75%" end="bottom 60%" strokeWidth={1.5} />

        {phases.columns.map((col, i) => (
          <motion.article
            key={col.name}
            className="relative px-4 py-12 md:px-10 md:py-16 xl:px-16"
            initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.1 }}
          >
            <div className="relative h-36 md:h-48">
              <ScrollLine
                d={i === 0 ? ADULT : KIDS}
                className="inset-0 h-full w-full"
                strokeWidth={i === 0 ? 4 : 3}
                color={i === 0 ? "var(--color-bone)" : "var(--color-orange)"}
                start="top 85%"
                end="top 40%"
                head
              />
            </div>
            <h3 className={i === 0 ? "display mt-8 text-[clamp(1.9rem,4.4vw,4.6rem)]" : "display mt-8 text-[clamp(1.9rem,4.4vw,4.6rem)] text-orange"}>{col.name}</h3>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-bone/75">{col.text}</p>
            {i === 0 && <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-line md:hidden" />}
          </motion.article>
        ))}
      </div>

      <div className="mt-14 text-center container-x md:mt-20">
        <RevealText as="p" lines={phases.center} className="display t-md mx-auto max-w-5xl" stagger={0.12} />
      </div>
    </section>
  );
}
