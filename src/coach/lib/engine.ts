/**
 * Motor do AURUM Coach: recebe os pontos do corpo a cada quadro e devolve
 * eventos (repetição, correção, meta) e um retrato do estado para a tela.
 *
 * Fluxo: ALINHAR (corpo visível, vista certa, posição inicial, parado)
 *        → ATIVO (conta repetições ou o tempo de isometria e corrige a execução).
 */
import type { Exercise, FormCheck, RepCheck, Variant } from "../types";
import type { Key, Landmarks } from "./pose";
import { ANGLE_SIGNALS, computeSignals, motionBetween, nearestSide, read, type Side, type Signals } from "./signals";

/** Limiares da repetição, em fração do caminho entre a posição inicial e o fim do movimento. */
export const ENTER = 0.5;
export const EXIT = 0.25;
export const FULL = 0.85;
const MIN_REP_MS = 300;
const ALIGN_MS = 1000;
const CUE_GAP_MS = 2600;
const SAME_CUE_GAP_MS = 6500;

export interface RepRecord {
  n: number;
  full: boolean;
  /** Fração do movimento atingida (1 = alvo). */
  peak: number;
  /** Valor do sinal no pico e no início (graus para sinais angulares). */
  peakValue: number;
  restValue: number;
  duration: number;
  issues: string[];
  side?: Side;
  /** Momento (ms desde o início da série). */
  t: number;
  praise?: boolean;
}

export type CoachEvent =
  | { type: "aligned" }
  | { type: "align-msg"; text: string }
  | { type: "rep"; rep: RepRecord }
  | { type: "cue"; text: string }
  | { type: "lost" }
  | { type: "found" }
  | { type: "hold-start" }
  | { type: "hold-left"; seconds: number }
  | { type: "target" };

export interface Snapshot {
  phase: "align" | "active";
  message: string;
  steady: number;
  reps: number;
  fullReps: number;
  progress: number;
  value: number;
  holdMs: number;
  inPosition: boolean;
  everInPosition: boolean;
  cue: string | null;
  cueAt: number;
  side: Side;
  lost: boolean;
  problems: string[];
  elapsed: number;
}

export interface SessionResult {
  exerciseId: string;
  view: Variant["view"];
  mode: Exercise["mode"];
  target: number;
  reps: RepRecord[];
  holdMs: number;
  inPositionPct: number;
  elapsedMs: number;
  issues: { cue: string; count: number }[];
  timeline: { t: number; text: string }[];
  source: "camera" | "video";
  angle: boolean;
  metricLabel: string;
}

const PART_NAMES: Partial<Record<Key, string>> = {
  nose: "a cabeça",
  leftShoulder: "os ombros",
  rightShoulder: "os ombros",
  leftElbow: "os cotovelos",
  rightElbow: "os cotovelos",
  leftWrist: "as mãos",
  rightWrist: "as mãos",
  leftHip: "o quadril",
  rightHip: "o quadril",
  leftKnee: "os joelhos",
  rightKnee: "os joelhos",
  leftAnkle: "os pés",
  rightAnkle: "os pés",
  leftFoot: "os pés",
  rightFoot: "os pés",
};

/** Articulações que cada sinal usa (para exigir que estejam visíveis e para desenhar). */
export const SIGNAL_JOINTS: Record<string, [string, string, string] | undefined> = {
  kneeFlex: ["Hip", "Knee", "Ankle"],
  hipFlex: ["Shoulder", "Hip", "Knee"],
  elbowFlex: ["Shoulder", "Elbow", "Wrist"],
  shoulder: ["Hip", "Shoulder", "Elbow"],
  ankle: ["Knee", "Ankle", "Foot"],
  shinLean: ["Knee", "Ankle", "Foot"],
  thighAbd: ["Shoulder", "Hip", "Knee"],
  kneeRise: ["Shoulder", "Hip", "Knee"],
  forearmTilt: ["Shoulder", "Elbow", "Wrist"],
  bodyLine: ["Shoulder", "Hip", "Ankle"],
  bodyLineKnee: ["Shoulder", "Hip", "Knee"],
  heelRise: ["Ankle", "Heel", "Foot"],
};

