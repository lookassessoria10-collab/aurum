import { cn } from "@/lib/utils";

type Props = {
  index: string;
  children: React.ReactNode;
  className?: string;
};

/** Pequena etiqueta editorial no canto das seções: "03 —— Funcional". */
export function SectionLabel({ index, children, className }: Props) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-muted", className)}>
      <span className="tabular-nums text-orange">{index}</span>
      <span aria-hidden className="h-px w-8 bg-orange/70" />
      <span>{children}</span>
    </p>
  );
}
