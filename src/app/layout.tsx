import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SITE_URL } from "@/config/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const title = "AURUM | Funcional e Funcional Kids";
const description =
  "Treinamento funcional para adultos e crianças com acompanhamento, movimento e evolução.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "AURUM",
  keywords: ["treinamento funcional", "funcional kids", "AURUM", "movimento", "treino orientado"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AURUM",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} antialiased`}>
      <body className="grain min-h-full">{children}</body>
    </html>
  );
}