const FOCUS_JOINTS = {
  full: ["Shoulder", "Hip", "Knee", "Ankle"],
  upper: ["Shoulder", "Elbow", "Wrist", "Hip"],
  lower: ["Hip", "Knee", "Ankle"],
} as const;

const keyOf = (side: Side, joint: string) => `${side === "L" ? "left" : "right"}${joint}` as Key;

function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

interface Counter {
  side?: Side;
  inRep: boolean;
  /** Último instante bem perto da posição inicial (início real do movimento). */
  lowAt: number;
  /** Último instante abaixo do limiar de saída (reserva, se o movimento não volta tão perto). */
  restAt: number;
  /** Ponto mais próximo da posição inicial desde a última repetição. */
  restP: number;
  restValue: number;
  lastEnd: number;
  peak: number;
  peakValue: number;
  agg: Map<RepCheck, number>;
}

const PRAISE_EVERY = 4;

export class CoachEngine {
  phase: "align" | "active" = "align";
  private near: Side = "L";
  private baseline: Record<string, number> = {};
  private okSince: number | null = null;
  private buffer: Signals[] = [];
  private prevLm: Landmarks | null = null;
  private motion = 0.2;
  private message = "Procurando você na imagem…";
  private lastSeen = -1;
  private lost = false;
  private startT = 0;
  private lastT = 0;

  private counters: Counter[];
  private reps: RepRecord[] = [];
  private cycleIssues = new Set<string>();
  private restSnap: Signals = {};
  private cleanStreak = 0;

  private since = new Map<FormCheck | "hold", number>();
  private active = new Set<string>();
  private lastCueAt = -Infinity;
  private lastByText = new Map<string, number>();
  private cue: string | null = null;
  private cueAt = 0;
  private timeline: { t: number; text: string }[] = [];
  private counts = new Map<string, number>();

  private holdMs = 0;
  private activeMs = 0;
  private everInPosition = false;
  private inPosition = false;
  private announced = new Set<number>();
  private targetHit = false;

  private progress = 0;
  private value = 0;

  constructor(
    private ex: Exercise,
    private v: Variant,
    private opts: { target: number; source: "camera" | "video" },
  ) {
    this.counters = v.metric.side === "each" ? [this.newCounter("L"), this.newCounter("R")] : [this.newCounter()];
  }

  private newCounter(side?: Side): Counter {
    return { side, inRep: false, lowAt: 0, restAt: 0, restP: Infinity, restValue: 0, lastEnd: 0, peak: 0, peakValue: 0, agg: new Map() };
  }

  /** Pontos que precisam estar visíveis para analisar este exercício. */
  private required(): Key[] {
    const joints = new Set<string>(FOCUS_JOINTS[this.ex.focus ?? "full"]);
    for (const j of SIGNAL_JOINTS[this.v.metric.signal] ?? []) joints.add(j);
    const sides: Side[] = this.v.view === "lateral" ? [this.near] : ["L", "R"];
    const keys: Key[] = [];
    for (const s of sides) for (const j of joints) keys.push(keyOf(s, j));
    return keys;
  }

  // ——— Leitura do sinal principal ———
  private raw(sig: Signals, side?: Side) {
    const m = this.v.metric;
    const mode = m.side === "each" ? (side ?? "max") : (m.side ?? "near");
    return read(sig, m.signal, mode, this.near);
  }

  private frac(sig: Signals, side?: Side) {
    const m = this.v.metric;
    let v = this.raw(sig, side);
    if (m.relative) v -= this.baseline[`${m.signal}.${side ?? "_"}`] ?? 0;
    const span = m.peak - m.rest || 1;
    return (v - m.rest) / span;
  }

