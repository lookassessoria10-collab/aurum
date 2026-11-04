"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * - Motion respeita prefers-reduced-motion (transforms viram cortes secos).
 * - ScrollTrigger recalcula posições depois que fontes e imagens carregam.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
