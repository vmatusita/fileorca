# Prompt do ajuste `ajuste-ci-partes`

## A mensagem do Victor (31/out/2026)

> Aceito a ADR-003

Foi a resposta à pergunta do fim da run F2: com o `verificar` do CI entre 1283 s e 1645 s no runner de 2 vCPU (limite 900 s, os 496 testes verdes), aceitar a opção 1 da ADR-003 (dividir o Playwright do CI em partes, numa run curta) ou mesclar a PR da F2 à mão.

## O que a run faz (da ADR-003, opção 1, e do CLAUDE.md)

- Branch `ajuste-ci-partes`, saindo da `main`, com PR própria. A PR mexe em `.github/workflows/ci.yml`, então o job de merge não a mescla sozinho: o merge é do Victor.
- `scripts/verificar.ts` ganha modos: sem argumento roda tudo, como hoje; `--sem-playwright` roda todos os portões menos o Playwright; `--playwright=<projeto>` com `--shard=i/n` opcional roda o build e só aquela parte do Playwright. Cada modo mantém o limite de 900 s. Nenhum portão, teste, limiar, orçamento ou tempo por teste muda.
- `.github/workflows/ci.yml`: o job `verificar` roda `--sem-playwright`; um job `playwright` em matriz roda o Chromium inteiro e o WebKit em duas partes (o WebKit sozinho chega a uns 710 s a 925 s com a suíte da F2, perto demais do limite); o job `merge` espera todos. O pós-deploy não muda.
- A ADR-003 passa a "Aceita", com a decisão registrada; o mesmo texto vai para a branch `fase-02`, para os dois lados não conflitarem.
- Medir o CI da própria PR. Depois do merge do Victor, trazer a `main` para a `fase-02` e rodar o CI da PR da F2 de novo.
- Seção nova no fim do CLAUDE.md e relatório em `docs/relatorios/ajuste-ci-partes.md`.
