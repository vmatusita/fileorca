# Playwright e navegadores

O que as runs aprenderam sobre os specs do Playwright, o Chromium e o WebKit, as portas e a divisão dos testes nas partes do CI, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- O WebKit do Playwright no Windows não tem `OffscreenCanvas` no worker; o motor cai para a página (DECISOES § 22). No CI (Linux) o comportamento pode diferir: os testes cobrem os dois caminhos sem depender disso.

## F2: ferramentas de imagem

Pegadinhas que a F2 achou:

- Colar no teste: `new ClipboardEvent('paste', { clipboardData: dt })` com um `DataTransfer` montado na página funciona nos dois navegadores; `page.dispatchEvent('paste')` não.
- O `serve-dist` devolve o 404 mais próximo para rota que falta: teste de página exige status 200, ou passa sem a página existir.
- O `playwright.config.ts` usa a porta 4173 com `reuseExistingServer`: dois worktrees rodando o Playwright ao mesmo tempo usam o servidor um do outro. Em outro worktree, rode com `FO_PORT=4174` (ou outra porta livre).

## F3: revisão e prontidão

Pegadinhas que a F3 achou:

- Com várias lentes rodando o Playwright ao mesmo tempo, o WebKit do Windows chegou a travar no `page.goto` até em teste antigo e simples. Antes de achar que um teste do WebKit está errado, rode-o de novo com a máquina livre.
- O `context.on('request')` do Playwright vê as requisições feitas de dentro dos workers, no Chromium e no WebKit (a lente de corretude provou). Uma prova de "nada sai" deve recusar método diferente de GET, corpo, outra origem e query string.

## Ajuste: espaço do aviso de cookies

- Teste que clica em algo do fim do rodapé tem de fechar o aviso antes (`dismissCookies`), porque o card fica por cima do canto de baixo à esquerda.

## F4: calculadoras

Pegadinhas que a F4 achou:

- O `budgets.spec.ts` não usa o `networkidle`, que no WebKit do Linux nunca disparava nos hubs (§ 138). Teste novo que precise da página quieta: espere o `load` e um intervalo sem requisição, como o `settler` dele.
- Os specs de dinheiro se chamam `money-*.spec.ts` para caírem depois do `design.spec.ts` na divisão do WebKit (§ 142). Com o nome `calc-*`, eles empurravam o `design.spec.ts` para a parte 3, junto com a matriz de imagens, e a parte caía por `ENOSPC`. Spec novo pesado: rode o `--list` das três partes antes do push e veja se o `design.spec.ts` continua na parte 2.

## F5b: guias de arquivo e kit do Product Hunt

Pegadinhas que a F5b achou:

- **Porta do Playwright para o `guias:medir`:** use de 4174 a 4189. O `fetch` do Node recusa algumas portas ("bad port"), como a 4190, e aí o script não acha o servidor.

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **Teste de pt e es no orçamento vai no `i18n-budgets.spec.ts`,** que cai entre o `design.spec.ts` e a matriz de imagens na ordem dos nomes. Dentro do `budgets.spec.ts`, os testes novos tinham levado os dois para a mesma parte do WebKit (§ 233). As medidas do orçamento estão em `tests/e2e/lib/budgets.ts`, e o passeio dos estados de PDF (`walkPdfTool`) recebe `lang`.

## F7: o que a revisão mudou nos formulários das calculadoras

- **Alto contraste** (§ 280). O WebKit do Playwright não emula `forcedColors`. O teste ramifica por dentro, pelo `matchMedia('(forced-colors: active)')`: no Chromium afirma o sublinhado, no WebKit o fundo.

## F8: piloto automático

Pegadinhas que a F8 achou:

- **O relógio falso do Playwright esvazia o `performance.getEntriesByType('resource')` no WebKit.** Um teste que fixa o relógio antes de a página carregar não vê os recursos dela.
- **Teste que percorre o site inteiro num teste só estoura os 60 s no WebKit do CI** quando o site cresce (o reflow a 320 px, com 169 páginas, § 306). Divida em blocos de páginas, um teste cada, e confira no `--list` onde caem o `design.spec.ts` e o `image-matrix.spec.ts`.
- **Os passeios de estados das ferramentas de PDF ficam no `axe-pdf-states.spec.ts`** (§ 307): no `a11y.spec.ts` eles caíam todos na primeira parte de cada navegador, acima de 700 s. Teste pesado de axe novo vai num spec que caia numa parte leve; confira no `--list`.
