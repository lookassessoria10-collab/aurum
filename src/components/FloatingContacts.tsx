import { InstagramLink } from "@/components/ui/InstagramLink";
import { ContactIcon, PartnerWhatsApp } from "@/components/ui/PartnerWhatsApp";
import { team } from "@/content/aurum";

const popoverId = "contatos-flutuantes";
const titleId = "contatos-flutuantes-titulo";

export function FloatingContacts() {
  return (
    <div className="hidden supports-[selector(:popover-open)]:contents">
      <button
        type="button"
        popoverTarget={popoverId}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-12 cursor-pointer items-center gap-2 border border-ink/20 bg-orange px-4 text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-lg shadow-black/40 transition-colors hover:bg-bone"
      >
        <ContactIcon className="size-5" />
        Contatos
      </button>

      <nav
        id={popoverId}
        popover="auto"
        aria-labelledby={titleId}
        className="fixed inset-auto right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] m-0 max-h-[calc(100dvh-6rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto border border-line bg-ink-2 p-4 text-bone shadow-xl shadow-black/50"
      >
        <p id={titleId} className="mb-3 text-sm font-bold">Fale com a equipe</p>
        <ul className="grid gap-2">
          {team.partners.map((partner) => (
            <li key={partner.key}>
              <PartnerWhatsApp partner={partner} />
            </li>
          ))}
          <li>
            <InstagramLink />
          </li>
        </ul>
      </nav>
    </div>
  );
}
