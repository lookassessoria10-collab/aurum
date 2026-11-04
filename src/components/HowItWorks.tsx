"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { howItWorks } from "@/content/aurum";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn, EASE_OUT } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

export function HowItWorks() {
  // Trilha horizontal só no desktop com movimento liberado; senão, lista vertical.
  const horizontal = useMediaQuery(MQ.desktop);
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      if (!horizontal || !pin.current || !track.current) return;
      const trackEl = track.current;
      const pinEl = pin.current;
      const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);
      // A trilha anda mais rápido que o scroll vertical: menos rolagem para o mesmo percurso
      const setHeight = () => {
        pinEl.style.height = `${distance() * 0.55 + window.innerHeight}px`;
      };
      setHeight();
      ScrollTrigger.addEventListener("refreshInit", setHeight);

      const total = howItWorks.steps.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setStep(Math.min(total - 1, Math.floor(self.progress * total * 0.999))),
        },
      });
      tl.to(trackEl, { x: () => -distance(), ease: "none" }, 0).fromTo(
        "[data-track-line]",
        { scaleX: 0 },
        { scaleX: 1, ease: "none" },
        0,
      );

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setHeight);
        pinEl.style.height = "";
      };
    },
    { scope: root, dependencies: [horizontal], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="como-funciona" data-section aria-labelledby="processo-title" className="relative bg-ink">
      <div className="pt-20 pb-10 container-x md:pt-28">
        <SectionLabel index="06">{howItWorks.label}</SectionLabel>
        <h2 id="processo-title" className="display mt-10">
          <RevealText as="span" lines={howItWorks.title} className="t-lg block text-bone/90" />
          <RevealText as="span" lines={[{ text: howItWorks.titleAccent, accent: true }]} className="mt-4 block text-[clamp(2rem,7.6vw,8rem)]" delay={0.25} />
        </h2>
      </div>

      <div ref={pin} className="relative">
        <div className={cn(horizontal && "sticky top-0 flex h-screen flex-col justify-center overflow-hidden")}>
          {horizontal && (
            <div aria-hidden className="absolute top-28 left-0 flex w-full items-center justify-between container-x">
              <span className="eyebrow text-muted">Processo AURUM</span>
              <span className="text-xs font-semibold tracking-[0.3em] tabular-nums text-bone/60">
                <span className="text-orange">{pad(step + 1)}</span> / {pad(howItWorks.steps.length)}
              </span>
            </div>
          )}

          <ol
            ref={track}
            className={cn(
              "relative",
              horizontal ? "flex w-max items-stretch pl-[8vw] pr-[8vw] will-change-transform" : "container-x",
            )}
          >
            {horizontal && (
              <span aria-hidden className="absolute bottom-[-3.5rem] left-[8vw] right-[8vw] h-[2px] bg-bone/10">
                <span data-track-line className="glow absolute inset-0 origin-left bg-orange" />
              </span>
            )}
            {howItWorks.steps.map((s, i) => (
              <li
                key={s.n}
                className={cn(
                  "relative",
                  horizontal ? "flex w-[min(40vw,580px)] shrink-0 items-end gap-6 pr-[3vw]" : "border-t border-line py-14 md:py-20",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "display shrink-0 leading-[0.8] transition-colors duration-500",
                    horizontal ? "text-[clamp(8rem,16vw,16rem)]" : "text-[clamp(5.5rem,26vw,11rem)]",
                    horizontal && i <= step ? "text-orange" : "text-transparent [-webkit-text-stroke:1px_rgba(244,244,244,0.35)]",
                    !horizontal && "text-orange",
                  )}
                >
                  {s.n}
                </span>
                <motion.div
                  className={cn(horizontal ? "pb-4" : "mt-6")}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: EASE_OUT }}
                >
                  <p className="eyebrow text-orange">Etapa {s.n}</p>
                  <h3 className="display t-md mt-3">{s.name}</h3>
                  <p className="mt-4 max-w-xs text-base leading-relaxed text-bone/70 md:text-lg">{s.text}</p>
                </motion.div>
                {horizontal && (
                  <span aria-hidden className={cn("absolute bottom-[-4rem] left-0 size-4 -skew-x-[24deg] border-2 transition-colors duration-500", i <= step ? "border-orange bg-orange" : "border-bone/30 bg-ink")} />
                )}
              </li>
            ))}
            {horizontal && (
              <li className="flex w-[min(52vw,760px)] shrink-0 flex-col justify-end pl-[2vw]">
                <p className="text-2xl font-medium text-bone/70">{howItWorks.closing[0]}</p>
                <p className="display mt-3 text-[clamp(2.5rem,5.6vw,6rem)] text-orange">{howItWorks.closing[1]}</p>
              </li>
            )}
          </ol>
        </div>
      </div>

      <div className={cn("flex flex-col justify-center py-20 container-x", horizontal && "hidden")}>
        <motion.p
          className="text-xl font-medium text-bone/70 md:text-3xl"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          {howItWorks.closing[0]}
        </motion.p>
        <RevealText lines={[{ text: howItWorks.closing[1], accent: true }]} as="p" className="display mt-4 text-[clamp(2rem,7.6vw,8rem)]" delay={0.2} />
      </div>
    </section>
  );
}
