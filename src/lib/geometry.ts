"use client";

import { useEffect, useState } from "react";

/**
 * Converte um caminho em coordenadas 0–100 (comandos absolutos M, L, C, Q)
 * para pixels, evitando deformar o traço quando o SVG estica.
 */
export function scalePath(d: string, w: number, h: number): string {
  let axis = 0;
  return d.replace(/[MLCQ]|-?\d*\.?\d+/g, (token) => {
    if (/[MLCQ]/.test(token)) {
      axis = 0;
      return token;
    }
    const v = parseFloat(token) * (axis++ % 2 === 0 ? w : h) * 0.01;
    return v.toFixed(1);
  });
}

/** Tamanho em pixels de um elemento, atualizado por ResizeObserver. */
export function useElementSize<T extends Element>(ref: React.RefObject<T | null>) {
  const [size, setSize] = useState({ w: 100, h: 100 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}
