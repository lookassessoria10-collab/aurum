"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/utils";
import { exercisesFor, REGIONS } from "../exercises";
import type { Env } from "../types";
import { HeroFigure, RegionFigure } from "./Glyphs";

const STEPS = [
  { n: "01", t: "Escolha", d: "Onde vai treinar e qual movimento vai fazer. São exercícios organizados por parte do corpo." },
  { n: "02", t: "Alinhe", d: "Posicione o celular de frente ou de lado. A voz avisa quando o corpo inteiro estiver no enquadramento." },
  { n: "03", t: "Execute", d: "O coach conta as repetições, mede a amplitude e corrige a execução pela voz, em tempo real." },
];

export function Home({ onPick }: { onPick: (env: Env) => void }) {
  const counts = { casa: exercisesFor("casa").length, academia: exercisesFor("academia").length };

  return (
    <div>
      <section className="container-x mx-auto grid max-w-7xl items-center gap-10 pb-16 pt-8 md:pt-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p className="eyebrow text-orange" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            AURUM Coach · personal trainer na câmera
          </motion.p>
          <h1 className="display t-hero mt-5">
            {["Treine com", "direção."].map((line, i) => (
              <span key={line} className="line-mask">
                <motion.span
                  className={i === 1 ? "block text-orange" : "block"}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-bone/80 md:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: EASE_OUT }}
          >
            Escolha o exercício, alinhe o corpo com a câmera e execute. O coach acompanha cada repetição, mede a amplitude do movimento e
            corrige sua execução pela voz.
          </motion.p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {(
              [
                { env: "casa", title: "Em casa", sub: "Sem equipamento: peso do corpo, chão, parede ou cadeira." },
                { env: "academia", title: "Na academia", sub: "Halteres, barras e máquinas. Ao vivo ou com o vídeo que você gravou." },
              ] as const
            ).map((c, i) => (
              <motion.button
                key={c.env}
                type="button"
                onClick={() => onPick(c.env)}
                className="group relative overflow-hidden border border-bone/15 bg-ink-2 p-5 text-left transition-colors hover:border-orange focus-visible:border-orange md:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.7, ease: EASE_OUT }}
              >
                <span aria-hidden className="absolute inset-0 origin-left -skew-x-12 scale-x-0 bg-orange transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-[1.3]" />
                <span className="relative block">
                  <span className="flex items-center justify-between">
                    <span className="eyebrow text-orange transition-colors group-hover:text-ink">{counts[c.env]} exercícios</span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:text-ink" aria-hidden>
                      <path d="M4 12 H19 M13 6 L19 12 L13 18" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </span>
                  <span className="display mt-3 block text-[clamp(2rem,4.2vw,3rem)] transition-colors group-hover:text-ink">{c.title}</span>
                  <span className="mt-2 block text-sm text-bone/70 transition-colors group-hover:text-ink/80">{c.sub}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-md"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: EASE_OUT }}
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-bone/10 bg-[radial-gradient(ellipse_at_50%_35%,#1c1c1c,#0a0a0a_70%)]">
            {(["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"] as const).map((c) => (
              <span key={c} aria-hidden className={`absolute h-8 w-8 border-orange ${c}`} />
            ))}
            <motion.span
              aria-hidden
              className="absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-orange to-transparent opacity-60"
              animate={{ top: ["8%", "92%", "8%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="absolute left-14 right-6 top-6 flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-bone/70">
              <motion.span className="h-2 w-2 rounded-full bg-orange" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
              Ao vivo · análise de movimento
            </p>
            <HeroFigure className="absolute inset-x-[6%] bottom-[19%] top-[12%] h-[69%] w-[88%]" />
            <p className="absolute bottom-6 left-6 right-6 bg-orange px-3 py-2 text-center text-[0.7rem] font-black uppercase italic tracking-[0.04em] text-ink md:text-sm">
              Desça mais, coxa paralela ao chão
            </p>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-line bg-ink-2">
        <div className="container-x mx-auto grid max-w-7xl gap-px md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="py-8 md:px-6 md:py-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: EASE_OUT }}
            >
              <span className="display text-5xl text-orange md:text-6xl">{s.n}</span>
              <h2 className="display mt-3 text-3xl md:text-4xl">{s.t}</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone/70 md:text-base">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-x mx-auto max-w-7xl py-16 md:py-24">
        <p className="eyebrow text-orange">Biblioteca</p>
        <h2 className="display t-md mt-3 max-w-3xl">Do agachamento à barra fixa, organizado por parte do corpo.</h2>
        <div className="mt-10 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
          {REGIONS.map((r, i) => (
            <motion.div
              key={r.id}
              className="flex flex-col items-start gap-4 bg-ink p-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <RegionFigure region={r.id} className="h-20 w-auto" />
              <div>
                <p className="display text-xl leading-tight">{r.short}</p>
                <p className="mt-1 text-xs text-muted">{r.blurb}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="border-l-2 border-orange pl-5">
            <p className="eyebrow text-bone">Sua imagem fica com você</p>
            <p className="mt-3 text-sm leading-relaxed text-bone/70">
              A análise acontece no seu próprio aparelho. O vídeo da câmera não é gravado nem enviado para nenhum servidor. Os vídeos que você
              escolher para analisar também não saem do seu celular ou computador.
            </p>
          </div>
          <div className="border-l-2 border-bone/20 pl-5">
            <p className="eyebrow text-bone">Ferramenta de apoio</p>
            <p className="mt-3 text-sm leading-relaxed text-bone/70">
              O AURUM Coach ajuda a acompanhar a execução, mas não substitui a avaliação e a orientação de um profissional de educação física.
              Respeite seus limites e, em caso de dor, interrompa o exercício.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
