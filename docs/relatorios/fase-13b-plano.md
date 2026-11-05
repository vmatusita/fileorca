# F13b · plano da run (gabarito da revisão)

A F13b é a segunda run da fase "UX/UI: implementação" do `PLANO-MELHORIAS.md`. A ficha é o `docs/prompts/prompt-fase-13b.txt`, e ela vence este plano. Este arquivo diz o ponto de partida, a linha de base, os § reservados, quem faz o quê e em que ordem, e liga cada critério de aceitação a um teste ou comando. A revisão adversarial final lê a ficha e este plano.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `origin/main` = `bd844ca8b96231aa5df912975c484cf4469dcf17` (a F13a mesclada). A branch `fase-13b` nasceu dele; o 1º commit (`8ff6709`) leva só o `docs/prompts/prompt-fase-13b.txt`. O `.md` do prompt não existia na máquina: a ficha manda gravar o `.txt`, e foi o que se fez (§ 536).
- **O rótulo `ci` não existe** (`gh label list`, 5/nov): a conferência no Linux do meio da run sai, e a execução final faz o papel dela (§ 542).
- **Linha de base no ponto de partida** (`.cache/f13b/baseline.sh`, saída em `.cache/f13b/antes/`, `dist/` copiado para `.cache/f13b/dist-base/`):
  - `pnpm install --frozen-lockfile` e `pnpm build`: 211 páginas.
  - Vitest: 120 arquivos, 1.963 testes, todos verdes.
  - `playwright test --list`: 1.903 testes em 61 arquivos, por navegador.
  - `budgets.spec.ts` e `i18n-budgets.spec.ts` no Chromium: 343 verdes.
  - A lista dos JS de `dist/_astro/` sem hash, com o tamanho cru e com gzip: `.cache/f13b/antes/js-list.txt` (o `CalcIsland` tem 30.744 B com gzip, o `QrTool` 10.778 B, o `island` da imagem 21.211 B e o `PdfIsland` 19.867 B). O cronograma não tem arquivo próprio: o `mount.ts` hidrata as duas raízes da mesma entrada.
  - As medidas das calculadoras, da home e do rodapé (`.cache/f13b/measure.mjs`, saída em `.cache/f13b/antes/measure.json`), por exemplo, a 360 × 740:

| Página | Fim do número, aviso aberto | Interseção com o aviso | Baixar PDF (topo–base), depois do Aceitar | 1º chip − Baixar | Card a 360 / 1280 |
| --- | --- | --- | --- | --- | --- |
| `/mortgage-calculator/` | 636 | 32 | 878–930 | 462 | 332 / 364 |
| `/es/calculadora-de-hipoteca/` | 678 | 52 | 946–998 | 462 | 358 / 390 |
| `/pt/simulador-sac-price/` | 678 | 52 | 920–972 | 1.060 | 332 / 364 |
| `/paint-calculator/` | 636 | 32 | 764–816 | 744 | 218 / 246 |
| `/bmi-calculator/` | 708 | 52 | 836–888 | 88 | 218 / 246 |

  O aviso de cookies começa em 604 px. A altura do `<main>` da home a 360: 10.168 px em en, 7.802 em pt e 7.878 em es. A do rodapé a 360: 2.118 px em en, 1.572 em pt e 1.606 em es (a meta do critério 6 é no máximo a metade: 1.059, 786 e 803).

## 2. Os § reservados

O próximo § livre era o 535. A fatia 1 (o agente principal) usa os números de 535 a 542. As frentes escrevem os § delas com um marcador próprio (`§ C-1`, `§ G-1`, `§ H-1`, `§ I-1`...), no `DECISOES.md` e nos comentários do código, e a junção troca cada marcador por um número, na ordem das frentes: C, G, H, depois os do agente principal na fatia 4 (marcador `§ M-n`) e, por último, os do I.

