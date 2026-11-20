"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { cn, EASE_OUT } from "@/lib/utils";
import { cameraTip, LEVELS, REGIONS } from "../exercises";
import type { Exercise } from "../types";
import { AngleGlyph, CameraDiagram } from "./Glyphs";

type Props = {
  exercise: Exercise;
  variantIdx: number;
  target: number;
  onVariant: (i: number) => void;
  onTarget: (n: number) => void;
  onCamera: () => void;
  onVideo: (file: File) => void;
  onBack: () => void;
};

export function Detail({ exercise: ex, variantIdx, target, onVariant, onTarget, onCamera, onVideo, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const v = ex.variants[variantIdx] ?? ex.variants[0];
  const region = REGIONS.find((r) => r.id === ex.region);
  const isHold = ex.mode === "hold";
  const step = isHold ? 5 : ex.alternating ? 2 : 1;
  const min = isHold ? 10 : 1;
  const max = isHold ? 300 : 100;

  const cues = [
    ...(v.checks ?? []).map((c) => c.cue),
    ...(v.repChecks ?? []).map((c) => c.cue),
    ...(v.hold ? [v.hold.low, v.hold.high] : []),
    ...(!isHold ? [v.depthCue ?? "Complete o movimento"] : []),
    ...(ex.tempo ? ["Mais devagar, controle o movimento"] : []),
  ].filter((c, i, a) => c && a.indexOf(c) === i && !/posição de prancha|^Assuma/.test(c));

  return (
    <div className="pb-36">
      <div className="container-x mx-auto max-w-7xl pt-6 md:pt-10">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-bone">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M20 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          Exercícios
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="eyebrow text-orange">{region?.name}</p>
            <h1 className="display t-lg mt-3">
              <span className="line-mask">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE_OUT }}>
                  {ex.name}
                </motion.span>
              </span>
            </h1>
            <p className="mt-4 text-base text-bone/75">{ex.muscles}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[ex.equipment, LEVELS[ex.level], ex.env.length > 1 ? "Casa e academia" : ex.env[0] === "casa" ? "Em casa" : "Academia"].map((t) => (
                <span key={t} className="border border-bone/15 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-bone/75">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 border border-bone/10 bg-ink-2 p-5 sm:flex-row sm:items-center sm:gap-6 md:p-6">
              <AngleGlyph metric={v.metric} className="h-20 w-32 shrink-0 sm:h-24 sm:w-36 md:h-28 md:w-44" />
              <div>
                <p className="eyebrow text-muted">O coach mede</p>
                <p className="display mt-2 text-2xl leading-tight md:text-3xl">{v.metric.label}</p>
                <p className="mt-2 text-sm text-bone/65">{isHold ? "e só conta o tempo com o corpo na posição certa." : "e conta a repetição quando o movimento é completo."}</p>
              </div>
            </div>

            {ex.variants.length > 1 && (
              <div className="mt-6">
                <p className="eyebrow text-muted">Como filmar</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Como filmar">
                  {ex.variants.map((vv, i) => (
                    <button
                      key={vv.label}
                      type="button"
                      role="radio"
                      aria-checked={i === variantIdx}
                      onClick={() => onVariant(i)}
                      className={cn(
                        "border px-4 py-3 text-left text-sm transition-colors",
                        i === variantIdx ? "border-orange bg-orange/10" : "border-bone/15 text-bone/70 hover:border-bone/40",
                      )}
                    >
                      <span className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-orange">{vv.view === "lateral" ? "De lado" : "De frente"}</span>
                      <span className="mt-1 block font-semibold">{vv.label.split(": ")[1] ?? vv.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="display text-2xl md:text-3xl">Como fazer</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {ex.steps.map((s, i) => (
                  <motion.li
                    key={s}
                    className="flex gap-4 text-base leading-relaxed text-bone/85"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: EASE_OUT }}
                  >
                    <span className="display w-7 shrink-0 text-xl text-orange">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <section className="border border-bone/10 p-5 md:p-6">
              <h2 className="display text-2xl md:text-3xl">Posicione a câmera</h2>
              <div className="mt-4 grid items-center gap-5 sm:grid-cols-[160px_1fr]">
                <CameraDiagram view={v.view} className="w-full max-w-[220px]" />
                <div className="text-sm leading-relaxed text-bone/80">
                  <p>{cameraTip(v.view, ex.posture)}</p>
                  <p className="mt-2 text-bone/60">Comece na posição inicial: {ex.start.toLowerCase()}. A voz avisa quando estiver tudo certo.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="display text-2xl md:text-3xl">O que a voz corrige</h2>
              <ul className="mt-4 grid gap-px bg-line">
                {cues.map((c) => (
                  <li key={c} className="flex items-center gap-3 bg-ink py-3 text-sm text-bone/85">
                    <span className="h-[2px] w-4 shrink-0 -skew-x-[30deg] bg-orange" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-xs leading-relaxed text-muted">
              Ferramenta de apoio: não substitui a avaliação de um profissional de educação física. Em caso de dor, pare. A imagem é analisada no
              seu aparelho e não é gravada nem enviada.
            </p>
          </div>
        </div>
      </div>

      {/* Ações fixas */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bone/10 bg-ink/92 backdrop-blur-md">
        <div className="container-x mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="eyebrow hidden text-muted sm:inline">Meta</span>
            <div className="flex items-center border border-bone/20">
              <button type="button" aria-label="Diminuir meta" onClick={() => onTarget(Math.max(min, target - step))} className="grid h-10 w-10 place-items-center text-lg hover:text-orange">
                −
              </button>
              <span className="display w-16 text-center text-xl tabular-nums" aria-live="polite">
                {target}
                <span className="ml-0.5 text-xs not-italic text-muted">{isHold ? "s" : ""}</span>
              </span>
              <button type="button" aria-label="Aumentar meta" onClick={() => onTarget(Math.min(max, target + step))} className="grid h-10 w-10 place-items-center text-lg hover:text-orange">
                +
              </button>
            </div>
            <span className="hidden text-xs text-muted md:inline">{isHold ? "segundos" : ex.alternating ? "repetições somando os dois lados" : "repetições"}</span>
          </div>
          <div className="flex flex-1 justify-end gap-2 sm:flex-none">
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onVideo(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border border-bone/30 px-3 py-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] transition-colors hover:border-bone md:px-5 md:text-[0.68rem]"
            >
              Analisar vídeo
            </button>
            <button
              type="button"
              onClick={onCamera}
              className="flex items-center gap-2 bg-orange px-4 py-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink transition-transform hover:-translate-y-0.5 md:px-6 md:text-[0.68rem]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 7 H15 V17 H3 Z M15 10 L21 7 V17 L15 14" strokeLinejoin="round" />
              </svg>
              Abrir câmera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
