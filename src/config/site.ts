/**
 * Configurações editáveis do site.
 *
 * Configure os links institucionais pelas variáveis de ambiente em .env.local.
 * Os contatos dos profissionais ficam em team.partners, no conteúdo do site.
 */

/** Link completo do WhatsApp, ex.: https://wa.me/55XXXXXXXXXXX */
export const WHATSAPP_URL: string = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "";

/** Perfil oficial no Instagram. */
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/aurumperfomance/";

/** URL pública do site (usada em Open Graph e links canônicos). */
export const SITE_URL: string = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
