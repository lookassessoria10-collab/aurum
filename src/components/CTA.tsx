"use client";

import { motion } from "motion/react";
import { contactHref, WHATSAPP_URL } from "@/config/site";
import { cta, team } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EASE_SNAP } from "@/lib/utils";

// Na seção dos sócios a ordem é A–B; aqui inverte para B–A, mantendo o equilíbrio.
const PAIR = [...team.partners].reverse();

export function CTA() {
  const href = contactHref();
  return (
    <section id="contato" data-section aria-labelledby="contato-title" className="relative overflow-hidden bg-ink py-24 md:py-32">
      {/* Bloco laranja diagonal que entra pelo canto, como nas peças da marca */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] bottom-0 h-[38%] w-[55%] bg-orange md:h-[50%] md:w-[44%]"
        initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
        whileInView={{ clipPath: "polygon(38% 0, 100% 0, 100% 100%, 0 100%)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: EASE_SNAP, delay: 0.3 }}
      />
      <ScrollLine d="M 0 30 C 30 30 46 54 62 60 C 74 64 80 70 86 78" className="inset-0 h-full w-full" start="top 80%" end="center 40%" strokeWidth={3} head />

      <div className="relative grid gap-14 container-x lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-7">
          <SectionLabel index="14">{cta.label}</SectionLabel>
          <RevealText id="contato-title" lines={cta.title} className="display mt-10 text-[clamp(1.7rem,7vw,7.5rem)]" stagger={0.1} />
          <p className="mt-10 max-w-md text-lg leading-relaxed text-bone/75 md:text-xl">{cta.text}</p>

          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <MagneticButton href={href}>{cta.primary}</MagneticButton>
            <MagneticButton href={href} variant="ghost" className="bg-ink">
              {cta.secondary}
            </MagneticButton>
          </div>
          {!WHATSAPP_URL && <p className="mt-6 text-xs tracking-wide text-muted">{cta.pendingNote}</p>}
        </div>

        {/* os dois sócios, sorrindo, com o mesmo tamanho */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
          {PAIR.map((p, i) => (
            <AnimatedImage
              key={p.key}
              photo={p.smile}
              sizes="(min-width: 1024px) 20vw, 50vw"
              mono={false}
              accent={false}
              position={p.position}
              zoom={p.zoom}
              delay={0.15 + i * 0.12}
              className="aspect-[3/4] w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
