"use client";

import { motion } from "motion/react";
import { team } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EASE_OUT } from "@/lib/utils";

/** Nome (quando houver) e papel, com o mesmo peso para os dois sócios. */
export function PartnerCaption({ name, credential, delay = 0 }: { name: string; credential: string; delay?: number }) {
  return (
    <motion.figcaption
      className="mt-5 flex items-start gap-3"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      <span aria-hidden className="mt-[0.45em] h-[3px] w-6 shrink-0 -skew-x-[30deg] bg-orange" />
      <span className="flex flex-col gap-1">
        {name && <span className="display text-[clamp(1.2rem,2.2vw,2rem)]">{name}</span>}
        <span className="eyebrow text-bone/70">
          {team.role}
          {credential && <span className="text-muted"> · {credential}</span>}
        </span>
      </span>
    </motion.figcaption>
  );
}

/** Os dois sócios lado a lado, mesmo tamanho e mesmo tratamento. */
export function Founders() {
  return (
    <section id="equipe" data-section aria-labelledby="equipe-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <ScrollLine d="M -2 30 C 30 26 44 46 50 60 C 56 74 74 82 102 78" className="inset-0 h-full w-full" start="top 75%" end="bottom 60%" />

      <div className="relative container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <SectionLabel index="07">{team.label}</SectionLabel>
            <RevealText id="equipe-title" lines={team.title} className="display mt-10 text-[clamp(2.2rem,5.6vw,6rem)]" stagger={0.1} />
          </div>
          <motion.div
            className="max-w-md space-y-4 lg:col-span-5 lg:pb-3"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <p className="text-2xl font-bold leading-snug text-bone md:text-3xl">{team.lead}</p>
            <p className="text-lg leading-relaxed text-bone/70">{team.text}</p>
          </motion.div>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1120px] grid-cols-2 gap-3 sm:gap-5 md:mt-20 lg:gap-8">
          {team.partners.map((p, i) => (
            <figure key={p.key} className="group">
              <AnimatedImage
                photo={p.portrait}
                sizes="(min-width: 1024px) 560px, 50vw"
                mono={false}
                accent={false}
                position={p.position}
                zoom={p.zoom}
                delay={i * 0.12}
                className="aspect-[3/4] w-full"
              />
              <PartnerCaption name={p.name} credential={p.credential} delay={0.3 + i * 0.12} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
