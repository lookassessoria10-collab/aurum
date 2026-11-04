"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { adaptation } from "@/content/aurum";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn, EASE_OUT, EASE_SNAP } from "@/lib/utils";

/*
 * Cada perfil muda a composição: de uma linha de base suave (iniciando) até
 * linhas de velocidade íngremes (performando). Todos os caminhos têm a mesma
 * estrutura de comandos para que o Motion interpole entre eles.
 * viewBox 0 0 400 300.
 */
const SHAPES: Record<string, { lines: string[]; visible: number; dot: [number, number] }> = {
  iniciando: {
    lines: [
      "M 0 230 C 90 228 150 222 220 214 C 290 206 340 200 400 196",
      "M 0 246 C 90 244 150 238 220 230 C 290 222 340 216 400 212",
      "M 0 262 C 90 260 150 254 220 246 C 290 238 340 232 400 228",
      "M 0 278 C 90 276 150 270 220 262 C 290 254 340 248 400 244",
      "M 0 294 C 90 292 150 286 220 278 C 290 270 340 264 400 260",
    ],
    visible: 1,
    dot: [400, 196],
  },
  evoluindo: {
    lines: [
      "M 0 240 C 80 230 120 160 200 164 C 280 168 320 110 400 96",
      "M 0 256 C 80 248 130 190 210 192 C 290 194 330 146 400 136",
      "M 0 272 C 80 266 140 220 220 220 C 300 220 340 182 400 176",
      "M 0 288 C 90 284 150 250 230 248 C 310 246 350 218 400 214",
      "M 0 300 C 90 298 160 276 240 274 C 320 272 360 254 400 250",
    ],
    visible: 3,
    dot: [400, 96],
  },
  performando: {
    lines: [
      "M 0 280 C 120 270 170 140 230 80 C 280 34 340 18 400 10",
      "M 30 290 C 140 280 190 170 250 116 C 300 74 350 58 400 52",
      "M 60 296 C 160 288 210 200 270 152 C 320 114 360 98 400 94",
      "M 90 300 C 180 294 230 230 290 190 C 340 156 370 142 400 138",
      "M 120 300 C 200 298 250 260 310 228 C 350 206 380 194 400 190",
    ],
    visible: 5,
    dot: [400, 10],
  },
};

export function Adaptation() {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const profile = adaptation.profiles[active];
  const shape = SHAPES[profile.key];

  function onKey(e: React.KeyboardEvent, i: number) {
    const n = adaptation.profiles.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="adaptacao" data-section aria-labelledby="adaptacao-title" className="relative overflow-hidden bg-ink-2 py-20 md:py-28">
      <div className="container-x">
        <SectionLabel index="10">{adaptation.label}</SectionLabel>
        <RevealText id="adaptacao-title" lines={adaptation.title} className="display t-lg mt-10" />

        <div className="mt-12 grid gap-10 md:mt-16 lg:grid-cols-12 lg:gap-8">
          <div role="tablist" aria-label="Perfis de treino" aria-orientation="vertical" className="flex flex-col border-t border-line lg:col-span-5">
            {adaptation.profiles.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.key}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${p.key}`}
                  aria-selected={on}
                  aria-controls="perfil-painel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className="group relative flex items-baseline gap-5 border-b border-line py-6 text-left md:py-8"
                >
                  <span className={cn("text-xs font-semibold tracking-[0.3em] tabular-nums transition-colors", on ? "text-orange" : "text-bone/40")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "display text-[clamp(1.8rem,4vw,3.6rem)] transition-all duration-500 ease-[var(--ease-out-expo)]",
                      on ? "translate-x-2 text-bone" : "text-bone/35 group-hover:text-bone/70",
                    )}
                  >
                    {p.name}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-px left-0 h-[3px] w-full origin-left bg-orange transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div
            id="perfil-painel"
            role="tabpanel"
            aria-labelledby={`tab-${profile.key}`}
            className="relative overflow-hidden border border-line lg:col-span-7"
          >
            {/* Palavra gigante de fundo */}
            <div aria-hidden className="pointer-events-none absolute -right-[4%] top-2 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={profile.key}
                  className="display block text-[clamp(4rem,11vw,10rem)] leading-none text-bone/[0.06]"
                  initial={{ x: "30%", opacity: 0 }}
                  animate={{ x: "0%", opacity: 1 }}
                  exit={{ x: "-30%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_SNAP }}
                >
                  {profile.name}
                </motion.span>
              </AnimatePresence>
            </div>

            <svg aria-hidden viewBox="0 0 400 300" preserveAspectRatio="none" className="relative block aspect-[16/10] w-full">
              {shape.lines.map((d, i) => (
                <motion.path
                  key={i}
                  initial={false}
                  animate={{ d, opacity: i < shape.visible ? (i === 0 ? 1 : 0.55 - i * 0.06) : 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20, delay: i * 0.04 }}
                  fill="none"
                  stroke={i === 0 ? "var(--color-orange)" : "var(--color-bone)"}
                  strokeWidth={i === 0 ? 3 : 1.2}
                  strokeLinecap="round"
                />
              ))}
              <motion.circle
                r={7}
                fill="var(--color-orange)"
                initial={false}
                animate={{ cx: shape.dot[0] - 10, cy: shape.dot[1] + 6 }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              />
            </svg>

            <div className="relative border-t border-line p-6 md:p-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={profile.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <p className="text-xl font-semibold leading-snug text-bone md:text-2xl">{profile.text}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {profile.focus.map((f) => (
                      <li key={f} className="border border-bone/20 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-bone/80">
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <RevealText lines={adaptation.closing} as="p" className="display t-lg mt-16 md:mt-20 lg:ml-[41.66%]" stagger={0.14} />
      </div>
    </section>
  );
}
