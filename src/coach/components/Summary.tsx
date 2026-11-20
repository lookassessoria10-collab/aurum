"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/utils";
import { FULL, type SessionResult } from "../lib/engine";
import type { Exercise } from "../types";

type Props = {
  exercise: Exercise;
  result: SessionResult;
  onAgain: () => void;
  onChange: () => void;
};

const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function Summary({ exercise, result, onAgain, onChange }: Props) {
  const isHold = result.mode === "hold";
  const reps = result.reps;
  const full = reps.filter((r) => r.full).length;
  const rom = reps.map((r) => (result.angle ? Math.abs(r.peakValue - r.restValue) : Math.min(r.peak, 1.15) * 100));
  const unit = result.angle ? "°" : "%";
  const holdS = Math.floor(result.holdMs / 1000);
  const top = result.issues[0];

  const tip = isHold
    ? holdS >= result.target
      ? "Meta de tempo cumprida. Na próxima, aumente alguns segundos mantendo o mesmo alinhamento."
      : top
        ? `Na próxima série, atenção a: ${top.cue.toLowerCase()}. Se precisar, divida o tempo em blocos menores.`
        : "Construa o tempo aos poucos: qualidade da posição vem antes da duração."
    : !reps.length
      ? "Nenhuma repetição foi reconhecida. Confira o enquadramento e a vista indicada (de lado ou de frente) e tente de novo."
      : full / reps.length < 0.7
        ? "Foque na amplitude: complete o movimento antes de pensar em carga ou velocidade."
        : top
          ? `Boa série. Na próxima, atenção a: ${top.cue.toLowerCase()}.`
          : "Execução consistente. Mantenha a técnica e evolua carga ou repetições aos poucos.";

  const stats = isHold
    ? [
        { label: "Meta", value: `${result.target} s` },
        { label: "Tempo em posição", value: `${Math.round(result.inPositionPct * 100)}%` },
        { label: "Duração da série", value: fmtTime(result.elapsedMs) },
        { label: "Correções", value: String(result.issues.reduce((a, b) => a + b.count, 0)) },
      ]
    : [
        { label: "Completas", value: reps.length ? `${full}/${reps.length}` : "—" },
        { label: "Amplitude média", value: reps.length ? `${Math.round(avg(rom))}${unit}` : "—" },
        { label: "Melhor amplitude", value: reps.length ? `${Math.round(Math.max(...rom))}${unit}` : "—" },
        { label: "Ritmo médio", value: reps.length ? `${(avg(reps.map((r) => r.duration)) / 1000).toFixed(1)} s` : "—" },
      ];

  return (
    <div className="container-x mx-auto max-w-6xl pb-24 pt-8 md:pt-14">
      <motion.p className="eyebrow text-orange" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {result.source === "video" ? "Análise do vídeo" : "Série concluída"} · {exercise.name}
      </motion.p>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <span className="line-mask">
          <motion.span className="display t-mega block" initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: EASE_OUT }}>
            {isHold ? holdS : reps.length}
            {isHold && <span className="text-orange">s</span>}
          </motion.span>
        </span>
        <motion.p className="display t-md pb-[0.6em] text-bone/60" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          {isHold ? "em posição" : reps.length === 1 ? "repetição" : "repetições"}
          <span className="block text-sm not-italic tracking-normal normal-case text-muted md:text-base">
            meta: {result.target} {isHold ? "segundos" : ""}
          </span>
        </motion.p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {stats.map((st, i) => (
          <motion.div
            key={st.label}
            className="bg-ink p-4 md:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: EASE_OUT }}
          >
            <p className="eyebrow text-muted">{st.label}</p>
            <p className="display mt-2 text-3xl md:text-5xl">{st.value}</p>
          </motion.div>
        ))}
      </div>

      {!isHold && reps.length > 0 && (
        <section className="mt-12" aria-label="Amplitude de cada repetição">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-2xl md:text-3xl">Repetição a repetição</h2>
            <p className="text-xs text-muted">
              <span className="mr-1 inline-block h-2 w-2 bg-orange" /> completa
              <span className="ml-3 mr-1 inline-block h-2 w-2 bg-bone/30" /> incompleta
            </p>
          </div>
          <div className="relative mt-6 flex h-44 items-end gap-1 border-b border-line md:h-56 md:gap-2">
            <div className="absolute inset-x-0 border-t border-dashed border-bone/30" style={{ bottom: `${(FULL / 1.15) * 100}%` }}>
              <span className="absolute -top-5 right-0 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted">alvo</span>
            </div>
            {reps.map((r, i) => (
              <div key={r.n} className="relative flex h-full flex-1 flex-col justify-end" title={`${r.n}ª: ${Math.round(rom[i])}${unit}${r.issues.length ? ` · ${r.issues.join(" · ")}` : ""}`}>
                <motion.div
                  className={r.full ? "bg-orange" : "bg-bone/30"}
                  initial={{ height: 0 }}
                  animate={{ height: `${(Math.min(r.peak, 1.15) / 1.15) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.7, ease: EASE_OUT }}
                />
                {r.issues.length > 0 && <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ff4b3a]" />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1 md:gap-2">
            {reps.map((r) => (
              <span key={r.n} className="flex-1 text-center text-[0.6rem] text-muted">
                {reps.length <= 20 || r.n % 5 === 0 ? r.n : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="display text-2xl md:text-3xl">Correções mais frequentes</h2>
          {result.issues.length ? (
            <ul className="mt-5 flex flex-col gap-3">
              {result.issues.slice(0, 5).map((it, i) => (
                <li key={it.cue}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="font-semibold">{it.cue}</span>
                    <span className="shrink-0 text-muted">{it.count}×</span>
                  </div>
                  <div className="mt-1.5 h-[3px] bg-line">
                    <motion.div
                      className="h-full bg-orange"
                      initial={{ width: 0 }}
                      animate={{ width: `${(it.count / result.issues[0].count) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: EASE_OUT }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted">Nenhuma correção nesta série.</p>
          )}
        </section>

        <section>
          <h2 className="display text-2xl md:text-3xl">Nota do coach</h2>
          <p className="mt-5 border-l-2 border-orange pl-4 text-base leading-relaxed text-bone/85">{tip}</p>
          {result.timeline.length > 0 && (
            <details className="mt-6 text-sm">
              <summary className="cursor-pointer text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted hover:text-bone">
                Linha do tempo das correções ({result.timeline.length})
              </summary>
              <ol className="mt-3 flex max-h-56 flex-col gap-1.5 overflow-auto pr-2">
                {result.timeline.map((e, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-10 shrink-0 tabular-nums text-orange">{fmtTime(e.t)}</span>
                    <span className="text-bone/80">{e.text}</span>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <button type="button" onClick={onAgain} className="bg-orange px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-ink transition-transform hover:-translate-y-0.5">
          Fazer outra série
        </button>
        <button type="button" onClick={onChange} className="border border-bone/30 px-6 py-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] transition-colors hover:border-bone">
          Trocar exercício
        </button>
      </div>
    </div>
  );
}
