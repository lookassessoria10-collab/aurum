import { gallery } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { KineticText } from "@/components/ui/KineticText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";

const WORD = "text-[clamp(2rem,5.6vw,6rem)]";
const WORD_SM = "text-[clamp(1.5rem,3vw,3.2rem)]";

/** Sequência editorial compacta: grande, vertical e recortada, com palavras sobre as fotos. */
export function MovementGallery() {
  const [a, b, c, d, e, f] = gallery.items;
  return (
    <section id="galeria" data-section aria-labelledby="galeria-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="container-x">
        <SectionLabel index="12">{gallery.label}</SectionLabel>
        <h2 id="galeria-title" className="sr-only">
          {gallery.label}
        </h2>
      </div>

      <KineticText words={gallery.items.map((i) => i.word)} from={-5} to={-45} className="mt-8 text-[clamp(3rem,9vw,9rem)] text-bone" />

      <div className="relative mt-10 container-x md:mt-14">
        <ScrollLine d="M 100 4 C 80 14 70 34 86 46 C 100 56 60 66 40 74 C 20 82 6 90 0 98" className="inset-0 h-full w-full" start="top 75%" end="bottom 70%" />

        {/* Linha 1: grande + vertical deslocada + quadrada */}
        <div className="relative grid grid-cols-12 gap-3 md:gap-5">
          <AnimatedImage photo={a.photo} word={a.word} wordClassName={WORD} sizes="(min-width: 768px) 50vw, 100vw" className="col-span-12 aspect-[16/10] md:col-span-6" />
          <AnimatedImage photo={b.photo} word={b.word} wordClassName={WORD_SM} sizes="(min-width: 768px) 25vw, 50vw" accent="left" delay={0.1} className="col-span-6 aspect-[3/4] md:col-span-3 md:mt-[22%]" />
          <AnimatedImage photo={c.photo} word={c.word} wordClassName={WORD_SM} sizes="(min-width: 768px) 25vw, 50vw" delay={0.2} className="col-span-6 aspect-[3/4] md:col-span-3 md:aspect-square" />
        </div>

        {/* Linha 2: vertical + faixa larga + vertical */}
        <div className="relative mt-3 grid grid-cols-12 gap-3 md:-mt-[6%] md:gap-5">
          <AnimatedImage photo={d.photo} word={d.word} wordClassName={WORD_SM} sizes="(min-width: 768px) 25vw, 50vw" accent="left" className="col-span-6 aspect-[3/4] md:col-span-3 md:mt-[30%]" />
          <AnimatedImage photo={e.photo} word={e.word} wordClassName={WORD} sizes="(min-width: 768px) 50vw, 100vw" delay={0.1} className="order-first col-span-12 aspect-[16/10] md:order-none md:col-span-6 md:mt-[16%]" />
          <AnimatedImage photo={f.photo} word={f.word} wordClassName={WORD_SM} sizes="(min-width: 768px) 25vw, 50vw" accent="left" delay={0.2} className="col-span-6 aspect-[3/4] md:col-span-3" />
        </div>
      </div>
    </section>
  );
}
