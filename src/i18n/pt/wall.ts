import type { WallTexts } from '../types.ts';

// F12 · a parede do bloqueador (decisão 10, com o ajuste 3; § 431). Os textos da especificação (wall.html), com a 2ª
// frase e os botões do ajuste 3. Os passos da ajuda vêm da ajuda pública de cada produto; nenhum tem link.
export default {
  title: 'A Oli vive dos anúncios',
  body: 'O FileOrca é grátis, sem cadastro e sem limite, porque os anúncios pagam as contas. Com um bloqueador ligado, os anúncios não aparecem e nada entra. Desative o bloqueador para o fileorca.com e recarregue a página.',
  later: 'O “Usar só desta vez” volta amanhã.',
  reload: 'Recarregar, já desativei',
  help: 'Ver como desativar',
  escape: 'Usar só desta vez',
  close: 'Fechar',
  helpTitle: 'Desative só para o fileorca.com',
  helpHint: 'Ache o seu na lista. Todo bloqueador deixa passar um site só e segue bloqueando o resto.',
  entries: {
    ubo: {
      name: 'uBlock Origin',
      steps: ['Abra o uBlock Origin pelo ícone na barra do navegador.', 'Aperte o botão grande de ligar e desligar, azul. Ele fica cinza.', 'Recarregue a página.'],
      note: 'Usa o uBO Lite? Mova o “modo de filtragem” até “sem filtragem”.',
    },
    adblock: {
      name: 'AdBlock',
      steps: ['Abra o AdBlock pelo ícone na barra do navegador.', 'Escolha “Pausar nesse site”.', 'A página recarrega sozinha.'],
      note: 'A pausa vale por 7 dias e se renova a cada visita.',
    },
    abp: {
      name: 'Adblock Plus',
      steps: ['Abra o Adblock Plus pelo ícone na barra do navegador.', 'Desligue a chave “Este site”.', 'Aperte “Atualizar”.'],
      note: 'A pausa vale por 7 dias e se renova a cada visita.',
    },
    adguard: {
      name: 'AdGuard',
      steps: ['Abra o AdGuard pelo ícone na barra do navegador.', 'Desligue “Proteção para o site atual”.', 'Recarregue a página.'],
      note: 'O ícone de pausa, no alto, desliga o AdGuard em todos os sites. A chave basta.',
    },
    brave: {
      name: 'Brave',
      steps: [
        'Abra o Brave Shields pelo ícone do leão, à direita da barra de endereço.',
        'Desligue os Shields na chave do alto do painel.',
        'Recarregue a página, se ela não recarregar sozinha.',
      ],
      note: 'Isso muda só o fileorca.com. No celular, o leão também fica na barra de endereço.',
    },
    firefox: {
      name: 'Firefox no modo Rigoroso',
      steps: [
        'Abra o escudo à esquerda da barra de endereço.',
        'Desligue a “Proteção aprimorada contra rastreamento”. Agora diz “Desativada neste site”.',
        'A página recarrega sozinha.',
      ],
      note: 'O Firefox chama isso de proteção contra rastreamento, não de bloqueador. O modo Rigoroso também bloqueia parte dos anúncios.',
    },
    'safari-mac': {
      name: 'Safari no Mac',
      steps: [
        'Com o fileorca.com aberto, escolha Safari > Ajustes e depois Sites.',
        'Na lista da esquerda, escolha “Bloqueadores de Conteúdo”.',
        'No menu ao lado do fileorca.com, escolha “Desligado” e recarregue a página.',
      ],
      note: 'O AdBlock, o Adblock Plus e o AdGuard também têm ícone próprio no Safari: veja acima.',
    },
    'safari-ios': {
      name: 'Safari no iPhone e no iPad',
      steps: [
        'No Safari, toque no botão à esquerda do endereço (antes do iOS 18, era o “aA”).',
        'Toque em “Gerenciar Extensões” e desligue o bloqueador.',
        'Recarregue a página.',
      ],
      note: 'É um bloqueador de conteúdo? No mesmo menu, abra os ajustes do site e desligue “Usar Bloqueadores de Conteúdo”.',
    },
    other: {
      name: 'Outro bloqueador, ou a rede',
      steps: [
        'Procure o ícone dele na barra do navegador ou dentro da barra de endereço.',
        'Permita o fileorca.com, ou pause o bloqueador neste site.',
        'Recarregue a página.',
      ],
      note: 'Se o bloqueio vem da rede (em alguns escritórios e escolas, ou com algumas VPNs e DNS), o navegador não consegue desligar. Tente outra rede.',
    },
  },
} satisfies WallTexts;
