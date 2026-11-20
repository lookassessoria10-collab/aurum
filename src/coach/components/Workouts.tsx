"use client";

import { motion } from "motion/react";
import { cn, EASE_OUT } from "@/lib/utils";
import { LEVELS } from "../exercises";
import { estimateMinutes, FOCUS, stepsOf, targetLabel, type Workout } from "../workouts";
import { RegionFigure } from "./Glyphs";

/* ——— Card de treino (lista) ——————————————————————————————— */

export function WorkoutCard({ workout: w, index, onOpen }: { workout: Workout; index: number; onOpen: () => void }) {
  const steps = stepsOf(w, 1, 1);
  const names = steps.map((s) => s.exercise.name);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="group relative flex h-full w-full flex-col overflow-hidden border border-bone/12 bg-ink-2 p-5 text-left transition-colors hover:border-orange focus-visible:border-orange md:p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.5, ease: EASE_OUT }}
    >
      <span aria-hidden className="absolute -right-4 -top-6 select-none font-[family-name:var(--font-display)] text-[7rem] font-black italic leading-none text-bone/[0.04]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow text-orange">{FOCUS[w.focus].label}</p>
          <p className="display mt-3 text-[1.7rem] leading-[0.95] transition-colors group-hover:text-orange md:text-3xl">{w.name}</p>
        </div>
        <RegionFigure region={FOCUS[w.focus].figure} active className="h-16 w-auto shrink-0" />
      </div>
      <p className="relative mt-3 line-clamp-2 text-sm text-bone/65">{w.blurb}</p>
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {names.slice(0, 4).map((n, i) => (
          <span key={`${n}-${i}`} className="border border-bone/10 px-2 py-1 text-[0.62rem] font-medium text-bone/70">
            {n}
          </span>
        ))}
        {names.length > 4 && <span className="px-2 py-1 text-[0.62rem] font-semibold text-orange">+{names.length - 4}</span>}
      </div>
      <div className="relative mt-auto flex items-center justify-between gap-3 pt-5 text-[0.62rem] font-bold uppercase tracking-[0.16em]">
        <span className="text-bone/70">
          {w.items.length} exercícios{w.sets > 1 ? ` · ${w.sets} séries` : ""}{w.rounds > 1 ? ` · ${w.rounds} voltas` : ""} · ≈ {estimateMinutes(w)} min
        </span>
        <span className="flex items-center gap-1" aria-label={LEVELS[w.level]}>
          {[1, 2, 3].map((l) => (
            <span key={l} className={cn("h-1 w-4 -skew-x-[30deg]", l <= w.level ? "bg-orange" : "bg-bone/15")} />
          ))}
        </span>
      </div>
    </motion.button>
  );
}

/* ——— Detalhe do treino ——————————————————————————————————— */

type DetailProps = {
  workout: Workout;
  rounds: number;
  rest: number;
  sets: number;
  onRounds: (n: number) => void;
  onRest: (n: number) => void;
  onSets: (n: number) => void;
  onStart: () => void;
  onBack: () => void;
};

