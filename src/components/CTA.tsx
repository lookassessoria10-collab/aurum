"use client";

import { motion } from "motion/react";
import { cta, team } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { InstagramLink } from "@/components/ui/InstagramLink";
import { PartnerWhatsApp } from "@/components/ui/PartnerWhatsApp";
import { RevealText } from "@/components/ui/RevealText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EASE_SNAP } from "@/lib/utils";

export function CTA() {
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

          <ul className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
            {team.partners.map((partner) => (
              <li key={partner.key}>
                <PartnerWhatsApp partner={partner} />
              </li>
            ))}
            <li className="sm:col-span-2">
              <InstagramLink />
            </li>
          </ul>
        </div>

        {/* os dois sócios, sorrindo, mesmo tamanho e mesma ordem da seção "Quem conduz" */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
          {team.partners.map((p, i) => (
            <figure key={p.key}>
              <AnimatedImage
                photo={p.smile}
                sizes="(min-width: 1024px) 20vw, 50vw"
                mono={false}
                accent={false}
                position={p.position}
                zoom={p.zoom}
                delay={0.15 + i * 0.12}
                className="aspect-[3/4] w-full"
              />
              <figcaption className="mt-3 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-bone/80 sm:text-[0.68rem]">
                <span aria-hidden className="h-[3px] w-4 shrink-0 -skew-x-[30deg] bg-orange" />
                {p.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
