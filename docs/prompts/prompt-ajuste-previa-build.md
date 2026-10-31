# Prompt do ajuste `ajuste-previa-build`

Run curta pedida pelo Victor na mesma sessão da F1a, em 30/out/2026, depois do merge da PR #1.

## Contexto da sessão

- O merge da F1a (`249307f`) não chegou a fileorca.com: o build de produção do Workers Builds falhou e o pós-deploy abriu a issue #2.
- O Victor pediu para o Claude abrir o log no Chrome dele. O log mostrou `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "buid" not found`: o comando de build no painel estava `pnpm buid`.
- O Victor corrigiu o comando para `pnpm build`, autorizou o Claude a clicar em "Tentar compilar novamente", o build passou, o pós-deploy reexecutado passou e a issue #2 foi fechada.

## Pergunta do Claude

> Abro um ajuste curto para corrigir a ADR-002 e o relatório?

Junto, no fim da resposta: "A ADR-002 e o relatório da F1a ainda dizem que a prévia falhava por causa do modelo 'Worker Previews' e do bloco `previews`, quando a causa real era o `pnpm buid` no painel. A decisão de Node 24 e pnpm 10 (DECISOES § 17) também pode ser revista. A PR desse ajuste ainda serviria de teste: com o comando corrigido, a prévia dela mostra se o `npx wrangler preview` funciona sem o bloco `previews`."

## Resposta do Victor

> Sim, faça aqui

## Escopo que o Claude fixou

- Corrigir a ADR-002, o § 17 (por um § novo) e o relatório da F1a com a causa real, sem mexer no código, no `wrangler.jsonc` nem no painel.
- Acrescentar ao CLAUDE.md uma seção que corrige as pegadinhas da F1a sobre o Workers Builds (só acrescentar).
- Usar a prévia desta PR para responder se o `npx wrangler preview` funciona sem o bloco `previews`, e fechar a ADR-002 com esse resultado.
- Relatório em `docs/relatorios/ajuste-previa-build.md`. A PR abre como rascunho até a prévia ser conferida; depois fica pronta para o merge automático do CI.