  private frame(sig: Signals) {
    if (this.v.metric.side === "each") return Math.max(this.frac(sig, "L"), this.frac(sig, "R"));
    return this.frac(sig);
  }

  // ——— Atualização por quadro ———
  update(lm: Landmarks | null, aspect: number, t: number): CoachEvent[] {
    const events: CoachEvent[] = [];
    const dt = this.lastT ? Math.min(Math.max(t - this.lastT, 0), 120) : 0;
    this.lastT = t;

    if (this.phase === "align") {
      this.align(lm, aspect, t, events);
      return events;
    }

    // Corpo sumiu do enquadramento: pausa sem perder a contagem
    const vis = lm ? this.visibleShare(lm) : 0;
    if (!lm || vis < 0.6) {
      if (!this.lost && this.lastSeen > 0 && t - this.lastSeen > 700) {
        this.lost = true;
        this.message = "Perdi você de vista. Volte para o enquadramento.";
        events.push({ type: "lost" });
      }
      this.prevLm = null;
      return events;
    }
    this.lastSeen = t;
    if (this.lost) {
      this.lost = false;
      events.push({ type: "found" });
    }

    const sig = computeSignals(lm, aspect);
    this.progress = this.frame(sig);
    this.value = this.raw(sig);
    this.activeMs += dt;

    const anyInRep = this.counters.some((c) => c.inRep);
    if (!anyInRep && this.progress < EXIT) this.restSnap = sig;

    this.checks(sig, t, events);

    if (this.ex.mode === "reps") this.countReps(sig, t, events);
    else this.hold(sig, t, dt, events);

    this.prevLm = lm;
    return events;
  }

  private visibleShare(lm: Landmarks) {
    const req = this.required();
    let ok = 0;
    for (const k of req) {
      const p = lm[k];
      if ((p.visibility ?? 0) > 0.45 && p.x > -0.02 && p.x < 1.02 && p.y > -0.02 && p.y < 1.02) ok++;
    }
    return ok / req.length;
  }

  private align(lm: Landmarks | null, aspect: number, t: number, events: CoachEvent[]) {
    const isVideo = this.opts.source === "video";
    let msg = "";

    if (!lm) {
      msg = "Não encontrei você. Fique inteiro na frente da câmera.";
    } else {
      if (this.v.view === "lateral") this.near = nearestSide(lm);
      const sig = computeSignals(lm, aspect);
      const req = this.required();

      const missing = req.filter((k) => (lm[k].visibility ?? 0) < 0.45 || lm[k].y > 1.01 || lm[k].y < -0.01 || lm[k].x < -0.01 || lm[k].x > 1.01);
      const xs = req.map((k) => lm[k].x);
      const ys = req.map((k) => lm[k].y);
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
      const edge = req.some((k) => lm[k].x < 0.015 || lm[k].x > 0.985 || lm[k].y < 0.01 || lm[k].y > 0.99);
      const ratio = this.shoulderRatio(lm, aspect);

      if (this.prevLm) {
        const m = motionBetween(lm, this.prevLm, aspect, sig.scale);
        this.motion = this.motion * 0.8 + m * 0.2;
      }
      this.prevLm = lm;

      if (missing.length) {
        const parts = [...new Set(missing.map((k) => PART_NAMES[k]).filter(Boolean))];
        msg = `Não estou vendo ${joinPt(parts.slice(0, 2))}. Afaste o celular ou ajuste o ângulo.`;
      } else if (edge) {
        msg = "Afaste-se um pouco: o corpo está encostando na borda.";
      } else if (span < ((this.ex.focus ?? "full") === "upper" ? 0.14 : 0.3)) {
        msg = "Chegue um pouco mais perto da câmera.";
      } else if (this.v.view === "lateral" && ratio > 0.42 && !isVideo) {
        msg = "Vire de lado para a câmera.";
      } else if (this.v.view === "frontal" && ratio < 0.45 && !isVideo) {
        msg = "Fique de frente para a câmera.";
      } else if (!isVideo && this.ex.mode === "reps" && !this.v.metric.relative && this.frame(sig) > 0.3) {
        msg = `Posição inicial: ${this.ex.start.charAt(0).toLowerCase()}${this.ex.start.slice(1)}.`;
      } else if (!isVideo && this.motion > 0.045) {
        msg = "Fique parado um instante.";
      }

      if (!msg) {
        this.buffer.push(sig);
        if (this.buffer.length > 40) this.buffer.shift();
      }
    }

    if (msg) {
      this.okSince = null;
      if (!isVideo || !lm) this.buffer = [];
    } else if (this.okSince === null) {
      this.okSince = t;
    }

    const needed = isVideo ? 250 : ALIGN_MS;
    if (!msg && this.okSince !== null && t - this.okSince >= needed) {
      this.begin(t);
      events.push({ type: "aligned" });
      return;
    }

    const shown = msg || "Ótimo, segure a posição…";
    if (shown !== this.message) {
      this.message = shown;
      events.push({ type: "align-msg", text: shown });
    }
  }

