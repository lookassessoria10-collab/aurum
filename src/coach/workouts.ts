/**
 * Treinos completos do AURUM Coach: sequências de 7 a 8 exercícios da
 * biblioteca (src/coach/exercises.ts), feitas em ordem, com descanso guiado.
 *
 * Para criar um treino novo, basta listar os ids dos exercícios e a meta de
 * cada um (repetições ou segundos). Sem meta, vale a meta padrão do exercício.
 */
import { exerciseById } from "./exercises";
import type { Env, Exercise, RegionId } from "./types";

export type WorkoutFocus = "inferiores" | "superiores" | "cardio" | "core" | "corpo" | "mobilidade";

export interface WorkoutItem {
  id: string;
  target?: number;
  /** Índice da forma de filmar (0 = recomendada). */
  variant?: number;
}

export interface Workout {
  id: string;
  name: string;
  env: Env[];
  focus: WorkoutFocus;
  level: 1 | 2 | 3;
  /** Descanso entre séries e exercícios (s). */
  rest: number;
  /** Quantas vezes a sequência inteira é repetida (circuito). */
  rounds: number;
  /** Séries seguidas de cada exercício antes de passar ao próximo (musculação). */
  sets: number;
  blurb: string;
  items: WorkoutItem[];
}

export const FOCUS: Record<WorkoutFocus, { label: string; figure: RegionId | "superiores" | "inferiores" }> = {
  inferiores: { label: "Membros inferiores", figure: "inferiores" },
  superiores: { label: "Membros superiores", figure: "superiores" },
  cardio: { label: "Cardio e condicionamento", figure: "corpo" },
  core: { label: "Core e abdômen", figure: "core" },
  corpo: { label: "Corpo inteiro", figure: "corpo" },
  mobilidade: { label: "Mobilidade", figure: "mobilidade" },
};

const CASA: Env[] = ["casa"];
const ACADEMIA: Env[] = ["academia"];
const AMBOS: Env[] = ["casa", "academia"];

