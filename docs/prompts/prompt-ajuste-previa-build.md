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

## Pedidos seguintes, na mesma sessão

1. O Claude propôs a opção 1 da ADR-002 (trocar o comando de prévia no painel). O Victor trocou e escreveu: "Troquei, confere aí". O Claude refez o build da prévia e enviou um commit novo: os dois builds ainda rodaram `npx wrangler preview`.
2. O Claude pediu para conferir se a troca foi salva. O Victor: "Salvei de novo". Um terceiro build também rodou `npx wrangler preview`; o Claude parou de tentar (regra anti-loop) e perguntou: "Aceita a opção 2 (bloco `previews` no `wrangler.jsonc`) nesta PR?"
3. O Victor: "Aceito, faça aqui". O escopo passou a incluir `"previews": {}` no `wrangler.jsonc`, o portão "worker sem código" e o teste de plataforma aceitando o campo só vazio, a ADR-002 aceita (opção 2), o DECISOES § 38 e a conferência da prévia (200, `noindex`, `build.txt` com o commit da PR).
