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
    'Solte seus PDFs na caixa, escolha os arquivos ou cole com Ctrl V.',
    'Digite uma senha e digite de novo para confirmar.',
    'Aperte Proteger PDFs, e a Oli criptografa cada arquivo.',
    'Baixe os PDFs protegidos e anote a senha.',
  ],
  specsHeading: 'O que entra e o que sai',
  specs: {
    caption: 'O que a Proteger PDF recebe e entrega',
    head: ['Detalhe', 'O que acontece'],
    rows: [
      ['O que aceita', 'Arquivos PDF, quantos quiser. A Oli confere o que há dentro do arquivo, não o nome dele.'],
      ['Senha', 'Uma senha para o lote inteiro, digitada duas vezes. Ela precisa ter de 4 a 100 caracteres.'],
      ['Criptografia', 'AES-256 (revisão 6), gravada pelo qpdf.'],
      ['Senha para abrir e de proprietário', 'A mesma senha serve para abrir o arquivo e como senha de proprietário.'],
      ['Restrições', 'Nenhuma é acrescentada. Imprimir e copiar continuam liberados para quem tem a senha.'],
      ['O que fica', 'O conteúdo das páginas não muda: só a criptografia é acrescentada. Os campos de formulário, os links e os marcadores ficam como eram, assim como os dados do documento. A Oli não acrescenta data, nome de programa nem nada do seu aparelho.'],
      ['Nome do arquivo', 'Um arquivo chamado relatorio.pdf sai como relatorio-protegido.pdf. O seu original não muda.'],
      ['Lote', 'Sem limite de arquivos. Vários arquivos são baixados juntos num ZIP só.'],
      ['Já protegido', 'Um PDF que já tem senha ou restrições é recusado na própria linha, com um link para Desbloquear PDF. Os outros arquivos seguem.'],
    ],
  },
  faqHeading: 'Perguntas',
  faq: [
    {
      q: 'Cada arquivo pode ter a própria senha?',
      a: 'Num lote só, não, porque uma senha vale para o lote inteiro. Proteja os arquivos em rodadas separadas, uma rodada para cada senha.',
    },
    {
      q: 'E se eu esquecer a senha?',
      a: 'Aí a cópia protegida não abre, e ninguém consegue recuperar a senha para você. Guarde a senha num lugar seguro e fique com o PDF original até conferir que a cópia protegida abre.',
    },
    {
      q: 'Quão forte é a proteção?',
      a: 'O ponto fraco é a senha, não a criptografia: uma senha curta ou comum é fácil de adivinhar. Escolha uma longa que você não use em nenhum outro lugar.',
    },
    {
      q: 'Dá para tirar a senha depois?',
      a: 'Dá, com a Desbloquear PDF e a mesma senha. Ela entrega uma cópia que abre sem senha.',
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
