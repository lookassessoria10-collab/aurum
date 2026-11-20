import type { Metadata } from "next";
import { CoachApp } from "@/coach/components/CoachApp";

const title = "AURUM Coach | Seu personal trainer na câmera";
const description =
  "Escolha o exercício, alinhe o corpo com a câmera e execute: o AURUM Coach conta as repetições, mede a amplitude e corrige a execução pela voz. Em casa ou na academia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/coach" },
  openGraph: { title, description, url: "/coach" },
  twitter: { title, description },
};

export default function CoachPage() {
  return <CoachApp />;
}