export function WorkoutDetail({ workout: w, rounds, rest, sets, onRounds, onRest, onSets, onStart, onBack }: DetailProps) {
  const steps = stepsOf(w, 1, 1);
  const minutes = estimateMinutes(w, rounds, rest, sets);
  const totalSets = w.items.length * rounds * sets;
  const views = new Set(steps.map((s) => s.exercise.variants[s.variant]?.view ?? "lateral"));

  return (
    <div className="pb-36">
      <div className="container-x mx-auto max-w-7xl pt-6 md:pt-10">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-bone">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M20 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          Treinos
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow text-orange">Treino completo · {FOCUS[w.focus].label}</p>
            <h1 className="display t-lg mt-3">
              <span className="line-mask">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE_OUT }}>
                  {w.name}
                </motion.span>
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-bone/75">{w.blurb}</p>

            <div className="mt-8 grid grid-cols-2 gap-px bg-line">
              {[
                { k: "Exercícios", v: String(w.items.length) },
                { k: "Séries", v: String(totalSets) },
                { k: "Duração", v: `≈ ${minutes} min` },
                { k: "Nível", v: LEVELS[w.level] },
              ].map((s) => (
                <div key={s.k} className="bg-ink p-4">
                  <p className="eyebrow text-muted">{s.k}</p>
                  <p className="display mt-2 text-2xl leading-none md:text-3xl">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <Stepper label="Séries por exercício" value={sets} unit="" onChange={onSets} min={1} max={5} step={1} />
              <Stepper label="Voltas" value={rounds} unit="" onChange={onRounds} min={1} max={3} step={1} />
              <Stepper label="Descanso" value={rest} unit="s" onChange={onRest} min={10} max={120} step={5} />
            </div>

            <div className="mt-8 border-l-2 border-orange pl-5 text-sm leading-relaxed text-bone/75">
              <p className="eyebrow text-bone">Como funciona</p>
              <p className="mt-3">
                O coach passa de uma série para a outra sozinho: quando você bate a meta, começa o descanso. Durante o descanso, a voz anuncia a
                próxima série
                {views.size > 1 ? " e avisa se o celular fica de lado ou de frente" : ""}. Entre séries do mesmo exercício, o celular fica onde está.
                Dá para pular uma série ou encerrar o treino quando quiser.
              </p>
            </div>
          </div>

          <div>
            <h2 className="display text-2xl md:text-3xl">A sequência</h2>
            <ol className="mt-5 grid gap-px bg-line">
              {steps.map((s, i) => {
                const view = s.exercise.variants[s.variant]?.view ?? "lateral";
                return (
                  <motion.li
                    key={`${s.exercise.id}-${i}`}
                    className="flex items-center gap-4 bg-ink py-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: EASE_OUT }}
                  >
                    <span className="display w-9 shrink-0 text-2xl text-orange">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="display truncate text-lg leading-tight md:text-xl">{s.exercise.name}</p>
                      <p className="mt-1 truncate text-xs text-muted">{s.exercise.muscles}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="display text-lg leading-none">
                        {sets > 1 && <span className="text-orange">{sets}× </span>}
                        {targetLabel(s.exercise, s.target)}
                      </p>
                      <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-bone/45">{view === "lateral" ? "de lado" : "de frente"}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
            {rounds > 1 && <p className="mt-3 text-xs text-muted">Repetir a sequência {rounds} vezes, com descanso maior entre as voltas.</p>}
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Ferramenta de apoio: não substitui a avaliação de um profissional de educação física. Respeite seus limites e, em caso de dor, pare.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bone/10 bg-ink/92 backdrop-blur-md">
        <div className="container-x mx-auto flex max-w-7xl items-center justify-between gap-3 py-3">
          <p className="min-w-0 truncate text-xs text-muted">
            <span className="font-semibold text-bone">
              {w.items.length} exercícios · {totalSets} séries
            </span>{" "}
            · ≈ {minutes} min
          </p>
          <button
            type="button"
            onClick={onStart}
            className="flex shrink-0 items-center gap-2 bg-orange px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink transition-transform hover:-translate-y-0.5 md:px-7"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M7 4 L20 12 L7 20 Z" />
            </svg>
            Começar treino
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, value, unit, onChange, min, max, step }: { label: string; value: number; unit: string; onChange: (n: number) => void; min: number; max: number; step: number }) {
  return (
    <div>
      <p className="eyebrow text-muted">{label}</p>
      <div className="mt-2 flex items-center border border-bone/20">
        <button type="button" aria-label={`Diminuir ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - step))} className="grid h-10 w-10 place-items-center text-lg hover:text-orange">
          −
        </button>
        <span className="display w-16 text-center text-xl tabular-nums" aria-live="polite">
          {value}
          {unit && <span className="ml-0.5 text-xs not-italic text-muted">{unit}</span>}
        </span>
        <button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + step))} className="grid h-10 w-10 place-items-center text-lg hover:text-orange">
          +
        </button>
      </div>
    </div>
  );
}
