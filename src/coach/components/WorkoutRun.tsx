"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, EASE_OUT } from "@/lib/utils";
import { cameraTip } from "../exercises";
import type { SessionResult } from "../lib/engine";
import { speak } from "../lib/speech";
import { FOCUS, stepsOf, targetLabel, type Step, type Workout } from "../workouts";
import { CameraDiagram } from "./Glyphs";
import { Session } from "./Session";

export interface StepResult {
  step: Step;
  result: SessionResult | null;
}

type Props = {
  workout: Workout;
  rounds: number;
  rest: number;
  sets: number;
  /** Fim do treino (completo ou encerrado no meio). */
  onDone: (results: StepResult[], elapsedMs: number) => void;
};

/**
 * Executa o treino em sequência: exercício (câmera + coach) → descanso guiado
 * (a voz anuncia o próximo) → próximo exercício… → resumo.
 */
export function WorkoutRunner({ workout, rounds, rest, sets, onDone }: Props) {
  const steps = useMemo(() => stepsOf(workout, rounds, sets), [workout, rounds, sets]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"exercise" | "rest">("exercise");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const results = useRef<StepResult[]>([]);
  const [startedAt] = useState(() => Date.now());

  // Mantém a tela acesa durante todo o treino (inclusive nos descansos)
  useEffect(() => {
    let wake: WakeLockSentinel | null = null;
    const lock = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        ?.request("screen")
        .then((s) => (wake = s))
        .catch(() => undefined);
    };
    lock();
    document.addEventListener("visibilitychange", lock);
    return () => {
      document.removeEventListener("visibilitychange", lock);
      wake?.release().catch(() => undefined);
    };
  }, []);

  const finishWorkout = () => onDone(results.current, Date.now() - startedAt);

  const record = (result: SessionResult | null) => {
    results.current = [...results.current.filter((r) => r.step.index !== idx), { step: steps[idx], result }];
  };

  const next = (result: SessionResult | null) => {
    record(result);
    if (idx >= steps.length - 1) return finishWorkout();
    setPhase("rest");
  };

  const quit = (result: SessionResult | null) => {
    if (result) record(result);
    finishWorkout();
  };

  const step = steps[idx];

  if (phase === "rest") {
    const upcoming = steps[idx + 1];
    const roundChange = upcoming.round !== step.round;
    return (
      <RestScreen
        key={`rest-${idx}`}
        workout={workout}
        steps={steps}
        doneUntil={idx}
        next={upcoming}
        seconds={roundChange ? rest * 2 : rest}
        roundEnded={roundChange ? step.round : null}
        onDone={() => {
          setIdx(idx + 1);
          setPhase("exercise");
        }}
        onQuit={() => quit(null)}
      />
    );
  }

  return (
    <Session
      key={`ex-${idx}`}
      exercise={step.exercise}
      variant={step.exercise.variants[step.variant] ?? step.exercise.variants[0]}
      target={step.target}
      source={{ kind: "camera" }}
      workout={{ index: idx, total: steps.length, name: workout.name, set: step.set, sets: step.sets }}
      initialFacing={facing}
      onFacing={setFacing}
      onFinish={(r) => next(r)}
      onExit={() => next(null)}
      onQuit={quit}
    />
  );
}

/* ——— Descanso guiado ———————————————————————————————————————— */

type RestProps = {
  workout: Workout;
  steps: Step[];
  doneUntil: number;
  next: Step;
  seconds: number;
  roundEnded: number | null;
  onDone: () => void;
  onQuit: () => void;
};

