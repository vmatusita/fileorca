# CLAUDE.md · FileOrca

Regras para toda run do Claude Code neste repositório. Valem junto com a ficha da run, o PLANO-MELHORIAS.md e o PLANO-FILEORCA.md. A F9 compactou este arquivo uma vez, sem perder regra: o núcleo ficou aqui, e as seções de fase e as pegadinhas foram, com o texto igual, para docs/claude/. Daqui em diante, as runs acrescentam no arquivo do tema em docs/claude/ (seção nova no fim), e este arquivo só muda no núcleo e no índice, também só acrescentando; nunca apagam nem afrouxam uma regra.

## O projeto em cinco linhas

- fileorca.com: ferramentas de imagem e PDF e calculadoras, em inglês, português e espanhol, tudo no navegador, sem conta, sem upload e sem servidor.
- Astro 7 com saída estática e ilhas Preact 11, hospedado no Cloudflare Workers (plano Free), num Worker `fileorca` só com assets (ADR-001).
- Receita de anúncio (AdSense, depois Journey e Mediavine) e doação (Ko-fi e Pix).
- Dono único: Victor Yuki Matusita. O código sai de runs autônomas com merge automático quando o CI passa.
- Um comando confere tudo: `pnpm verificar`.

## Fonte de verdade

1. A ficha da run (vence o resto).
2. PLANO-MELHORIAS.md, nos itens de "Mudanças no contrato".
3. PLANO-FILEORCA.md (as "Decisões fechadas" são contrato: nenhuma run muda).
4. Este CLAUDE.md e docs/claude/ (o índice abaixo diz qual arquivo ler).
5. DECISOES.md (§ numerados), docs/adr/, docs/design/ (design system), docs/F0-SAIDA.md e data/keywords.csv.
6. O código existente.

Na dúvida, a opção mais simples e reversível, registrada no DECISOES.md.

## Arquitetura é fixa

Host, framework, estrutura do repositório e pipeline não mudam numa run. Se a run achar que precisa mudar, escreve uma ADR nova com status "Proposta" em docs/adr/, deixa a mudança de fora e registra a pendência no relatório.

## Git (a main não tem proteção no GitHub Free: estas regras são a proteção)

- Trabalhe numa branch `fase-NN` (ou `fase-NNa`, `fase-NNb`, `fase-01c`) ou `ajuste-{assunto}` nas runs curtas. Commits pequenos, mensagem em inglês.
- Abra a PR em rascunho logo depois do primeiro push (`gh pr create --draft`, num comando separado do push) e marque como pronta só no fim, com tudo commitado (`gh pr ready`). O merge é do CI: **nunca** rode `gh pr merge`.
- **Nunca**: push na main, force push, `git reset --hard`, `--amend` em commit alheio, `--no-verify`, mexer em `core.hooksPath` ou no `.githooks/`.
- A trava tem três camadas: o hook `.githooks/pre-push`, as regras de negação do `.claude/settings.json` e este arquivo. Não contorne nenhuma.
- O ruleset de `docs/ops/ruleset-main.json` (PR obrigatória, check `ci-ok` obrigatório, sem force push e sem exclusão da main) é a quarta camada, depois que o Victor o importa no GitHub (seção F do PLANO-MELHORIAS.md). Importar ou mudar o ruleset no GitHub é só dele.

## Fora de toda run

DNS, configuração da zona, Worker e variáveis do Workers Builds no Cloudflare; deploy direto com wrangler; configurações do repositório no GitHub; criar contas; enviar e-mail, post ou pedido a qualquer serviço; publicar repositório; código de Worker (o Worker é só assets); formulário que colete cartão de crédito; dependência com licença fora da lista (MIT, Apache-2.0, BSD, ISC, 0BSD, MPL-2.0, OFL-1.1 para fontes e LGPL-3.0 só em arquivo separado; nunca AGPL nem licença não comercial).

Também fora (F9): criar, renomear ou apagar rótulos do repositório (`gh label`), e importar, mudar, desativar ou apagar rulesets. As duas coisas são do Victor. Pôr e tirar o rótulo `ci` de uma PR continua permitido (regra 1).

## Testes

- `pnpm verificar` roda tudo (tipos, lint, Vitest, Playwright em Chromium e WebKit, axe, Lighthouse CI, licenças, hreflang, links, órfãs, orçamentos de JS e de requisições, distância dos anúncios, cabeçalhos, Worker sem código, conteúdo de dinheiro e saúde, lint:texto).
- Rode até passar, corrigindo a causa. Desligar, pular ou afrouxar teste é proibido.
- Calculadora: os valores esperados vêm de oráculo independente (numpy-financial e exemplos oficiais), gravados em fixtures/calc/ num commit antes do motor. Nunca gere o esperado rodando o próprio motor.

