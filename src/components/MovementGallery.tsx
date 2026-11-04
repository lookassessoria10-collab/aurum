import { gallery } from "@/content/aurum";
import { AnimatedImage } from "@/components/ui/AnimatedImage";
import { KineticText } from "@/components/ui/KineticText";
import { ScrollLine } from "@/components/ui/ScrollLine";
import { SectionLabel } from "@/components/ui/SectionLabel";

// Alturas desencontradas para o ritmo editorial; a do meio desce, as laterais sobem.
const OFFSET = ["md:mt-0", "md:mt-[18%]", "md:mt-[6%]"];

/**
 * Sequência editorial em uma linha: as fotos começam em P&B, ganham cor no
 * centro da tela e carregam uma palavra cada.
 */
export function MovementGallery() {
  return (
    <section id="galeria" data-section aria-labelledby="galeria-title" className="relative overflow-hidden bg-ink py-20 md:py-28">
      <div className="container-x">
        <SectionLabel index="12">{gallery.label}</SectionLabel>
        <h2 id="galeria-title" className="sr-only">
          {gallery.label}
        </h2>
      </div>

      <KineticText words={gallery.kinetic} from={-5} to={-45} className="mt-8 text-[clamp(3rem,9vw,9rem)] text-bone" />

      <div className="relative mt-10 container-x md:mt-14">
        <ScrollLine d="M 100 6 C 78 14 70 40 52 50 C 34 60 18 70 0 92" className="inset-0 h-full w-full" start="top 75%" end="bottom 70%" />
        <ul className="relative grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {gallery.items.map((item, i) => (
            <li key={item.word} className={i === 0 ? `col-span-2 md:col-span-1 ${OFFSET[i]}` : OFFSET[i]}>
              <AnimatedImage
                photo={item.photo}
                word={item.word}
                wordClassName="text-[clamp(1.5rem,3.4vw,3.6rem)]"
                sizes="(min-width: 768px) 32vw, 50vw"
                colorize
                accent={false}
                delay={i * 0.1}
                className={i === 0 ? "aspect-[4/5] w-full max-md:aspect-[16/11]" : "aspect-[4/5] w-full"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
