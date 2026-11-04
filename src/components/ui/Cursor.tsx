"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

const INTERACTIVE = "a, button, [role='tab'], [data-cursor]";

/**
 * Anel sutil que segue o cursor e expande sobre elementos interativos.
 * O cursor nativo continua visível. Desligado no toque e com movimento reduzido.
 */
export function Cursor() {
  const enabled = useMediaQuery("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  return enabled ? <CursorRing /> : null;
}

function CursorRing() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.5 });
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setHover(Boolean((e.target as Element | null)?.closest?.(INTERACTIVE)));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] rounded-full border border-bone/50 mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hover ? 64 : 26,
        height: hover ? 64 : 26,
        opacity: visible ? 1 : 0,
        backgroundColor: hover ? "rgba(244,244,244,0.12)" : "rgba(244,244,244,0)",
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}
