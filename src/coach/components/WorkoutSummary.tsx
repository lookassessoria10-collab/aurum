"use client";

import { motion } from "motion/react";
import { cn, EASE_OUT } from "@/lib/utils";
import { FOCUS, stepsOf, type Workout } from "../workouts";
import type { StepResult } from "./WorkoutRun";

type Props = {
  workout: Workout;
  rounds: number;
  sets: number;
  results: StepResult[];
  elapsedMs: number;
  onAgain: () => void;
  onBack: () => void;
};

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function WorkoutSummary({ workout, rounds, sets, results, elapsedMs, onAgain, onBack }: Props) {
  const steps = stepsOf(workout, rounds, sets);
  const byIndex = new Map(results.map((r) => [r.step.index, r.result]));
  const done = results.filter((r) => r.result).length;
  const reps = results.reduce((a, r) => a + (r.result && r.result.mode === "reps" ? r.result.reps.length : 0), 0);
  const full = results.reduce((a, r) => a + (r.result && r.result.mode === "reps" ? r.result.reps.filter((x) => x.full).length : 0), 0);
  const holdS = results.reduce((a, r) => a + (r.result && r.result.mode === "hold" ? Math.floor(r.result.holdMs / 1000) : 0), 0);
  const fullPct = reps ? Math.round((full / reps) * 100) : 0;

  // Pontos de atenção do treino inteiro
  const issues = new Map<string, number>();
  for (const r of results) for (const it of r.result?.issues ?? []) issues.set(it.cue, (issues.get(it.cue) ?? 0) + it.count);
  const top = [...issues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const complete = done === steps.length;
  // Só lista até onde a pessoa chegou; o restante vira uma linha
  const reached = results.length ? Math.max(...results.map((r) => r.step.index)) + 1 : 0;
  const shown = steps.slice(0, Math.max(reached, 1));
  const notReached = steps.length - shown.length;
  const note =
    done === 0
      ? "Nenhum exercício foi concluído. Confira o posicionamento do celular indicado em cada exercício e tente de novo."
      : done / steps.length < 0.6
        ? "Treino parcial, e tudo bem. Na próxima, tente completar mais exercícios, mesmo que seja reduzindo a meta ou aumentando o descanso."
        : reps && fullPct < 70
          ? "Você foi até o fim, agora o foco é amplitude: complete cada repetição antes de pensar em velocidade ou carga."
          : top.length
            ? `Treino ${complete ? "completo" : "quase completo"} e consistente. Na próxima, atenção a: ${top[0][0].toLowerCase()}.`
            : "Treino completo e consistente. Evolua aos poucos: mais repetições, mais carga ou menos descanso.";

  const stats = [
    { k: "Tempo total", v: fmt(elapsedMs) },
    { k: steps.length > workout.items.length ? "Séries feitas" : "Exercícios", v: `${done}/${steps.length}` },
    { k: "Repetições", v: String(reps) },
    reps ? { k: "Completas", v: `${fullPct}%` } : { k: "Isometria", v: `${holdS} s` },
  ];

  return (
    <div className="container-x mx-auto max-w-6xl pb-24 pt-8 md:pt-14">
      <p className="eyebrow text-orange">
        {complete ? "Treino concluído" : "Treino encerrado"} · {FOCUS[workout.focus].label}
      </p>
      <h1 className="display t-lg mt-3">
        <span className="line-mask">
          <motion.span className="block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: EASE_OUT }}>
            {workout.name}
          </motion.span>
        </span>
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.k}
            className="bg-ink p-4 md:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.6, ease: EASE_OUT }}
          >
            <p className="eyebrow text-muted">{s.k}</p>
            <p className="display mt-2 text-3xl md:text-5xl">{s.v}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="display text-2xl md:text-3xl">Exercício a exercício</h2>
          <ol className="mt-5 grid gap-px bg-line">
            {shown.map((s, i) => {
              const r = byIndex.get(s.index) ?? null;
              const attempted = byIndex.has(s.index);
              const isHold = s.exercise.mode === "hold";
              const got = r ? (isHold ? Math.floor(r.holdMs / 1000) : r.reps.length) : 0;
              const pct = Math.min(1, got / s.target);
              const fullN = r && !isHold ? r.reps.filter((x) => x.full).length : 0;
              return (
                <motion.li
                  key={s.index}
                  className="bg-ink py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn("display w-9 shrink-0 text-xl", r ? "text-orange" : "text-bone/30")}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("display truncate text-lg leading-tight", !r && "text-bone/45")}>
                        {s.exercise.name}
                        {(s.sets > 1 || rounds > 1) && (
                          <span className="ml-2 text-xs not-italic tracking-normal normal-case text-muted">
                            {[s.sets > 1 ? `série ${s.set}` : "", rounds > 1 ? `volta ${s.round}` : ""].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {!attempted
                          ? "Não chegou a este exercício"
                          : !r
                            ? "Pulado"
                            : isHold
                              ? `${got} de ${s.target} s em posição`
                              : `${got} de ${s.target} repetições · ${fullN} completas`}
                        {r?.issues[0] ? ` · ${r.issues[0].cue}` : ""}
                      </p>
                    </div>
                    <span className="display shrink-0 text-lg">{r ? `${Math.round(pct * 100)}%` : "—"}</span>
                  </div>
                  <div className="ml-[3.25rem] mt-2 h-[3px] bg-line">
                    <motion.div
                      className="h-full bg-orange"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.04, duration: 0.7, ease: EASE_OUT }}
                    />
                  </div>
                </motion.li>
              );
            })}
          </ol>
          {notReached > 0 && (
            <p className="mt-4 text-sm text-muted">
              {notReached === 1 ? "Mais 1 série não chegou a ser feita." : `Mais ${notReached} séries não chegaram a ser feitas.`}
            </p>
          )}
        </section>

        <section>
          <h2 className="display text-2xl md:text-3xl">Pontos de atenção</h2>
          {top.length ? (
            <ul className="mt-5 flex flex-col gap-3">
              {top.map(([cue, count]) => (
                <li key={cue}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="font-semibold">{cue}</span>
                    <span className="shrink-0 text-muted">{count}×</span>
                  </div>
                  <div className="mt-1.5 h-[3px] bg-line">
                    <div className="h-full bg-orange" style={{ width: `${(count / top[0][1]) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted">Nenhuma correção registrada.</p>
          )}

          <h2 className="display mt-10 text-2xl md:text-3xl">Nota do coach</h2>
          <p className="mt-5 border-l-2 border-orange pl-4 text-base leading-relaxed text-bone/85">{note}</p>
        </section>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <button type="button" onClick={onAgain} className="bg-orange px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-ink transition-transform hover:-translate-y-0.5">
          Repetir treino
        </button>
        <button type="button" onClick={onBack} className="border border-bone/30 px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] transition-colors hover:border-bone">
          Outros treinos
        </button>
      </div>
    </div>
  );
}
