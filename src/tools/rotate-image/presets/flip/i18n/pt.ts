// Flip image (F18, decision 9): a preset of Rotate image with the mirror alone, Horizontal (the default) or Vertical, and no
// turn. Page blocks with at least three of their own (gate:conteudo, MIN_OWN_BLOCKS) and the panel bits. The Portuguese
// text says what the English one says, with "Espelhar" of the "Mirror" row of docs/i18n/pt.md (DECISOES § 736).
import type { FlipOptionsTexts, ImageToolTexts } from '../../../../../i18n/types.ts';

export default {
  title: 'Espelhar imagem online, sem upload',
  description:
    'Espelhe uma imagem JPG, PNG ou WebP no navegador: troque a esquerda pela direita ou o alto pelo baixo, sem girar. Sem upload, sem limite e sem GPS.',
  h1: 'Espelhar imagem',
  howHeading: 'Como espelhar uma imagem',
  howSteps: [
    'Solte as imagens na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Deixe a opção Horizontal para trocar a esquerda pela direita, ou escolha a Vertical para trocar o alto pelo baixo.',
    'Baixe a imagem espelhada, ou o ZIP quando tiver espelhado várias.',
  ],
  specsHeading: 'O que o espelhamento faz',
  specs: {
    caption: 'Espelhar imagem: formatos aceitos, os dois espelhos e a saída',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Aceita', 'JPG, PNG e WebP, reconhecidos pelo conteúdo do arquivo e não pelo nome. Fotos HEIC passam antes pela ferramenta HEIC para JPG, e arquivos AVIF, pela ferramenta AVIF para JPG.'],
      ['Horizontal', 'O padrão. A esquerda e a direita trocam de lugar, como num espelho posto ao lado da imagem.'],
      ['Vertical', 'O alto e o baixo trocam de lugar, como no reflexo da imagem na água parada.'],
      ['Sem giro', 'A imagem só é espelhada, nunca girada. Para girar também, a Girar imagem combina um giro com um espelhamento.'],
      ['Ponto de partida', 'A orientação da foto é aplicada primeiro, então o espelho inverte a imagem como você a vê, e não os pixels crus.'],
      ['Lote', 'O espelho escolhido vale para todas as imagens do lote, sem limite de imagens.'],
      ['Saída', 'O mesmo formato e a mesma largura e altura da imagem que você vê. PNG e WebP mantêm a transparência.'],
      ['Qualidade', 'JPG e WebP são salvos de novo depois do espelhamento. O PNG é salvo sem perda.'],
      ['Metadados', 'Exif, XMP, IPTC e GPS são removidos, e nenhuma marcação de orientação fica para ser lida duas vezes.'],
    ],
  },
  faqHeading: 'Perguntas sobre espelhar',
  faq: [
    {
      q: 'Qual é a diferença entre espelhar e girar uma imagem?',
      a: 'Girar roda a imagem em torno do centro. Espelhar inverte a imagem como num espelho: a opção Horizontal troca a esquerda pela direita, e a Vertical troca o alto pelo baixo. Um texto numa imagem espelhada fica ao contrário.',
    },
    {
      q: 'Como corrijo uma selfie que saiu espelhada?',
      a: 'Deixe a opção Horizontal. A esquerda e a direita trocam de lugar, então um texto que aparecia ao contrário na foto volta a ser lido do jeito certo.',
    },
    {
      q: 'Espelhar na vertical é o mesmo que deixar a imagem de cabeça para baixo?',
      a: 'Não. Um giro de 180° também troca a esquerda pela direita, enquanto o espelho vertical deixa os dois lados onde estão e só troca o alto pelo baixo. Para uma foto de cabeça para baixo, use 180° na Girar imagem.',
    },
    {
      q: 'Espelhar um JPG diminui a qualidade?',
      a: 'Um JPG ou um WebP é salvo de novo depois do espelhamento, então passa mais uma vez por uma compressão com perda. O PNG é salvo sem perda. Espelhe uma vez só, a partir do original, em vez de espelhar várias vezes.',
    },
    {
      q: 'Dá para espelhar várias imagens de uma vez?',
      a: 'Sim. Solte todas juntas. O espelho escolhido vale para o lote inteiro, e você baixa tudo num ZIP só.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Suas imagens são espelhadas no seu aparelho e nunca são enviadas a um servidor. As cópias espelhadas deixam de fora os metadados da foto, inclusive a localização GPS.',
  relatedHeading: 'Mais ferramentas de imagem',
  panel: {
    formats: 'JPG, PNG ou WebP',
    progressLabel: 'Espelhando as imagens',
    done: 'Prontinho! Sua imagem foi espelhada.',
    doneMany: 'Prontinho! Suas {count} imagens foram espelhadas.',
    options: {
      legend: 'Espelhar',
      horizontal: 'Horizontal',
      vertical: 'Vertical',
    },
  },
} satisfies ImageToolTexts<FlipOptionsTexts>;
