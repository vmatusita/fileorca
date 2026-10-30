import type { ContactTexts } from '../types.ts';

export default {
  title: 'Contato por e-mail',
  description:
    'Escreva para contato@fileorca.com com uma dúvida ou um arquivo que não funciona. Respostas em português, inglês ou espanhol. O e-mail só serve para responder.',
  h1: 'Contato',
  intro: 'Tem uma dúvida ou um arquivo que não funciona? Mande um e-mail para este endereço.',
  emailLabel: 'E-mail',
  notes: [
    'Se um arquivo não funcionar, diga qual navegador você usa e o tipo do arquivo. Não precisa mandar o arquivo.',
    'As respostas saem em português, inglês ou espanhol.',
    'Nunca envie senhas nem dados de pagamento. O FileOrca jamais pede esse tipo de informação.',
    'Os e-mails enviados para este endereço são encaminhados pelo serviço Cloudflare Email Routing para uma caixa do Gmail e usados só para responder.',
  ],
} satisfies ContactTexts;
