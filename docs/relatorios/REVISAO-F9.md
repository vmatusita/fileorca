# Revisão adversarial da F9

Revisão final da run F9, no método da F3 (`docs/claude/windows-git-bash.md`, "Método da revisão adversarial") e na regra 3 de toda run: uma fase que mexe em CI e em privacidade pede de cinco a seis lentes.

## Como foi feita

- **O commit revisado:** `859f7b4` da branch `fase-09` (o relatório antes da revisão). Foi numa worktree só de leitura, `.claude/worktrees/revisao-f9`, com o próprio `pnpm install` e o próprio `pnpm build`.
- **Seis lentes Sonnet em contexto limpo,** contra a ficha (`docs/prompts/prompt-fase-09.txt`) e o plano (`docs/relatorios/fase-09-plano.md`):
  - (a) corretude do CI;
  - (b) segurança do repositório público;
  - (c) custo e tempo;
  - (d) testes;
  - (e) o `CLAUDE.md`;
  - (f) os papéis do Victor.

  Cada lente teve a própria porta (`FO_PORT` de 4174 a 4179) e a própria pasta em `.cache/lente-<x>/`.
- **Os céticos:** um por achado médio ou acima, e um só para os baixos de cada lente. São 21 agentes.
- **As correções:** um agente Opus só, numa worktree. Depois, uma segunda passada (um revisor Sonnet em contexto limpo) leu o diff das correções.
- **O resultado:** nenhum achado crítico nem alto ficou de pé depois dos céticos. O único alto (F-1) caiu para médio. Os médios foram corrigidos, ou corrigidos em parte com a pendência do resto. Os baixos foram corrigidos ou registrados no `docs/PENDENCIAS.md`.

## Os médios

- **A-2: a classe sai do payload do evento.**
  - O defeito: um push em rascunho e o `gh pr ready` logo em seguida geram duas execuções, a um segundo uma da outra. Se a ordem dos webhooks inverter, a execução leve cancela a completa, e a PR pronta fica com o `ci-ok` verde só com tipos, lint e Vitest.
  - A correção: o `ci-ok` confere o estado atual da PR (`gh api .../pulls/<n>`) e fica vermelho quando a classe é `leve` e a PR já está pronta. O passo também falha fechado se o script não imprimir o veredito (A-4).
- **B-1 e F-1: dois `ci-ok` no mesmo commit.**
  - O defeito: o `ci-ok` de uma execução cancelada roda (`always()`) e sai vermelho. A API mostrou os dois check runs no commit `8727853`, e o `statusCheckRollup` do commit ficou `FAILURE`. O texto da run dizia, sem prova, que o da execução nova "é o que vale".
  - A correção:
    - o `if: always()` fica, porque a ficha manda;
    - o texto foi corrigido;
    - o fim de run passa a ser o `gh pr ready` antes do último push, para o commit final ter uma execução só;
    - o `alerta-dependabot` ganhou `!cancelled()`;
    - o OPERACAO diz o que fazer se o merge for recusado.
  - O que fica: se o ruleset bloqueia, ninguém testou. Vira a pendência "F9 ci-ok duplicado", com o teste numa PR descartável.
- **A-1, D-1, C-1 e E-1** foram médios para a lente e baixos para o cético; estão nas tabelas abaixo.

## A segunda passada

Um revisor Sonnet em contexto limpo leu o diff das correções (`859f7b4..d8054e4`), rodou os testes tocados, o Vitest inteiro (102 arquivos, 1.749 testes), o `gate:actionlint` e o `pnpm tipos`, e achou oito baixos. Nenhum crítico ou alto. Todos foram corrigidos pelo agente principal no commit seguinte:

| Id | Achado | Correção |
| --- | --- | --- |
| R2-1 | A nota do fim de run ("nunca o push seguido do `gh pr ready`") contradiz a ficha da F9 | A nota diz que a ficha de cada run vence e o que fazer quando ela pede o push e o ready em seguida (esperar a execução leve); § 327 |
| R2-2 | "rótulos do GitHub" no "Fora de toda run" podia proibir pôr o `ci` numa PR | "criar, renomear ou apagar rótulos do repositório"; pôr e tirar o `ci` de uma PR continua permitido |
| R2-3 | A linha vermelha da classe `leve` numa PR pronta não diz como fazer a completa rodar | O `docs/claude/ci.md` diz (`gh pr ready --undo` e `gh pr ready`, ou rodar de novo), e que um erro passageiro do `gh api` pede só rodar de novo |
| R2-4 | O relatório ainda tinha os números e frases que os achados mandavam corrigir; a nota do plano não estava commitada | O relatório final foi refeito com os números do commit final, e a nota do plano entrou no commit |
| R2-5 | A linha "F9 motor MIT" do PENDENCIAS ficou no presente | No futuro, como o README e o LICENSE |
| R2-6 | O comentário do `scripts/verificar.ts` apontava a "seção F1a" do `CLAUDE.md` | Aponta a tabela da F1a em "Comandos", que continua no núcleo |
| R2-7 | A regra da função de status aceitava `success() && !cancelled()` | A regra reprova `success()` em qualquer ponto do `if`, com mais um controle |
| R2-8 | A pegadinha da linha verde do `ci-ok` não dizia que são duas PRs | O `docs/claude/ci.md` diz o padrão em duas PRs, como na § 297 |