## Regras que nenhuma run quebra

- Nenhum arquivo do usuário sai do aparelho. Nenhum número digitado vai para `?` na URL nem para evento do GA4.
- Anúncio: nada a menos de 150 px (`ad-clearance`) do Baixar, dos campos, do painel ou da Oli; nada acima da ferramenta no celular, dentro do painel, no processamento, no cronograma ou nas páginas jurídicas. Só âncora e vinheta como formatos automáticos.
- Design: docs/design/ manda. Nenhuma cor fora dos tokens; amarelo (`sun`) só no Baixar; a Oli tem nove poses fechadas e é `aria-hidden`.
- Nenhuma página recebe COOP/COEP; nenhuma ferramenta usa SharedArrayBuffer.
- O repositório é público, com as `refs/pull/*`, os logs e os artefatos do Actions: nenhum dado pessoal, token ou segredo, e nenhum achado da auditoria (valor, coordenada, nem o arquivo ou a pessoa onde ele está), entra em arquivo do Git, mensagem de commit, PR, log ou artefato. A auditoria fica só em `.cache/`, e os textos dizem só quantos achados há de cada tipo.

## Como a run termina

- Válvula de estouro: o que a ficha permite cortar vira pendência no relatório e vai para uma run "b". O que a ficha diz que nunca se corta, não se corta.
- Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca. Bloqueio real (ID faltando, serviço fora do ar) não para a run: siga com placeholder e registre a pendência.
- Grave o próprio prompt em docs/prompts/ (`prompt-fase-NN.md` ou `prompt-ajuste-{assunto}.md`) na PR da run.
- Relatório em docs/relatorios/fase-NN.md (ou ajuste-{assunto}.md), em português: saída real do `pnpm verificar`, link da prévia, decisões novas e a lista do que sobrou para o Victor fazer.
- Subagentes Sonnet para exploração e revisão; a revisão adversarial final roda em contexto limpo, contra a ficha.

## Idioma

Narrativa, relatórios e docs em português. Código, nomes de arquivo e commits em inglês. Textos do site nos arquivos de tradução de cada idioma.

## Regras de toda run (PLANO-MELHORIAS.md)

Valem a partir da F9, que as escreve no CLAUDE.md. Somam-se às de "Execução por IA" do PLANO.