  private shoulderRatio(lm: Landmarks, aspect: number) {
    const sx = (lm.leftShoulder.x - lm.rightShoulder.x) * aspect;
    const sy = lm.leftShoulder.y - lm.rightShoulder.y;
    const mx = ((lm.leftShoulder.x + lm.rightShoulder.x) / 2 - (lm.leftHip.x + lm.rightHip.x) / 2) * aspect;
    const my = (lm.leftShoulder.y + lm.rightShoulder.y) / 2 - (lm.leftHip.y + lm.rightHip.y) / 2;
    return Math.hypot(sx, sy) / Math.max(Math.hypot(mx, my), 1e-4);
  }

  /** Pula o alinhamento (botão "Começar mesmo assim"). */
  forceStart(t: number) {
    if (this.phase === "active") return;
    this.begin(t);
  }

  private begin(t: number) {
    // Linha de base dos sinais relativos: mediana do período parado
    const m = this.v.metric;
    if (m.relative && this.buffer.length) {
      const sides: (Side | undefined)[] = m.side === "each" ? ["L", "R"] : [undefined];
      for (const s of sides) {
        this.baseline[`${m.signal}.${s ?? "_"}`] = median(this.buffer.map((b) => this.raw(b, s)));
      }
    }
    if (this.buffer.length) this.restSnap = this.buffer[this.buffer.length - 1];
    this.phase = "active";
    this.startT = t;
    this.lastSeen = t;
    this.message = "";
    for (const c of this.counters) {
      c.restAt = c.lowAt = c.lastEnd = t;
    }
  }

  // ——— Correções quadro a quadro ———
  private checks(sig: Signals, t: number, events: CoachEvent[]) {
    const isHold = this.ex.mode === "hold";
    const inRep = this.counters.some((c) => c.inRep);
    for (const c of this.v.checks ?? []) {
      const when = isHold ? "any" : (c.when ?? "rep");
      const gate =
        when === "any" ||
        (when === "rep" && inRep) ||
        (when === "bottom" && inRep && this.progress > 0.6) ||
        (when === "top" && !inRep && this.progress < 0.3);

      let bad = false;
      if (gate) {
        const raw = read(sig, c.signal, c.side ?? "near", this.near);
        const value = c.drift ? Math.abs(raw - read(this.restSnap, c.signal, c.side ?? "near", this.near)) : raw;
        bad = (c.above !== undefined && value > c.above) || (c.below !== undefined && value < c.below);
      }

      if (!bad) {
        this.since.delete(c);
        this.active.delete(c.cue);
        continue;
      }
      const s = this.since.get(c) ?? t;
      this.since.set(c, s);
      if (t - s < (c.ms ?? 250)) continue;

      if (!this.active.has(c.cue)) {
        this.active.add(c.cue);
        if (isHold && this.everInPosition) this.bump(c.cue);
      }
      if (!isHold) this.cycleIssues.add(c.cue);
      if (!isHold || this.everInPosition) this.say(c.cue, t, events);
    }
  }

