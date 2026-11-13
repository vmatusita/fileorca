# Revisão adversarial da F18

A revisão do "Como trabalhar", passo 5, do prompt da F18 (`docs/prompts/prompt-fase-18.txt`), no método da F3 (DECISOES § 92 a § 94; `docs/claude/windows-git-bash.md`). O resumo e as decisões estão no DECISOES § 748; a correção do motor, no § 749.

## O método

- **O commit fixo:** `31b9770` da `fase-18`: as seis frentes juntas, os documentos até o § 747, as duas tabelas das matrizes, o Lighthouse das páginas novas e as imagens do relatório.
- **A worktree só de leitura:** `.claude/worktrees/revisao-f18`, com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` (o `dist/build.txt` com o `31b9770`) e o build de teste dos anúncios feito uma vez antes das lentes, para elas o reaproveitarem sem disputar o diretório; o LanguageTool e o `dist` do ponto de partida (`39d1341`) copiados para o `.cache/` dela.
- **Cinco lentes Sonnet em contexto limpo** (regra 3 de toda run: a F18 mexe no motor, com as operações `organize` e `strip`, e na privacidade):
  - (a) as ferramentas: as matrizes, as saídas, o teste 2 das presets, os chips que levam, a grade do Organizar;
  - (b) o site, o SEO, os idiomas e os documentos;
  - (c) o orçamento, os anúncios, a acessibilidade e o CI;
  - (d) o motor;
  - (e) a privacidade.

  Cada uma com a própria porta (4174 a 4178), escrevendo só no `.cache/lente-<x>/` da worktree, contra a ficha da F18, o prompt e o plano (`docs/relatorios/fase-18-plano.md`), apontando só lacunas de correção ou de requisito.
- **Os céticos:** um por achado médio ou acima, e um por lente para os baixos, com a regra "na dúvida, refutado".
- **As correções:** num agente só (Opus), no checkout principal; depois, a segunda passada das lentes dos achados corrigidos (a, d e e) sobre o diff das correções.

## O que cada lente rodou

| Lente | O que rodou | Resultado |
| --- | --- | --- |
| (a) ferramentas | Vitest de `pdf-matrix-table`, `matrix-table`, `matrix-lib`, `pdf-organize`, `strip-op`, `pdf-grid-math`, `handoff` e `registry-lists`; no Chromium, `pdf-presets`, `island-pdf-organize`, `image-matrix`, `image-presets` e os dois `handoff`; no WebKit, os mesmos e os casos da F18 do `pdf-matrix`; nos dois, `pdf-privacy` e `image-webp-speed`; a distância de cada espelho certo aos três errados nas 10 fixtures | 117 testes do Vitest; 22 + 59 no Chromium; 32 + 59 no WebKit; 54 nos dois. O espelho errado mais perto fica a 13,8 (a WebP animada), contra a folga de 4 |
| (b) site, SEO, idiomas e documentos | `gate:seo`, `gate:links`, `gate:conteudo`, `lint:texto`; 28 arquivos do Vitest (rotas, textos, glossário, kit, pendências, `claude-md`, guias, registros, contagens, ícones, hubs, consentimento, SEO, prontidão, conteúdo); no Chromium, `share-target`, `navigation`, `tool-i18n` e `footer-phone`; o `dist/` conferido à mão (canonical, hreflang, OG, sitemaps, schema, busca, contagens dos três idiomas, kit) | portões verdes (223 páginas indexáveis, 17.240 links, 45 páginas de ferramenta e preset, 48 de PDF, 30 guias); `lint:texto` com 0 erro; 561 testes do Vitest; 99 de 99 no Chromium |
| (c) orçamento, anúncios, acessibilidade e CI | um script próprio que segue os imports estáticos de cada página contra o `dist-base`; o tamanho das ilhas; `budgets`, `i18n-budgets`, `ads`, `fo-ad-map`, `layout-shift` (bloco da F18), `a11y` (bloco da F18) e os testes dos ícones; o `--list --shard` das partes | 211 de 214 páginas antigas com os mesmos JS (as 3 outras são os guias de localização, como o § 741 diz); as 15 novas com 2 arquivos cada; ilhas +44 B e +1.110 B; os números dos § 735, § 741 e § 742 reproduzidos |
| (d) motor | o diff de `src/engine` e de `scripts/oss` contra o `39d1341`; o `strip.ts` inteiro; o Vitest do `organize`, do `strip`, do pacote do motor; casos de borda próprios no Node | nenhuma lacuna nas duas operações; o mapeamento da Espelhar conferido pela conta (meia volta e `flipV` dão o espelho horizontal puro) |
| (e) privacidade | `image-privacy`, `pdf-privacy`, `launch-claims` e `events` nos dois navegadores; Vitest de `strip-op`, `consent`, `matrix-lib`, `engine-process` e `guides-measured`; o diff procurando armazenamento, `pushState`, `fetch`, `sendBeacon` e parâmetros de URL; as afirmações da página do Remover dados EXIF contra o `strip.ts` | 72 de 72 em cada navegador; 88 testes do Vitest; nenhum vazamento, nenhuma chave nova, nenhuma dependência nova; o `OUTCOMES` só com os dois valores novos |

## Os achados e os céticos

| Id | Lente | Sev. da lente | Achado | Cético | Destino |
| --- | --- | --- | --- | --- | --- |
| a-1 | a | médio | O card do Remover dados EXIF diz que a foto não mudou, e um PNG com `eXIf` girado aparece diferente no Chromium | refutado (baixo): a frase é a que a decisão 10 pede, os pixels são os mesmos, e o caso já está no § 732 e no F18 m-1 | nada (já registrado) |
| b-1 | b | médio | O comentário do `scripts/guides/lib/browser.ts` e o "F9 comentário guias" mexidos fora do escopo | refutado: a pendência trazia o próprio gatilho (a próxima medida dos guias), que a F18 cumpriu, e o § 733 registra | nada |
| b-2 | b | baixo | O índice de componentes do design system não lista o README novo da grade | refutado | nada |
| b-3 | b | baixo | O § 739 não traz o número do runner do WebP | refutado: a frase foi resolvida pela medida da máquina, e o número vai na descrição da PR, como o prompt manda | nada |
| c-1 | c | baixo | A parte 4/14 do WebKit, com o `clearance` inteiro, pode passar de 700 s | refutado: o § 747 a dá como projeção (pessimista 764 s); só a execução completa do CI mede | nada |
| d-1 | d | baixo | Um PNG com `eXIf` girado aparece deitado no Chromium depois do `strip` | refutado: já no § 732 e no F18 m-1 | nada (já registrado) |
| E-1 | e | médio | O `launch-claims.spec.ts` sem nenhuma das cinco páginas novas, e o `pdf-privacy.spec.ts` sem as duas presets de PDF | refutado, lendo o critério 5 como "os specs passam" | corrigido assim mesmo, pela leitura mais rigorosa (§ 701): `e2b4039` |
| E-2 | e | baixo | O `stripJpeg` guarda a miniatura de um JFIF, e a página promete que a miniatura sai | **confirmado (baixo)** | corrigido no motor: `2c213cb` (§ 749) |
| E-3 | e | baixo | "A foto não mudou" e "cada pixel fica igual" são mais largos que a exceção do PNG com `eXIf` | refutado: o mesmo caso do a-1 | nada (já registrado) |

Nenhum achado alto. A lente (a) deixou uma nota fora dos achados: a frase "much closer in size" das páginas de texto da PDF para PNG não cobria o WebKit, onde o PNG chega à metade do JPG; ela foi corrigida com o resto (`e556e7a`, § 729).

## As correções

| Commit | O que corrige | A prova |
| --- | --- | --- |
| `2c213cb` | E-2: o APP0 JFIF fica só com o cabeçalho de 14 bytes, a miniatura em 0 × 0 e o comprimento em 16 | três testes no `tests/unit/strip.test.ts`, dois reprovando no código antigo ("expected … not to contain 'JFIF-THUMBNAIL-PIXELS'"); a saída das 11 fixtures igual byte a byte; a matriz de imagem verde nos dois navegadores; o pacote do motor com a mudança |
| `e2b4039` | E-1: as cinco páginas no `launch-claims.spec.ts`, as duas presets de PDF no `pdf-privacy.spec.ts` (`TOOLS` e `DRAWS`) | os 18 casos novos reprovam no `dist-base` (404); 108 testes verdes nos dois navegadores |
| `e556e7a` | A nota da lente (a): as frases de tamanho do PNG nos três idiomas e o limite de baixo (0,4) da matriz | com o limite em 0,45 o caso reprova com "Received: 0.44459936362680635"; os casos da F18 do `pdf-matrix` verdes nos dois navegadores, a tabela regerada igual |

## A segunda passada

As lentes a, d e e, sobre o diff `31b9770..e556e7a`, na mesma worktree no `e556e7a` (com o `dist` refeito nele).

| Id | Sev. | Achado | Destino |
| --- | --- | --- | --- |
| A2-1 | médio | A frase nova falava de "página", e a medida e a matriz somam as páginas de cada PDF; por página, a razão vai de 0,39 a 2,9 | corrigido: as frases falam do PDF inteiro, nos três idiomas (`dd8281d`, § 729) |
| A2-2 | baixo | O comentário do limite citava 0,40, que é a 300 ppi; o teste roda a 150 ppi, onde o mínimo é 0,44 | corrigido: `e03c065` |
| A2-3 | baixo | O limite de cima só foi medido por PDF | sem mudança (a própria lente) |
| d-1 | médio | A mudança do motor sem § no `DECISOES.md` | resolvido pelo § 749 |
| d-2 | baixo | Os testes novos não prendiam o JFIF curto nem o JFXX | corrigido: dois casos sintéticos, cada um reprovando com o mutante dele (`80363f7`) |
| E2-1 | baixo | O `image-privacy.spec.ts` sem caso de sentinela para o Remover dados EXIF e a Espelhar | corrigido: dois casos, reprovando no `dist-base` (404) e verdes nos dois navegadores (`6c55333`) |

Depois das correções da segunda passada: `pnpm tipos` 0 erro, `pnpm lint` limpo, `lint:texto` 0 erro, o Vitest dos arquivos tocados verde (199), o `strip.test.ts` do pacote do motor verde (16), os casos da F18 do `pdf-matrix` verdes nos dois navegadores com a tabela igual, o `image-privacy` verde nos dois (20).

## O que sobrou

Nenhum achado aberto, alto, médio ou baixo. Nenhum baixo novo foi para o grupo 28 do `docs/PENDENCIAS.md`: os refutados que tratam da Orientation do PNG e da WebP já são o F18 m-1, e a parte 4/14 do WebKit fica para a execução completa do CI (§ 747).
