import type { ContactTexts } from '../types.ts';

export default {
  title: 'Contact by email',
  description:
    'Write to contato@fileorca.com with a question or a file that does not work. Replies come in English, Portuguese or Spanish. Your email is used only to answer.',
  h1: 'Contact',
  intro: 'Have a question, or a file that does not work? Send an email to this address.',
  emailLabel: 'Email',
  notes: [
    'If a file does not work, mention the browser you use and the file type. You do not need to send the file.',
    'Replies come in English, Portuguese or Spanish.',
    'Never send passwords or payment data. FileOrca will never ask for them.',
    'Emails to this address are forwarded by Cloudflare Email Routing to a Gmail inbox and used only to answer.',
  ],
} satisfies ContactTexts;
