type Props = {
  partner: { name: string; phone: string };
  showName?: boolean;
};

export function ContactIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.8-3.3A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M9 12h.01m3.5 0h.01m3.5 0h.01" />
    </svg>
  );
}

export function PartnerWhatsApp({ partner, showName = true }: Props) {
  const { name, phone } = partner;

  return (
    <a
      href={`https://wa.me/${phone.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp de ${name}, ${phone} (abre em nova aba)`}
      className="group flex min-h-12 items-center gap-1.5 border border-orange/70 bg-ink px-2 py-2 text-left text-bone transition-colors hover:bg-orange hover:text-ink focus-visible:bg-orange focus-visible:text-ink sm:gap-3 sm:px-4"
    >
      <ContactIcon className="size-4 shrink-0 text-orange group-hover:text-ink group-focus-visible:text-ink sm:size-5" />
      <span>
        <span className="block text-xs font-bold sm:text-sm">{showName ? name : "WhatsApp"}</span>
        <span className="block text-[0.65rem] text-bone/75 group-hover:text-ink group-focus-visible:text-ink sm:text-xs">{phone}</span>
      </span>
    </a>
  );
}
