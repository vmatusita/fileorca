# ADR-002: Prévia das PRs no modelo "Worker Previews" do Workers Builds

**Status:** Proposta, confirmada pela prévia da PR #3: com o comando de build certo, o `npx wrangler preview` recusa rodar sem o bloco `previews` (ver "Atualização"). Decisão do Victor entre as opções 1 e 2
**Data:** 30/out/2026
**Proposta por:** run F1a; atualizada pelo ajuste `ajuste-previa-build`
**Afeta:** ADR-001 (itens 2 e 5), ficha F1a (`wrangler.jsonc`), critério 12 da F1a

> As seções Contexto, Opções, Proposta, "O que a run tentou" e "Antes de decidir" são o texto da F1a. A seção "Atualização", no fim, corrige o diagnóstico.

## Contexto

- A ADR-001 e a ficha F1a fixam o `wrangler.jsonc` com exatamente `name`, `compatibility_date`, `assets`, `workers_dev` e `preview_urls`, e descrevem a prévia por Version URL (`<versão>-<worker>.<subdomínio>.workers.dev`), que é o que `npx wrangler versions upload` gera.
- O Worker `fileorca` foi criado na F0 (28 e 29/out/2026). Segundo a documentação do Cloudflare conferida em 30/out/2026, Workers novos ligados ao Workers Builds usam o modelo "Worker Previews": o comando de prévia padrão das branches que não são de produção passa a ser `npx wrangler preview`, com Preview URL `<branch>-fileorca.<subdomínio>.workers.dev` e uma Deployment URL imutável por commit.
- O `wrangler preview` (wrangler 4.156.0, `src/preview/ensure-config.ts`) recusa rodar em CI sem um bloco `previews` no arquivo de configuração ("Your Wrangler configuration is missing a `previews` block … The block can be empty").
- O primeiro build da prévia da PR #1 (commit `af28dfa`) falhou. O comentário do Cloudflare na PR já é o do modelo novo ("Preview Deployments by commit", coluna "Deployment URL"). O log do build fica no painel do Cloudflare, que a run não acessa, então a causa exata não está confirmada.

## Opções

1. **Trocar o comando de prévia no painel** (Workers & Pages → fileorca → Settings → Build → Preview command) para `npx wrangler versions upload`. Mantém a ADR-001 e o `wrangler.jsonc` como estão; a prévia volta a ser Version URL com o alias da branch. Só o Victor mexe no painel.
2. **Acrescentar `"previews": {}` ao `wrangler.jsonc`** e adotar o modelo novo. Muda o contrato da ficha F1a (campos exatos) e o teste de Worker sem código precisaria aceitar o campo. O Cloudflare já põe `X-Robots-Tag: noindex` nas Preview URLs de workers.dev, e a regra `https://:version.:subdomain.workers.dev/*` do `_headers` continua cobrindo todas elas.

## Proposta

A opção 1, por ser reversível, não mudar o contrato e bater com a ADR-001. Se o Victor preferir o modelo novo, a opção 2 entra por uma run curta de ajuste, com a ADR-001 revisada.

## O que a run tentou (30/out/2026)

| Commit | Configuração | Resultado no Workers Builds |
| --- | --- | --- |
| `af28dfa` | Node 26.13.0, pnpm 12.16.1, sem `previews` | falhou em menos de 17 s após o push (build `b9d3b134-ed15-47e6-b3a7-596cd72e63ac`) |
| `bc0f703` | igual | falhou em ~26 s (build `d925f68d-ee94-4f07-a5e1-0f2938a54eb9`) |
| `fe97a8e` | Node 24.22.2, pnpm 12.16.1, sem `previews` | falhou depois de ~27 s de execução |
| `a120197` | Node 24.22.2, pnpm 12.16.1, com `"previews": {}` (sonda, revertida) | falhou em ~25 s (build `adb0c2f3-69c4-470d-aeb4-6482c996776b`) |
| `f8673c6` | Node 24.22.2, pnpm 10.34.9, com `"previews": {}` (sonda, revertida em `f4b8aea`) | falhou em ~60 s, mais adiante que as outras |

O CI do GitHub (Ubuntu 24.04) instala e builda o mesmo commit sem erro, então a falha restante está no ambiente do Workers Builds ou no comando de prévia. A run não tem acesso aos logs do painel.

## Antes de decidir

Abrir no painel o log do build mais recente da branch `fase-01a` e ver em que etapa ele para (instalação, `pnpm build` ou o comando de prévia). Se for o comando de prévia, vale a opção 1 (ou a 2). Se for a instalação, ajustar Node e pnpm (DECISOES § 17).

## Atualização (30/out/2026, ajuste `ajuste-previa-build`)

Depois do merge da F1a, o build de produção também falhou, e o Victor abriu o log no painel. O primeiro bloqueio não era o modelo "Worker Previews" nem o Node ou o pnpm: o comando de build salvo no painel era `pnpm buid`, sem o "l", e os builds lidos paravam antes de chegar ao comando de prévia.

| Build | Commit | Node e pnpm detectados | Onde parou |
| --- | --- | --- | --- |
| `d925f68d` (prévia) | `bc0f703` | 26.13.0 e 12.16.1 | instalação ok ("Done in 7.2s using pnpm v12.16.1"); `Executing user build command: pnpm buid` → `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`, `Command "buid" not found` |
| `b9d3b134` (prévia) | `af28dfa` | 26.13.0 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `adb0c2f3` (prévia) | `a120197` | 24.22.2 e 12.16.1 | instalação ok; etapa Building falhou em 2 s |
| `8d03fd90` (prévia) | `9bb5ccf` | 24.22.2 e 10.34.9 | instalação ok; etapa Building falhou em 2 s |
| `62a07a98` (produção) | `249307f` | 24.22.2 e 10.34.9 | instalação ok; `Command "buid" not found` |
| `a49d23cc` (produção, refeito) | `249307f` | 24.22.2 e 10.34.9 | **passou** depois de o Victor corrigir o comando para `pnpm build`: 72 arquivos, deploy em fileorca.com |

O que isso muda:

- Com o comando de build errado, nenhum build podia chegar ao comando de prévia (`npx wrangler preview`): todos os logs lidos param na etapa Building, em 2 s. A hipótese do bloco `previews` não foi testada na F1a, e a diferença de tempo entre as tentativas da tabela anterior era fila e instalação, não progresso.
- O Node 26 e o pnpm 12 instalam sem erro no Workers Builds. A razão do DECISOES § 17 não se sustenta (ver § 37).
- A prévia da PR do ajuste (PR #3, commit `b562124`, build `f2790489`) foi o primeiro build de branch com o comando certo. A instalação e o `pnpm build` passaram (27 páginas, `build.txt` com `b562124`), e o comando de prévia falhou em 4 s com `✘ [ERROR] Your Wrangler configuration is missing a previews block to run this command. Add the following to your configuration file: { "previews": {} }`, no wrangler 4.156.0. O mecanismo descrito nesta ADR está confirmado, mas não era a causa das falhas da F1a, que paravam antes.
- As opções e a proposta acima continuam valendo: a opção 1 (trocar o comando de prévia no painel para `npx wrangler versions upload`) não muda o `wrangler.jsonc` nem a ADR-001; a opção 2 (`"previews": {}`) muda o contrato da ficha F1a e pede uma run de ajuste.