export const WORKOUTS: Workout[] = [
  // ————— EM CASA —————
  {
    id: "casa-inferiores",
    name: "Pernas e glúteos em casa",
    env: CASA,
    focus: "inferiores",
    level: 2,
    rest: 30,
    rounds: 2,
    sets: 1,
    blurb: "Agachar, avançar e empurrar o quadril, só com o peso do corpo. Termina com isometria na parede.",
    items: [
      { id: "marcha", target: 30 },
      { id: "agachamento-livre", target: 15 },
      { id: "afundo-reverso", target: 16 },
      { id: "ponte", target: 15 },
      { id: "agachamento-sumo", target: 15 },
      { id: "abducao-em-pe", target: 20 },
      { id: "panturrilha", target: 20 },
      { id: "cadeirinha", target: 40 },
    ],
  },
  {
    id: "casa-superiores",
    name: "Superiores sem equipamento",
    env: CASA,
    focus: "superiores",
    level: 2,
    rest: 30,
    rounds: 2,
    sets: 1,
    blurb: "Empurrar e puxar com o peso do corpo: flexões, remada na mesa e mergulho na cadeira.",
    items: [
      { id: "flexao-inclinada", target: 12 },
      { id: "remada-invertida", target: 10 },
      { id: "flexao-pike", target: 8 },
      { id: "superman", target: 12 },
      { id: "mergulho-banco", target: 12 },
      { id: "flexao-joelhos", target: 12 },
      { id: "toque-ombro", target: 16 },
      { id: "prancha-alta", target: 30 },
    ],
  },
  {
    id: "casa-cardio",
    name: "Cardio HIIT em casa",
    env: CASA,
    focus: "cardio",
    level: 3,
    rest: 20,
    rounds: 2,
    sets: 1,
    blurb: "Circuito intenso para elevar a frequência cardíaca. Descansos curtos, duas voltas.",
    items: [
      { id: "polichinelo", target: 30 },
      { id: "skipping", target: 40 },
      { id: "agachamento-salto", target: 12 },
      { id: "escalador", target: 30 },
      { id: "burpee", target: 8 },
      { id: "avanco-salto", target: 16 },
      { id: "polichinelo", target: 30 },
      { id: "marcha", target: 40 },
    ],
  },
  {
    id: "casa-core",
    name: "Core e abdômen",
    env: AMBOS,
    focus: "core",
    level: 2,
    rest: 25,
    rounds: 2,
    sets: 1,
    blurb: "Controle do tronco do começo ao fim: abdominais, pranchas e isometrias.",
    items: [
      { id: "dead-bug", target: 16 },
      { id: "abdominal", target: 15 },
      { id: "elevacao-pernas", target: 12 },
      { id: "prancha", target: 30 },
      { id: "russian-twist", target: 20 },
      { id: "prancha-lateral", target: 25 },
      { id: "abdominal-remador", target: 12 },
      { id: "canoinha", target: 20 },
    ],
  },
  {
    id: "casa-corpo-iniciante",
    name: "Corpo inteiro para começar",
    env: CASA,
    focus: "corpo",
    level: 1,
    rest: 30,
    rounds: 2,
    sets: 1,
    blurb: "Primeiro treino completo: pernas, peito, costas e core, em ritmo confortável.",
    items: [
      { id: "marcha", target: 40 },
      { id: "agachamento-livre", target: 12 },
      { id: "flexao-inclinada", target: 10 },
      { id: "ponte", target: 15 },
      { id: "afundo", target: 10 },
      { id: "superman", target: 12 },
      { id: "prancha", target: 20 },
      { id: "polichinelo", target: 20 },
    ],
  },
  {
    id: "casa-express",
    name: "Express 7 exercícios",
    env: CASA,
    focus: "corpo",
    level: 2,
    rest: 15,
    rounds: 2,
    sets: 1,
    blurb: "Sete exercícios rápidos com descanso curto: o treino para os dias corridos.",
    items: [
      { id: "polichinelo", target: 30 },
      { id: "cadeirinha", target: 30 },
      { id: "flexao", target: 10 },
      { id: "abdominal", target: 15 },
      { id: "step-up", target: 12 },
      { id: "agachamento-livre", target: 15 },
      { id: "mergulho-banco", target: 12 },
    ],
  },

  // ————— NA ACADEMIA —————
  {
    id: "academia-inferiores",
    name: "Inferiores completo",
    env: ACADEMIA,
    focus: "inferiores",
    level: 2,
    rest: 60,
    rounds: 1,
    sets: 3,
    blurb: "Quadríceps, posteriores, glúteos e panturrilhas, do agachamento às máquinas.",
    items: [
      { id: "agachamento-barra", target: 10 },
      { id: "leg-press", target: 12 },
      { id: "stiff", target: 10 },
      { id: "hip-thrust", target: 10 },
      { id: "bulgaro", target: 10 },
      { id: "extensora", target: 12 },
      { id: "flexora", target: 12 },
      { id: "panturrilha", target: 15 },
    ],
  },
  {
    id: "academia-gluteos",
    name: "Glúteos em foco",
    env: ACADEMIA,
    focus: "inferiores",
    level: 2,
    rest: 50,
    rounds: 1,
    sets: 3,
    blurb: "Empurrar o quadril, dobradiça e passadas para glúteos fortes e estáveis.",
    items: [
      { id: "hip-thrust", target: 12 },
      { id: "agachamento-sumo", target: 12 },
      { id: "stiff", target: 12 },
      { id: "bulgaro", target: 10 },
      { id: "step-up", target: 12 },
      { id: "swing", target: 15 },
      { id: "ponte-unilateral", target: 10 },
    ],
  },
  {
    id: "academia-empurrar",
    name: "Superiores: peito, ombros e tríceps",
    env: ACADEMIA,
    focus: "superiores",
    level: 2,
    rest: 60,
    rounds: 1,
    sets: 3,
    blurb: "Dia de empurrar: supinos, desenvolvimento, elevação lateral e tríceps.",
    items: [
      { id: "supino-reto", target: 10 },
      { id: "supino-inclinado", target: 10 },
      { id: "desenvolvimento", target: 10 },
      { id: "elevacao-lateral", target: 12 },
      { id: "paralelas", target: 8 },
      { id: "triceps-frances", target: 12 },
      { id: "triceps-polia", target: 12 },
    ],
  },
  {
    id: "academia-puxar",
    name: "Superiores: costas e bíceps",
    env: ACADEMIA,
    focus: "superiores",
    level: 2,
    rest: 60,
    rounds: 1,
    sets: 3,
    blurb: "Dia de puxar: puxada, remadas, trapézio e roscas.",
    items: [
      { id: "puxada-frente", target: 12 },
      { id: "remada-curvada", target: 10 },
      { id: "remada-unilateral", target: 10 },
      { id: "remada-baixa", target: 12 },
      { id: "encolhimento", target: 15 },
      { id: "rosca-direta", target: 12 },
      { id: "rosca-martelo", target: 12 },
    ],
  },
  {
    id: "academia-superiores",
    name: "Superiores completo",
    env: ACADEMIA,
    focus: "superiores",
    level: 2,
    rest: 60,
    rounds: 1,
    sets: 3,
    blurb: "Empurrar e puxar alternados, braços e uma prancha para fechar.",
    items: [
      { id: "supino-reto", target: 10 },
      { id: "puxada-frente", target: 12 },
      { id: "desenvolvimento", target: 10 },
      { id: "remada-baixa", target: 12 },
      { id: "elevacao-lateral", target: 12 },
      { id: "rosca-direta", target: 12 },
      { id: "triceps-polia", target: 12 },
      { id: "prancha", target: 30 },
    ],
  },
  {
    id: "academia-corpo",
    name: "Corpo inteiro na academia",
    env: ACADEMIA,
    focus: "corpo",
    level: 2,
    rest: 60,
    rounds: 1,
    sets: 3,
    blurb: "Os grandes padrões de movimento em um treino: agachar, empurrar, levantar e puxar.",
    items: [
      { id: "agachamento-goblet", target: 12 },
      { id: "supino-reto", target: 10 },
      { id: "terra", target: 6 },
      { id: "puxada-frente", target: 12 },
      { id: "desenvolvimento", target: 10 },
      { id: "afundo", target: 10 },
      { id: "rosca-direta", target: 12 },
      { id: "prancha", target: 30 },
    ],
  },
  {
    id: "academia-metabolico",
    name: "Circuito metabólico",
    env: ACADEMIA,
    focus: "cardio",
    level: 3,
    rest: 20,
    rounds: 2,
    sets: 1,
    blurb: "Kettlebell, peso do corpo e remada em ritmo forte. Duas voltas.",
    items: [
      { id: "swing", target: 15 },
      { id: "burpee", target: 10 },
      { id: "agachamento-goblet", target: 12 },
      { id: "escalador", target: 30 },
      { id: "step-up", target: 16 },
      { id: "polichinelo", target: 30 },
      { id: "remada-curvada", target: 12 },
      { id: "prancha", target: 30 },
    ],
  },
  {
    id: "academia-core",
    name: "Core avançado",
    env: ACADEMIA,
    focus: "core",
    level: 3,
    rest: 30,
    rounds: 1,
    sets: 2,
    blurb: "Barra fixa, roda abdominal e isometrias longas.",
    items: [
      { id: "elevacao-pernas-barra", target: 10 },
      { id: "roda-abdominal", target: 8 },
      { id: "prancha", target: 40 },
      { id: "dead-bug", target: 16 },
      { id: "russian-twist", target: 20 },
      { id: "prancha-lateral", target: 30 },
      { id: "canoinha", target: 20 },
    ],
  },

  // ————— CASA E ACADEMIA —————
  {
    id: "mobilidade",
    name: "Mobilidade e amplitude",
    env: AMBOS,
    focus: "mobilidade",
    level: 1,
    rest: 15,
    rounds: 1,
    sets: 1,
    blurb: "Ombros, quadril, coluna e tornozelos, com a amplitude medida grau a grau. Bom antes do treino ou nos dias de descanso.",
    items: [
      { id: "joelho-peito", target: 10 },
      { id: "flexao-ombro", target: 8 },
      { id: "abducao-ombro", target: 8 },
      { id: "inclinacao-lateral", target: 10 },
      { id: "alcance-pes", target: 8 },
      { id: "tornozelo", target: 10 },
      { id: "cossaco", target: 10 },
      { id: "cocoras", target: 30 },
    ],
  },
];

