# Revisão adversarial da F17

A revisão final da run F17 ("AVIF para JPG e Converter para WebP/AVIF", a run 2b: o AVIF to JPG e o Convert to WebP em en, pt e es, a recusa do AVIF com o link ao conversor, o lugar das duas no site, a matriz e a medida do codificador AVIF), contra a ficha da F17 do `PLANO-UX-QV.md`, o prompt (`docs/prompts/prompt-fase-17.txt`) e o plano (`docs/relatorios/fase-17-plano.md`).

## O método

- **O commit fixo:** `c4002c6` da branch `fase-17` (as três frentes juntas e conferidas, com os § 701 a 718, os documentos, as pendências, a matriz e as imagens), numa worktree só de leitura (`.claude/worktrees/revisao-f17`, `git worktree add --detach`), com o próprio `pnpm install --frozen-lockfile`, o próprio `pnpm build` (o `dist/build.txt` igual ao commit) e o próprio build de teste (feito antes das lentes, com a árvore limpa, para as três o reusarem).
- **Três lentes Sonnet em contexto limpo** (a F17 é fase de interface e de texto, e o motor não mudou; regra 3 de toda run): (a) as ferramentas e a privacidade, (b) o site, o SEO e os idiomas, (c) o orçamento, os anúncios, a acessibilidade e o CI. Cada uma com o próprio `FO_PORT` (4301, 4321 e 4341; o build de teste no `FO_PORT` + 100), a própria `--output` e escrevendo só em `.cache/lente-<x>/` da worktree, apontando só lacunas de correção ou de requisito, nunca preferência de estilo.
- **Os céticos:** um próprio para cada achado médio ou acima (nenhum houve) e um para os baixos de cada lente que os teve (a lente b), com a regra "na dúvida, refutado". Foram 4 agentes ao todo.
- **As correções:** o único achado que sobreviveu é de documento e se resolve com o § 719, que é do agente principal (só ele escreve no `DECISOES.md`); nenhum agente de correção de código foi preciso. A segunda passada da lente b revisou o diff dos documentos (abaixo).

## O que as lentes viram

- **(a) As ferramentas e a privacidade:** o `git diff 624a168..c4002c6 -- src/engine` vazio; o `image-matrix.spec.ts` e o `image-presets.spec.ts` nos dois navegadores numa execução, 58 passaram (1,7 min), com a tabela da matriz conferida contra a decisão 10 (as oito fixtures em WebP em dois lotes, as quatro pequenas em AVIF, nunca a de 12 MP nem a `gen-grande`, o maior lote do WebKit com 7,2 s, nenhuma requisição para fora do 127.0.0.1); o `handoff`, o `image-smoke`, o `image-privacy`, o `image-avif-speed`, o `events` e o `share-target` nos dois, 118 passaram (o `[avif 12 MP]` deu 1,9 s nos dois, com as outras lentes na máquina). Sondas próprias nos dois navegadores: o Convert to WebP em AVIF e Strong com a `jpg-03` (GPS, Orientation 3) e a PNG transparente (AVIF 3264 × 2448 sem Exif, XMP nem GPS e sem plano alfa; AVIF 800 × 600 com plano alfa; o "Ajustar" com "AVIF · Strong"; os dois chips sem levar); o AVIF to JPG em pt e es com a `gen-avif.avif` e o AVIF com alfa (dois JPG sem metadados); um AVIF e um HEIC largados em 14 páginas de en, pt e es, com a frase exata ("an AVIF file", "a HEIC file") e o `href` do idioma; o AVIF sozinho recusado em três páginas; nenhuma requisição fora do 127.0.0.1, do `blob:` e do `data:`. **Nenhum achado.**
- **(b) O site, o SEO e os idiomas:** o `gate:seo` (208 páginas indexáveis, hreflang recíproco, 3 sitemaps), o `gate:links` (15.882 links em 217 páginas, nenhuma órfã) e o `gate:conteudo` (39 páginas de ferramenta e de preset); o Vitest de 18 arquivos (rotas, hub, ícones, home, conteúdo, textos, registro, "Abrir com", kit, SEO, contagens, `english-leak`, `glossary`, `pendencias`, `claude-md`), 306 passaram; o `lint:texto` com 33 arquivos, 2.271 textos e 0 erro de gramática; o `share-target`, o `tool-i18n`, o `header-menu`, o `navigation` e o `launch-claims` no Chromium, 146 passaram; o `--list` com 2.470 testes em 85 arquivos. No `dist/`: as seis páginas com o título, o H1, o canônico, o hreflang, a OG, o schema e o sitemap certos; as descrições com 138, 144, 160, 159, 124 e 150 caracteres; os manifests com 15 entradas; a "Abrir com" com 22 cartões e o `noTool` com o AVIF; o hub com dez em cada idioma; a busca por "avif"; nenhuma frase "AVIF files are not accepted" sobrando. O kit recontado (o `alternativeto.md` com 146 e 748, o `diretorios.md` e o r/SideProject) confere, sem nenhum `<!-- muda com a 2b -->` restante. **Um achado baixo** (b-1).
- **(c) O orçamento, os anúncios, a acessibilidade e o CI:** o `budgets.spec.ts` e o `i18n-budgets.spec.ts` nos dois navegadores, 710 passaram (11,0 min); um script próprio comparando o `dist/` com o `dist-base` página por página (0 das 208 páginas do ponto de partida mudou de lista; as 6 novas com a entrada própria e o `island`) e os arquivos de `_astro/` (só as duas entradas novas, 221 e 399 B com gzip); o grupo `island` 4 B menor; o `ads`, o `fo-ad-map`, o `layout-shift` e o `a11y` das páginas da F17 e dos hubs, 120 passaram nos dois navegadores (os hubs de imagem com 2 caixas e 12,3 % a 360 px; o teste da `lateral-2`); o Lighthouse de duas páginas remedido (99/100/100/100 e 100/100/100/100, CLS 0); o `hub-icons` e o `icons`, 22 passaram, os SVG só com LF; o `--list --shard` das 22 partes (os testes novos nas partes que a § 712 e a § 717 dizem, o `clearance.spec.ts` inteiro na 4 do WebKit) e a afirmação "nenhuma parte acima de 700 s por causa desta run" sustentada. **Nenhum achado.**

## Os achados

1 achado das três lentes: 1 baixo, confirmado pelo cético e resolvido. Nenhum achado alto ou médio, aberto ou fechado.

| Id | Lente | Sev. da lente | Sev. final (cético) | Achado | Destino |
| --- | --- | --- | --- | --- | --- |
| b-1 | b | baixo | baixo (confirmado) | A seção F17 do `docs/claude/imagem.md` abre com "(DECISOES § 701 a § 719)", e o `DECISOES.md` do `c4002c6` termina no § 718: a referência apontava para um § que ainda não existia | resolvido: o § 719 (este relato) entrou no `DECISOES.md`, e a referência passou a conferir; a seção do `imagem.md` não mudou |

## A segunda passada

- **Lente b,** sobre o diff dos documentos depois do `c4002c6` (o § 706 com o contraste dos ícones, o § 719, este relato e o relatório): PREENCHER_SEGUNDA.

## O que fica

Nada novo para o grupo 27 do `docs/PENDENCIAS.md`: o único achado foi resolvido. As duas linhas do grupo 27 (F17 m-1, a medida do runner; F17 m-2, o "menor arquivo" do glossário de pt) são as que a run já tinha registrado.
