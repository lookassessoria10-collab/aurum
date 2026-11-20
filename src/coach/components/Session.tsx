"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn, EASE_OUT } from "@/lib/utils";
import { CoachEngine, FULL, type CoachEvent, type SessionResult, type Snapshot } from "../lib/engine";
import { drawOverlay, setCanvasFont } from "../lib/draw";
import { convert, loadPoseLandmarker, Smoother } from "../lib/pose";
import { setVoiceEnabled, speak, stopSpeech, voiceEnabled } from "../lib/speech";
import type { Exercise, Variant } from "../types";

export type SessionSource = { kind: "camera" } | { kind: "video"; file: File };

type Props = {
  exercise: Exercise;
  variant: Variant;
  target: number;
  source: SessionSource;
  onFinish: (result: SessionResult) => void;
  /** Saiu antes de começar (ou pulou, dentro de um treino). */
  onExit: () => void;
  /** Dentro de um treino completo: posição na sequência. */
  workout?: { index: number; total: number; name: string; set: number; sets: number };
  /** Encerrar o treino inteiro (com o resultado parcial deste exercício, se houver). */
  onQuit?: (result: SessionResult | null) => void;
  initialFacing?: "user" | "environment";
  onFacing?: (facing: "user" | "environment") => void;
};

const PRAISE = ["Boa!", "Isso!", "Execução perfeita!", "Ótimo ritmo!", "Amplitude completa!", "Continua assim!"];

function cameraError(err: unknown) {
  const name = (err as { name?: string })?.name;
  if (typeof window !== "undefined" && !window.isSecureContext) return "A câmera só funciona em conexão segura (https).";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Permissão da câmera negada. Libere o acesso à câmera nas configurações do navegador e tente de novo.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "Nenhuma câmera encontrada neste aparelho.";
  if (name === "NotReadableError") return "A câmera está sendo usada por outro aplicativo. Feche-o e tente de novo.";
  return "Não foi possível abrir a câmera.";
}

