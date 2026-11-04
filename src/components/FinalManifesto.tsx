"use client";

import { useRef } from "react";
import { finalManifesto } from "@/content/aurum";
import { BrandSymbol } from "@/components/ui/Brand";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

const LINE = "text-[clamp(2rem,7vw,7.5rem)]";

/**
 * Tela preta: as frases entram alternando os lados, uma cortina laranja atravessa
 * e a assinatura AURUM fecha a narrativa.
 */
export function FinalManifesto() {
  const motionOk = useMediaQuery(MQ.motion);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!motionOk) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-fm-line]");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });
      lines.forEach((el, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        tl.fromTo(
          el,
          { xPercent: 70 * dir, skewX: 18 * dir, opacity: 0 },
          { xPercent: 0, skewX: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
          i * 0.8,
        );
        if (i > 0) tl.to(lines[i - 1], { opacity: 0.2, duration: 0.5 }, i * 0.8);
      });
      const end = lines.length * 0.8 + 0.2;
      tl.fromTo("[data-fm-curtain]", { xPercent: -120, opacity: 1 }, { xPercent: 220, duration: 1.1, ease: "power2.inOut" }, end)
        .to("[data-fm-lines]", { opacity: 0, duration: 0.1 }, end + 0.45)
        .fromTo("[data-fm-sign]", { yPercent: 140, scale: 1.25 }, { yPercent: 0, scale: 1, duration: 0.9, ease: "power4.out" }, end + 0.55)
        .fromTo("[data-fm-symbol]", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, end + 0.7)
        .fromTo("[data-fm-tag]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, end + 0.9)
        .to({}, { duration: 0.4 });
    },
    { scope: root, dependencies: [motionOk], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="manifesto"
      data-section
      aria-labelledby="manifesto-final-title"
      className={cn("relative bg-black", motionOk ? "h-[240vh]" : "py-24")}
    >
      <div className={cn("flex flex-col justify-center overflow-hidden container-x", motionOk && "sticky top-0 h-screen")}>
        <h2 id="manifesto-final-title" className="sr-only">
          Manifesto AURUM
        </h2>
        <div className={cn(motionOk && "absolute inset-0 flex flex-col justify-center container-x")}>
          <ul data-fm-lines className={cn("display", LINE)}>
            {finalManifesto.lines.map((l, i) => (
              <li key={l} className="line-mask">
                <span data-fm-line className={cn("block", i === finalManifesto.lines.length - 1 && "text-orange")}>
                  {l}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {motionOk && (
          <div
            data-fm-curtain
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[60%] bg-orange"
            style={{ clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)", opacity: 0 }}
          />
        )}

        <div className={cn("flex flex-col items-start gap-6", motionOk ? "absolute inset-0 justify-center container-x" : "mt-20")}>
          <div data-fm-symbol>
            <BrandSymbol className="h-auto w-24 md:w-36" />
          </div>
          <p className="line-mask">
            <span data-fm-sign className="display t-mega block origin-left">
              {finalManifesto.signature}
            </span>
          </p>
          <p data-fm-tag className="display t-md text-orange">
            {finalManifesto.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
