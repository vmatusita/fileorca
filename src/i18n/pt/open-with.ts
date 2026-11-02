import type { OpenWithTexts } from '../types.ts';

// A página do compartilhar (F8, decisão 1; DECISOES § 290).
export default {
  title: 'Abrir com',
  description:
    'Escolha uma ferramenta do FileOrca para as imagens e os PDFs que você compartilhou no celular. Os arquivos ficam no seu aparelho.',
  h1: 'Abrir com o FileOrca',
  lead: 'Escolha uma ferramenta para os arquivos que você compartilhou. Eles ficam neste aparelho.',
  filesHeading: 'Seus arquivos',
  takesThis: 'Abre este arquivo',
  takesAll: 'Abre os {total} arquivos',
  takesSome: 'Abre {count} de {total} arquivos',
  noTool: 'Nenhuma ferramenta daqui abre esses arquivos. O FileOrca trabalha com JPG, PNG, WebP, HEIC e PDF.',
  emptySays: 'Nada para abrir por aqui.',
  emptyDetail: 'Compartilhe imagens ou PDFs com o FileOrca no celular, ou escolha uma ferramenta.',
  unknown: 'formato desconhecido',
  unnamed: 'Arquivo sem nome',
} satisfies OpenWithTexts;
