/**
 * Detecção de pose no navegador (MediaPipe Pose Landmarker), adaptada do
 * projeto Moveo. Nenhum vídeo ou imagem sai do dispositivo: o runtime wasm e
 * o modelo são baixados de CDNs públicas e ficam em cache do navegador.
 */
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm";
// "full": mais estável que "lite" para pernas e vistas de perfil, ainda em tempo real.
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

export interface Pt {
  x: number;
  y: number;
  visibility?: number;
}

const IDX = {
  nose: 0,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFoot: 31,
  rightFoot: 32,
} as const;

export type Key = keyof typeof IDX;
export type Landmarks = Record<Key, Pt>;
export const KEYS = Object.keys(IDX) as Key[];

let landmarker: Promise<PoseLandmarker> | null = null;

export function loadPoseLandmarker(): Promise<PoseLandmarker> {
  if (!landmarker) {
    landmarker = import("@mediapipe/tasks-vision").then(async ({ FilesetResolver, PoseLandmarker }) => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      const create = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      // GPU (WebGL) é bem mais rápido; alguns aparelhos só funcionam na CPU
      return create("GPU").catch(() => create("CPU"));
    });
    landmarker.catch(() => {
      landmarker = null;
    });
  }
  return landmarker;
}

/**
 * Converte os 33 pontos do MediaPipe para o formato interno. Com a câmera
 * frontal o vídeo aparece espelhado, então o eixo X também é espelhado para
 * o desenho e os cálculos ficarem no mesmo referencial (ângulos não mudam).
 */
export function convert(raw: { x: number; y: number; visibility?: number }[] | undefined, mirror: boolean): Landmarks | null {
  if (!raw || raw.length < 33) return null;
  const out = {} as Landmarks;
  for (const k of KEYS) {
    const p = raw[IDX[k]];
    out[k] = { x: mirror ? 1 - p.x : p.x, y: p.y, visibility: p.visibility ?? 1 };
  }
  return out;
}

/** Suavização exponencial por ponto: reduz o tremido sem atrasar demais o movimento. */
export class Smoother {
  private prev: Landmarks | null = null;
  constructor(private alpha = 0.45) {}
  push(next: Landmarks): Landmarks {
    if (!this.prev) {
      this.prev = next;
      return next;
    }
    const out = {} as Landmarks;
    for (const k of KEYS) {
      const a = this.prev[k];
      const b = next[k];
      out[k] = { x: a.x + this.alpha * (b.x - a.x), y: a.y + this.alpha * (b.y - a.y), visibility: b.visibility };
    }
    this.prev = out;
    return out;
  }
  reset() {
    this.prev = null;
  }
}

export const SKELETON: Array<[Key, Key]> = [
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"],
  ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["leftAnkle", "leftHeel"],
  ["leftHeel", "leftFoot"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
  ["rightAnkle", "rightHeel"],
  ["rightHeel", "rightFoot"],
];
