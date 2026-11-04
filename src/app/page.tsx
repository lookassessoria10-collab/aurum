import { Adaptation } from "@/components/Adaptation";
import { BodySystem } from "@/components/BodySystem";
import { CTA } from "@/components/CTA";
import { FinalManifesto } from "@/components/FinalManifesto";
import { Footer } from "@/components/Footer";
import { FunctionalAdult } from "@/components/FunctionalAdult";
import { FunctionalDefinition } from "@/components/FunctionalDefinition";
import { FunctionalKids } from "@/components/FunctionalKids";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Manifesto } from "@/components/Manifesto";
import { MovementGallery } from "@/components/MovementGallery";
import { Objectives } from "@/components/Objectives";
import { Phases } from "@/components/Phases";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Cursor } from "@/components/ui/Cursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default function Home() {
  return (
    <MotionProvider>
      <a
        href="#conteudo"
        className="fixed left-4 top-4 z-[80] -translate-y-24 bg-orange px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="overflow-x-clip">
        <Hero />
        <Manifesto />
        <FunctionalDefinition />
        <BodySystem />
        <Objectives />
        <HowItWorks />
        <FunctionalAdult />
        <FunctionalKids />
        <Phases />
        <Adaptation />
        <MovementGallery />
        <FinalManifesto />
        <CTA />
      </main>
      <Footer />
      <ScrollProgress />
      <Cursor />
    </MotionProvider>
  );
}
