# F13a · o plano da run

O gabarito da revisão adversarial final: o que a run faz, em que ordem, quem faz cada parte e que teste ou comando prova cada critério da ficha (`docs/prompts/prompt-fase-13a.txt`, que vence este plano onde divergirem).

## Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` em `14341bc` (a F12 mesclada). A branch `fase-13a` nasceu dele; o primeiro commit (`fe7d624`) traz os dois arquivos do prompt sem edição. A PR em rascunho é a [vmatusita/fileorca#26](https://github.com/vmatusita/fileorca/pull/26).
- **Linha de base**, medida no `fe7d624` (o código igual ao do `14341bc`), com a saída em `.cache/f13a/antes/` (fora do Git):
  - Vitest: 115 arquivos e 1.909 testes;
  - `pnpm exec playwright test --list`: 1.693 testes por navegador, em 54 arquivos;
  - `budgets.spec.ts` e `i18n-budgets.spec.ts` no Chromium: 342 testes verdes;
  - a lista dos JS de `dist/_astro/` com o tamanho com gzip (`.cache/f13a/antes/js-list.txt`): a ilha de imagem (`island.js`) tem 18.523 bytes e a de PDF (`PdfIsland…`) 16.781 bytes;
  - uma cópia do `dist/` em `.cache/f13a/dist-base/`, servida por `.cache/f13a/serve-base.ts` para as provas de "reprova sem a mudança" e as imagens do "antes".
- **O rótulo `ci` não existe** (§ 461): a conferência do meio no Linux sai, e a execução completa do fim faz o papel dela.

## Os § reservados e os marcadores

- **§ 456 a § 463:** a fatia 1, escritos na ordem (o contrato, a divisão, o aviso, as sete janelas, a Oli, o rótulo, os testes antigos da fatia 1 e a base da página de ferramenta).
- **As frentes da fatia 2** escrevem os seus § com um marcador (o prefixo da run, a letra da frente e a ordem: I, P e U) num arquivo fora do Git da worktree delas; na junção (fatia 3), um script troca os marcadores por números a partir do § 464, na ordem I, P, U, e o texto vai para o fim do `DECISOES.md`.
- **Depois:** os § da fatia 3 (a junção, o selo da DropZone, o mapa), a frente H (marcador próprio, trocado na fatia 5), os da fatia 4 (a documentação) e os da revisão, nessa ordem.

## Quem faz o quê, e a ordem das fatias

1. **Fatia 1, o agente principal:** o UX-09 (o aviso compacto, o `keep()`, o selo por página, as sete janelas da R-A-2), o UX-10 (a Oli por estado e a regra `checkLoops`) e a base comum do UX-04 (o CSS do retângulo, da faixa, da água e do resultado; o canto da Oli; o H1 nos dois moldes). Commits, push e a PR em rascunho. Feita: `4ba7521` a `ca7e6da`.
2. **Fatia 2, três agentes Opus em worktrees, ao mesmo tempo:**
   - **I:** o UX-04 nas ferramentas de imagem, nas presets e na ferramenta embutida dos guias, com a linha do café, a e-2, a f-2, a p-13, a p-14 (D-06), o D-17, o D-09 e os testes;
   - **P:** o UX-04 no juntar e nas outras ferramentas de PDF, e o UX-11 inteiro (em dois commits), com os testes;
   - **U:** o UX-16 nos ícones e nos registros, sem o selo da DropZone, com os testes.
3. **Fatia 3, o agente principal:** junta as três frentes (merge com o trailer), resolve os conflitos, renumera os §, troca o selo da DropZone pelo `file-drop` nas duas ilhas, roda os specs do mapa no build de teste e faz os ajustes da estimativa, se precisar. A conferência no Linux sai (§ 461).
4. **Fatia 4:** um agente Opus (H) numa worktree faz o UX-14 (o chip que leva o arquivo, a chegada, a caixa vazia, a Privacidade) e o UX-18 (o soltar em qualquer lugar e o `dropEffect = 'none'`) nas duas ilhas, com os testes. Ao mesmo tempo, o agente principal faz o `docs/design/`, o `docs/claude/` (a seção "## F13a: página de ferramenta" no fim de cada arquivo de tema), os textos que faltarem, os § e o `docs/PENDENCIAS.md` (as 25 pendências e o grupo 22), sem tocar nos arquivos do H.
5. **Fatia 5, o agente principal:** junta o H, roda as verificações completas e monta as tabelas e as imagens do relatório (`docs/relatorios/fase-13a/`).
6. **A revisão adversarial final** (cinco lentes Sonnet em contexto limpo, numa worktree só de leitura sobre um commit fixo, com o próprio build e o próprio build de teste; cético por achado médio ou acima; um agente Opus de correções e uma segunda passada): `docs/relatorios/REVISAO-F13a.md`.
7. **Fechar:** o relatório (`docs/relatorios/fase-13a.md`), o `pnpm verificar --partes` uma vez no último commit, a sequência de fim da decisão 13 (push, a execução leve verde, `gh pr ready`, a execução completa até o fim) e o custo na descrição da PR.

