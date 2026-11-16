// F19b, slice 1: the minimal text of guides-what-a-pdf-password-protects in pt, so the page builds; the front T writes the guide.
import type { FileGuideTexts } from '../types.ts';

export default {
  title: "O que a senha de um PDF protege | FileOrca",
  description: "O que a senha de abrir faz, o que as restrições não fazem, e por que uma senha curta é fraca.",
  h1: "O que a senha de um PDF protege",
  lead: "O que a senha de abrir faz, o que as restrições não fazem, e por que uma senha curta é fraca.",
  changed: "Publicado pela primeira vez em {published}.",
  intro: ["Este guia está sendo escrito."],
  toolHeading: "O que a senha de um PDF protege",
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
  // F19b (front M1): the shape of the tables, which the front T rewrites in words and keeps.
  tables: [
    {
      heading: "Três PDFs com senha",
      caption: "Três PDFs protegidos pelo Proteger PDF: as páginas, o arquivo antes e depois e os bytes que a criptografia acrescentou",
      head: ["PDF", "Páginas", "Antes", "Depois", "Acrescentado"],
    },
    {
      heading: "Restrições sem senha",
      caption: "O PDF com restrições e sem senha para abrir, como veio e depois do Desbloquear PDF, ao lado de um PDF depois do Proteger PDF: o arquivo, se um leitor o abriu sem senha e as ações que ele bloqueia",
      head: ["Arquivo", "Tamanho", "Abre sem senha", "Ações bloqueadas"],
      labels: ["Só restrições, como veio", "O mesmo PDF depois do Desbloquear PDF", "Um PDF depois do Proteger PDF"],
    },
  ],
  sourcesHeading: "Fontes",
  sources: [],
  facts: {},
  names: [],
  relatedHeading: "Ferramentas e guias relacionados",
} satisfies FileGuideTexts;
