# AURUM — Funcional e Funcional Kids

Apresentação digital da AURUM. Página única, Next.js 16 + TypeScript + Tailwind CSS 4,
com Motion e GSAP/ScrollTrigger.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Onde editar

| O quê | Onde |
| --- | --- |
| Textos e WhatsApp dos profissionais | `src/content/aurum.ts` |
| WhatsApp institucional, Instagram, URL do site | `src/config/site.ts` (ou `.env.local`, veja abaixo) |
| Cores e escala tipográfica | `src/app/globals.css` (`@theme`) |
| Metadata / SEO / Open Graph | `src/app/layout.tsx`, `src/app/opengraph-image.jpg` |

### Contatos

Os botões em “Quem conduz”, “Contato” e no atalho flutuante usam os números
de `team.partners` em `src/content/aurum.ts`. Informe o código do país, o DDD e o número.

```env
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/55XXXXXXXXXXX
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/...
NEXT_PUBLIC_SITE_URL=https://dominio-oficial.com.br
```

Sem `NEXT_PUBLIC_WHATSAPP_URL`, o WhatsApp do rodapé aponta para a seção de contato.
O Instagram usa o perfil oficial `@aurumperfomance` por padrão.
O QR Code só deve ser adicionado quando houver o link oficial.

## Marca

- Marca atual (2026): ícone com kettlebell, AURUM e a frase **"Movimento que se constrói."**
- `brand-source/` guarda os arquivos oficiais recebidos (fora do repositório, no `.gitignore`).
  O script usa `brand-source/marca-2026-transparente.png` (PNG 2000×2000 com fundo transparente).
- `public/aurum/brand/` tem `aurum-lockup-2026.png` (assinatura completa), `aurum-symbol-2026.png` (ícone),
  `aurum-wordmark-solo-2026.png` (AURUM), `aurum-wordmark-2026.png` (AURUM + frase) e `aurum-tagline-2026.png`
  (só a frase), **recortados pixel a pixel** do PNG oficial — `npm run brand:assets` regenera
  esses arquivos, o favicon e a imagem de compartilhamento.
  Quando chegarem os vetores originais (SVG/AI/PDF), substitua os PNGs mantendo os nomes.
- Fonte de apoio oficial: **Montserrat**. Os títulos usam Montserrat Black Itálico.
  Se a AURUM enviar a fonte display das peças sociais, troque `--font-display` em
  `globals.css` (via `next/font/local`).

## Fotos

### Sócios

`public/aurum/photos/team/` tem as fotos oficiais dos dois sócios (já tratadas na
identidade, por isso aparecem coloridas). Eles têm sempre o mesmo destaque:

- seção **07 · Quem conduz**: braços cruzados, lado a lado;
- seção **14 · Contato**: sorrindo, lado a lado, na mesma ordem.

Vinicius José (camiseta preta) à esquerda e Gustavo Barreto (camiseta branca) à direita.
Nomes e `credential` (opcional, ex.: CREF) ficam em `team.partners` no
`src/content/aurum.ts`. O `zoom` iguala a escala dos rostos entre fotos com
enquadramentos diferentes.

### Treino

| Onde | Arquivo |
| --- | --- |
| 08 · Funcional para a vida real | `photos/funcional/funcional-agachamento-turma.webp` |
| 09 · Funcional Kids | `photos/kids/kids-barreiras.webp`, `photos/kids/kids-circuito-turma.webp` (faixa larga) |
| 12 · Galeria | `photos/funcional/funcional-avanco.webp`, `funcional-agilidade.webp`, `funcional-mobilidade.webp` |

As fotos de treino adulto começam em P&B e ganham cor quando chegam ao centro da tela
(`colorize` no `AnimatedImage`). As do Kids e dos sócios já vêm tratadas no preto e
laranja da marca e aparecem coloridas. Textos alternativos ficam em `src/content/aurum.ts`.

Direção: corpos reais em movimento, esforço e execução. Sem poses olhando para a câmera,
sem estética de fisiculturismo; para crianças, nada de cargas altas.

## Animação

- **GSAP + ScrollTrigger**: só o que é amarrado ao scroll (scrub) — linha de movimento
  (`ScrollLine`), tipografia cinética, trajetórias convergentes, corpo-sistema,
  trilha horizontal do processo, sequência de movimentos, manifesto final, parallax.
- **Motion**: entrada na tela, abertura do hero, estados e microinterações
  (menu, cursor, botões magnéticos, perfis, circuito Kids).
- `prefers-reduced-motion`: sequências fixas viram layout estático, deslocamentos são removidos.
- Abaixo de 1024px: sem trilha horizontal, sem parallax, sem cursor customizado.

## AURUM Coach (`/coach`)

Personal trainer com a câmera, em página própria. No site, só entra o botão **Coach** no menu
(desktop e mobile); o resto da apresentação não muda.

Fluxo: escolher **Em casa** (sem equipamento) ou **Na academia** → parte do corpo → exercício →
alinhar o corpo com a câmera (a voz orienta) → executar. O coach conta as repetições, mede a
amplitude e corrige pela voz (pt-BR). Na academia também dá para **analisar um vídeo já gravado**.
No fim, um resumo com repetições completas, amplitude por repetição e correções mais frequentes.

- Detecção de pose: MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`), roda no navegador.
  A imagem não é gravada nem enviada; o modelo e o runtime vêm de CDN (jsDelivr e Google Storage).
- A câmera exige HTTPS (ou `localhost`).
- **Treinos completos** (`src/coach/workouts.ts`): sequências de 7 a 8 exercícios por foco
  (membros inferiores, superiores, cardio, core, corpo inteiro e mobilidade), em casa e na academia.
  Cada treino define a meta de cada exercício, o descanso, as **séries por exercício** (academia: 3)
  e as **voltas** (circuitos em casa: 2) — tudo ajustável na tela do treino. O coach passa de uma
  série para outra sozinho; no descanso, a voz anuncia o próximo exercício e se o celular fica de
  lado ou de frente. No fim, um resumo do treino inteiro.
- Exercícios, critérios e frases da voz: `src/coach/exercises.ts` (organizados por região do corpo).
  Cada exercício define a vista (de lado ou de frente), o sinal medido (ex.: flexão do joelho),
  a amplitude esperada e as correções.
- Cálculo dos ângulos: `src/coach/lib/signals.ts`. Contagem, alinhamento e correções:
  `src/coach/lib/engine.ts`. Telas: `src/coach/components/`.
- É uma ferramenta de apoio: o texto da página deixa claro que não substitui a orientação de um
  profissional de educação física.

## Estrutura

```
src/components/          seções (Hero, Manifesto, FunctionalDefinition, BodySystem, Objectives,
                         HowItWorks, FunctionalAdult, FunctionalKids, Phases, Adaptation,
                         MovementGallery, FinalManifesto, CTA, Header, Footer)
src/components/ui/       KineticText, ScrollLine, SectionLabel, AnimatedImage, MagneticButton,
                         RevealText, Cursor, ScrollProgress, Brand, CapacityGlyph
src/content/aurum.ts     conteúdo
src/app/coach/           página do AURUM Coach
src/coach/               biblioteca de exercícios, análise de movimento e telas do Coach
src/config/site.ts       links configuráveis
scripts/brand-assets.mjs recorte da marca, ícones, OG, textura e placeholders
```
