# ADR-002: Prévia das PRs no modelo "Worker Previews" do Workers Builds

**Status:** Proposta (não aplicada; decisão do Victor)
**Data:** 30/out/2026
**Proposta por:** run F1a
**Afeta:** ADR-001 (itens 2 e 5), ficha F1a (`wrangler.jsonc`), critério 12 da F1a

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

## Antes de decidir

Abrir o log do build `b9d3b134-ed15-47e6-b3a7-596cd72e63ac` no painel e confirmar a causa. Se o erro for outro (por exemplo, o Corepack com o Node 26), a correção é a do DECISOES § 17.