export function Session({ exercise, variant, target, source, onFinish, onExit, workout, onQuit, initialFacing = "user", onFacing }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);
  // Motor novo a cada série (o componente é remontado a cada série)
  const [engine] = useState(() => new CoachEngine(exercise, variant, { target, source: source.kind }));

  const [facing, setFacing] = useState<"user" | "environment">(initialFacing);
  const [status, setStatus] = useState<"loading" | "running" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [voice, setVoice] = useState(voiceEnabled);
  const [aspect, setAspect] = useState(source.kind === "video" ? 9 / 16 : 4 / 3);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [lastRep, setLastRep] = useState<{ n: number; full: boolean; key: number } | null>(null);
  const [videoPct, setVideoPct] = useState(0);
  const [canForce, setCanForce] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isVideo = source.kind === "video";
  const mirror = !isVideo && facing === "user";

  // Mapa correção → sinal (para pintar o segmento com problema)
  const cueSignal = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of variant.checks ?? []) m.set(c.cue, c.signal);
    if (variant.hold) {
      m.set(variant.hold.low, variant.metric.signal);
      m.set(variant.hold.high, variant.metric.signal);
    }
    return m;
  }, [variant]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (engine.phase !== "active") onExit();
    else onFinish(engine.result());
  }, [engine, onExit, onFinish]);
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  // "Sair": dentro de um treino encerra o treino todo; fora dele, encerra a série
  const quit = () => {
    if (!onQuit) return finish();
    if (doneRef.current) return;
    doneRef.current = true;
    onQuit(engine.phase === "active" ? engine.result() : null);
  };

  useEffect(() => {
    setCanvasFont(getComputedStyle(document.body).fontFamily);
  }, []);

  // Encaixa o palco na proporção do vídeo
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const w = Math.min(W, H * aspect);
      setBox({ w: Math.floor(w), h: Math.floor(w / aspect) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect]);

  // Liberar o botão "Começar mesmo assim" se o alinhamento demorar
  useEffect(() => {
    if (isVideo || status !== "running") return;
    const id = window.setTimeout(() => setCanForce(true), 9000);
    return () => window.clearTimeout(id);
  }, [isVideo, status]);

  // Câmera/vídeo + detecção de pose
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let url: string | null = null;
    let wake: WakeLockSentinel | null = null;
    const video = videoRef.current;
    if (!video) return;
    const smoother = new Smoother(0.5);

    let alignMsg = "";
    let alignSince = 0;
    let alignSpokenAt = -Infinity;
    let alignSpoken = "";

    const onEvents = (events: CoachEvent[]) => {
      for (const e of events) {
        switch (e.type) {
          case "aligned":
            speak(exercise.mode === "hold" ? `Posição encontrada. ${exercise.start}.` : "Posição encontrada. Pode começar!", { interrupt: true });
            break;
          case "rep": {
            const r = e.rep;
            const extra = r.issues[0] ?? (r.praise ? PRAISE[r.n % PRAISE.length] : "");
            speak(extra ? `${r.n}. ${extra}` : String(r.n), { interrupt: true });
            setLastRep({ n: r.n, full: r.full, key: performance.now() });
            break;
          }
          case "cue":
            speak(e.text, { interrupt: true });
            break;
          case "lost":
            speak("Perdi você de vista. Volte para o enquadramento.", { interrupt: true });
            break;
          case "hold-start":
            speak("Valendo! Segure firme.", { interrupt: true });
            break;
          case "hold-left":
            speak(e.seconds >= 10 ? `Faltam ${e.seconds} segundos` : String(e.seconds), { interrupt: true });
            break;
          case "target":
            speak(
              workout
                ? exercise.mode === "hold" ? "Tempo concluído!" : "Meta concluída!"
                : exercise.mode === "hold" ? "Tempo concluído! Excelente trabalho." : "Meta concluída! Excelente trabalho.",
              { interrupt: true },
            );
            window.setTimeout(() => finishRef.current(), workout ? 1200 : 1700);
            break;
        }
      }
    };

    const start = async () => {
      setStatus("loading");
      setError(null);
      try {
        const media = (async () => {
          if (source.kind === "camera") {
            if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no-media"), { name: "NotFoundError" });
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false,
            });
            video.srcObject = stream;
          } else {
            url = URL.createObjectURL(source.file);
            video.src = url;
          }
          video.muted = true;
          video.playsInline = true;
          await new Promise<void>((res) => {
            if (video.readyState >= 2) res();
            else video.addEventListener("loadeddata", () => res(), { once: true });
          });
          if (video.videoWidth && video.videoHeight) setAspect(video.videoWidth / video.videoHeight);
        })().catch((err) => {
          throw { kind: "media", err };
        });
        const model = loadPoseLandmarker().catch((err) => {
          throw { kind: "model", err };
        });
        const [, landmarker] = await Promise.all([media, model]);
        if (cancelled) return;
        await video.play().catch(() => undefined);
        try {
          // Mantém a tela acesa durante a série
          wake = (await navigator.wakeLock?.request("screen")) ?? null;
        } catch {
          wake = null;
        }
        setStatus("running");

        let lastVideoTime = -1;
        let lastUi = 0;
        let failures = 0;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (video.readyState < 2 || (video.paused && !video.ended)) return;
          if (video.currentTime === lastVideoTime) return;
          lastVideoTime = video.currentTime;
          const now = performance.now();
          let result;
          try {
            result = landmarker.detectForVideo(video, now);
            failures = 0;
          } catch (err) {
            if (++failures === 1) console.warn("[AURUM Coach] falha na detecção de pose", err);
            if (failures > 45) {
              cancelAnimationFrame(raf);
              setError("A análise de movimento não está funcionando neste navegador. Tente atualizar a página ou usar o Chrome.");
              setStatus("error");
            }
            return;
          }
          let lm = convert(result.landmarks?.[0], mirror);
          if (lm) lm = smoother.push(lm);
          else smoother.reset();
          const ratio = video.videoWidth / video.videoHeight || 1;
          const t = source.kind === "video" ? video.currentTime * 1000 : now;
          onEvents(engine.update(lm, ratio, t));
          const s = engine.snapshot(t);

          // Fala de alinhamento: só quando a instrução fica estável
          if (s.phase === "align") {
            if (s.message !== alignMsg) {
              alignMsg = s.message;
              alignSince = now;
            } else if (now - alignSince > 1400 && alignSpoken !== alignMsg && now - alignSpokenAt > 4500 && !alignMsg.startsWith("Ótimo")) {
              alignSpoken = alignMsg;
              alignSpokenAt = now;
              speak(alignMsg);
            }
          }

          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
              canvas.width = Math.round(w * dpr);
              canvas.height = Math.round(h * dpr);
            }
            if (ctx) {
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
              if (lm) {
                drawOverlay(ctx, lm, w, h, {
                  signal: variant.metric.signal,
                  side: variant.metric.side ?? "near",
                  near: engine.nearSide,
                  view: variant.view,
                  problems: s.problems.map((p) => cueSignal.get(p)).filter(Boolean) as string[],
                  active: s.phase === "active",
                });
              } else ctx.clearRect(0, 0, w, h);
            }
          }

          if (now - lastUi > 80) {
            lastUi = now;
            setSnap(s);
            if (source.kind === "video" && video.duration) setVideoPct(video.currentTime / video.duration);
          }
        };
        raf = requestAnimationFrame(loop);
      } catch (e) {
        if (cancelled) return;
        const fail = e as { kind?: string; err?: unknown };
        setError(
          fail.kind === "model"
            ? "Não foi possível carregar a análise de movimento. Verifique a conexão e tente de novo."
            : source.kind === "video"
              ? "Não foi possível abrir este vídeo. Tente um arquivo MP4 ou MOV."
              : cameraError(fail.err),
        );
        setStatus("error");
      }
    };

    const onEnded = () => {
      if (engine.phase === "active") return finishRef.current();
      // O vídeo acabou sem o corpo ficar enquadrado: explica em vez de voltar em silêncio
      cancelAnimationFrame(raf);
      setError(
        `Não consegui acompanhar o exercício neste vídeo. ${engine.snapshot(0).message} Confira se o corpo aparece inteiro e se o vídeo foi gravado ${variant.view === "lateral" ? "de lado" : "de frente"}.`,
      );
      setStatus("error");
    };
    video.addEventListener("ended", onEnded);
    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("ended", onEnded);
      video.pause();
      stream?.getTracks().forEach((tr) => tr.stop());
      video.srcObject = null;
      if (url) URL.revokeObjectURL(url);
      wake?.release().catch(() => undefined);
      stopSpeech();
    };
    // facing/attempt reiniciam a mídia; o resto é fixo durante a série
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing, attempt]);

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    setVoiceEnabled(next);
    if (next) speak("Voz ligada");
  };

  const s = snap;
  const isHold = exercise.mode === "hold";
  const act = s?.phase === "active" ? s : null;
  const active = Boolean(act);
  const holdSec = s ? Math.floor(s.holdMs / 1000) : 0;
  const progress = s ? Math.max(0, Math.min(1.15, s.progress)) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-ink text-bone">
      {/* Barra superior */}
      <div className="relative flex h-14 shrink-0 items-center justify-between gap-3 border-b border-bone/10 px-3 md:h-16 md:px-6">
        <button type="button" onClick={quit} className="flex h-10 items-center gap-2 pr-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-bone/70 hover:text-bone">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Sair
        </button>
        <div className="min-w-0 text-center">
          <p className="display truncate text-base md:text-xl">{exercise.name}</p>
          <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-orange">
            {isVideo
              ? "Análise do vídeo"
              : workout
                ? `${workout.sets > 1 ? `Série ${workout.set}/${workout.sets} · ` : ""}${workout.index + 1} de ${workout.total} · ${variant.view === "lateral" ? "de lado" : "de frente"}`
                : variant.label}
          </p>
        </div>
        {workout && (
          <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] bg-bone/10">
            <span className="block h-full bg-orange" style={{ width: `${(workout.index / workout.total) * 100}%` }} />
          </span>
        )}
        <div className="flex items-center gap-1">
          <IconButton label={voice ? "Desligar voz" : "Ligar voz"} onClick={toggleVoice} pressed={voice}>
            {voice ? (
              <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z M16.5 8.5 Q19 12 16.5 15.5 M18.8 6 Q23 12 18.8 18" />
            ) : (
              <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z M17 9 L22 15 M22 9 L17 15" />
            )}
          </IconButton>
          {!isVideo && (
            <IconButton
              label="Trocar câmera"
              onClick={() => {
                const next = facing === "user" ? "environment" : "user";
                setFacing(next);
                onFacing?.(next);
              }}
            >
              <path d="M4 8 H7 L9 5 H15 L17 8 H20 V19 H4 Z M9 13 A3 3 0 0 1 15 12 M15 12 L16.5 10.5 M15 12 L13.2 11" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Palco */}
      <div ref={wrapRef} className="relative min-h-0 flex-1">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-graphite-2" style={{ width: box.w, height: box.h }}>
          <video ref={videoRef} className={cn("absolute inset-0 h-full w-full object-cover", mirror && "-scale-x-100")} playsInline muted />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

          {/* Moldura de alinhamento */}
          <AnimatePresence>
            {status === "running" && s?.phase === "align" && (
              <motion.div className="pointer-events-none absolute inset-[5%]" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
                {(["left-0 top-0 border-l-[3px] border-t-[3px]", "right-0 top-0 border-r-[3px] border-t-[3px]", "bottom-0 left-0 border-b-[3px] border-l-[3px]", "bottom-0 right-0 border-b-[3px] border-r-[3px]"] as const).map((c) => (
                  <span key={c} className={cn("absolute h-10 w-10 transition-colors duration-300 md:h-14 md:w-14", c, (s?.steady ?? 0) > 0 ? "border-orange" : "border-bone/70")} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contador / cronômetro */}
          {act && (
            <div className="pointer-events-none absolute left-3 top-3 md:left-5 md:top-5">
              <div className="flex items-baseline gap-1.5 rounded-sm bg-ink/75 px-3 py-2 backdrop-blur-sm">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={isHold ? holdSec : act.reps}
                    className="display text-5xl leading-none md:text-7xl"
                    initial={{ y: "60%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-60%", opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    {String(isHold ? holdSec : act.reps).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="display text-lg text-bone/50 md:text-2xl">/{target}</span>
              </div>
              <p className="mt-1.5 pl-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-bone/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                {isHold ? (act.inPosition ? "segundos em posição" : "tempo pausado") : `repetições · ${act.fullReps} completas`}
              </p>
            </div>
          )}

          {/* Medidor de amplitude */}
          {active && !isHold && (
            <div className="pointer-events-none absolute right-3 top-1/2 flex h-[46%] -translate-y-1/2 flex-col items-center gap-2 md:right-5">
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-bone/80 [writing-mode:vertical-rl]">amplitude</span>
              <div className="relative w-3 flex-1 overflow-hidden rounded-full bg-ink/70 ring-1 ring-bone/20 md:w-4">
                <div className="absolute inset-x-0 bottom-0 bg-orange transition-[height] duration-100" style={{ height: `${(progress / 1.15) * 100}%`, opacity: progress >= FULL ? 1 : 0.65 }} />
                <div className="absolute inset-x-0 h-[2px] bg-bone" style={{ bottom: `${(FULL / 1.15) * 100}%` }} />
              </div>
            </div>
          )}

          {/* Resultado da última repetição */}
          <AnimatePresence>
            {lastRep && active && (
              <motion.div
                key={lastRep.key}
                className={cn(
                  "pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-sm px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em]",
                  lastRep.full ? "bg-orange text-ink" : "bg-bone text-ink",
                )}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {lastRep.n}ª · {lastRep.full ? "completa" : "incompleta"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagens e correções */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col items-center gap-2 md:bottom-6">
            <AnimatePresence mode="wait">
              {status === "running" && s && (s.phase === "align" || s.lost || (isHold && !s.everInPosition)) ? (
                <motion.div
                  key={s.lost ? "lost" : s.phase === "align" ? s.message : "hold"}
                  className="max-w-xl rounded-sm bg-ink/85 px-4 py-3 text-center backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-orange">
                    {s.lost ? "Enquadramento" : s.phase === "align" ? "Alinhe o corpo" : "Posição inicial"}
                  </p>
                  <p className="mt-1 text-sm font-semibold md:text-base">
                    {s.lost ? "Perdi você de vista. Volte para o enquadramento." : s.phase === "align" ? s.message : `${exercise.start}.`}
                  </p>
                  {s.phase === "align" && (
                    <div className="mx-auto mt-2 h-[3px] w-40 overflow-hidden bg-bone/15">
                      <div className="h-full bg-orange transition-[width] duration-100" style={{ width: `${s.steady * 100}%` }} />
                    </div>
                  )}
                </motion.div>
              ) : s?.cue ? (
                <motion.div
                  key={s.cue + s.cueAt}
                  className="max-w-xl bg-orange px-4 py-3 text-center text-ink"
                  initial={{ opacity: 0, y: 14, clipPath: "inset(0 100% 0 0)" }}
                  animate={{ opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)" }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <p className="display text-lg leading-tight md:text-2xl">{s.cue}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Carregando / erro */}
          {status !== "running" && (
            <div className="absolute inset-0 grid place-items-center bg-ink/90 p-6 text-center">
              {status === "loading" ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.span
                    className="block h-12 w-12 rounded-full border-[3px] border-bone/15 border-t-orange"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="display text-xl">Preparando o coach</p>
                  <p className="max-w-xs text-sm text-muted">
                    {isVideo ? "Carregando o vídeo e a análise de movimento." : "Abrindo a câmera e carregando a análise de movimento (mais rápido a partir da segunda vez)."}
                  </p>
                </div>
              ) : (
                <div className="flex max-w-sm flex-col items-center gap-4">
                  <p className="display text-2xl text-orange">Ops</p>
                  <p className="text-sm text-bone/85">{error}</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setAttempt((a) => a + 1)} className="bg-orange px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ink">
                      Tentar de novo
                    </button>
                    <button type="button" onClick={() => (onQuit ? onQuit(null) : onExit())} className="border border-bone/30 px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.2em]">
                      {onQuit ? "Encerrar treino" : "Voltar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-bone/10 px-3 py-3 md:px-6">
        {isVideo ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">Vídeo</span>
            <div className="h-[3px] flex-1 bg-bone/15">
              <div className="h-full bg-orange" style={{ width: `${videoPct * 100}%` }} />
            </div>
          </div>
        ) : (
          <p className="min-w-0 flex-1 truncate text-[0.68rem] font-medium text-muted">
            Meta: {target} {isHold ? "segundos" : exercise.alternating ? "repetições (somando os dois lados)" : "repetições"}
          </p>
        )}
        <div className="flex items-center gap-2">
          {canForce && s?.phase === "align" && (
            <button
              type="button"
              onClick={() => engine.forceStart(isVideo ? (videoRef.current?.currentTime ?? 0) * 1000 : performance.now())}
              className="border border-bone/30 px-3 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] hover:border-bone"
            >
              Começar assim
            </button>
          )}
          <button type="button" onClick={finish} className="bg-orange px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-ink md:px-6 md:py-3">
            {isVideo ? "Parar análise" : workout ? (active ? "Próximo" : "Pular exercício") : active ? "Encerrar série" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center text-bone/80 transition-colors hover:text-orange"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
