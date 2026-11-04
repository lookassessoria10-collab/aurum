import { INSTAGRAM_URL, WHATSAPP_URL } from "@/config/site";
import { brand, footer } from "@/content/aurum";
import { BrandHorizontal } from "@/components/ui/Brand";

const link = "text-sm font-semibold uppercase tracking-[0.2em] text-bone/70 transition-colors hover:text-orange";

function Social({ href, label }: { href: string; label: string }) {
  if (!href) {
    return (
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-bone/30" title="Link ainda não configurado">
        {label}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
      {label}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink pt-16 pb-10 container-x lg:pb-20">
      <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <a href="#topo" aria-label={`${brand.name} — ${footer.backToTop}`} className="w-fit">
          <BrandHorizontal className="h-auto w-56 md:w-72" />
        </a>
        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap gap-x-8 gap-y-4">
            {footer.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={link}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Social href={INSTAGRAM_URL} label={footer.social.instagram} />
            </li>
            <li>
              <Social href={WHATSAPP_URL} label={footer.social.whatsapp} />
            </li>
          </ul>
        </nav>
      </div>
      <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs uppercase tracking-[0.3em] text-bone/45 md:flex-row md:justify-between">
        <p>{brand.tagline}</p>
        <a href="#topo" className="w-fit transition-colors hover:text-orange">
          {footer.backToTop} ↑
        </a>
      </div>
    </footer>
  );
}
