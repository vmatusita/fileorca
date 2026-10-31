# ADR-003: Dividir o Playwright do CI em partes

**Status:** Proposta (decisão do Victor; nenhuma run aplica sem a decisão)
**Data:** 31/out/2026
**Proposta por:** run F2 (a ficha manda escrever esta ADR se o `verificar` passar de 800 s no CI)
**Afeta:** `.github/workflows/ci.yml` (fora de toda run), `scripts/verificar.ts`, `playwright.config.ts`, DECISOES § 57 e § 76

## Contexto

- O `pnpm verificar` roda inteiro num job só do GitHub Actions, num runner Ubuntu de 2 vCPU (repositório privado no GitHub Free), com o Playwright em 2 workers (§ 57) e um teto de 900 s que o próprio `verificar` impõe.
- Na F1b, o Playwright levou 424 s para 474 testes. Na F2, o primeiro push com a suíte inteira ([run 41200291640](https://github.com/vmatusita/fileorca/actions/runs/41200291640), commit `df918b2`) levou **1414 s** para 532 testes: a soma da duração dos testes no log é 2786 s, ou seja, os 2 workers ficaram ocupados o tempo todo. Por spec, somando os dois navegadores: axe 771 s, matriz de fixtures 691 s, smoke das ferramentas 295 s, anúncios 224 s, design 138 s, café 134 s.
- O custo novo vem de trabalho de CPU de verdade: codecs WASM de uma thread (MozJPEG, OxiPNG, libheif, jSquash) sobre fotos de 8 a 12 MP, uma vez por navegador, e o axe sobre 39 páginas em duas larguras e dois temas. O WebKit leva de 1,7 a 2 vezes o tempo do Chromium. Nada disso se tira sem tirar alcance que a ficha F2 exige (navegador, página, largura, tema, fixture e os testes dos critérios 3 a 8 e 10).
- A F2 fez o que a ficha permite sem reduzir o alcance (§ 83): o axe passou ao modo legado e só com as violações (cerca de 3 vezes mais rápido por análise, mesmas regras), e os estados da F1b viraram um carregamento cada. Depois disso, a válvula cortou (e) Convert to WebP/AVIF e (f) AVIF to JPG para a run 2b (§ 85). Com tudo isso, o CI do commit `4b169ae` ([run 41205310197](https://github.com/vmatusita/fileorca/actions/runs/41205310197)) passou os 486 testes, mas o `verificar` levou **1283,5 s** (Playwright 1123,4 s; 2212 s somados). O runner de repositório privado tem 2 vCPU (documentação do GitHub, 31/out/2026). **A PR da F2, que lança o site, não mescla sozinha enquanto esta ADR não for decidida** (§ 87).
- O teto de 900 s e o número de workers existem para o CI ser estável e caber no plano grátis (2000 min/mês). Cada ferramenta nova (a F3 e as de PDF) põe mais trabalho de codec na mesma fila.

## Opções

1. **Dividir o Playwright em jobs paralelos por navegador.** Um job roda os portões rápidos, o build, o Vitest, o Lighthouse e o `lint:texto`; dois jobs rodam o Playwright, um com `--project=chromium` e outro com `--project=webkit`, cada um sobre o mesmo `dist/` (artefato do primeiro job ou build próprio). O teto de 900 s passa a valer por job. O job de merge espera os três.
2. **Dividir por shard do Playwright** (`--shard=1/3`, `2/3`, `3/3`), com os dois navegadores em cada parte. Divide melhor quando um navegador pesa mais que o outro, e a conta de minutos é a mesma da opção 1.
3. **Runner maior** (runners de 4 ou 8 vCPU são pagos no GitHub). Mantém um job só, mas tem custo mensal.
4. **Manter um job e cortar alcance a cada ferramenta nova** (menos fixtures por navegador, axe numa largura só). Contraria a ficha F2 e o plano.

## Proposta

A opção 1. É a mais simples de ler no log, mantém o alcance inteiro e põe o WebKit, que é o mais lento, num job só dele. O `scripts/verificar.ts` ganha um modo que roda só um projeto do Playwright (por exemplo, `pnpm verificar --playwright=webkit`), e o `ci.yml` chama cada modo num job. O tempo de cada job fica perto da metade do atual, com folga para a F3. Os minutos do plano sobem pouco: o build e a instalação se repetem em cada job (cerca de 2 min por job).

## Antes de decidir

- A mudança mexe em `.github/workflows/ci.yml`, e uma PR que mexe no pipeline não é mesclada sozinha (o job de merge recusa): o merge dessa PR é seu.
- O job de merge (`scripts/ci/pode-mesclar.ts`) e o pós-deploy dependem do nome do job `verificar`; a divisão precisa manter um job de nome `verificar` (ou mudar o script, que também é do pipeline).
- Com a decisão, uma run curta (`ajuste-ci-partes`) implementa e mede três execuções seguidas.
