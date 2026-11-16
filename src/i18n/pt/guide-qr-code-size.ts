// F19b (front M5): the minimal text of guides-qr-code-size in pt, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "Tamanho do QR code | FileOrca",
  description: "Como o texto que você digita define quantos quadradinhos um QR code tem, e o que isso muda no PNG e na impressão.",
  h1: "Tamanho do QR code",
  lead: "Como o texto que você digita define quantos quadradinhos um QR code tem, e o que isso muda no PNG e na impressão.",
  changed: "Publicado pela primeira vez em {published}.",
  intro: ["Este guia está sendo escrito."],
  toolHeading: "Tamanho do QR code",
  toolIntro: "Este guia está sendo escrito.",
  sections: [
    { heading: "Parte 1", paragraphs: ["Este guia está sendo escrito."] },
    { heading: "Parte 2", paragraphs: ["Este guia está sendo escrito."] },
    { heading: "Parte 3", paragraphs: ["Este guia está sendo escrito."] },
  ],
  half: 1,
  measuredHeading: "O que medimos",
  sheet: {
    stats: [
      { label: "O que medimos", value: "Este guia está sendo escrito." },
      { label: "O que medimos", value: "Este guia está sendo escrito." },
    ],
    sample: "Este guia está sendo escrito.",
    link: "Veja a tabela",
  },
  tableHeading: "A medida",
  measuredIntro: "Este guia está sendo escrito.",
  measuredNote: "Medido em {date}.",
  // F19b (front M5): the shape of the tables, which the front T rewrites in words and keeps (the labels in the order of
  // the measurement).
  tables: [
    {
      heading: "Os textos e os códigos deles",
      caption: "Cada texto digitado no Gerador de QR code, no Chromium: os caracteres, o que a ferramenta conta, a versão que o leitor achou, os quadradinhos de cada lado e os quadradinhos escuros sob a Oli",
      head: ["Texto", "Caracteres", "Contados pela ferramenta", "Versão", "Quadradinhos por lado", "Quadradinhos escuros sob a Oli"],
      labels: ["Link curto", "Frase sem acentos", "A mesma frase com acentos", "Link longo"],
    },
    {
      heading: "O PNG de cada texto em cada tamanho",
      caption: "O PNG de cada texto em cada tamanho do Gerador de QR code, no Chromium: os pixels, os pixels de cada quadradinho e o arquivo",
      head: ["Texto", "Tamanho do PNG", "Pixels", "Pixels por quadradinho", "Arquivo"],
    },
  ],
  sourcesHeading: "Fontes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Ferramentas e guias relacionados",
} satisfies FileGuideTexts;
