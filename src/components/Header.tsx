"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { brand, nav } from "@/content/aurum";
import { BrandInline, BrandSymbol } from "@/components/ui/Brand";
import { cn, EASE_OUT, EASE_SNAP } from "@/lib/utils";

export function Header() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Barra compacta depois do primeiro scroll
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Item ativo do menu conforme a seção visível
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Menu fullscreen: trava o scroll, Esc fecha, foco fica preso no header
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const first = headerRef.current?.querySelector<HTMLElement>("[data-menu-link]");
    first?.focus();
    const toggle = toggleRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !headerRef.current) return;
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((el) => el.offsetParent !== null);
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <motion.header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.6 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 flex flex-col justify-between bg-ink pt-28 pb-10 container-x lg:hidden"
            initial={{ clipPath: "polygon(100% 0%, 100% 0%, 130% 100%, 130% 100%)" }}
            animate={{ clipPath: "polygon(-30% 0%, 100% 0%, 130% 100%, 0% 100%)" }}
            exit={{ clipPath: "polygon(100% 0%, 100% 0%, 130% 100%, 130% 100%)" }}
            transition={{ duration: 0.7, ease: EASE_SNAP }}
          >
            <nav aria-label="Principal">
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.a
                      data-menu-link
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      className="display t-lg flex items-baseline gap-4 py-1 text-bone transition-colors hover:text-orange focus-visible:text-orange"
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 + i * 0.06 }}
                    >
                      <span aria-hidden className="font-sans text-xs font-semibold not-italic tracking-[0.3em] text-orange">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="flex items-end justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="eyebrow text-muted">{brand.tagline}</p>
              <BrandSymbol className="h-auto w-14" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative flex items-center justify-between transition-[height,background-color,border-color] duration-500 container-x",
          compact || open ? "h-16" : "h-20 md:h-24",
          compact && !open ? "border-b border-bone/10 bg-ink/85 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <a href="#topo" aria-label="AURUM — voltar ao início" className="relative z-10 text-[24px] md:text-[32px]">
          <BrandInline priority />
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "group relative py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] transition-colors",
                    active === item.id ? "text-bone" : "text-bone/60 hover:text-bone",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left -skew-x-[30deg] bg-orange transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      active === item.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="relative z-10 flex h-12 items-center gap-3 pl-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? "Fechar" : "Menu"}</span>
          <span aria-hidden className="relative block h-3 w-7">
            <span
              className={cn(
                "absolute left-0 block h-[2px] w-7 bg-bone transition-transform duration-300",
                open ? "top-[5px] rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute right-0 block h-[2px] bg-orange transition-all duration-300",
                open ? "top-[5px] w-7 -rotate-45" : "top-[10px] w-4",
              )}
            />
          </span>
        </button>
      </div>
    </motion.header>
  );
}
