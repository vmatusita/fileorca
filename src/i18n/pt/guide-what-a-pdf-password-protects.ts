// F19b (front T4): o que a senha de um PDF protege, em português, com as medidas de data/guides-measured.json (front M1),
// a partir do texto em inglês (front E4); as fontes, que não têm versão em português, lidas em 2026-11-16.
import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'O que a senha de um PDF protege e o que as restrições não protegem',
  description: 'A senha para abrir um PDF tranca o arquivo inteiro, e as restrições sozinhas são só um pedido ao leitor. O que cada uma fez com nossos PDFs de teste.',
  h1: 'O que a senha de um PDF protege',
  lead: 'A senha para abrir e as restrições parecem proteger o arquivo. Só uma das duas manteve fechados os nossos PDFs de teste.',
  changed: 'Primeira versão deste guia, publicada em {published}, com os números medidos em {measured}.',
  intro: [
    'Um PDF pode ter dois tipos diferentes de proteção. A senha para abrir, a que a Proteger PDF coloca, mantém o arquivo fechado até alguém digitá-la. As restrições, definidas com uma senha de proprietário à parte, deixam qualquer pessoa abrir e ler o arquivo, mas pedem ao programa que não o imprima, não copie o texto e não mude as páginas.',
    'Pusemos as duas à prova em arquivos nossos: {files_word} PDFs que protegemos com a Proteger PDF e um PDF que veio trancado só por restrições. Em cada um, lemos a criptografia, tentamos abrir sem senha, com a senha certa e com uma errada, e contamos os bytes que a proteção acrescentou. A documentação do qpdf, o programa por trás da Proteger PDF e da Desbloquear PDF, explica o que vimos.',
  ],
  toolHeading: 'Coloque senha num PDF aqui',
  toolIntro: 'Solte um PDF ou vários, digite uma senha duas vezes e aperte Proteger PDFs. Cada arquivo volta criptografado e pede essa senha antes de abrir.',
  sections: [
    {
      heading: 'A senha para abrir criptografa o arquivo inteiro',
      paragraphs: [
        'A senha para abrir não é um cadeado do lado de fora do arquivo. A Proteger PDF criptografa o conteúdo do PDF com uma chave, e a documentação do qpdf explica onde essa chave fica: ela é sorteada e guardada no próprio arquivo, criptografada com a senha. Quem digita a senha recebe a chave e, com ela, as páginas.',
        'Os {files_word} PDFs que protegemos voltaram com criptografia AES e uma chave de {keyBits} bits, a revisão {revision} da criptografia de PDF. Segundo a documentação do qpdf, uma chave desse tamanho sempre usa AES, e essa é a única revisão que a especificação do PDF 2.0 não considera obsoleta.',
        'Sem a senha, o leitor de PDF dos nossos testes se recusou a abrir todos os {refusedWithout_word}. Com ela, todos abriram, e uma senha errada não levou a lugar nenhum. Também procuramos nos bytes de cada arquivo protegido a senha que tínhamos digitado, e ela não estava lá: a senha tranca a chave e não é guardada ao lado dela.',
      ],
    },
    {
      heading: 'As restrições são um pedido, não um cadeado',
      paragraphs: [
        'As restrições funcionam de outro jeito. Um PDF pode listar o que permite, como imprimir, copiar o texto, preencher formulários ou mudar as páginas, e ter uma senha de proprietário só para essa lista, sem senha para abrir. A documentação do qpdf é direta sobre o efeito disso: quem faz valer as restrições é apenas o programa que abre o arquivo. Um leitor que segue o padrão deve obedecer a elas, e qualquer programa capaz de ler o arquivo já tem a chave.',
        'Nosso PDF de teste com restrições mostra o que isso quer dizer. Ele é criptografado do mesmo jeito que os arquivos protegidos, com uma chave de {ownerKeyBits} bits e a revisão {ownerRevision}, e bloqueia {ownerBlocked_wordf} das {capabilities_wordf} ações que o qpdf lista. Mesmo assim, o leitor dos nossos testes o abriu sem senha nenhuma. A documentação do qpdf tem um nome para um arquivo assim: criptografado, mas não protegido por senha.',
        'A Desbloquear PDF, diante de um PDF só com restrições, tirou todas elas sem pedir senha nenhuma. A cópia que ela devolveu veio sem criptografia, sem nenhuma ação bloqueada e com as mesmas {ownerPages_wordf} páginas. Nada no arquivo conseguiu impedir isso, e a documentação do qpdf acrescenta que qualquer leitor de código aberto poderia ser modificado para ignorar a lista.',
      ],
    },
    {
      heading: 'O que a Proteger PDF acrescenta e o que deixa de fora',
      paragraphs: [
        'A Proteger PDF usa a senha que você digita tanto para abrir o arquivo quanto como senha de proprietário, e não acrescenta nenhuma restrição: nos nossos arquivos protegidos, nenhuma das ações que o qpdf lista ficou bloqueada. Um PDF que já tem restrições é recusado, e o nosso foi, então essas restrições precisam sair antes, com a Desbloquear PDF.',
        'A criptografia ocupa pouco espaço, e na nossa amostra o acréscimo pouco dependeu do tamanho do arquivo. Nossos {files_word} PDFs cresceram de {addedMin_exact} a {addedMax_exact}: o PDF de fotos, com {photosBefore}, foi o que menos ganhou, e o nosso menor arquivo, com {mixedBefore}, ganhou {mixedAdded_exact}, o que num arquivo tão pequeno é {mixedChange_more} a mais.',
        'Protegemos cada arquivo duas vezes, com uma senha diferente a cada vez, e as duas cópias saíram do mesmo tamanho nos {sameSize_word} arquivos.',
      ],
    },
    {
      heading: 'Uma senha curta pode ser adivinhada',
      paragraphs: [
        'Uma chave longa ajuda pouco se a senha que a guarda é fácil de descobrir. O NIST, a agência de padrões dos Estados Unidos, escreve na publicação especial 800-63B que o comprimento é um fator primário da força de uma senha, e que senhas curtas demais cedem a ataques de força bruta e de dicionário: tentar todas as combinações, ou todas as palavras de uma lista.',
        'Para sistemas de login, as regras do NIST pedem pelo menos {nistMinimum} quando a senha é a única coisa que prova quem você é, e contam também com um limite de tentativas erradas. Um PDF protegido não tem esse limite. A chave está dentro do arquivo, então quem tem uma cópia pode tentar uma senha atrás da outra num computador próprio, onde nada limita o ritmo das tentativas. O NIST chama isso de ataque offline.',
        'Nossa medida não cronometrou quanto tempo leva para adivinhar uma senha, e este guia não promete nada sobre isso. O que ela mostra é mais estreito: a senha certa abriu todos os arquivos, uma errada não abriu nenhum, e a criptografia foi a mesma com qualquer senha que digitamos. O quanto um arquivo protegido é difícil de abrir depende da senha.',
      ],
    },
    {
      heading: 'Qual proteção faz o quê',
      paragraphs: ['Lado a lado, as duas proteções cobrem coisas diferentes.'],
      list: [
        'Senha para abrir: o arquivo continua criptografado para quem não tem a senha, e ela não fica gravada no arquivo. Quem recebe a senha de você pode fazer tudo com a cópia, já que a Proteger PDF não acrescenta restrição.',
        'Só restrições: qualquer pessoa abre e lê o arquivo, e o que ele permite vale apenas nos programas que escolhem seguir a lista.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'O que medimos',
  sheet: {
    stats: [
      { label: 'Acrescentado ao nosso PDF de fotos', value: '+{photosAdded_exact}', from: '{photosBefore}', to: '{photosAfter}' },
      { label: 'Bloqueadas no PDF que abre sem senha', value: '{ownerBlocked} de {capabilities}', sub: 'Ações, na lista do qpdf' },
    ],
    sample: '{files} PDFs de teste com senha e um PDF só com restrições.',
    link: 'Veja as tabelas',
  },
  tableHeading: 'Arquivo por arquivo',
  measuredIntro: 'Os {files_word} PDFs de teste que protegemos com a Proteger PDF, cada um duas vezes e cada vez com uma senha nova inventada para o teste; depois, nosso PDF com restrições e sem senha para abrir, como veio e depois da Desbloquear PDF. A coluna Acrescentado mostra, byte a byte, quanto cada arquivo cresceu.',
  measuredNote: 'Medido em {date}, no Node, com o motor das ferramentas deste site, cada execução num processo novo, como numa aba nova. A criptografia de cada arquivo foi lida com o qpdf, e cada arquivo foi aberto com o PDF.js, o leitor dos nossos testes, sem senha, com a senha certa e com uma errada.',
  tables: [
    {
      heading: 'PDFs com senha',
      caption: 'Cada PDF protegido pela Proteger PDF: as páginas, o tamanho antes e depois e os bytes que a criptografia acrescentou',
      head: ['PDF', 'Páginas', 'Antes', 'Depois', 'Acrescentado'],
    },
    {
      heading: 'Restrições sem senha',
      caption: 'O PDF com restrições e sem senha para abrir, como veio e depois da Desbloquear PDF, ao lado de um PDF depois da Proteger PDF: o tamanho, se um leitor o abriu sem senha e quantas ações ele bloqueia',
      head: ['Arquivo', 'Tamanho', 'Abre sem senha', 'Ações bloqueadas'],
      labels: ['Só restrições, como veio', 'O mesmo PDF depois da Desbloquear PDF', 'PDF com páginas de tamanhos diferentes, depois da Proteger PDF'],
    },
  ],
  sourcesHeading: 'Fontes',
  sources: [
    { id: 'qpdf', label: 'Documentação do qpdf: Criptografia de PDF (em inglês)', href: 'https://qpdf.readthedocs.io/en/stable/encryption.html', read: '2026-11-16' },
    { id: 'nist', label: 'NIST: Publicação Especial 800-63B (em inglês)', href: 'https://pages.nist.gov/800-63-4/sp800-63b.html', read: '2026-11-16' },
  ],
  facts: {
    nistMinimum: { text: '15 caracteres', source: 'nist' },
  },
  names: ['800-63B', 'PDF 2.0'],
  relatedHeading: 'Ferramentas e guias relacionados',
};

export default texts;
