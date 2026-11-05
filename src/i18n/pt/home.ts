import type { HomeTexts } from '../types.ts';

// F13b (UX-03 B, home-b.html; DECISOES § 567 a § 571): a home como o mar por categoria. Todo número é um {placeholder}
// que o build preenche da fonte (src/components/home-numbers.ts e src/components/tool-count.ts).
export default {
  title: 'FileOrca: ferramentas grátis que nunca enviam seus arquivos',
  description:
    'Ferramentas grátis que rodam no navegador, sem cadastro e sem upload. Seus arquivos ficam no seu aparelho, e você mesmo confere na aba Rede do navegador.',
  h1: '{n} ferramentas.',
  h1Promise: '0 uploads.',
  intro: 'Ferramentas de imagem, PDF e dinheiro que fazem o trabalho no seu aparelho, sem cadastro.',
  toolsHeading: 'Escolha uma ferramenta',
  to: ' para ',
  image: {
    heading: 'Imagem',
    count: '{n} ferramentas',
    say: '{photos} fotos de celular na Comprimir imagem: {percent} mais leves, no ajuste padrão.',
    more: 'Cada ferramenta de imagem abre o arquivo nesta aba, faz o trabalho no seu aparelho e entrega uma cópia nova para você salvar.',
    all: 'Todas as ferramentas de imagem e os tamanhos comuns',
  },
  pdf: {
    heading: 'PDF',
    count: '{n} ferramentas',
    say: 'Um PDF de fotos na Comprimir PDF: {percent} mais leve no nível recomendado.',
    more: 'Juntar, dividir e assinar acontecem na mesma aba, e a senha que você digita para um PDF nunca sai dela.',
    all: 'Todas as ferramentas de PDF',
  },
  money: {
    heading: 'Dinheiro',
    count: '{n} calculadoras',
    num: '{diff} a menos',
    say: 'de juros no SAC do que na PRICE, no exemplo do simulador: {loan} em {months} meses, a {rate} ao ano.',
    more: 'Cada calculadora explica o resultado, que você pode baixar em PDF ou CSV, e os números que você digita ficam no seu aparelho.',
    all: 'As {n} calculadoras financeiras',
  },
  qr: {
    heading: 'QR code',
    count: '{n} ferramenta',
    num: '{max} caracteres',
    say: 'num código só, com a Oli no meio, na correção de erro H.',
    more: 'Digite um link ou um texto curto e salve o código em PNG ou SVG, com o texto guardado no seu aparelho.',
  },
  privacyHeading: 'Seus arquivos ficam com você',
  privacyBody:
    'Seus arquivos nunca saem do seu aparelho. O FileOrca faz o trabalho no navegador, e você mesmo pode conferir: abra a aba Rede do navegador enquanto usa uma ferramenta e veja que nenhuma requisição leva o seu arquivo.',
  // F11 (decisão 7): a seção "Leia um guia"; {n} é o número de guias do idioma, lido dos registros.
  guides: {
    heading: 'Leia um guia',
    intro: 'Cada guia responde a uma pergunta com números e traz a ferramenta dentro.',
    hubLink: 'Ver os {n} guias',
  },
} satisfies HomeTexts;
