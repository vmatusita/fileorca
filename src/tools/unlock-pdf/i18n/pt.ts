import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { UnlockTexts } from '../../pdf/option-texts.ts';

// Blocos da página Desbloquear PDF (data-content: how, specs, faq, privacy, related) e os textos do painel que a ilha de
// PDF mostra. As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/): se ele mudar lá, mude
// aqui e no inglês.
const texts: PdfToolTexts<UnlockTexts> = {
  title: 'Desbloquear PDF: tire a senha de um PDF no navegador',
  description:
    'Abra um PDF protegido por senha ou tire as restrições dele, no próprio navegador. O arquivo e a senha ficam no seu aparelho e nunca são enviados.',
  h1: 'Desbloquear PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte um PDF na caixa, escolha o arquivo ou cole, um PDF por vez, porque cada arquivo tem a própria senha.',
    'Se o PDF só tem restrições, a Oli tira tudo na hora; se ele pede senha para abrir, digite a senha na caixa e aperte Tirar a senha.',
    'Baixe o PDF novo, que abre sem senha, enquanto o seu arquivo original continua intacto.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Desbloquear PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['Arquivos', 'Um PDF por vez. A Oli confere que é um PDF pelo que há dentro do arquivo, não pelo nome.'],
      ['Só restrições', 'Um PDF que abre livremente, mas bloqueia coisas como editar, imprimir ou copiar, perde essas restrições na hora. A Oli não pede nada.'],
      ['Senha para abrir', 'Um PDF que pede senha quando você abre precisa dessa senha aqui. Digite a senha na caixa e aperte Tirar a senha.'],
      ['Senha errada', 'A Oli avisa que a senha não abriu o arquivo, e você pode tentar de novo quantas vezes precisar.'],
      ['Tipos de proteção', 'AES-256, AES-128 e a antiga proteção RC4, tratadas pelo qpdf rodando no seu navegador.'],
      ['Sem adivinhar', 'Sem a senha certa, o arquivo continua fechado: a Oli não adivinha nem quebra senhas. Use só em arquivos que você tem o direito de abrir e alterar.'],
      ['O que fica', 'As páginas, o texto, as imagens, os campos de formulário, os links, os marcadores e as propriedades do documento ficam como eram. Só a proteção sai.'],
      ['O que você recebe', 'Um PDF novo, sem senha e sem restrições. O seu arquivo original não muda.'],
      ['Nada para tirar', 'Um PDF sem senha e sem restrições não tem nada para tirar, então a Oli avisa isso em vez de devolver o mesmo arquivo.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Qual é a diferença entre senha para abrir e restrições?',
      a: 'A senha para abrir impede qualquer pessoa de ler o PDF, então você precisa dela aqui. As restrições são definidas por quem fez o arquivo: dá para ler, mas coisas como editar, imprimir ou copiar o texto ficam bloqueadas. A Oli tira as restrições sozinha e só pede senha quando o arquivo precisa de uma para abrir.',
    },
    {
      q: 'Consigo abrir um PDF se esqueci a senha?',
      a: 'Não. A Oli precisa da senha certa e não adivinha nem quebra senhas, então um arquivo sem ela continua fechado. Se o arquivo é seu para abrir, peça a senha a quem fez o PDF, ou uma cópia sem senha.',
    },
    {
      q: 'Posso tirar a senha de qualquer PDF?',
      a: 'Use só em arquivos que você tem o direito de abrir e alterar, como os seus próprios documentos ou arquivos cujo dono permitiu. Tirar uma senha não dá a você permissão para compartilhar ou editar o trabalho de outra pessoa. Na dúvida, pergunte ao dono antes.',
    },
    {
      q: 'Meu PDF ou a minha senha são enviados para algum lugar?',
      a: 'Não. A Oli lê e grava o PDF no seu aparelho, no navegador, com o qpdf rodando dentro da página. Nem o arquivo nem a senha que você digita vão para lugar nenhum. Abra a aba Rede do navegador enquanto usa a ferramenta: nenhuma requisição leva os seus arquivos.',
    },
    {
      q: 'Que tipos de proteção ela consegue tirar?',
      a: 'AES-256, AES-128 e a proteção RC4, mais antiga. A Oli tira só a proteção, então as páginas, o texto, os formulários, os links e os marcadores ficam como eram.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seu PDF e a senha que você digita são tratados no seu aparelho, no navegador, e nunca são enviados a um servidor. A Oli não guarda nenhum dos dois.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'desbloqueado',
    note: 'um PDF por vez',
    progressLabel: 'Tirando a proteção',
    done: 'Prontinho! A Oli tirou a proteção do seu PDF.',
    doneMany: 'Prontinho! A Oli tirou a proteção de {count} PDFs.',
    options: {
      passwordLabel: 'Senha para abrir o PDF',
      rule: 'Digite a senha deste PDF para continuar.',
      submit: 'Tirar a senha',
      ask: 'Este PDF pede senha para abrir. Digite a senha e aperte Tirar a senha.',
    },
  },
};

export default texts;
