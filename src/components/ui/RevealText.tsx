"use client";

import { motion } from "motion/react";
import type { Line } from "@/content/aurum";
import { cn, EASE_OUT, lineAccent, lineText } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span";

type Props = {
  lines: readonly Line[];
  as?: Tag;
  id?: string;
  className?: string;
  lineClassName?: string;
  /** Atraso inicial em segundos */
  delay?: number;
  stagger?: number;
  /** Direção de entrada: de baixo (padrão) ou da lateral */
  from?: "bottom" | "left" | "right";
  /** Anima ao montar em vez de esperar entrar na tela */
  immediate?: boolean;
};

// 140% garante que acentos (Ã, Ç, É) não apareçam acima da máscara antes da revelação
const OFFSET = { bottom: { y: "140%" }, left: { x: "-108%" }, right: { x: "108%" } };

/**
 * Revela cada linha por clipping: o texto desliza de dentro de uma máscara.
 * Com prefers-reduced-motion o MotionConfig global remove o deslocamento.
 */
export function RevealText({
  lines,
  as = "h2",
  id,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  from = "bottom",
  immediate = false,
}: Props) {
  const Tag = motion[as];
  const target = { x: "0%", y: "0%" };

  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      {...(immediate ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: 0.35 } })}
    >
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className={cn("block", lineAccent(line) && "text-orange", lineClassName)}
            variants={{
              hidden: { x: "0%", y: "0%", ...OFFSET[from] },
              shown: { ...target, transition: { duration: 0.85, ease: EASE_OUT, delay: delay + i * stagger } },
            }}
          >
            {lineText(line)}
          </motion.span>{" "}
        </span>
      ))}
    </Tag>
  );
}