1. **PR em rascunho desde o começo** (o Workers Builds já gera a prévia). Commite tudo, relatório e screenshots inclusive, e só então rode o `gh pr ready`: é isso que dispara o CI completo, uma vez. Para conferir no Linux do CI no meio da run (o WebKit de lá difere do Windows), ponha o rótulo `ci` na PR e tire depois.
2. **Na máquina local:** rode o spec alvo enquanto corrige, e o `pnpm verificar` completo (em partes, `--partes`) uma vez, antes do `gh pr ready`.
3. **Revisão proporcional ao risco.** Run curta: uma lente e um cético. Fase de interface ou de texto: três lentes. Fase que mexe em motor, conta, dinheiro, saúde, privacidade, anúncio ou CI: de cinco a seis lentes. Cético próprio só para achado médio ou acima; os baixos de cada lente vão a um cético só, como hoje.
4. **Ler só o que a tarefa toca.** O índice do CLAUDE.md diz qual arquivo de docs/claude/ ler para cada assunto. O DECISOES.md se lê buscando o §, nunca inteiro.
5. **Custo no relatório.** O relatório traz o `pnpm ci:custo <id>` da última execução do CI: minutos de job, tempo de parede e número de jobs.
6. **Agentes em worktree:** o primeiro passo é `git merge --ff-only <branch da run>`, e todo merge leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`).

Notas à regra 1, da revisão da F9 (DECISOES § 327 e § 338):

- O rótulo `ci` só existe depois que o Victor o cria (Issues → Labels). Sem ele, a execução completa sai do `gh pr ready`, e o `gh pr ready --undo` volta a PR ao rascunho entre uma execução e outra. A run nunca cria o rótulo.
- O fim da run: com tudo commitado, rode o `gh pr ready` antes do último push, para o último commit ganhar uma execução só, a completa; ou espere a execução leve do último push terminar antes do `gh pr ready`. Evite o push seguido logo do `gh pr ready`: a execução leve cancelada deixa um `ci-ok` vermelho no mesmo commit, ao lado do verde da completa. A ficha de cada run vence: se ela mandar o push e o `gh pr ready` em seguida, espere a execução leve terminar entre os dois.

## Índice: mexeu em X, leia docs/claude/X.md

Cada arquivo de docs/claude/ guarda, com o texto igual, as seções de fase e as pegadinhas do tema dele, na ordem em que entraram. Leia só o arquivo do que a tarefa toca (regra 4 acima). As linhas que a F9 tirou deste arquivo, com o porquê de cada uma, estão no DECISOES.md, no § "O CLAUDE.md enxuto e a pasta docs/claude/".

- Mexeu no CI (`.github/`, partes, `ci:custo`, disco e `ENOSPC`), no `verificar`, no Dependabot, na regra de merge, no Workers Builds, no Node, no pnpm, no Vite ou no Vitest, ou escreveu código e pode cair nas pegadinhas gerais (o Astro e o `build.format`, que faz de toda página um `.../index.astro`; o TypeScript e o `exactOptionalPropertyTypes`; o `pnpm tipos`, que confere também os specs): `docs/claude/ci.md`.
- Mexeu no motor ou numa ferramenta de imagem, num worker, no caminho sem `OffscreenCanvas`, no QR code, ou na ilha de uma ferramenta e no `mount.ts` que a hidrata: `docs/claude/imagem.md`.
- Mexeu numa ferramenta de PDF, no PDF.js, no qpdf, no pdf-lib ou na matriz de PDF: `docs/claude/pdf.md`.
- Mexeu numa calculadora (dinheiro, Brasil, casa ou saúde), num oráculo, num campo do formulário ou no resultado acima da dobra: `docs/claude/calculadoras.md`. Um oráculo roda pelo `uv`, cuja pegadinha (fora do PATH nesta máquina) está no arquivo do Git Bash.
- Mexeu numa página em pt ou es, no formato de um idioma, no `lint:texto`, num guia de arquivo, no `guias:medir` ou no kit do Product Hunt: `docs/claude/idiomas.md`. O `lint:texto` tem também uma pegadinha no arquivo das calculadoras (os placeholders dos textos de dinheiro).
- Mexeu no CSS, nos tokens, na Oli, num ícone, nas fontes e no CLS, no aviso de cookies, no Preact (os tipos de evento vêm de `preact`, e o SVG sem `compat`) ou no `pnpm screenshots`: `docs/claude/design-e-oli.md`. O `pnpm screenshots` tem pegadinhas também no arquivo do service worker e no de PDF.
- Mexeu no service worker, no offline, na página "Abrir com" ou no compartilhar: `docs/claude/service-worker.md`.
- Mexeu em anúncio, no `gate:prontidao`, no GA4 ou no Pix: `docs/claude/anuncios.md`.
- Escreveu ou mudou um spec do Playwright, mexeu numa porta, no WebKit ou na divisão dos testes nas partes: `docs/claude/playwright.md`.
- Usou o Git Bash, o PowerShell, o uv, uma worktree ou agentes, fez um commit de merge ou rodou a revisão adversarial: `docs/claude/windows-git-bash.md`.

## Comandos

As tabelas de cada fase, na ordem em que entraram. Comando novo entra na tabela da fase que o cria, aqui no núcleo; as pegadinhas dele vão para o arquivo do tema.

### F1a: comandos

Scripts do `package.json` (todos rodam igual no Windows e no Ubuntu, em TypeScript com o Node puro, sem bash):

| Comando | O que faz |
| --- | --- |
| `pnpm verificar` | Tudo, em ordem, com o tempo de cada portão; para na primeira falha e reprova acima de 15 min |
| `pnpm tipos` / `pnpm lint` / `pnpm test` | `astro check`, ESLint, Vitest |
| `pnpm build` | Build estático em `dist/` (grava `_headers`, `_redirects` e `build.txt`) |
| `pnpm e2e` | Playwright em Chromium e WebKit sobre o `dist/` (precisa de build antes) |
| `pnpm lhci` | Lighthouse CI no celular sobre o `dist/`, com o Chromium do Playwright |
| `pnpm lint:texto` | LanguageTool local nos textos alterados contra `origin/main` |
| `pnpm gate:cabecalhos`, `gate:worker`, `gate:seo`, `gate:links`, `gate:licencas`, `gate:dinheiro-saude`, `gate:actionlint` | Um portão pós-build de cada vez |
| `pnpm serve` | Serve o `dist/` como o Cloudflare (barra no fim, 404 mais próximo, `_headers`) |

Rodar um teste só: `pnpm exec vitest run tests/unit/ads.test.ts`, `pnpm exec playwright test tests/e2e/ads.spec.ts --project=webkit`. Primeira vez numa máquina: `pnpm exec playwright install chromium webkit` (no Ubuntu, com `--with-deps`).

### F2: ferramentas de imagem

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm fixtures` | Regera as fixtures `gen-*` de `fixtures/images/` a partir da F0 (`--check` compara sem gravar, `--no-webkit` pula a checagem no WebKit). Fora do `verificar`: o CI lê os arquivos commitados, e os SHA-256 do `fixtures/ORIGEM.md` são a verdade |
| `pnpm gate:conteudo` | Conteúdo mínimo das páginas de ferramenta e de preset, e título, descrição e texto proibido no site inteiro (DECISOES § 68) |
| `node scripts/fixtures/matrix-table.ts > docs/relatorios/fase-02-matriz.md` | A tabela ferramenta × fixture × navegador, a partir de `test-results/matriz/*.json`: rode antes `image-matrix.spec.ts` e `image-presets.spec.ts` nos dois navegadores, numa execução só do Playwright |