| § | Assunto |
| --- | --- |
| 535 | A especificação dos seis protótipos é contrato, com o que vence e o que não vai para o site (decisão 1) |
| 536 | A divisão, a ordem e as 20 pendências; o arquivo do prompt (decisão 2) |
| 537 | A `Figtree Fallback` nos pesos 600 e 700 (F10 p-15) |
| 538 | O token `--danger-on-deep` |
| 539 | A linha d'água: a faixa da F13a no `.fo-result`, a `.fo-sea-top` dos cartões `deep` e a crista do rodapé |
| 540 | A contagem sem os presets (`src/components/tool-count.ts`), ao lado da § 321 |
| 541 | Os testes antigos que mudaram na fatia 1 (formato da § 341) e a data dos Termos |
| 542 | O rótulo `ci` não existe: a conferência no Linux do meio sai (decisão 13) |
| C-n, G-n, H-n | As decisões e os testes antigos de cada frente, renumerados na junção a partir do 543 |
| M-n | O agente principal na fatia 4 (grupo 22, documentação, textos) |
| I-n | A frente I (UX-17 A), renumerada por último |

## 3. Quem faz o quê, e em que ordem

### Fatia 1 · a base comum (agente principal, na branch `fase-13b`)

1. A fonte de reserva nos pesos 600 e 700 (`src/styles/fonts.css`), medida sobre a Arial Bold (100,0% da Figtree nos dois navegadores; `.cache/f13b/font600.mjs`).
2. O `--danger-on-deep` (`#FF8A80`, igual nos dois temas) no `tokens.json` e no `tokens.css`, o `theme.css` regerado só pelo `node scripts/design/tema.ts`, o par no `contrast.test.ts` e o nome no `TEXT_COLOR_TOKENS`.
3. A linha d'água: a regra `.fo-sea-top` pronta no `components.css` (a frente C a aplica ao `.fo-rhero`), a crista do rodapé (`.fo-footer::after`) e, no `.fo-result`, a faixa de água da F13a como linha d'água, sem segunda onda.
4. A contagem: `src/components/tool-count.ts` (46, 29 e 35), a Sobre e os Termos com placeholders e algarismos, os Termos de en e es com a data de 5/nov, o `lint:texto` com as amostras da contagem, o `about-counts.test.ts` reescrito e o `tool-count.test.ts` novo.
5. Depois da fonte: `cookie-notice.spec.ts`, `tool-slot.spec.ts`, `layout-shift.spec.ts` e `calc-form.spec.ts` nos dois navegadores.
6. Commit, push e a PR em rascunho.

### Fatia 2 · três frentes ao mesmo tempo, cada uma na sua worktree (agentes `opus`)

O primeiro passo de cada uma é `git merge --ff-only fase-13b`. Cada uma lê o próprio briefing (`.cache/f13b/brief-<x>.md` do checkout principal, por caminho absoluto), o mapa da exploração do seu tema (`.cache/f13b/explore/`) e a especificação do protótipo. Cada uma usa o próprio `FO_PORT` e escreve o CSS num bloco ao lado da seção do seu componente.

- **C (UX-12 A, decisão 4), `FO_PORT=4175`:** as calculadoras (dinheiro, casa, saúde, presets, as 8 do Brasil), a calculadora embutida nos guias de dinheiro e o QR, com as 14 pendências, a Oli do card, a `.fo-sea-top` no `.fo-rhero` e os testes.
- **G (UX-13 A, decisão 5), `FO_PORT=4176`:** os 30 guias de arquivo, o `checkFileGuide`, as 3 pendências e os testes.
- **H (UX-03 B e UX-15 A, decisões 6 e 7), `FO_PORT=4177`:** a home dos três idiomas (o H1 com a contagem, as faixas, os números com fonte, o texto a mais, os anúncios `geral`) e o aquário dos hubs de categoria, com os testes.

### Fatia 3 · a junção (agente principal)

`git merge --no-ff -F <arquivo>` de cada frente na ordem C, G, H, com o trailer `Co-Authored-By`; os conflitos resolvidos à mão, o `pnpm tipos` verde, os marcadores renumerados, o build, o Vitest inteiro e os specs do mapa (`fo-ad-map`, `ads`, `ads-coffee`) no build de teste. A conferência no Linux sai (§ 542).

### Fatia 4 · a frente I e o agente principal, ao mesmo tempo