**A válvula de estouro,** se o tempo apertar: saem para a F13b, nesta ordem, o UX-18, o UX-16, o UX-14 e o UX-11, cada um com um § e uma linha no grupo 22 (com o UX-18 sai, o `dropEffect = 'none'` da F10 p-11 fica, com o teste). Nunca saem o UX-09, o UX-10, o UX-04 inteiro, os testes da decisão 11, o mapa verde e a revisão.

## Os critérios e o que prova cada um

| Critério | Prova |
| --- | --- |
| 1. O aviso compacto | `tests/e2e/cookie-notice.spec.ts` (a altura e o Escolher ou o primeiro campo acima dele a 360 × 740 nos cinco moldes; 150 px no pt e no es a 320 × 640; 360 px de largura a partir de 768; o selo da página; o foco no erro a 360 e a 320 com o `gen-texto-extensao-png.png`; no máximo 2 links do rodapé a 1280); `tests/unit/cookie-seal.test.ts` (o selo em toda página do `dist/`); `tests/e2e/fo-ad-map.spec.ts` (as sete janelas, no build de teste); `tests/e2e/cookie-footer.spec.ts` (a f-06) |
| 2. A Oli | `tests/e2e/design.spec.ts` ("motion without the preference": as seis páginas, até 5 s e nada `running` 3,2 s depois; "prefers-reduced-motion": `getAnimations()` vazio); `tests/unit/design-checks.test.ts` ("laço só no progresso", que reprova o CSS do ponto de partida); `pnpm gate:design` |
| 3. A página de ferramenta | os specs novos das frentes I e P: a altura do retângulo nos cinco estados (356/340, ±1 px), o CLS da interação até 0,05 (comprimir, HEIC, WebP, redimensionar e juntar, e o 3º uso com o café), a base do retângulo até 740 px em toda página de ferramenta e de preset com e sem a fonte, o foco no Baixar sem rolar, os chips a 220 px (comprimir) e a 400 px (juntar), o D-06, o D-17, o D-09, a p-13 e o juntar (D-21, D-22, D-26 e D-27) |
| 4. As peças de PDF | os 13 testes da tabela "Testes da F13" do `pdf-pieces.html` (frente P) |
| 5. O chip que leva | os quatro testes do `handoff.html` (frente H), com a rede sem os bytes nem o nome do arquivo |
| 6. Os ícones | `tests/unit/icons.test.ts` (71 ícones); o teste novo no `dist/` de que nenhum hub repete um ícone; a DropZone em repouso com o `file-drop` (fatia 3) |
| 7. O soltar | os três testes do `drop-anywhere.html` nos dois navegadores e o `dropEffect` igual a `'none'` numa página sem ferramenta (frente H) |
| 8. Os anúncios | `fo-ad-map.spec.ts`, `ads.spec.ts` e `ads-coffee.spec.ts` no build de teste, nos dois navegadores, com os alvos novos; a tabela por molde no relatório |
| 9. A acessibilidade | o axe nos dois temas e nos dois navegadores em cada estado (frentes I, P e H, e o aviso); os botões de 48 px; o contraste dos pares novos no `docs/design/` |
| 10. Os arquivos que saem | `image-matrix.spec.ts`, `image-presets.spec.ts` e `pdf-matrix.spec.ts` com o mesmo esperado; `git diff --stat 14341bc -- fixtures/ scripts/oracle/ scripts/guides/` vazio |
| 11. O orçamento | `budgets.spec.ts` e `i18n-budgets.spec.ts` no build padrão; a lista dos JS sem o hash igual à de antes; o tamanho de cada ilha com gzip, antes e depois |
| 12. O CLS e o Lighthouse | `layout-shift.spec.ts` de 320 a 412 px nos dois builds; `pnpm lhci` (as partes do CI) |
| 13. Os textos | `pnpm lint:texto`, `english-leak.test.ts` e `glossary.test.ts` |
| 14. A documentação | o `docs/design/`, o `docs/claude/` e o `docs/PENDENCIAS.md` em dia; `pendencias.test.ts`; os § a partir do 456 |
| 15. Os testes | os números do Vitest e do `--list` antes e depois; o § de cada teste antigo que mudou; as provas contra o `dist/` do ponto de partida |
| 16. O `pnpm verificar` | `pnpm verificar --partes` no último commit, com o total de cada parte e a soma (nenhuma acima de 700 s) |
| 17. A revisão | `docs/relatorios/REVISAO-F13a.md` sem achado crítico, alto ou médio aberto |
| 18. O CI | a execução depois do `gh pr ready`, o `ci-ok` verde e o `merge` |

## O que é da F13b

- **Os itens:** UX-12 A (as calculadoras e o QR), UX-13 A (a página de guia, menos o que a ilha nova muda sozinha na ferramenta embutida), UX-03 B (a home, com a decisão avulsa do texto), UX-15 A (o mar nos hubs e no escuro) e UX-17 A (as páginas institucionais e o rodapé).
- **As 20 pendências:** F4 ACE-7 (aceitar e registrar), ACE-8, ACE-9 e ACE-11; F7 obs 1, obs 2, obs 3, f-9, f-10 e f-13; Idiomas E-2 e R2-03; F5b F-2 e F-13; F10 p-2, p-3, p-15, p-16, p-17 e p-19.
- **O que a F13a vir e for da área deles** entra no relatório, na seção "O que fica para a F13b", e no grupo 22 do `docs/PENDENCIAS.md`.
