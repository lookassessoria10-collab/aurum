/**
 * Todo o texto visível do site.
 * Edite aqui para ajustar conteúdo sem mexer nos componentes.
 *
 * Linhas de título aceitam string simples ou { text, accent } — accent pinta a
 * linha de laranja.
 */

export type Line = string | { text: string; accent?: boolean };

export type Photo = { src: string; alt: string };

const photo = (file: string, alt: string): Photo => ({ src: `/aurum/photos/${file}`, alt });

export const brand = {
  name: "AURUM",
  tagline: "Movimento que se constrói.",
  edgeWords: ["Movimento", "Disciplina", "Evolução"],
};

export const nav = [
  { id: "aurum", label: "AURUM" },
  { id: "funcional", label: "Funcional" },
  { id: "kids", label: "Kids" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "contato", label: "Contato" },
] as const;

/** Nome curto de cada seção, usado no indicador de progresso. */
export const sectionNames: Record<string, string> = {
  topo: "Abertura",
  aurum: "Manifesto",
  funcional: "Funcional",
  sistema: "O corpo como sistema",
  objetivos: "Objetivos",
  "como-funciona": "Como funciona",
  equipe: "Quem conduz",
  "vida-real": "Vida real",
  kids: "Funcional Kids",
  fases: "Adulto e Kids",
  adaptacao: "Adaptação",
  galeria: "Movimento",
  manifesto: "Manifesto final",
  contato: "Contato",
};

export const hero = {
  intro: ["FORÇA", "CONTROLE", "MOBILIDADE", "COORDENAÇÃO", "RITMO"],
  title: ["MOVIMENTO", { text: "COM DIREÇÃO.", accent: true }] as Line[],
  subtitle:
    "Funcional e Funcional Kids com acompanhamento pensado para desenvolver o corpo para a vida real.",
  primaryCta: { label: "Conheça a AURUM", href: "#aurum" },
  /** Atalhos da abertura para pular direto para cada parte da apresentação */
  quickLabel: "Ir direto para",
  quickLinks: [
    { label: "Funcional", href: "#funcional" },
    { label: "Funcional Kids", href: "#kids" },
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Os sócios", href: "#equipe" },
    { label: "Contato", href: "#contato" },
  ],
  scrollHint: "Role para começar",
  edgeLeft: "Funcional · Funcional Kids",
};

export const manifesto = {
  label: "Manifesto",
  /** Faixa de tipografia cinética logo após a abertura */
  kinetic: ["MOVIMENTO", "CONTROLE", "FORÇA", "MOBILIDADE", "COORDENAÇÃO"],
  title: ["CADA CORPO", { text: "PEDE UM CAMINHO.", accent: true }] as Line[],
  paragraphs: [
    "Nenhuma pessoa se move exatamente igual à outra.",
    "História, mobilidade, força, coordenação, limitações e objetivos mudam de pessoa para pessoa.",
    "Por isso, a AURUM parte de um princípio simples:",
  ],
  principle: ["o treinamento precisa se adaptar à pessoa.", "Não a pessoa ao treinamento."],
  sideWords: ["INDIVIDUALIDADE", "MOVIMENTO", "ADAPTAÇÃO", "EVOLUÇÃO"],
};

export const definition = {
  label: "O que é treinamento funcional",
  title: ["FUNCIONAL", "NÃO É UM"],
  struck: "CIRCUITO.",
  lead: "É um sistema de treinamento baseado em padrões fundamentais do movimento.",
  body: "Ele trabalha diferentes capacidades físicas e respeita a forma como o corpo precisa se mover no treino, no esporte e principalmente na vida cotidiana.",
  capacitiesHint: "Passe o cursor ou toque em cada capacidade",
  capacities: [
    { key: "forca", name: "FORÇA", text: "Gerar e sustentar tensão para mover, empurrar e carregar." },
    { key: "mobilidade", name: "MOBILIDADE", text: "Amplitude com controle em cada articulação." },
    { key: "estabilidade", name: "ESTABILIDADE", text: "Manter a posição enquanto o resto do corpo se move." },
    { key: "coordenacao", name: "COORDENAÇÃO", text: "Partes diferentes do corpo trabalhando no tempo certo." },
    { key: "resistencia", name: "RESISTÊNCIA", text: "Sustentar a qualidade do movimento por mais tempo." },
    { key: "potencia", name: "POTÊNCIA", text: "Aplicar força com velocidade quando o movimento pede." },
  ],
} as const;