- **I (UX-17 A, decisão 8), `FO_PORT=4178`, worktree:** a 404, a Sobre (cartão e Oli), a Contato, a coluna da direita das seis páginas sem anúncio e o rodapé com `details` no celular, com os testes.
- **O agente principal, na branch:** as três linhas do grupo 22 (decisão 9), o `docs/design/`, o `docs/claude/`, os textos que faltarem, os § e o `docs/PENDENCIAS.md` (decisão 11), sem tocar nos arquivos da frente I (as views institucionais, o `Footer.astro` e o bloco do rodapé no CSS).

### Fatia 5 · a junção do I e o fechamento

A junção do I, as verificações completas (Vitest, tipos, lint, os portões, os specs tocados nos dois navegadores, o build de teste), as tabelas de antes e depois, as imagens de `docs/relatorios/fase-13b/`, a revisão adversarial (seis lentes Sonnet num commit fixo, numa worktree só de leitura), as correções num agente `opus`, a segunda passada, o relatório, o `pnpm verificar --partes` e a sequência de fim da decisão 13.

## 4. Decisões tomadas para as dúvidas da exploração

Cada uma vira um § da frente que a executa.

**Calculadoras (C).**
- O número abaixo de 596 px a 360 × 740 (hoje 636 em en e 678 em es e pt): a frente acha o espaço no topo da página (o "Reviewed by" numa linha, o card mais compacto, o padding da especificação) e mede no `dist/`; o limite não muda.
- O bloco recolhível só nas calculadoras com campos de impostos, seguro e taxas (a hipoteca e os presets dela, em en e es) e com a TR (o SAC × PRICE em pt), declarado por calculadora no `def`; as outras ficam como estão.
- O erro de vários campos: o card mostra a mensagem do primeiro campo errado, na ordem do formulário. O `problem` de uma conta (que não é de um campo) fica no mesmo lugar, com o `aria-invalid` no campo que a conta aponta, quando aponta. O "último resultado que valeu" é o exemplo enquanto a pessoa não teve outro.
- A Oli: `wave` parada no exemplo, `cheer` uma vez no primeiro resultado da visita, `oops` no erro, e `wave` de novo depois; na saúde, nunca `cheer`. O sprite das calculadoras leva `wave`, `cheer` e `oops` (`wave` e `oops` na saúde), e o `gate:design` passa a exigi-las.
- A data curta da Ovulation e a do "Reviewed by" são escritas à mão (a § 112 proíbe o `Intl` nas datas), com teste contra o `Intl` do Node. O CSV e o PDF continuam com a data longa.
- O foco das listas (F7 obs 1) volta por uma chave estável da linha; os ids por índice ficam, para não mudar os testes que os leem.
- O `placard` dos `defs` fica como dado (os testes o leem); só a Placa sai da tela.
- O `pnpm screenshots` quebra nas calculadoras (ele lê `.fo-placard` e `.fo-export .fo-btn`), e a ficha o deixa fora: vira linha do grupo 23.

**Guia (G).**
- O `toolIntro` vai para logo depois da ilha (acima dele, o painel passa da dobra de 740 px), com um §.
- A chave dos números da ficha não é `facts` (já existe e é pulada pelo `guides-numbers.test.ts`).
- A coluna igual em todas as linhas sai em todos os guias em que existe (o teste vale para os 30).
- A pista: "Scroll sideways to see the {n} columns" (a ficha vence a especificação), com o `{n}` lido da tabela, e o equivalente da especificação em pt e es.
- A cor da dobra da ficha é a do hub do guia (`FILE_GUIDES[id].hub`).

**Home e hubs (H).**
- As caixas de anúncio da home são `AdBreak` entre as faixas, com o `data-ad-media` que a F12 usa de fato (não há classe `fo-mobile-only` nas caixas da F12), e a estimativa (`src/ads/estimate.ts`) aprende a faixa e os chips, se o mapa pedir.
- O `gate:prontidao` passa a contar a home pelos chips (o seletor do `scripts/lib/prontidao.ts` muda no mesmo commit do teste).
- A Oli da home e a dos hubs balançam e param antes de 5 s; o teste do movimento espera 5,2 s nessas páginas.
- O `<main>` da home na largura da página sem anúncio sai de uma propriedade `wide` do `BaseLayout`, que a frente I reaproveita nas seis páginas com coluna da direita.
- O número de imagem no lugar do "2.6 MB → 717 KB" sai do `data/guides-measured.json` (as mesmas 3 fotos medidas no guia de localização e no de JPG × PNG), conferido pela frente.

