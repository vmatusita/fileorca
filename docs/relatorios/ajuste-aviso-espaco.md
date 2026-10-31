# Ajuste · Espaço do aviso de cookies no fim da página: relatório

Branch `ajuste-aviso-espaco`, a partir da `main` em `94a1428` (o merge da F3). Pedido: `docs/prompts/prompt-ajuste-aviso-espaco.md`. Decisões: `DECISOES.md` § 106 e § 107. Run de 31/out/2026.

## Resumo

Depois do merge da F3, o Victor viu em fileorca.com, a uns 1920 px, uma área azul-escura vazia de uns 220 px embaixo do rodapé, que só sumia ao aceitar os cookies.

- **A causa:** a F3 (§ 91) tinha tirado a faixa clara, que era o padding no `body`, e passado a reserva para o rodapé. Mas a reserva continuou valendo para todo mundo: a altura inteira do aviso, enquanto ele estivesse aberto.
- **A correção:** agora o aviso aberto flutua por cima do fim da página, como um banner, e não reserva nada ali. O espaço embaixo do rodapé só abre quando um elemento recebe o foco do teclado embaixo do aviso e a página já não tem como rolar. Assim, a garantia de foco não coberto (WCAG 2.4.11, § 36) continua de pé. A âncora do AdSense mantém a reserva própria (§ 101).
- **A troca:** enquanto a pessoa não escolhe, o card cobre o canto de baixo à esquerda do rodapé quando a página está rolada até o fim. Ele segue não modal, e a escolha está no próprio card.

## O espaço antes e depois

**O teste antes da correção.** O `tests/e2e/cookie-footer.spec.ts` passou a exigir que, com o aviso aberto e sem foco do teclado, o rodapé termine com o respiro normal de 24 px. Isso vale nas larguras 360, 768, 1280 e 1920 (a do screenshot), nos dois temas e pelos dois caminhos de tema. No código de antes, 8 testes falharam, nos dois navegadores:

```
  1) [chromium] › tests\e2e\cookie-footer.spec.ts:64:3 › /privacy/: with the cookie notice open the page ends at the footer, and Decline takes the room away

    Error: /privacy/ 360px light (media)

    expect(received).toEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Object {
        "below": "ok",
    -   "padding": "24px",
    +   "padding": "240px",
      }
```

Com a âncora do AdSense na tela, o rodapé ficava com 340 px. Sem foco, deveriam ser 132 px: os 24 de respiro mais os 108 da âncora.

**Depois da correção.** Passam os 178 testes de `cookie-footer`, `events`, `consent`, `consent-choice`, `coffee` e `a11y`, nos dois navegadores. Entre eles estão o teste de 45 Tabs com o aviso aberto (nenhum foco coberto), o teste sem `scroll-padding` e o foco no último link do rodapé, que abre a reserva e deixa o link acima do aviso.

**Screenshots** da home rolada até o fim, com o aviso aberto, no Chromium:

| | 1920 claro | 1920 escuro | 360 claro | 360 escuro |
| --- | --- | --- | --- | --- |
| Antes | [antes](ajuste-aviso-espaco/espaco-antes-1920-light.png) | [antes](ajuste-aviso-espaco/espaco-antes-1920-dark.png) | [antes](ajuste-aviso-espaco/espaco-antes-360-light.png) | [antes](ajuste-aviso-espaco/espaco-antes-360-dark.png) |
| Depois | [depois](ajuste-aviso-espaco/espaco-depois-1920-light.png) | [depois](ajuste-aviso-espaco/espaco-depois-1920-dark.png) | [depois](ajuste-aviso-espaco/espaco-depois-360-light.png) | [depois](ajuste-aviso-espaco/espaco-depois-360-dark.png) |

## O que mudou

- **`src/components/CookieNotice.astro`:**
  - a reserva do aviso no `--fo-bottom-room` só entra com a flag `keys`;
  - o `focusin` liga essa flag quando o elemento focado ficaria embaixo do aviso e a página não tem mais como rolar;
  - a flag volta a desligar quando o aviso some;
  - o `scroll-padding-bottom` segue contando o aviso e a âncora.
- **`tests/e2e/cookie-footer.spec.ts`:** a expectativa nova e a largura de 1920 × 1035.
- **`tests/e2e/events.spec.ts`:** o teste do `donate_click` do rodapé fecha o aviso antes de clicar no link do café.
- **`tests/e2e/ads.spec.ts`** (§ 107): o CI da PR achou uma intermitência antiga, sem relação com o aviso. O teste media o layout logo depois de mudar a largura, enquanto a ilha ainda movia a comparação para dentro ou para fora do cartão. Agora ele espera dois quadros antes de medir, sem mudar nenhuma asserção.
- **Documentos:** a decisão está no `DECISOES.md` § 106, e a regra ganhou uma seção curta no fim do CLAUDE.md.

## pnpm verificar local

Execução em 31/out/2026, com o código final deste ajuste. Ambiente: Windows 11, Ryzen 5 7600X, Node 26.8.1 e pnpm 10. O `pnpm verificar` buildou do zero.

```
Resumo do pnpm verificar (tudo)
  ok       7.3 s  tipos (astro check)
  ok       2.4 s  lint (eslint)
  ok       8.1 s  build (astro build do zero)
  ok       5.5 s  vitest
  ok       0.3 s  cabeçalhos gerados
  ok       0.4 s  worker sem código
  ok       0.5 s  seo (hreflang, sitemaps, canonical, robots)
  ok       0.5 s  links internos e páginas órfãs
  ok       0.5 s  conteúdo mínimo das ferramentas e do site
  ok      16.7 s  prontidão para o AdSense (dois builds extras em .cache/)
  ok       0.5 s  design (sprite, fontes, tema, movimento, setas)
  ok       5.4 s  licenças
  ok       0.3 s  conteúdo de dinheiro e saúde
  ok       0.4 s  actionlint
  ok     146.4 s  playwright (chromium e webkit, axe, anúncios, orçamentos)
  ok      71.4 s  lighthouse ci
  ok       0.4 s  lint:texto (LanguageTool)
  total 266.7 s (limite 900 s)
verificar exit 0
```

O Vitest passou com 48 arquivos e 778 testes, e o Playwright com 536 testes nos dois navegadores. O `lint:texto` não teve texto do site alterado para conferir.

## CI e merge

A PR é desta branch, e o CI em partes a mescla quando as quatro partes passam. Este relatório entra antes do merge, então o CI, o merge e a conferência da produção (só leitura, com o Google bloqueado) ficam na resposta da run.

## O que é do Victor

- Abrir fileorca.com numa janela anônima, rolar até o fim e conferir que a área vazia sumiu. Conferir também que o card do aviso, enquanto aberto, fica por cima do canto de baixo à esquerda do rodapé.
- Se preferir que o card nunca cubra o rodapé, as saídas são duas, e as duas são decisão de design:
  - um card menor no computador;
  - o rodapé com a primeira coluna afastada do canto esquerdo.
