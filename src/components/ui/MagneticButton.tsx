"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";
import { isExternal } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "text";
  className?: string;
  strength?: number;
};

const styles = {
  primary: "bg-orange text-ink px-7 py-5 sm:px-9",
  ghost: "border border-bone/30 text-bone px-7 py-5 sm:px-9 hover:border-orange",
  text: "text-bone/80 px-1 py-3 hover:text-orange",
};

/** Botão de ação: puxado pelo cursor no desktop, link comum no toque. */
export function MagneticButton({ href, children, variant = "primary", className, strength = 0.28 }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const external = isExternal(href);

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y }}
      className={cn(
        "group relative inline-flex min-h-12 items-center gap-4 overflow-hidden text-xs font-bold uppercase tracking-[0.22em] transition-colors duration-300",
        styles[variant],
        className,
      )}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-[105%] -skew-x-[24deg] bg-bone transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-focus-visible:translate-x-0"
          style={{ width: "130%", left: "-15%" }}
        />
      )}
      <span className="relative">{children}</span>
      <svg aria-hidden viewBox="0 0 24 24" className="relative size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
        <path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" />
      </svg>
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </motion.a>
  );
}
