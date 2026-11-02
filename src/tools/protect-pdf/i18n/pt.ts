// Blocos da página Proteger PDF (how, specs, faq, privacy) e os textos que esta ferramenta soma aos do painel de PDF.
// As linhas de especificação dizem o que o motor faz de verdade (src/engine/pdf/qpdf.ts): AES-256 revisão 6, uma senha
// para abrir e de proprietário, nenhuma restrição acrescentada. Se a cifra mudar lá, mude aqui e no inglês.
import type { PdfToolTexts } from '../../../i18n/types.ts';
import type { PasswordToolTexts } from '../../pdf/option-texts.ts';

const texts: PdfToolTexts<PasswordToolTexts> = {
  title: 'Proteger PDF: coloque senha num PDF no navegador',
  description:
    'Coloque senha em PDFs no navegador, com criptografia AES-256, num arquivo ou no lote inteiro. Nada é enviado, e a sua senha nunca fica guardada.',
  h1: 'Proteger PDF',
  howHeading: 'Como funciona',
  howSteps: [
    'Solte seus PDFs na caixa, escolha os arquivos ou cole com Ctrl V, quantos quiser.',
    'Digite uma senha de 4 a 100 caracteres e digite de novo para confirmar.',
    'Aperte Proteger PDFs, e a Oli criptografa cada arquivo no seu navegador, com a mesma senha para todos.',
    'Baixe um PDF ou todos juntos num ZIP e anote a senha, porque ninguém consegue recuperá-la para você.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Proteger PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Senha', 'Uma senha para o lote inteiro, digitada duas vezes. Ela precisa ter de 4 a 100 caracteres.'],
      ['Criptografia', 'AES-256 (revisão 6), gravada pelo qpdf rodando no seu navegador.'],
      ['Senha para abrir e de proprietário', 'A mesma senha serve para abrir o arquivo e como senha de proprietário.'],
      ['Restrições', 'Nenhuma é acrescentada. Imprimir e copiar continuam liberados para quem tem a senha.'],
      ['O que fica', 'O conteúdo das páginas não muda: só a criptografia é acrescentada. Os campos de formulário, os links e os marcadores ficam como eram, assim como os dados do documento. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['Nome do arquivo', 'Um arquivo chamado relatorio.pdf sai como relatorio-protegido.pdf. O seu original não muda.'],
      ['Lote', 'Sem limite de arquivos. Vários arquivos são baixados juntos num ZIP só.'],
      ['Já protegido', 'Um PDF que já tem senha ou restrições é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.'],
      ['Senha esquecida', 'O FileOrca não guarda a senha e não consegue recuperá-la. Guarde uma cópia num lugar seguro.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Como coloco senha num PDF?',
      a: 'Solte o PDF, digite uma senha duas vezes e aperte Proteger PDFs. A Oli criptografa o arquivo no seu navegador, e o PDF novo pede a senha sempre que alguém abrir. O seu arquivo original fica como era.',
    },
    {
      q: 'E se eu esquecer a senha?',
      a: 'O FileOrca não guarda a sua senha, então não consegue recuperá-la, e o arquivo protegido não abre sem ela. Guarde a senha num lugar seguro e fique com o PDF original até conferir que a cópia protegida abre.',
    },
    {
      q: 'Quão forte é a proteção?',
      a: 'O arquivo é criptografado com AES-256, uma criptografia padrão para arquivos PDF. O que mais pesa é a senha: uma curta ou comum é fácil de adivinhar, então escolha uma longa que você não use em nenhum outro lugar. A regra aqui é de 4 a 100 caracteres, e quanto mais longa, mais segura.',
    },
    {
      q: 'Dá para proteger vários PDFs de uma vez?',
      a: 'Dá. Solte quantos arquivos quiser: todos recebem a mesma senha, e cada um sai como um arquivo próprio terminado em -protegido. Quando você quiser todos, um botão entrega um ZIP.',
    },
    {
      q: 'Meu PDF e a minha senha são enviados para algum lugar?',
      a: 'Não. A Oli lê o PDF e criptografa o arquivo no seu aparelho, no navegador, com o qpdf. Nem o arquivo nem a senha vão para um servidor, e a senha não fica guardada.',
    },
  ],
  privacyHeading: 'Privacidade',
  privacyNote:
    'Seus PDFs são criptografados no seu aparelho e nunca são enviados a um servidor. A senha não fica guardada e não sai do seu aparelho.',
  relatedHeading: 'Ferramentas relacionadas',
  panel: {
    suffix: 'protegido',
    note: 'PDFs, quantos quiser',
    progressLabel: 'Protegendo os PDFs',
    done: 'Prontinho! Seu PDF agora pede senha.',
    doneMany: 'Prontinho! Seus {count} PDFs agora pedem senha.',
    action: 'Proteger PDFs',
    options: {
      passwordLabel: 'Senha',
      confirmLabel: 'Confirme a senha',
      rule: 'Use de 4 a 100 caracteres.',
      mismatch: 'As duas senhas não são iguais. Digite a mesma senha nos dois campos.',
    },
  },
};

export default texts;