A segunda passada lembrou também que o exemplo antigo do OPERACAO, que citava o arquivo de um dado de terceiro, continua no histórico da branch (commit `6002159`, já publicado). Reescrever o histórico está fora da run; a § 332 registra.

## Lente A: corretude do CI

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| A-1 | médio | baixo | O ci-ok com always() sai vermelho numa execução cancelada, e isso dispara o alerta-dependabot e deixa um check vermelho no mesmo commit (`.github/workflows/ci.yml`) | Corrigido em parte (`3f6c576`, `1258a19`): o `alerta-dependabot` ganhou `!cancelled()`, e o texto do `docs/claude/ci.md` e da § 327 diz o que a API mostrou. O `always()` do `ci-ok` fica (a ficha manda). Pendência "F9 ci-ok duplicado" |
| A-2 | médio | médio | A classe sai do payload do evento (draft e labels), então uma PR pronta pode terminar com o ci-ok verde da classe leve (`.github/workflows/ci.yml`) | Corrigido (`3f6c576`): o `ci-ok` lê o estado atual da PR (`PR_DRAFT_NOW`) e fica vermelho se a classe é `leve` e a PR está pronta; § 327 |
| A-3 | baixo | baixo | O passo a passo manda rodar `gh run rerun --failed`, mas o artefato do build vive 1 dia (`docs/OPERACAO.md`) | Corrigido (`1258a19`): o OPERACAO e o `docs/claude/ci.md` dizem que o `--failed` só vale em até 24 h |
| A-4 | baixo | baixo | O ci-ok.ts e o classificar.ts não falham fechados se `import.meta.main` não existir, e o Node que os roda vem do `.node-version` da própria PR (`scripts/ci/ci-ok.ts`) | Corrigido (`3f6c576`): o passo Verdict exige `ci-ok: verde` na saída (`pipefail`, `tee`, `grep -qx`); o teste roda o passo |
| A-5 | baixo | baixo | O teste do CLI do ci-ok roda o script no lugar, não sozinho num diretório (`tests/unit/ci-ok.test.ts`) | Corrigido (`3f6c576`): o `cli()` roda uma cópia do script numa pasta temporária |
| A-6 | baixo | refutado | As classes `portões` e o caminho do rótulo `ci` nunca rodaram numa execução real do GitHub (`.github/workflows/ci.yml`) | Refutado pelo cético |

## Lente B: segurança do repositório público

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| B-1 | médio | médio | O check ci-ok de execuções diferentes do mesmo commit convive no mesmo SHA: sobra vermelho de execução cancelada, ou verde velho da classe leve depois do gh pr ready (`.github/workflows/ci.yml:354-380 (job ci-ok); DECISOES.md:3074; docs/claude/ci.md:155`) | Corrigido em parte (`3f6c576`, `1258a19`, `d8054e4`): o texto foi corrigido, o fim de run passa a pôr o `gh pr ready` antes do último push (ou espera a execução leve terminar), e o OPERACAO diz o que fazer se o merge for recusado. Se o ruleset bloqueia, ninguém testou: pendência "F9 ci-ok duplicado" |
| B-2 | baixo | baixo | O OPERACAO diz que o GH_TOKEN só entra nos passos que chamam o gh, mas no job merge ele é variável do job inteiro (`.github/workflows/ci.yml:396-402; docs/OPERACAO.md:192`) | Corrigido (`1258a19`): a frase do OPERACAO sobre o `GH_TOKEN` |
| B-3 | baixo | baixo | A auditoria rebaixa a falso positivo todo achado que só aparece em tests/ ou fixtures/, sem olhar o valor (`scripts/publico/lib/classify.ts:92, :109, :115 e seguintes (TEST_PATH)`) | Pendência "F9 auditoria testes": mudar a regra mudaria a contagem da auditoria |
| B-4 | baixo | baixo | Os passos de configuração que não dependem do merge da F9 ficam depois dele e do ruleset, com o repositório já público (`docs/OPERACAO.md:158-174`) | Corrigido (`1258a19`): os passos que não dependem do merge vêm antes dele no OPERACAO |
| B-5 | baixo | baixo | O preparo novo roda `npx --yes playwright@<versão>` baixado do registro, sem a verificação de integridade do lockfile, num passo que usa sudo (`.github/workflows/ci.yml:193 e :304`) | Registrado na § 325; pendência "F9 npx integridade" para a F9b |
| B-6 | baixo | baixo | O OPERACAO aponta o arquivo onde está um dado de terceiro achado pela auditoria (`docs/OPERACAO.md:162`) | Corrigido (`1258a19`): o exemplo do OPERACAO ficou genérico, sem caminho; o `git grep` não achou outra frase assim |

