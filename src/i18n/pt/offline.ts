import type { OfflineTexts } from '../types.ts';

// A página offline (F8, decisão 8; DECISOES § 289).
export default {
  title: 'Offline',
  description:
    'O FileOrca guarda neste aparelho as páginas que você abre com internet, para elas funcionarem offline. Esta página ainda não foi guardada.',
  h1: 'Você está offline',
  says: 'Sem internet, e esta página ainda não foi guardada.',
  saysDetail: 'As páginas que você abriu aqui com internet seguem funcionando.',
  savedHeading: 'Guardadas neste aparelho',
  savedEmpty: 'Nada guardado ainda. Abra uma ferramenta com internet e ela fica aqui.',
  homeLink: 'Ir para a página inicial',
} satisfies OfflineTexts;