**Institucionais (I).**
- O `details` do rodapé ganha um nome novo (a `.fo-footer__more` é o bloco Guias da F11).
- Os H2 das páginas jurídicas ganham ids gerados no build a partir do texto, sem mudar o texto; a Privacidade não muda nenhuma palavra nem a data.
- O cartão dos números no Contato fica só na coluna da direita a 1280.

## 5. Critérios de aceitação → prova

| Critério | Prova |
| --- | --- |
| 1 Base comum | Spec novo da Paint a 360 no WebKit com a Figtree segurada ("Window area" numa linha); `layout-shift.spec.ts` (320 a 412 px, os dois builds); `contrast.test.ts` e `theme-pair.test.ts`; teste da linha d'água (`.fo-result` sobre a estrutura da F13a, `.fo-rhero` e rodapé, nos dois temas); `tool-count.test.ts` (46, 29 e 35, a home, o cartão, a Sobre e os Termos) e `header-menu` (14) |
| 2 Calculadoras | Specs da frente C: dobra e aviso a 360 × 740, altura do card nos quatro estados a 360 e 1280, CLS da interação no Chromium, `aria-invalid` e `aria-describedby` (também no Credit card payoff), cronograma antes dos chips, "Download CSV", `th[scope=row]`, rótulos a 360 e 320 nos dois navegadores, Ovulation, 15 vs 30 em es, QR, F7 obs 1, a Oli; `money-speed.spec.ts`; a tabela da distância dos chips no relatório |
| 3 Guia | `tool-guides.spec.ts` e specs novos da frente G nos 30 guias e dois navegadores; Vitest no `dist/` (a ficha contra o `data/guides-measured.json`); `conteudo.test.ts` (a ordem antiga reprova) |
| 4 Home | Vitest no `dist/` (o H1 e cada número contra a fonte, nos três idiomas); `fo-ad-map.spec.ts` (3 caixas por largura, nada na primeira tela, 1.110 px, densidade); `gate:prontidao`; o `<main>` largo a 1280 no build padrão; a Oli; `budgets.spec.ts` e `i18n-budgets.spec.ts`; LCP no H1 |
| 5 Hubs | Specs do `hub-sea.html` nas quatro views, a 360 e a 1280 |
| 6 Institucionais e rodapé | Specs da frente I (404 com status 404, chips dos registros, cartão da Sobre, coluna da direita, índice, rodapé a 360 e a partir de 768) |
| 7 Grupo 22 | Um teste para cada linha, com a medida antes e depois |
| 8 Anúncios | `fo-ad-map.spec.ts`, `ads.spec.ts` e `ads-coffee.spec.ts` no build de teste, nos dois navegadores; a tabela por molde no relatório |
| 9 Acessibilidade | axe nos estados novos (spec próprio numa parte leve), nos dois temas e navegadores; 48 px |
| 10 Nada que sai muda | `money-calc.spec.ts`, `calc-oracle.test.ts`, `image-matrix.spec.ts`, `pdf-matrix.spec.ts`; `git diff --stat bd844ca -- fixtures/ scripts/oracle/ scripts/guides/ data/` vazio |
| 11 Orçamento | `budgets.spec.ts` e `i18n-budgets.spec.ts`; a lista dos JS sem hash contra `.cache/f13b/antes/js-list.txt`; o tamanho de cada ilha com gzip |
| 12 CLS e Lighthouse | `layout-shift.spec.ts`; `pnpm lhci` |
| 13 Textos | `lint:texto`, `english-leak`, `glossary`, `text-punctuation`, `health-voice` |
| 14 Documentação | `pendencias.test.ts`; os § a partir do 535 |
| 15 Testes | A contagem do Vitest e do `--list`, antes e depois; os § dos testes antigos; a prova contra o `dist-base` |
| 16 `verificar` | `pnpm verificar --partes` no último commit |
| 17 Revisão | `docs/relatorios/REVISAO-F13b.md` |
| 18 CI | A execução depois do `gh pr ready` e o `merge` |
