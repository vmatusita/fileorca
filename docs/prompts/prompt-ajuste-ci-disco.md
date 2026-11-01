# Ajuste · Queda de disco do WebKit 2 de 3 no CI

Prompt da run curta `ajuste-ci-disco` do FileOrca, de 31/out/2026. Ela nasceu de um cartão de tarefa que o ajuste `ajuste-ci-webkit-tres` propôs no fim da run. O Victor pediu para fazer na mesma sessão:

> Faça esta tarefa aqui: “Investigar a queda de disco do WebKit 2 de 3 no CI”

E, no meio da run:

> ao finalizar fazer merge e push

## O cartão (o brief da tarefa)

```text
Ajuste `ajuste-ci-disco` do FileOrca (vmatusita/fileorca), só depois do merge da PR #9 (ajuste-ci-webkit-tres) na `main`.

Problema: na run 41250641460, tentativa 1, a parte `playwright (webkit 2 de 3)` teve o `/` do runner caindo de 10 897 MB livres para 609 MB entre 23:04:44 e 23:05:44, em três degraus (2958, 4003 e 3327 MB), durante o `tests/e2e/design.spec.ts`. A janela começa na "Oli boxes a 1280×800" e segue até "review regressions". O espaço não voltou até o fim. Os testes passaram. No fim, o `du` das pastas medidas deu uns 2,5 GB e o `find / -xdev -type f -size +200M` não achou nada. No rerun (tentativa 2) e em cinco execuções com duas partes, o disco ficou acima de 9,7 GB livres. Os detalhes estão na DECISOES § 108, na § 90 e em `docs/relatorios/ajuste-ci-webkit-tres.md` (seção "Risco registrado").

Tarefa:
1. Ampliar o diagnóstico em `scripts/lib/disco.ts` (só leitura no runner, só Linux e CI). Por exemplo: `lsof +L1` (arquivos apagados ainda abertos, com o processo), `du` de `/var` e `/var/tmp`, coredumps (`/var/crash`, `/var/lib/systemd/coredump`) e os processos vivos do WebKit no fim. Sem mudar teste, portão, limiar, timeout, `retries` nem workers.
2. Medir o CI da PR mais de uma vez e achar onde vão os ~10 GB quando a queda acontece.
3. Registrar num § novo do `DECISOES.md` e no relatório `docs/relatorios/ajuste-ci-disco.md`, em português. Se a correção pedir mexer no `.github/` ou no `playwright.config.ts`, escrever a proposta e deixar a decisão para o Victor.

Pronto quando o diagnóstico novo estiver no `main` por PR e o relatório disser a causa, ou disser o que a medida mostrou se a queda não se repetir.
```