export const bodySystem = {
  label: "O corpo como sistema",
  title: ["NADA", "TRABALHA", { text: "SOZINHO.", accent: true }] as Line[],
  core: "CORE",
  tags: ["MOBILIDADE", "ESTABILIDADE", "FORÇA", "COORDENAÇÃO", "CONTROLE"],
  paragraphs: [
    "O movimento nasce da relação entre diferentes partes do corpo.",
    "Estabilidade, controle e força trabalham juntas para produzir movimentos mais eficientes.",
  ],
  closing: ["O objetivo não é apenas executar um exercício.", "É construir um corpo capaz de responder melhor."],
};

export const objectives = {
  label: "Objetivos",
  title: ["TREINAR MELHOR", "MUDA MAIS DO", { text: "QUE O TREINO.", accent: true }] as Line[],
  items: [
    {
      n: "01",
      title: ["REDUZIR", "RISCOS."],
      text: "Preparar o corpo para lidar melhor com diferentes movimentos e demandas.",
    },
    {
      n: "02",
      title: ["DESENVOLVER", "PERFORMANCE."],
      text: "Força, potência, controle, mobilidade e resistência trabalhando de maneira integrada.",
    },
    {
      n: "03",
      title: ["CONSTRUIR", "RESULTADOS REAIS."],
      text: "Evolução que aparece no treino, no esporte e na rotina.",
    },
  ],
};

export const howItWorks = {
  label: "Como funciona a AURUM",
  title: ["NÃO É UMA", "SEQUÊNCIA DE", "EXERCÍCIOS."],
  titleAccent: "É UM PROCESSO.",
  steps: [
    { n: "01", name: "ENTENDER.", text: "Conhecer quem está treinando, seus objetivos, capacidades e necessidades." },
    { n: "02", name: "PLANEJAR.", text: "Organizar estímulos e movimentos de acordo com o momento de cada pessoa." },
    { n: "03", name: "TREINAR.", text: "Executar com orientação, técnica e intenção." },
    { n: "04", name: "ACOMPANHAR.", text: "Observar resposta, evolução e dificuldades." },
    { n: "05", name: "AJUSTAR.", text: "O treinamento evolui junto com quem está treinando." },
  ],
  closing: ["O treino não é estático.", "VOCÊ TAMBÉM NÃO."],
};

export const functionalAdult = {
  label: "Funcional",
  title: ["FUNCIONAL", "PARA A", { text: "VIDA REAL.", accent: true }] as Line[],
  subtitle: [
    "Treinar não serve apenas para executar melhor exercícios.",
    "Serve para construir um corpo mais preparado para aquilo que a vida exige.",
  ],
  movements: ["AGACHAR", "EMPURRAR", "PUXAR", "CARREGAR", "GIRAR", "ESTABILIZAR", "SALTAR", "DESLOCAR"],
  capacities: [
    { strong: "Força", rest: "para carregar." },
    { strong: "Mobilidade", rest: "para alcançar." },
    { strong: "Controle", rest: "para estabilizar." },
    { strong: "Coordenação", rest: "para reagir." },
    { strong: "Resistência", rest: "para continuar." },
  ],
  closing: ["O corpo aprende.", "O movimento melhora.", { text: "A rotina sente.", accent: true }] as Line[],
  photo: photo("funcional/funcional-agachamento-turma.webp", "Turma fazendo agachamento enquanto o professor orienta o movimento de perto"),
};

export const kids = {
  label: "Funcional Kids",
  preTitle: ["ANTES DE", "PERFORMANCE,", { text: "MOVIMENTO.", accent: true }] as Line[],
  title: ["FUNCIONAL", { text: "KIDS.", accent: true }] as Line[],
  paragraphs: [
    "Na infância, movimento também é aprendizado.",
    "O Funcional Kids utiliza atividades orientadas para desenvolver diferentes capacidades enquanto a criança explora o próprio corpo.",
  ],
  circuitLabel: "Circuito de movimento",
  circuitShuffle: "Reorganizar circuito",
  stations: ["COORDENAÇÃO", "EQUILÍBRIO", "AGILIDADE", "CONTROLE", "CONFIANÇA", "CONSCIÊNCIA CORPORAL"],
  // Fotos oficiais do Funcional Kids (já tratadas no preto e laranja da marca)
  photos: {
    hurdles: photo("kids/kids-barreiras.webp", "Criança sorrindo enquanto salta pequenas barreiras laranja em um circuito de agilidade"),
    group: photo(
      "kids/kids-circuito-turma.webp",
      "Crianças em um circuito com escada de agilidade, plataformas de equilíbrio e barreiras, acompanhadas de perto por um professor",
    ),
  },
  groupCaption: "Atividades orientadas",
};

