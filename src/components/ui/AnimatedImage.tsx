"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useRef } from "react";
import type { Photo } from "@/content/aurum";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn, EASE_SNAP } from "@/lib/utils";

type Props = {
  photo: Photo;
  sizes: string;
  className?: string;
  /** Parallax interno discreto (só desktop) */
  parallax?: boolean;
  /** Faixa diagonal laranja que "pinta" parte da foto P&B */
  accent?: "left" | "right" | false;
  /** Palavra editorial sobreposta */
  word?: string;
  wordClassName?: string;
  delay?: number;
  /** P&B editorial (padrão). Fotos já tratadas na identidade, como as dos sócios, usam false. */
  mono?: boolean;
  /** Enquadramento dentro do recorte (object-position) */
  position?: string;
  /** Aproximação fixa do recorte, para igualar a escala entre fotos diferentes */
  zoom?: number;
  /** Começa em P&B e ganha cor conforme a foto chega ao centro da tela */
  colorize?: boolean;
};

// Máscara diagonal inspirada nas linhas de velocidade do símbolo AURUM.
const HIDDEN = "polygon(0% 0%, 0% 0%, -32% 100%, -32% 100%)";
const SHOWN = "polygon(0% 0%, 132% 0%, 100% 100%, -32% 100%)";

export function AnimatedImage({
  photo,
  sizes,
  className,
  parallax = true,
  accent = "right",
  word,
  wordClassName,
  delay = 0,
  mono = true,
  position,
  zoom = 1,
  colorize = false,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!parallax && !colorize) return;
      const mm = gsap.matchMedia();
      if (colorize) {
        mm.add(MQ.motion, () => {
          gsap.fromTo(
            inner.current,
            { filter: "grayscale(1) contrast(1.08) brightness(0.92)" },
            { filter: "grayscale(0) contrast(1) brightness(1)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "center 50%", scrub: true } },
          );
        });
      }
      mm.add(MQ.desktop, () => {
        if (!parallax) return;
        gsap.fromTo(
          inner.current,
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <motion.figure
      ref={root}
      className={cn("relative overflow-hidden bg-graphite-2", className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="absolute inset-0"
        variants={{
          hidden: { clipPath: HIDDEN },
          shown: { clipPath: SHOWN, transition: { duration: 1.25, ease: EASE_SNAP, delay } },
        }}
      >
        <div ref={inner} className="absolute inset-x-0 -inset-y-[7%]">
          {/* a foto chega levemente ampliada e assenta enquanto a máscara abre */}
          <motion.div
            className="absolute inset-0"
            variants={{
              hidden: { scale: 1.25 },
              shown: { scale: 1, transition: { duration: 1.6, ease: EASE_SNAP, delay } },
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={sizes}
              className={cn("object-cover", mono && !colorize && "photo-mono")}
              style={{
                objectPosition: position,
                transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                transformOrigin: position ?? "50% 50%",
              }}
            />
          </motion.div>
        </div>
        {accent && (
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-orange mix-blend-color"
            variants={{
              hidden: { opacity: 0 },
              shown: { opacity: 0.9, transition: { duration: 0.6, delay: delay + 0.9 } },
            }}
            style={{
              clipPath:
                accent === "right"
                  ? "polygon(78% 0%, 88% 0%, 70% 100%, 60% 100%)"
                  : "polygon(18% 0%, 26% 0%, 8% 100%, 0% 100%)",
            }}
          />
        )}
      </motion.div>
      {word && (
        <figcaption
          aria-hidden
          className={cn("display pointer-events-none absolute bottom-[0.1em] left-[0.25em] z-10 text-bone [text-shadow:0_4px_28px_rgba(0,0,0,0.55),0_1px_4px_rgba(0,0,0,0.4)]", wordClassName)}
        >
          {word}
        </figcaption>
      )}
    </motion.figure>
  );
}
