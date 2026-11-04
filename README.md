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
| Todos os textos | `src/content/aurum.ts` |
| WhatsApp, Instagram, URL do site | `src/config/site.ts` (ou `.env.local`, veja abaixo) |
| Cores e escala tipográfica | `src/app/globals.css` (`@theme`) |
| Metadata / SEO / Open Graph | `src/app/layout.tsx`, `src/app/opengraph-image.jpg` |

### Contatos (nada foi inventado)

```env
NEXT_PUBLIC_WHATSAPP_URL=https://wa.me/55XXXXXXXXXXX
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/...
NEXT_PUBLIC_SITE_URL=https://dominio-oficial.com.br
```

Sem `WHATSAPP_URL`, os botões da seção final apontam para `#contato` e aparece a nota
"Canal de atendimento em configuração.". Sem Instagram, o item do rodapé fica sem link.
O QR Code só deve ser adicionado quando houver o link oficial.

## Marca

- `brand-source/` guarda as peças oficiais recebidas. A pasta fica fora do repositório (está no `.gitignore`); para rodar o script, coloque ali as lâminas da marca com os mesmos nomes.
- `public/aurum/brand/` tem logotipo, símbolo e wordmark **recortados pixel a pixel**
  dessas peças, só com o fundo removido — `npm run brand:assets` regenera.
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

## Estrutura

```
src/components/          seções (Hero, Manifesto, FunctionalDefinition, BodySystem, Objectives,
                         HowItWorks, FunctionalAdult, FunctionalKids, Phases, Adaptation,
                         MovementGallery, FinalManifesto, CTA, Header, Footer)
src/components/ui/       KineticText, ScrollLine, SectionLabel, AnimatedImage, MagneticButton,
                         RevealText, Cursor, ScrollProgress, Brand, CapacityGlyph
src/content/aurum.ts     conteúdo
src/config/site.ts       links configuráveis
scripts/brand-assets.mjs recorte da marca, ícones, OG, textura e placeholders
```
