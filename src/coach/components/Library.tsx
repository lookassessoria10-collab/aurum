"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { cn, EASE_OUT } from "@/lib/utils";
import { exercisesFor, LEVELS, REGIONS } from "../exercises";
import type { Env, Exercise, RegionId } from "../types";
import { AngleGlyph, RegionFigure } from "./Glyphs";

type Props = {
  env: Env;
  region: RegionId | "todos";
  onEnv: (env: Env) => void;
  onRegion: (r: RegionId | "todos") => void;
  onOpen: (ex: Exercise) => void;
  onBack: () => void;
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Library({ env, region, onEnv, onRegion, onOpen, onBack }: Props) {
  const [query, setQuery] = useState("");
  const all = useMemo(() => exercisesFor(env), [env]);
  const list = useMemo(() => {
    const q = norm(query.trim());
    return all.filter(
      (e) => (region === "todos" || e.region === region) && (!q || norm(`${e.name} ${e.muscles} ${e.equipment}`).includes(q)),
    );
  }, [all, region, query]);

  const groups = REGIONS.map((r) => ({ region: r, items: list.filter((e) => e.region === r.id) })).filter((g) => g.items.length);

  return (
    <div className="container-x mx-auto max-w-7xl pb-24 pt-6 md:pt-10">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bone/60 hover:text-bone">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path d="M20 12 H5 M11 6 L5 12 L11 18" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        Início
      </button>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-orange">{all.length} exercícios {env === "casa" ? "sem equipamento" : "na academia"}</p>
          <h1 className="display t-lg mt-3">Escolha o movimento</h1>
        </div>
        <div role="radiogroup" aria-label="Onde você vai treinar" className="flex border border-bone/20 p-1">
          {(["casa", "academia"] as const).map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={env === e}
              onClick={() => onEnv(e)}
              className={cn(
                "relative px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] transition-colors md:px-6",
                env === e ? "text-ink" : "text-bone/70 hover:text-bone",
              )}
            >
              {env === e && <motion.span layoutId="env-pill" className="absolute inset-0 bg-orange" transition={{ duration: 0.4, ease: EASE_OUT }} />}
              <span className="relative">{e === "casa" ? "Em casa" : "Na academia"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Regiões */}
      <div className="sticky top-14 z-20 -mx-4 mt-8 border-y border-line bg-ink/90 px-4 backdrop-blur-md md:top-16 md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
        <div className="flex gap-1 overflow-x-auto py-3 [scrollbar-width:none]" role="tablist" aria-label="Parte do corpo">
          {[{ id: "todos" as const, short: "Todos" }, ...REGIONS].map((r) => {
            const on = region === r.id;
            const n = r.id === "todos" ? all.length : all.filter((e) => e.region === r.id).length;
            if (!n) return null;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onRegion(r.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] transition-colors",
                  on ? "border-orange bg-orange/10 text-bone" : "border-transparent text-bone/60 hover:text-bone",
                )}
              >
                {r.id !== "todos" && <RegionFigure region={r.id} active={on} className="h-6 w-auto" />}
                {r.short}
                <span className={cn("tabular-nums", on ? "text-orange" : "text-bone/35")}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="mt-6 flex items-center gap-3 border-b border-bone/20 pb-2 focus-within:border-orange">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-bone/50" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M15 15 L20 20" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="sr-only">Buscar exercício</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por exercício, músculo ou equipamento"
          className="w-full bg-transparent py-2 text-sm text-bone outline-none placeholder:text-bone/35"
        />
      </label>

      <AnimatePresence mode="wait">
        <motion.div key={`${env}-${region}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
          {groups.length === 0 && <p className="mt-12 text-sm text-muted">Nenhum exercício encontrado com essa busca.</p>}
          {groups.map((g) => (
            <section key={g.region.id} className="mt-10" aria-labelledby={`r-${g.region.id}`}>
              {region === "todos" && (
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 id={`r-${g.region.id}`} className="display text-2xl md:text-3xl">
                    {g.region.name}
                  </h2>
                  <span className="text-xs text-muted">{g.items.length}</span>
                </div>
              )}
              {region !== "todos" && (
                <h2 id={`r-${g.region.id}`} className="sr-only">
                  {g.region.name}
                </h2>
              )}
              <ul className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((ex, i) => (
                  <li key={ex.id} className="bg-ink">
                    <Card ex={ex} index={i} onOpen={() => onOpen(ex)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Card({ ex, index, onOpen }: { ex: Exercise; index: number; onOpen: () => void }) {
  const [hover, setHover] = useState(false);
  const v = ex.variants[0];
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group flex h-full w-full items-stretch gap-4 p-4 text-left transition-colors hover:bg-ink-2 md:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 whitespace-nowrap text-[0.58rem] font-bold uppercase tracking-[0.16em]">
          <span className="text-orange">{ex.mode === "hold" ? `${ex.target} s` : `${ex.target} rep.`}</span>
          <span className="text-bone/30">·</span>
          <span className="truncate text-bone/55">{ex.variants.length > 1 ? "Lado ou frente" : v.view === "lateral" ? "Câmera de lado" : "Câmera de frente"}</span>
        </div>
        <p className="display mt-2 text-xl leading-[0.95] transition-colors group-hover:text-orange md:text-2xl">{ex.name}</p>
        <p className="mt-2 line-clamp-1 text-xs text-muted">{ex.equipment} · {ex.muscles}</p>
        <div className="mt-auto flex items-center gap-1 pt-3" aria-label={LEVELS[ex.level]}>
          {[1, 2, 3].map((l) => (
            <span key={l} className={cn("h-1 w-4 -skew-x-[30deg]", l <= ex.level ? "bg-orange" : "bg-bone/15")} />
          ))}
          <span className="ml-2 text-[0.6rem] text-bone/40">{LEVELS[ex.level]}</span>
        </div>
      </div>
      <AngleGlyph metric={v.metric} play={hover} className="h-14 w-20 shrink-0 self-center opacity-80 transition-opacity group-hover:opacity-100 md:h-16 md:w-24" />
    </motion.button>
  );
}
