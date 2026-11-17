import { INSTAGRAM_URL } from "@/config/site";

export function InstagramLink() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-12 items-center gap-2 border border-bone/30 bg-ink px-3 py-2 text-xs font-bold text-bone transition-colors hover:border-orange hover:text-orange focus-visible:text-orange sm:text-sm"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      Instagram
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
