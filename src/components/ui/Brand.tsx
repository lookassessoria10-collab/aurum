import Image from "next/image";
import { brand } from "@/content/aurum";
import { cn } from "@/lib/utils";

/*
 * Marca 2026 recortada do PNG oficial (ver scripts/brand-assets.mjs):
 * ícone, AURUM e a frase "Movimento que se constrói." na tipografia original.
 * As proporções são preservadas; só a largura ou a altura é definida via className.
 */

type Props = { className?: string; priority?: boolean };

const ALT = `AURUM — ${brand.tagline}`;

/** Assinatura vertical oficial: ícone, AURUM e frase. Sem a frase em usos muito pequenos. */
export function BrandLockup({ className, priority, tagline = true }: Props & { tagline?: boolean }) {
  if (tagline) {
    return (
      <Image
        src="/aurum/brand/aurum-lockup-2026.png"
        alt={ALT}
        width={1287}
        height={931}
        preload={priority}
        className={cn("h-auto", className)}
        sizes="(max-width: 768px) 60vw, 400px"
      />
    );
  }
  return (
    <span role="img" aria-label="AURUM" className={cn("inline-flex flex-col items-center", className)}>
      <Image src="/aurum/brand/aurum-symbol-2026.png" alt="" width={416} height={514} preload={priority} className="h-auto w-[34%]" sizes="160px" />
      <Image src="/aurum/brand/aurum-wordmark-solo-2026.png" alt="" width={1099} height={205} preload={priority} className="mt-[9%] h-auto w-full" sizes="400px" />
    </span>
  );
}

/** Assinatura horizontal: ícone à esquerda; AURUM e a frase à direita. */
export function BrandHorizontal({ className }: Props) {
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-[5%]", className)}>
      <Image src="/aurum/brand/aurum-symbol-2026.png" alt="" width={416} height={514} className="h-auto w-[20%] shrink-0" sizes="80px" />
      <span className="flex min-w-0 flex-1 flex-col">
        <Image src="/aurum/brand/aurum-wordmark-solo-2026.png" alt="" width={1099} height={205} className="h-auto w-full" sizes="260px" />
        <Image src="/aurum/brand/aurum-tagline-2026.png" alt="" width={1287} height={58} className="mt-[7%] h-auto w-full" sizes="260px" />
      </span>
    </span>
  );
}

/** Ícone + AURUM lado a lado (cabeçalho). */
export function BrandInline({ className, priority }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-[0.35em]", className)}>
      <Image src="/aurum/brand/aurum-symbol-2026.png" alt="" width={416} height={514} preload={priority} className="h-[1.35em] w-auto" sizes="60px" />
      <Image src="/aurum/brand/aurum-wordmark-solo-2026.png" alt="AURUM" width={1099} height={205} preload={priority} className="h-[0.75em] w-auto" sizes="180px" />
    </span>
  );
}

export function BrandSymbol({ className, alt = "" }: Props & { alt?: string }) {
  return (
    <Image src="/aurum/brand/aurum-symbol-2026.png" alt={alt} width={416} height={514} className={className} sizes="(max-width: 768px) 40vw, 320px" />
  );
}
