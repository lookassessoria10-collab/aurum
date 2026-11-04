import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Assinaturas oficiais recortadas das peças da marca (ver scripts/brand-assets.mjs).
 * As proporções originais são preservadas: só a altura é definida via className.
 */

type Props = { className?: string; priority?: boolean };

const ALT = "AURUM — Ritmo que se constrói.";

export function BrandLockup({ className, priority }: Props) {
  return (
    <Image
      src="/aurum/brand/aurum-lockup.png"
      alt={ALT}
      width={792}
      height={544}
      preload={priority}
      className={className}
      sizes="(max-width: 768px) 60vw, 400px"
    />
  );
}

export function BrandHorizontal({ className }: Props) {
  return (
    <Image
      src="/aurum/brand/aurum-lockup-horizontal.png"
      alt={ALT}
      width={475}
      height={108}
      className={className}
      sizes="320px"
    />
  );
}

/** Símbolo + wordmark lado a lado, como nas aplicações horizontais da marca. */
export function BrandInline({ className, priority }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-[0.35em]", className)}>
      <Image
        src="/aurum/brand/aurum-symbol.png"
        alt=""
        width={347}
        height={276}
        preload={priority}
        className="h-[1.25em] w-auto"
        sizes="60px"
      />
      <Image
        src="/aurum/brand/aurum-wordmark-solo.png"
        alt="AURUM"
        width={792}
        height={145}
        preload={priority}
        className="h-[0.8em] w-auto"
        sizes="160px"
      />
    </span>
  );
}

export function BrandSymbol({ className, alt = "" }: Props & { alt?: string }) {
  return (
    <Image
      src="/aurum/brand/aurum-symbol.png"
      alt={alt}
      width={347}
      height={276}
      className={className}
      sizes="(max-width: 768px) 40vw, 320px"
    />
  );
}