function RestScreen({ workout, steps, doneUntil, next, seconds, roundEnded, onDone, onQuit }: RestProps) {
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [total, setTotal] = useState(seconds);
  const [now, setNow] = useState(() => Date.now());
  const said = useRef(new Set<number>());
  const doneRef = useRef(false);
  const view = next.exercise.variants[next.variant]?.view ?? "lateral";
  const left = Math.max(0, Math.ceil((endAt - now) / 1000));

  // Mesma posição do celular: próxima série do mesmo exercício
  const sameSpot = next.set > 1;

  // Anúncio do próximo exercício
  useEffect(() => {
    const unit = next.exercise.mode === "hold" ? "segundos" : "repetições";
    const intro = roundEnded ? `Fim da volta ${roundEnded}. ` : "";
    speak(
      sameSpot
        ? `${intro}Descanse. Próxima: série ${next.set} de ${next.sets}, ${next.target} ${unit}. O celular fica onde está.`
        : `${intro}Descanse. Próximo: ${next.exercise.name}, ${next.target} ${unit}. Posicione o celular ${view === "lateral" ? "de lado" : "de frente"} para você.`,
      { interrupt: true },
    );
  }, [next, roundEnded, view, sameSpot]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (left === 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
      return;
    }
    if (said.current.has(left)) return;
    if (left === 10 && total > 14) {
      said.current.add(left);
      speak("Dez segundos", { interrupt: true });
    } else if (left <= 3) {
      said.current.add(left);
      speak(String(left), { interrupt: true });
    }
  }, [left, total, onDone]);

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  const add = (s: number) => {
    setEndAt((e) => e + s * 1000);
    setTotal((t) => t + s);
    said.current.clear();
  };

  const frac = total ? left / total : 0;
  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink text-bone">
      <div className="relative flex h-14 shrink-0 items-center justify-between gap-3 border-b border-bone/10 px-3 md:h-16 md:px-6">
        <button type="button" onClick={onQuit} className="flex h-10 items-center gap-2 pr-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bone/70 hover:text-bone">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Encerrar treino
        </button>
        <p className="hidden truncate text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-orange sm:block">{workout.name}</p>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-bone/60">
          {doneUntil + 1} de {steps.length}
        </p>
      </div>

      {/* Sequência */}
      <div className="flex shrink-0 gap-1 px-3 pt-3 md:px-6" aria-hidden>
        {steps.map((s, i) => (
          <span key={i} className={cn("h-1 flex-1 -skew-x-[30deg]", i <= doneUntil ? "bg-orange" : i === doneUntil + 1 ? "bg-bone/60" : "bg-bone/15")} />
        ))}
      </div>

      <div className="container-x mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 py-8 md:grid-cols-[0.9fr_1.1fr] md:py-12">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow text-orange">{roundEnded ? `Fim da volta ${roundEnded}` : sameSpot ? "Descanso entre séries" : "Descanso"}</p>
          <div className="relative mt-5 aspect-square w-[min(68vw,320px)]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(244,244,244,0.1)" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="var(--color-orange)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                style={{ transition: "stroke-dashoffset 0.2s linear" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={left}
                  className="display text-[clamp(4.5rem,22vw,8.5rem)] leading-none"
                  initial={{ y: "35%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-35%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  {left}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => add(15)} className="border border-bone/30 px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] hover:border-bone">
              +15 s
            </button>
            <button type="button" onClick={skip} className="bg-orange px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink">
              Pular descanso
            </button>
          </div>
        </div>

        <div>
          <p className="eyebrow text-muted">
            Próximo · {next.index + 1} de {steps.length}
            {next.round > 1 ? ` · volta ${next.round}` : ""}
          </p>
          <h2 className="display t-md mt-3">{next.exercise.name}</h2>
          <p className="mt-2 text-sm text-bone/65">
            {next.sets > 1 && (
              <span className="mr-2 inline-block bg-orange px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink">
                Série {next.set} de {next.sets}
              </span>
            )}
            <span className="display text-xl text-orange">{targetLabel(next.exercise, next.target)}</span>
            {next.exercise.alternating ? " · somando os dois lados" : ""} · {next.exercise.muscles}
          </p>
          {sameSpot ? (
            <div className="mt-6 border-l-2 border-orange pl-5 text-sm leading-relaxed text-bone/80">
              <p className="font-semibold text-bone">Mesma posição: o celular fica onde está.</p>
              <p className="mt-1">Respire, solte a musculatura e volte para a posição inicial: {next.exercise.start.toLowerCase()}.</p>
            </div>
          ) : (
            <div className="mt-6 grid items-center gap-5 border border-bone/10 p-5 sm:grid-cols-[150px_1fr]">
              <CameraDiagram view={view} className="w-full max-w-[200px]" />
              <div className="text-sm leading-relaxed text-bone/80">
                <p className="font-semibold text-bone">Posicione o celular {view === "lateral" ? "de lado" : "de frente"}.</p>
                <p className="mt-1">{cameraTip(view, next.exercise.posture)}</p>
                <p className="mt-2 text-bone/60">Posição inicial: {next.exercise.start.toLowerCase()}.</p>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">{FOCUS[workout.focus].label} · a câmera abre sozinha quando o descanso acabar.</p>
        </div>
      </div>
    </div>
  );
}
