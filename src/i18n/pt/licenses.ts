import type { LicensesTexts } from '../types.ts';

export default {
  title: 'Licenças dos programas e fontes de código aberto',
  description:
    'Os programas de código aberto e as fontes que chegam ao seu navegador no FileOrca, com as licenças. Ferramentas usadas só para montar o site não entram.',
  h1: 'Licenças',
  intro:
    'O FileOrca usa software de código aberto. Esta página lista os programas e as fontes que chegam ao seu navegador, com as respectivas licenças. As ferramentas usadas só para montar o site não entram, porque não são distribuídas.',
  packagesHeading: 'Software',
  fontsHeading: 'Fontes',
  noFonts: 'O site ainda não carrega nenhuma fonte da web.',
  packageColumn: 'Pacote',
  versionColumn: 'Versão',
  licenseColumn: 'Licença',
  showText: 'Mostrar o texto da licença',
  sourceLabel: 'Código-fonte',
  bundledHeading: 'Software dentro de outro software',
  bundledIntro:
    'Estes pacotes não são instalados sozinhos. Cada um vem dentro de um pacote da lista acima e acaba nos arquivos que o seu navegador recebe.',
  viaLabel: 'Vem com',
  showTextOf: 'Mostrar a licença de',
  copiedFrom: 'Copiado de',
  lgplHeading: 'Fotos HEIC e a LGPL',
  lgplWhat:
    'As fotos HEIC são abertas com a libheif, uma biblioteca livre sob a GNU Lesser General Public License, versão 3 (LGPL-3.0). Ela chega ao seu navegador pelo pacote libheif-js, que também traz a libde265, o decodificador de vídeo de que as fotos HEIC precisam, sob a mesma licença.',
  lgplSeparate:
    'O FileOrca usa a libheif sem nenhuma alteração. A biblioteca compilada é o arquivo libheif.wasm, e o site o entrega como um arquivo próprio, byte a byte como o pacote o publica. O JavaScript que o inicia é o do próprio pacote, tratado só pela ferramenta que monta o site.',
  lgplReplace:
    'Você pode usar outra versão da biblioteca. A página pede o libheif.wasm pelo endereço dele, então uma versão que você compilou a partir do código-fonte abaixo pode tomar o lugar dele, por exemplo com as substituições locais das ferramentas do desenvolvedor do navegador.',
  lgplSourceHeading: 'Código-fonte da versão em uso',
  lgplRoles: {
    libheif: 'a biblioteca',
    libde265: 'o decodificador HEVC que vem nela',
    wrapper: 'o pacote npm que a envolve',
    build: 'os scripts que montam o arquivo .wasm',
  },
  lgplTexts:
    'O texto completo da LGPL-3.0 e o da GPL-3.0, a que ela remete, estão em libheif-js, na primeira tabela abaixo.',
} satisfies LicensesTexts;