export const workoutById = (id: string) => WORKOUTS.find((w) => w.id === id);
/** Treinos do ambiente; os exclusivos dele aparecem antes dos compartilhados. */
export const workoutsFor = (env: Env) =>
  WORKOUTS.filter((w) => w.env.includes(env)).sort((a, b) => a.env.length - b.env.length);

export interface Step {
  exercise: Exercise;
  target: number;
  variant: number;
  round: number;
  /** Série deste exercício (1…sets). */
  set: number;
  sets: number;
  /** Posição do exercício na lista do treino (0…items-1). */
  item: number;
  /** Posição na sequência completa (0…total-1). */
  index: number;
}

/** Sequência completa do treino: voltas × exercícios × séries. */
export function stepsOf(w: Workout, rounds = w.rounds, sets = w.sets): Step[] {
  const steps: Step[] = [];
  for (let r = 1; r <= rounds; r++) {
    w.items.forEach((it, item) => {
      const exercise = exerciseById(it.id);
      if (!exercise) return;
      for (let s = 1; s <= sets; s++) {
        steps.push({ exercise, target: it.target ?? exercise.target, variant: it.variant ?? 0, round: r, set: s, sets, item, index: steps.length });
      }
    });
  }
  return steps;
}

/** Duração estimada (min): execução + posicionamento + descansos. */
export function estimateMinutes(w: Workout, rounds = w.rounds, rest = w.rest, sets = w.sets) {
  let s = 0;
  const steps = stepsOf(w, rounds, sets);
  for (const st of steps) {
    const ex = st.exercise;
    // Na primeira série é preciso posicionar o celular; nas seguintes, a posição é a mesma
    s += (st.set === 1 ? 15 : 5) + (ex.mode === "hold" ? st.target : st.target * (ex.tempo ? Math.max(2, ex.tempo * 1.8) : 1.3));
  }
  s += rest * Math.max(0, steps.length - 1);
  return Math.max(1, Math.round(s / 60));
}

export const targetLabel = (ex: Exercise, target: number) => (ex.mode === "hold" ? `${target} s` : `${target} rep.`);
