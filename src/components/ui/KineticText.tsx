"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  words: readonly string[];
  /** Deslocamento horizontal em % da largura da faixa, do início ao fim do scroll */
  from?: number;
  to?: number;
  className?: string;
  outline?: boolean;
  separator?: React.ReactNode;
  /** Tipografia decorativa: escondida de leitores de tela por padrão */
  decorative?: boolean;
};

/** Faixa de palavras gigantes que atravessa a tela conforme o scroll. */
export function KineticText({
  words,
  from = 10,
  to = -40,
  className,
  outline = false,
  separator = <span className="mx-[0.3em] inline-block h-[0.12em] w-[0.6em] -skew-x-[24deg] bg-orange align-middle" />,
  decorative = true,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          track.current,
          { xPercent: from },
          {
            xPercent: to,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.4 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden={decorative || undefined} className={cn("overflow-hidden select-none", className)}>
      <div ref={track} className={cn("display whitespace-nowrap will-change-transform", outline && "outline-text")}>
        {words.map((w, i) => (
          <span key={i}>
            {w}
            {i < words.length - 1 && separator}
          </span>
        ))}
      </div>
    </div>
  );
}
