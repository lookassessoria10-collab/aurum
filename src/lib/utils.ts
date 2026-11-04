import type { Line } from "@/content/aurum";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function lineText(line: Line): string {
  return typeof line === "string" ? line : line.text;
}

export function lineAccent(line: Line): boolean {
  return typeof line !== "string" && Boolean(line.accent);
}

/** Curva usada em todas as revelações: rápida na entrada, precisa no final. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_SNAP = [0.7, 0, 0.2, 1] as const;
