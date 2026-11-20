import type { SideMode } from "./lib/signals";

export type Env = "casa" | "academia";
export type View = "frontal" | "lateral";
export type Posture = "standing" | "floor" | "seated" | "hanging" | "bench";
export type Focus = "full" | "upper" | "lower";
export type RegionId = "pernas" | "empurrar" | "puxar" | "core" | "corpo" | "mobilidade";

/** Sinal que define a repetição: sai de `rest` (posição inicial) e chega a `peak`. */
export interface Metric {
  signal: string;
  /** "each" conta cada lado separadamente (movimentos alternados). */
  side?: SideMode | "each";
  rest: number;
  peak: number;
  /** rest/peak são somados à linha de base medida no alinhamento. */
  relative?: boolean;
  /** Nome do que está sendo medido, para a tela ("Flexão do joelho"). */
  label: string;
}

/** Problema de execução verificado quadro a quadro. */
export interface FormCheck {
  signal: string;
  side?: SideMode;
  above?: number;
  below?: number;
  /**
   * Quando checar: "rep" durante a repetição (padrão), "bottom" perto do fim do
   * movimento, "top" na posição inicial, "any" o tempo todo.
   */
  when?: "any" | "rep" | "bottom" | "top";
  /** Compara com o valor do início da repetição (ex.: tronco que balança). */
  drift?: boolean;
  /** Tempo que o problema precisa durar para virar correção (ms). */
  ms?: number;
  cue: string;
}

/** Verificação feita ao final de cada repetição, com o máximo/mínimo atingido. */
export interface RepCheck {
  signal: string;
  side?: SideMode;
  agg: "max" | "min";
  above?: number;
  below?: number;
  cue: string;
}

/** Exercícios isométricos: o tempo só corre com o valor dentro da faixa. */
export interface Hold {
  range: [number, number];
  /** Correção quando o valor fica abaixo / acima da faixa. */
  low: string;
  high: string;
}

/** Forma de filmar e analisar o exercício (de lado, de frente). */
export interface Variant {
  view: View;
  /** O que essa vista observa (ex.: "Profundidade e tronco"). */
  label: string;
  metric: Metric;
  checks?: FormCheck[];
  repChecks?: RepCheck[];
  hold?: Hold;
  /** Correção para repetição incompleta. */
  depthCue?: string;
}

export interface Exercise {
  id: string;
  name: string;
  region: RegionId;
  env: Env[];
  posture: Posture;
  focus?: Focus;
  mode: "reps" | "hold";
  level: 1 | 2 | 3;
  equipment: string;
  /** Repetições (total) ou segundos. */
  target: number;
  /** Alterna os lados: a meta é o total somando os dois lados. */
  alternating?: boolean;
  muscles: string;
  /** Duração mínima saudável de cada repetição (s) — abaixo disso, pede controle. */
  tempo?: number;
  /** Posição inicial, dita pela voz no alinhamento. */
  start: string;
  steps: string[];
  variants: Variant[];
}

export interface Region {
  id: RegionId;
  name: string;
  short: string;
  blurb: string;
}