  private say(text: string, t: number, events: CoachEvent[], force = false) {
    if (!force) {
      if (t - this.lastCueAt < CUE_GAP_MS) return;
      if (t - (this.lastByText.get(text) ?? -Infinity) < SAME_CUE_GAP_MS) return;
    }
    this.lastCueAt = t;
    this.lastByText.set(text, t);
    this.cue = text;
    this.cueAt = t;
    this.timeline.push({ t: t - this.startT, text });
    events.push({ type: "cue", text });
  }

  private bump(cue: string) {
    this.counts.set(cue, (this.counts.get(cue) ?? 0) + 1);
  }

  // ——— Repetições ———
  private countReps(sig: Signals, t: number, events: CoachEvent[]) {
    for (const c of this.counters) {
      const p = this.frac(sig, c.side);
      const value = this.raw(sig, c.side);

      if (!c.inRep) {
        if (p < c.restP) {
          c.restP = p;
          c.restValue = value;
        }
        if (p < EXIT) c.restAt = t;
        if (p < 0.12) c.lowAt = t;
        if (p > ENTER) {
          c.inRep = true;
          c.peak = p;
          c.peakValue = value;
          c.agg.clear();
        }
        continue;
      }

      if (p > c.peak) {
        c.peak = p;
        c.peakValue = value;
      }
      for (const rc of this.v.repChecks ?? []) {
        const v = read(sig, rc.signal, rc.side ?? "near", this.near);
        const prev = c.agg.get(rc);
        c.agg.set(rc, prev === undefined ? v : rc.agg === "max" ? Math.max(prev, v) : Math.min(prev, v));
      }

      if (p < EXIT) {
        c.inRep = false;
        // Do início real do movimento até a volta (a parte final, abaixo de 25%, é estimada)
        const begin = c.lowAt >= c.lastEnd ? c.lowAt : c.restAt;
        const duration = Math.round((t - begin) * 1.12);
        if (duration < MIN_REP_MS) continue;
        this.finishRep(c, duration, t, events);
        c.lastEnd = c.restAt = t;
        c.restP = p;
        c.restValue = value;
      }
    }
  }

  private finishRep(c: Counter, duration: number, t: number, events: CoachEvent[]) {
    const full = c.peak >= FULL;
    const issues = new Set(this.cycleIssues);
    for (const rc of this.v.repChecks ?? []) {
      const v = c.agg.get(rc);
      if (v === undefined) continue;
      if ((rc.above !== undefined && v > rc.above) || (rc.below !== undefined && v < rc.below)) issues.add(rc.cue);
    }
    if (!full) issues.add(this.v.depthCue ?? "Complete o movimento");
    if (this.ex.tempo && duration < this.ex.tempo * 1000 * 0.75) issues.add("Mais devagar, controle o movimento");
    this.cycleIssues.clear();

    for (const i of issues) this.bump(i);
    this.cleanStreak = issues.size ? 0 : this.cleanStreak + 1;

    const rep: RepRecord = {
      n: this.reps.length + 1,
      full,
      peak: c.peak,
      peakValue: c.peakValue,
      restValue: c.restValue,
      duration,
      issues: [...issues],
      side: c.side,
      t: t - this.startT,
      praise: !issues.size && this.cleanStreak > 0 && this.cleanStreak % PRAISE_EVERY === 0,
    };
    this.reps.push(rep);

    if (rep.issues.length) {
      // A voz fala o número com a correção; evita outra correção logo em seguida
      this.lastCueAt = t;
      this.lastByText.set(rep.issues[0], t);
      this.cue = rep.issues[0];
      this.cueAt = t;
      const live = this.timeline.some((e) => e.text === rep.issues[0] && t - this.startT - e.t < 4000);
      if (!live) this.timeline.push({ t: t - this.startT, text: `${rep.n}ª repetição: ${rep.issues[0]}` });
    }
    events.push({ type: "rep", rep });

    if (!this.targetHit && this.reps.length >= this.opts.target && this.opts.source === "camera") {
      this.targetHit = true;
      events.push({ type: "target" });
    }
  }