### F4: calculadoras

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py` | Regera `fixtures/calc/` (`--check` compara sem gravar, `--only <id>` faz uma calculadora). Fora do `verificar`: o CI lê as fixtures commitadas, e o `calc-oracle.test.ts` confere o SHA-256 do script |
| `CALC_FIXTURES_DIR=<cópia> pnpm exec vitest run tests/unit/calc-oracle.test.ts` | A prova do mutante: uma cópia das fixtures com um centavo mudado tem de reprovar |
| `pnpm exec playwright test tests/e2e/money-speed.spec.ts --project=chromium` | A medida dos 16 ms por tecla (p50 e p95 no log, linhas `[16 ms]`) |

### F5a: ferramentas de PDF

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm fixtures` | Regera também as 13 fixtures `gen-*` de `fixtures/pdf/` e o oráculo `fixtures/pdf/expected.json` (`scripts/fixtures/pdf.ts`; `--no-pdf` pula). Deterministas: o qpdf com `--static-id --static-aes-iv` e o `crypto.getRandomValues` trocado por um contador durante a cifra |
| `node scripts/fixtures/pdf-matrix-table.ts` | Monta `docs/relatorios/fase-05a-matriz.md` a partir de `test-results/matriz-pdf/*.json`: rode antes o `pdf-matrix.spec.ts` nos dois navegadores, numa execução só do Playwright |
| `pnpm motor:exportar` | Grava o pacote `fileorca-image-engine` em `.cache/oss/fileorca-image-engine/` (`--conferir` copia para uma pasta temporária fora do repositório e roda `npm install`, `tsc --noEmit` e `vitest run`; usa a rede e fica fora do `verificar`) |

### F5b: guias de arquivo e kit do Product Hunt

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm guias:medir` | Mede o que os 10 guias de arquivo dizem, sobre o `dist/` (rode `pnpm build` antes) e no Node, e grava `data/guides-measured.json` (`--check` refaz e compara: Node exato, navegador com a tolerância da § 185; `--only <id>` mede um guia). Fora do `verificar` |
| `pnpm lancamento:imagens` | Gera a miniatura (PNG e GIF da Oli) e a galeria do Product Hunt em `docs/lancamento/product-hunt/`, a partir do `dist/` e do `docs/design/`, e reescreve a tabela das imagens do `product-hunt.md`. Fora do `verificar` |

### F6: português e espanhol

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 python -I scripts/oracle/pix.py` | Regera `fixtures/pix.json` (o exemplo do manual do BC e os quatro códigos do Pix), só com a biblioteca padrão; `--check` compara sem gravar |
| `uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python -I scripts/oracle/calc_br.py` | Regera `fixtures/calc/br-*.json`, as 8 calculadoras brasileiras (`--check`, `--only <id>`). O `calc.py` e as 18 fixtures em inglês não mudam |

### F7: casa, saúde e QR code

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `uv run --no-project --python 3.13 python -I scripts/oracle/calc_home_health.py` | Regera as 11 fixtures de casa e saúde (`fixtures/calc/<id>.json`), só com a biblioteca padrão (`fractions`, `decimal` com 50 dígitos, `datetime`); `--check` compara sem gravar, `--only <id>` faz uma calculadora. Os outros dois oráculos não mudam |

### F9: CI e repositório público

Comandos novos:

| Comando | O que faz |
| --- | --- |
| `pnpm ci:custo <run-id> [--attempt n]` | O custo de uma execução do CI, pelo `gh` e só com leitura: os minutos cobrados de cada job, o preparo, o `total` do `verificar`, o tempo de parede e a classe, em Markdown |
| `pnpm verificar --partes` | As partes do CI em sequência na máquina, lidas do `.github/workflows/ci.yml`: o build uma vez, o limite de 900 s em cada parte e a soma |
| `pnpm verificar --build` | Só o build: o job `build` do CI |
| `pnpm verificar <parte> --dist-pronto` | Usa o `dist/` pronto: não o apaga, pula o build e falha se o `dist/build.txt` não for o `git rev-parse HEAD` |
| `pnpm verificar --leve` | Tipos, lint, build e Vitest: o job da PR em rascunho |
| `pnpm publico:auditar` | A auditoria para o repositório público; o resultado vai só para `.cache/auditoria-publico.md`, fora do Git |
