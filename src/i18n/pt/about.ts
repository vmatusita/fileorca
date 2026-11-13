import type { AboutTexts } from '../types.ts';

export default {
  title: 'Sobre o FileOrca e quem faz o site',
  description:
    'O FileOrca é feito e mantido por Victor Yuki Matusita, dev em Curitiba. Veja por que as ferramentas são grátis e o que uma orca tem a ver com isso.',
  h1: 'Sobre o FileOrca',
  intro: [
    'O FileOrca é feito e mantido por uma pessoa só: Victor Yuki Matusita, dev em Curitiba, no Paraná.',
    'É um conjunto de ferramentas grátis que rodam no seu navegador: {image} ferramentas de imagem, {pdf} de PDF, {money} calculadoras de dinheiro feitas para o Brasil e um gerador de QR code, além de guias sobre arquivos de imagem e PDF. As de imagem e as de PDF, o gerador de QR code e os guias são os mesmos nos {languages} idiomas do site.',
  ],
  whyHeading: 'Por que este site existe',
  why: [
    'O FileOrca existe para oferecer ferramentas grátis, sem cadastro, sem upload e sem limite. Você solta um arquivo, a ferramenta trabalha no seu navegador e o arquivo nunca sai do seu aparelho.',
    'Os anúncios pagam os custos do site, e os cafés opcionais pagam as próximas ferramentas. Seus arquivos não entram nessa conta: o site nunca os recebe.',
  ],
  orcaHeading: 'Orca é golfinho',
  orca: 'Uma curiosidade: a orca não é uma baleia. Ela é um golfinho, o maior da família dos golfinhos oceânicos. A Oli, a orca deste site, também é golfinho.',
  linksHeading: 'Encontre o Victor na internet',
  websiteLabel: 'Site do Victor',
  linkedinLabel: 'Victor no LinkedIn',
  // F19a (decisão 5; DECISOES § 758): o dia em que o site entrou no ar vem do LAUNCH_DATE, nunca digitado aqui.
  since:
    'O FileOrca entrou no ar em {date}. A página {whatsNew} lista as mudanças desde então, com as datas, e a página {howItWorks} mostra o que acontece com o seu arquivo e como conferir no navegador.',
  // F19a (decisão 6; DECISOES § 763): o quadro do autor no fim de cada guia.
  author: {
    heading: 'Sobre o autor',
    who: '{name} é dev em Curitiba, no Paraná, e faz e mantém o FileOrca sozinho.',
    fileGuide: 'Os números deste guia foram medidos em {date} com o motor das ferramentas deste site, nos arquivos de teste que o guia lista.',
    moneyGuide: 'Os números deste guia saem da calculadora que ele traz, e as contas dela são conferidas com um cálculo independente.',
  },
  stats: {
    heading: 'O FileOrca em números',
    image: 'ferramentas de imagem',
    pdf: 'ferramentas de PDF',
    money: 'calculadoras feitas para o Brasil',
    languages: 'idiomas',
    zero: 'uploads',
  },
} satisfies AboutTexts;
