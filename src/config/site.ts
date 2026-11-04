/**
 * Configurações editáveis do site.
 *
 * Nenhum contato foi inventado: preencha os links abaixo (ou as variáveis de
 * ambiente correspondentes em .env.local) quando a AURUM enviar os dados oficiais.
 * Enquanto um link estiver vazio, os botões que dependem dele levam à seção de
 * contato e o item correspondente do rodapé aparece sem link.
 */

/** Link completo do WhatsApp, ex.: https://wa.me/55XXXXXXXXXXX */
export const WHATSAPP_URL: string = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "";

/** Perfil oficial no Instagram, ex.: https://instagram.com/aurum */
export const INSTAGRAM_URL: string = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";

/** URL pública do site (usada em Open Graph e links canônicos). */
export const SITE_URL: string = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const CONTACT_FALLBACK = "#contato";

export function contactHref(): string {
  return WHATSAPP_URL || CONTACT_FALLBACK;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