## Lente C: custo e tempo

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| C-1 | médio | baixo | A mudança de máquina do runner é um degrau único, não uma 'variação', e a linha de base não rodou nas 'máquinas de repositório público' (`docs/relatorios/fase-09-plano.md (achado 1), DECISOES.md § 338 e § 339, docs/claude/ci.md (pegadinha 'O tipo de máquina do runner varia')`) | Corrigido (`1258a19`, `c18dedd`): "a máquina mudou entre a linha de base e a F9", causa desconhecida, no `docs/claude/ci.md`, nas § 325, § 338 e § 339 e no PENDENCIAS; o plano ganhou uma nota |
| C-2 | baixo | baixo | O tamanho do artefato 'site' não está registrado em lugar nenhum (`docs/relatorios/fase-09.md; DECISOES.md § 324; docs/claude/ci.md`) | Corrigido (`c18dedd`): o artefato `site` tem 23.038.126 bytes (23,0 MB), na § 324 e no relatório |
| C-3 | baixo | baixo | A tabela de execuções tem um marcador no lugar do custo, e o texto do --partes se contradiz (`docs/relatorios/fase-09.md:318 e :306-308`) | Corrigido no relatório final: a tabela de execuções e o `--partes` final |
| C-4 | baixo | baixo | A receita 'gh run rerun <id> --failed' não vale mais depois de 24 h, e o OPERACAO não avisa (`docs/OPERACAO.md:52 e :112; .github/workflows/ci.yml (upload do artefato 'site')`) | Corrigido (`1258a19`): o mesmo que o A-3 |
| C-5 | baixo | baixo | As duas medidas do preparo foram duas variantes da opção A; a opção B ficou sem medida, e a variante 2 não mostra ganho (`DECISOES.md § 325; docs/relatorios/fase-09-plano.md ('Segunda opção (B), só se A não fechar em 90 s')`) | Corrigido (`c18dedd`): a § 325 diz que a variante 2 não teve ganho separável e que a opção B ficou sem medida por escolha |
| C-6 | baixo | baixo | A conta controlada não compara igual no job de portões (o lint:texto da linha de base não existe na PR #20) (`DECISOES.md § 339; docs/relatorios/fase-09.md (conta controlada)`) | Corrigido (`c18dedd`): a conta controlada é conservadora e vai em faixa: 147 a 148 minutos (−5,7 % a −6,4 %), na § 339 e no relatório |

## Lente D: testes

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| D-1 | médio | baixo | O teste da função de status explícita aceita `success()`, que repete o defeito que ele existe para barrar (`tests/unit/ci-workflows.test.ts`) | Corrigido (`3f6c576`): a regex não aceita `success()`, com dois controles que reprovam |
| D-2 | baixo | baixo | O § 341 e o relatório dão 1.735 testes do Vitest, e o commit final tem 1.736 (`DECISOES.md`) | Corrigido no relatório final: a contagem do Vitest no commit final |
| D-3 | baixo | baixo | O título de um teste promete a comparação com as matrizes do ci.yml, que ele deixou de fazer (`tests/unit/verificar.test.ts`) | Corrigido (`c0e6869`): o título do teste |
| D-4 | baixo | baixo | O relatório se contradiz sobre o `--partes` final, e o único `--partes` registrado é de um commit antigo (`docs/relatorios/fase-09.md`) | Corrigido no relatório final: o `--partes` final, sobre o commit final |
| D-5 | baixo | baixo | Ponteiro para o CLAUDE.md que a F9 não atualizou (`scripts/guides/lib/browser.ts`) | Não mudado: o `scripts/guides/` tem o SHA-256 conferido pelo `guides-measured.test.ts`. Pendência "F9 comentário guias" |

## Lente E: o CLAUDE.md

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| E-1 | médio | baixo | Pegadinhas de uso geral foram para arquivos que o índice não cita pelo assunto (`CLAUDE.md`) | Corrigido (`59d1817`): as linhas do índice citam os assuntos que faltavam |
| E-2 | baixo | baixo | Índice manda `pnpm screenshots`, `lint:texto` e o oráculo para um arquivo, e a pegadinha está em outro (`CLAUDE.md`) | Corrigido (`59d1817`): o índice diz que o `pnpm screenshots`, o `lint:texto` e o `uv` têm pegadinhas em mais de um arquivo |
| E-3 | baixo | baixo | O teste não prende o núcleo: regra do núcleo pode ir para docs/claude/ e o teste passa (`tests/unit/lib/claude-md.ts`) | Corrigido (`3f6c576`): o teste exige as 79 linhas do núcleo no `CLAUDE.md`, com um controle que reprova |
| E-4 | baixo | baixo | A seção da F9 do ci.md omite parte do CI real, e os números de partes antigos ficam sem aviso (`docs/claude/ci.md`) | Corrigido (`1258a19`): a seção da F9 do `ci.md` ganhou a divisão atual, o fork, o `fetch-depth`, o preparo e como reproduzir uma parte; o `ci.md` e o `playwright.md` ganharam a nota sobre os números de partes de cada época |
| E-5 | baixo | baixo | Três regras que a F9 criou e valem para toda run só estão no ci.md (`CLAUDE.md`) | Corrigido (`59d1817`): o núcleo ganhou a regra do repositório público, os rótulos e rulesets em "Fora de toda run" e a nota do rótulo `ci` |
| E-6 | baixo | baixo | § 331 traz tamanhos que já não batem com os arquivos (`DECISOES.md`) | Corrigido (`c18dedd`): os tamanhos atuais e as seções novas da F9 na § 331 |

## Lente F: os papéis do Victor

| Id | Lente | Cético | Achado | Destino |
| --- | --- | --- | --- | --- |
| F-1 | alto | médio | O ci-ok vermelho de uma execução cancelada continua no mesmo commit depois da completa verde, e o ruleset exige o ci-ok (`docs/claude/ci.md:155 (e DECISOES.md § 327; docs/ops/ruleset-main.json; docs/OPERACAO.md:177)`) | O mesmo defeito do B-1 (alto para a lente, médio para o cético). Pendência "F9 ci-ok duplicado" |
| F-2 | médio | baixo | A ordem do passo a passo deixa por último os passos urgentes, que não dependem do merge (`docs/OPERACAO.md:158-177 (e docs/relatorios/fase-09.md:360-370)`) | Corrigido (`1258a19`): o mesmo que o B-4 |
| F-3 | médio | baixo | O passo 1 manda rodar um script que só existe na branch fase-09, e o relatório e o OPERACAO se contradizem sobre refazer a auditoria (`docs/OPERACAO.md:160 e docs/relatorios/fase-09.md:360`) | Corrigido (`1258a19`): o passo 1 diz que o script só existe na `fase-09` até o merge e manda rodar a auditoria de novo antes de decidir; o relatório segue o OPERACAO |
| F-4 | baixo | baixo | Nomes de menu do GitHub desatualizados nos passos de segurança (`docs/OPERACAO.md:150 e :174 (e PLANO-MELHORIAS.md seção F, passo 5)`) | Corrigido (`1258a19`): os nomes atuais dos menus (Advanced Security, Secret Protection), com o antigo entre parênteses |
| F-5 | baixo | baixo | README e LICENSE falam do repositório MIT do motor como se já existisse (`README.md:32 e LICENSE:11-13`) | Corrigido (`37fbc55`): o README e o LICENSE falam do repositório MIT no futuro |
| F-6 | baixo | refutado | Itens da lista do Victor no relatório não estão no manual e um deles não diz o que escrever (`docs/relatorios/fase-09.md:368 e docs/OPERACAO.md:145-150`) | Refutado pelo cético |
| F-7 | baixo | baixo | A saída "voltar para privado" não avisa que o ruleset e o ci-ok obrigatório deixam de proteger (`docs/OPERACAO.md:167 e :172`) | Corrigido (`1258a19`): a saída "voltar para privado" avisa do ruleset e dos minutos |
| F-8 | baixo | baixo | Nenhum teste protege a seção nova "Repositório público", e a abertura do manual ficou desatualizada (`tests/unit/operacao.test.ts e docs/OPERACAO.md:3`) | Corrigido (`1258a19`): o `operacao.test.ts` confere a seção nova, e a abertura do manual diz "depois da F9" |

Total: 37 achados; depois dos céticos, 0 críticos, 0 altos, 3 médios, 32 baixos e 2 refutados.
