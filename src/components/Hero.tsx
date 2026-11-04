"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { brand, hero } from "@/content/aurum";
import { BrandLockup } from "@/components/ui/Brand";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { scalePath, useElementSize } from "@/lib/geometry";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { EASE_OUT, EASE_SNAP, lineAccent, lineText } from "@/lib/utils";

// Trajetória de abertura: entra pela esquerda, ganha direção e sai pela direita.
const INTRO_PATH = "M -4 78 C 18 80 26 58 42 56 C 58 54 62 70 74 52 C 82 40 90 30 104 24";

const WORD_START = 700;
const WORD_STEP = 340;
const FINAL_AT = WORD_START + hero.intro.length * WORD_STEP + 150;

export function Hero() {
  const reduce = useReducedMotion();
  const [word, setWord] = useState(-1);
  const [final, setFinal] = useState(false);
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const size = useElementSize(svg);

  // Sequência de abertura: logo pequeno → linha → palavras → frase principal
  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => setFinal(true), 0);
      return () => clearTimeout(t);
    }
    const timers = hero.intro.map((_, i) => setTimeout(() => setWord(i), WORD_START + i * WORD_STEP));
    timers.push(setTimeout(() => setFinal(true), FINAL_AT));
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  // Ao rolar, o bloco principal sobe e perde intensidade
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.to(content.current, {
          yPercent: -18,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-slab]", {
          xPercent: -30,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const show = final ? "shown" : "hidden";

  return (
    <section
      ref={root}
      id="topo"
      data-section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
    >
      {/* Linhas diagonais finas no canto, como nas peças da marca */}
      <svg aria-hidden className="pointer-events-none absolute -left-10 top-0 h-[60%] w-[45%] opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={i * 6 - 40} y1={100} x2={i * 6 + 20} y2={0} stroke="#2b2b2b" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      {/* Bloco laranja diagonal que atravessa a borda */}
      <div
        data-hero-slab
        aria-hidden
        className="pointer-events-none absolute -left-[4%] top-[19%] h-[clamp(1.25rem,2.6vw,2.75rem)] w-[38%] md:w-[30%]"
      >
        <motion.div
          className="h-full w-full bg-orange"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: final ? 1 : 0 }}
          style={{ originX: 0, clipPath: "polygon(0 0, 100% 0, calc(100% - 2.2rem) 100%, 0 100%)" }}
          transition={{ duration: 0.9, ease: EASE_SNAP, delay: final ? 0.35 : 0 }}
        />
      </div>

      {/* Linha de abertura */}
      <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
        <motion.path
          d={scalePath(INTRO_PATH, size.w, size.h)}
          fill="none"
          stroke="var(--color-orange)"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="glow"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: final ? 0.7 : 1 }}
          transition={{ pathLength: { duration: 2.2, ease: EASE_SNAP, delay: 0.5 }, opacity: { duration: 0.8 } }}
        />
      </svg>

      {/* Informações editoriais nas bordas */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-5 top-28 hidden text-right text-[0.62rem] font-medium uppercase leading-[2.1] tracking-[0.5em] text-bone/45 md:block lg:right-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: final ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        {brand.edgeWords.map((w) => (
          <span key={w} className="block">{w}</span>
        ))}
        <span className="mt-3 ml-auto block h-[2px] w-8 bg-orange" />
      </motion.div>
      <motion.p
        aria-hidden
        className="pointer-events-none absolute bottom-40 left-7 hidden origin-bottom-left -rotate-90 whitespace-nowrap text-[0.62rem] font-medium uppercase tracking-[0.5em] text-bone/40 md:block lg:left-11"
        initial={{ opacity: 0 }}
        animate={{ opacity: final ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        {hero.edgeLeft}
      </motion.p>

      {/* Palco da abertura: logo pequeno + palavras em sequência */}
      <AnimatePresence>
        {!final && (
          <motion.div
            key="intro"
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10"
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
            >
              <BrandLockup priority className="h-auto w-24 md:w-28" />
            </motion.div>
            {/* Todas as palavras ficam empilhadas; cada uma entra por baixo e sai por cima */}
            <div className="relative h-[1.3em] w-full overflow-hidden text-center leading-[1.3] display t-xl">
              {hero.intro.map((w, i) => (
                <motion.span
                  key={w}
                  className={i === hero.intro.length - 1 ? "absolute inset-x-0 top-0 text-orange" : "absolute inset-x-0 top-0"}
                  initial={{ y: "110%", skewX: 0 }}
                  animate={{ y: i < word ? "-110%" : i === word ? "0%" : "110%", skewX: i === word ? 0 : -12 }}
                  transition={{ duration: 0.34, ease: EASE_SNAP }}
                >
                  {w}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cortina diagonal laranja que passa entre a abertura e a frase principal */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[70%] bg-orange"
          style={{ clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)" }}
          initial={{ x: "-110%" }}
          animate={{ x: final ? "160%" : "-110%" }}
          transition={{ duration: 0.75, ease: EASE_SNAP }}
        />
      )}

      {/* Estado final */}
      <div ref={content} className="relative z-10 mt-auto pt-32 pb-24 container-x md:pb-28">
        <motion.h1 id="hero-title" className="display t-hero" initial="hidden" animate={show}>
          {hero.title.map((line, i) => (
            <span key={i} className="line-mask">
              <motion.span
                className={lineAccent(line) ? "block text-orange" : "block"}
                variants={{
                  hidden: { y: "140%" },
                  shown: { y: "0%", transition: { duration: 1, ease: EASE_OUT, delay: 0.3 + i * 0.12 } },
                }}
              >
                {lineText(line)}
              </motion.span>{" "}
            </span>
          ))}
        </motion.h1>

        <motion.div
          className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={final ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.5 }}
        >
          <p className="max-w-md text-base leading-relaxed text-bone/75 md:text-lg">{hero.subtitle}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <MagneticButton href={hero.primaryCta.href}>{hero.primaryCta.label}</MagneticButton>
            <MagneticButton href={hero.secondaryCta.href} variant="text">
              {hero.secondaryCta.label}
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      {/* Indicação de scroll */}
      <motion.a
        href="#aurum"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-bone/55 hover:text-bone lg:left-auto lg:right-16 lg:translate-x-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: final ? 1 : 0 }}
        transition={{ delay: 1 }}
      >
        <span className="hidden md:inline">{hero.scrollHint}</span>
        <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-x-0 top-0 block h-1/2 animate-[scrollHint_1.8s_var(--ease-snap)_infinite] bg-orange" />
        </span>
        <span className="sr-only md:hidden">{hero.scrollHint}</span>
      </motion.a>

    </section>
  );
}
