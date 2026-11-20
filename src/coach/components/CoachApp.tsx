"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandInline } from "@/components/ui/Brand";
import { EASE_OUT } from "@/lib/utils";
import { exerciseById } from "../exercises";
import type { SessionResult } from "../lib/engine";
import { warmUp } from "../lib/speech";
import type { Env, Exercise, RegionId } from "../types";
import { workoutById, type Workout } from "../workouts";
import { Detail } from "./Detail";
import { Home } from "./Home";
import { Library, type LibraryTab } from "./Library";
import { Session, type SessionSource } from "./Session";
import { Summary } from "./Summary";
import { WorkoutDetail } from "./Workouts";
import { WorkoutRunner, type StepResult } from "./WorkoutRun";
import { WorkoutSummary } from "./WorkoutSummary";

type Screen = "home" | "library" | "detail" | "session" | "summary" | "workout" | "run" | "workoutSummary";

export function CoachApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [env, setEnv] = useState<Env>("casa");
  const [tab, setTab] = useState<LibraryTab>("treinos");
  const [region, setRegion] = useState<RegionId | "todos">("todos");
  // Exercício avulso
  const [exId, setExId] = useState<string | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [target, setTarget] = useState(10);
  const [source, setSource] = useState<SessionSource>({ kind: "camera" });
  const [result, setResult] = useState<SessionResult | null>(null);
  // Treino completo
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [rounds, setRounds] = useState(1);
  const [rest, setRest] = useState(30);
  const [sets, setSets] = useState(1);
  const [runResults, setRunResults] = useState<{ results: StepResult[]; elapsed: number } | null>(null);

  const [run, setRun] = useState(0);
  const libScroll = useRef(0);

  const ex = exId ? exerciseById(exId) : undefined;
  const workout = workoutId ? workoutById(workoutId) : undefined;

  // Cada tela começa do topo; a lista volta para onde estava
  useEffect(() => {
    window.scrollTo({ top: screen === "library" ? libScroll.current : 0, behavior: "instant" });
  }, [screen]);

  const open = (e: Exercise) => {
    libScroll.current = window.scrollY;
    setExId(e.id);
    setVariantIdx(0);
    setTarget(e.target);
    setScreen("detail");
  };

  const openWorkout = (w: Workout) => {
    libScroll.current = window.scrollY;
    setWorkoutId(w.id);
    setRounds(w.rounds);
    setRest(w.rest);
    setSets(w.sets);
    setScreen("workout");
  };

  const start = (src: SessionSource) => {
    warmUp();
    setSource(src);
    setRun((r) => r + 1);
    setScreen("session");
  };

  const startWorkout = () => {
    warmUp();
    setRun((r) => r + 1);
    setScreen("run");
  };

  const fullscreen = screen === "session" || screen === "run";

  return (
    <div className="min-h-svh">
      {!fullscreen && (
        <header className="sticky top-0 z-40 border-b border-bone/10 bg-ink/85 backdrop-blur-md">
          <div className="container-x mx-auto flex h-14 max-w-7xl items-center justify-between md:h-16">
            <button type="button" onClick={() => setScreen("home")} aria-label="AURUM Coach — início" className="flex items-center gap-3 text-[22px] md:text-[26px]">
              <BrandInline />
              <span aria-hidden className="h-5 w-px bg-bone/25" />
              <span className="display text-[0.7em] text-orange">Coach</span>
            </button>
            <Link href="/" className="group flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-bone">
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden>
                <path d="M20 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <span className="hidden sm:inline">Voltar ao site</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </div>
        </header>
      )}

      <motion.main
        id="conteudo"
        key={fullscreen ? `${screen}-${run}` : screen}
        // Só opacidade: transform aqui quebraria os elementos fixos (sessão, barra de ações)
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {screen === "home" && (
          <Home
            onPick={(e) => {
              setEnv(e);
              setRegion("todos");
              setTab("treinos");
              libScroll.current = 0;
              setScreen("library");
            }}
          />
        )}

        {screen === "library" && (
          <Library
            env={env}
            region={region}
            tab={tab}
            onEnv={(e) => {
              setEnv(e);
              setRegion("todos");
            }}
            onRegion={setRegion}
            onTab={setTab}
            onOpen={open}
            onOpenWorkout={openWorkout}
            onBack={() => setScreen("home")}
          />
        )}

        {/* ——— Exercício avulso ——— */}
        {screen === "detail" && ex && (
          <Detail
            exercise={ex}
            variantIdx={variantIdx}
            target={target}
            onVariant={setVariantIdx}
            onTarget={setTarget}
            onCamera={() => start({ kind: "camera" })}
            onVideo={(file) => start({ kind: "video", file })}
            onBack={() => setScreen("library")}
          />
        )}

        {screen === "session" && ex && (
          <Session
            key={run}
            exercise={ex}
            variant={ex.variants[variantIdx] ?? ex.variants[0]}
            target={target}
            source={source}
            onFinish={(r) => {
              setResult(r);
              setScreen("summary");
            }}
            onExit={() => setScreen("detail")}
          />
        )}

        {screen === "summary" && ex && result && (
          <Summary
            exercise={ex}
            result={result}
            onAgain={() => (source.kind === "camera" ? start({ kind: "camera" }) : setScreen("detail"))}
            onChange={() => setScreen("library")}
          />
        )}

        {/* ——— Treino completo ——— */}
        {screen === "workout" && workout && (
          <WorkoutDetail
            workout={workout}
            rounds={rounds}
            rest={rest}
            sets={sets}
            onRounds={setRounds}
            onRest={setRest}
            onSets={setSets}
            onStart={startWorkout}
            onBack={() => setScreen("library")}
          />
        )}

        {screen === "run" && workout && (
          <WorkoutRunner
            key={run}
            workout={workout}
            rounds={rounds}
            rest={rest}
            sets={sets}
            onDone={(results, elapsed) => {
              setRunResults({ results, elapsed });
              setScreen("workoutSummary");
            }}
          />
        )}

        {screen === "workoutSummary" && workout && runResults && (
          <WorkoutSummary
            workout={workout}
            rounds={rounds}
            sets={sets}
            results={runResults.results}
            elapsedMs={runResults.elapsed}
            onAgain={startWorkout}
            onBack={() => {
              setTab("treinos");
              setScreen("library");
            }}
          />
        )}
      </motion.main>
    </div>
  );
}