  // ——— Isometria ———
  private hold(sig: Signals, t: number, dt: number, events: CoachEvent[]) {
    const h = this.v.hold;
    if (!h) return;
    const value = this.raw(sig);
    const [lo, hi] = h.range;
    const out = value < lo ? h.low : value > hi ? h.high : null;

    if (out) {
      const s = this.since.get("hold") ?? t;
      this.since.set("hold", s);
      if (t - s > 350) {
        if (this.everInPosition) {
          if (!this.active.has(out)) {
            this.active.add(out);
            this.bump(out);
          }
          this.say(out, t, events);
        }
        this.inPosition = false;
      }
    } else {
      this.since.delete("hold");
      this.active.delete(h.low);
      this.active.delete(h.high);
    }

    const formOk = ![...this.active].some((a) => a !== h.low && a !== h.high);
    const ok = !out && formOk;
    if (ok) {
      this.inPosition = true;
      if (!this.everInPosition) {
        this.everInPosition = true;
        events.push({ type: "hold-start" });
      }
    } else if (!out) {
      this.inPosition = false;
    }

    if (this.inPosition && this.everInPosition) this.holdMs += dt;

    const goal = this.opts.target * 1000;
    const left = Math.ceil((goal - this.holdMs) / 1000);
    for (const mark of [20, 10, 3, 2, 1]) {
      if (left === mark && !this.announced.has(mark) && this.opts.target > mark + 4) {
        this.announced.add(mark);
        events.push({ type: "hold-left", seconds: mark });
      }
    }
    if (!this.targetHit && this.holdMs >= goal && this.opts.source === "camera") {
      this.targetHit = true;
      events.push({ type: "target" });
    }
  }

  snapshot(t: number): Snapshot {
    const reps = this.reps.length;
    return {
      phase: this.phase,
      message: this.message,
      steady: this.okSince === null ? 0 : Math.min(1, (t - this.okSince) / (this.opts.source === "video" ? 250 : ALIGN_MS)),
      reps,
      fullReps: this.reps.filter((r) => r.full).length,
      progress: this.progress,
      value: this.value,
      holdMs: this.holdMs,
      inPosition: this.inPosition,
      everInPosition: this.everInPosition,
      cue: this.cue && t - this.cueAt < 2800 ? this.cue : null,
      cueAt: this.cueAt,
      side: this.near,
      lost: this.lost,
      problems: [...this.active],
      elapsed: this.phase === "active" ? t - this.startT : 0,
    };
  }

  get nearSide() {
    return this.near;
  }

  result(): SessionResult {
    const issues = [...this.counts.entries()].map(([cue, count]) => ({ cue, count })).sort((a, b) => b.count - a.count);
    return {
      exerciseId: this.ex.id,
      view: this.v.view,
      mode: this.ex.mode,
      target: this.opts.target,
      reps: this.reps,
      holdMs: this.holdMs,
      inPositionPct: this.activeMs ? Math.min(1, this.holdMs / this.activeMs) : 0,
      elapsedMs: this.phase === "active" ? this.lastT - this.startT : 0,
      issues,
      timeline: this.timeline,
      source: this.opts.source,
      angle: ANGLE_SIGNALS.has(this.v.metric.signal),
      metricLabel: this.v.metric.label,
    };
  }
}

function joinPt(parts: (string | undefined)[]) {
  const p = parts.filter(Boolean) as string[];
  if (p.length <= 1) return p[0] ?? "o corpo todo";
  return `${p.slice(0, -1).join(", ")} e ${p[p.length - 1]}`;
}