export const phases = {
  label: "Adulto e Kids",
  heading: "A diferença entre Funcional e Funcional Kids",
  columns: [
    {
      name: "FUNCIONAL",
      text: "Mais capacidade para o corpo responder às demandas da rotina, do esporte e do treinamento.",
    },
    {
      name: "FUNCIONAL KIDS",
      text: "Mais repertório motor para a criança explorar, aprender e ganhar confiança através do movimento.",
    },
  ],
  center: ["MESMO PRINCÍPIO.", { text: "CORPOS EM FASES DIFERENTES.", accent: true }] as Line[],
};

export const adaptation = {
  label: "O treino se adapta à pessoa",
  title: ["NÃO EXISTE", "UM TREINO", { text: "PARA TODO MUNDO.", accent: true }] as Line[],
  profiles: [
    { key: "iniciando", name: "INICIANDO", text: "Construir base, aprender movimentos e desenvolver confiança.", focus: ["Base", "Técnica", "Confiança"] },
    { key: "evoluindo", name: "EVOLUINDO", text: "Aumentar capacidade, variedade e controle.", focus: ["Capacidade", "Variedade", "Controle"] },
    { key: "performando", name: "PERFORMANDO", text: "Explorar força, potência, velocidade e eficiência.", focus: ["Força", "Potência", "Velocidade", "Eficiência"] },
  ],
  closing: ["O sistema é o mesmo.", { text: "A aplicação muda.", accent: true }] as Line[],
};

export const gallery = {
  label: "Galeria de movimento",
  /** Faixa de palavras que atravessa a tela acima das fotos */
  kinetic: ["CONTROLE", "FORÇA", "MOVIMENTO", "CONFIANÇA", "DESCOBERTA", "EVOLUÇÃO"],
  items: [
    { word: "CONTROLE", photo: photo("funcional/funcional-avanco.webp", "Mulher em posição de avanço, concentrada, controlando o movimento ao ar livre") },
    { word: "MOVIMENTO", photo: photo("funcional/funcional-agilidade.webp", "Mulher sorrindo enquanto muda de direção entre cones em um treino de agilidade") },
    { word: "MOBILIDADE", photo: photo("funcional/funcional-mobilidade.webp", "Mulher alongando o ombro em um exercício de mobilidade") },
  ],
};

export const finalManifesto = {
  lines: ["O CORPO APRENDE.", "O CORPO ADAPTA.", "O CORPO RESPONDE.", "O CORPO EVOLUI."],
  signature: "AURUM.",
  tagline: "MOVIMENTO QUE SE CONSTRÓI.",
};

/**
 * Os dois sócios da AURUM, sempre com o mesmo destaque.
 * `credential` é opcional (ex.: CREF) e só aparece se for preenchido.
 */
export const team = {
  label: "Quem conduz",
  title: ["QUEM CONSTRÓI", { text: "O SEU RITMO.", accent: true }] as Line[],
  lead: "Dois sócios, um mesmo princípio: movimento com direção.",
  text: "Na AURUM, quem treina é acompanhado de perto — no Funcional e no Funcional Kids.",
  role: "Sócio",
  partners: [
    {
      key: "a",
      name: "Vinicius José",
      credential: "",
      portrait: photo("team/socio-a-bracos-cruzados.webp", "Vinicius José, sócio da AURUM, de camiseta preta e braços cruzados"),
      smile: photo("team/socio-a-sorrindo.webp", "Vinicius José, sócio da AURUM, sorrindo, com as mãos na cintura"),
      // fotos verticais 9:16: o recorte 3:4 sobe para manter rosto e braços
      position: "50% 14%",
      zoom: 1,
    },
    {
      key: "b",
      name: "Gustavo Barreto",
      credential: "",
      portrait: photo("team/socio-b-bracos-cruzados.webp", "Gustavo Barreto, sócio da AURUM, de camiseta branca e braços cruzados"),
      smile: photo("team/socio-b-sorrindo.webp", "Gustavo Barreto, sócio da AURUM, sorrindo, de braços cruzados"),
      // foto mais aberta: aproxima um pouco para o rosto ficar na mesma escala do outro sócio
      position: "50% 18%",
      zoom: 1.14,
    },
  ],
};

export const cta = {
  label: "Contato",
  title: ["COMECE", { text: "PELO MOVIMENTO.", accent: true }] as Line[],
  text: "Conheça o Funcional e o Funcional Kids AURUM.",
  primary: "Quero conhecer a AURUM",
  secondary: "Falar com a equipe",
  pendingNote: "Canal de atendimento em configuração.",
};

export const footer = {
  links: [
    { label: "Funcional", href: "#funcional" },
    { label: "Funcional Kids", href: "#kids" },
  ],
  social: { instagram: "Instagram", whatsapp: "WhatsApp" },
  backToTop: "Voltar ao topo",
};
