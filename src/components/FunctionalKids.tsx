"use client";

import { motion } from "motion/react";
import { kids } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { BrandSymbol } from "@/components/ui/Brand";
import { KidsCircuit } from "@/components/KidsCircuit";
import { KineticText } from "@/components/ui/KineticText";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EASE_OUT } from "@/lib/utils";

// Linhas mais nervosas: zigue-zague com quiques curtos
const ZIGZAG = "M -2 20 L 12 8 L 20 26 L 30 10 L 38 30 L 50 12 L 58 34 L 70 14 L 80 36 L 92 18 L 102 30";

/** O símbolo oficial saltando ao lado do título: mais energia sem virar visual infantil. */
function HoppingSymbol() {
  return (
    <motion.span
      aria-hidden
      className="mb-[0.1em] inline-block w-[0.9em] shrink-0"
      animate={{ y: ["0em", "-0.34em", "0em", "-0.12em", "0em"] }}
      transition={{ duration: 1.1, times: [0, 0.35, 0.62, 0.8, 1], ease: "easeOut", repeat: Infinity, repeatDelay: 0.5 }}
    >
      <BrandSymbol className="h-auto w-full" />
    </motion.span>
  );
}

export function FunctionalKids() {
  return (
    <section id="kids" data-section aria-labelledby="kids-title" className="relative overflow-hidden bg-[#0f0f0f]">
      <div className="relative pt-20 pb-8 container-x md:pt-28">
        <ScrollLine d={ZIGZAG} className="glow inset-x-0 top-6 h-40 w-full md:h-52" start="top 85%" end="top 25%" strokeWidth={3} head />
        <SectionLabel index="09">{kids.label}</SectionLabel>
        <RevealText lines={kids.preTitle} as="p" className="display t-lg mt-10" from="left" stagger={0.05} />
      </div>

      <KineticText words={kids.stations} from={0} to={-55} outline className="py-2 text-[clamp(3rem,9vw,9rem)] text-orange/70" />

      <div className="grid gap-12 pt-14 pb-16 container-x lg:grid-cols-12 lg:items-end lg:gap-8 md:pt-20">
        <div className="lg:col-span-7">
          <h2 id="kids-title" className="display flex items-end gap-[0.15em] text-[clamp(2.6rem,7vw,8rem)]">
            <RevealText as="span" lines={kids.title} className="block" stagger={0.06} />
            <HoppingSymbol />
          </h2>
          <div className="mt-10 max-w-md space-y-4 text-lg leading-relaxed text-bone/75 md:text-xl">
            {kids.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                className={i === 0 ? "font-bold text-bone" : undefined}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.06 }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
        <AnimatedImage
          photo={kids.photos.hurdles}
          sizes="(min-width: 1024px) 38vw, 90vw"
          mono={false}
          accent={false}
          className="aspect-[4/5] w-full max-w-md justify-self-end lg:col-span-5 lg:max-w-none"
        />
      </div>

      {/* turma no circuito: faixa larga, no formato original da foto */}
      <div className="pb-16 container-x md:pb-24">
        <AnimatedImage photo={kids.photos.group} sizes="100vw" mono={false} accent={false} delay={0.1} className="aspect-[16/9] w-full md:aspect-[2/1]" />
        <p className="eyebrow mt-5 flex items-center gap-3 text-muted">
          <span aria-hidden className="h-[3px] w-6 -skew-x-[30deg] bg-orange" />
          {kids.groupCaption}
        </p>
      </div>

      <motion.div
        className="pb-20 container-x md:pb-28"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <KidsCircuit />
      </motion.div>
    </section>
  );
}
