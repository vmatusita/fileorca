import type { SupportTexts } from '../types.ts';

export default {
  title: 'Apoie estas ferramentas grátis com um café no Pix',
  description:
    'Ferramentas grátis, feitas por uma pessoa só em Curitiba. Um café no Pix ou no Ko-fi paga a próxima ferramenta da fila. É opcional e não muda nada no site.',
  h1: 'Ferramentas grátis, feitas por uma pessoa só',
  body: 'Sem cadastro, sem paywall, sem limite. Os anúncios pagam os custos; os cafés pagam as próximas ferramentas.',
  whoHeading: 'Quem está por trás',
  who: 'Eu sou o Victor Yuki Matusita, dev em Curitiba. Faço e mantenho o FileOrca sozinho, então não tem equipe por trás: é uma pessoa só.',
  nextHeading: 'O que o próximo café paga',
  next: 'A Oli funciona à base de café, e o próximo café paga a próxima ferramenta da fila. A doação é opcional: não compra nada e não muda nada no site.',
  button: 'Apoiar no Ko-fi',
  amountsNote:
    'No Ko-fi, os valores sugeridos são US$ 3, 5 ou 10. O pagamento acontece no Ko-fi, que segue as próprias políticas.',
  pix: {
    heading: 'Um café no Pix',
    legend: 'Valor',
    any: 'Qualquer valor',
    amount: 'R$ {amount}',
    qrLabel: 'QR code do Pix, {amount}',
    anyLower: 'qualquer valor',
    codeLabel: 'Pix copia e cola',
    copy: 'Copiar código',
    copied: 'Código copiado. Cole no app do seu banco, na opção Pix copia e cola.',
    receiver: 'Em nome de {name}',
    note: 'Aponte a câmera do app do banco para o QR ou copie o código. O Pix cai na hora, e o site não fica sabendo quem pagou nem quanto. Se você pagou por engano, escreva pela página de Contato: eu devolvo pelo botão de devolução do próprio Pix, em até 90 dias.',
  },
} satisfies SupportTexts;
