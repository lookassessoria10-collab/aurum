import Image from "next/image";
import { brand } from "@/content/aurum";
import { cn } from "@/lib/utils";

/*
 * Assinaturas montadas com os recortes oficiais (ver scripts/brand-assets.mjs):
 * símbolo + wordmark AURUM, sem alterar proporções. A frase de assinatura
 * ("Movimento que se constrói.") entra como texto, porque as versões do logo
 * com frase trazem a assinatura antiga desenhada.
 */

type Props = { className?: string; priority?: boolean };

const ALT = `AURUM — ${brand.tagline}`;

/** Assinatura vertical: símbolo, AURUM e (opcional) a frase embaixo. */
export function BrandLockup({ className, priority, tagline = true }: Props & { tagline?: boolean }) {
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex flex-col items-center", className)}>
      <Image src="/aurum/brand/aurum-symbol.png" alt="" width={347} height={276} preload={priority} className="h-auto w-[44%]" sizes="200px" />
      <Image src="/aurum/brand/aurum-wordmark-solo.png" alt="" width={792} height={145} preload={priority} className="mt-[7%] h-auto w-full" sizes="400px" />
      {tagline && <span className="mt-[5%] whitespace-nowrap font-normal tracking-[0.22em] text-bone">{brand.tagline}</span>}
    </span>
  );
}

/** Assinatura horizontal: símbolo à esquerda, AURUM e a frase à direita. */
export function BrandHorizontal({ className }: Props) {
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-[5%]", className)}>
      <Image src="/aurum/brand/aurum-symbol.png" alt="" width={347} height={276} className="h-auto w-[26%] shrink-0" sizes="90px" />
      <span className="flex min-w-0 flex-1 flex-col">
        <Image src="/aurum/brand/aurum-wordmark-solo.png" alt="" width={792} height={145} className="h-auto w-full" sizes="240px" />
        <span className="mt-[6%] whitespace-nowrap text-[0.6rem] font-normal tracking-[0.12em] text-bone md:text-[0.68rem] md:tracking-[0.16em]">
          {brand.tagline}
        </span>
      </span>
    </span>
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

