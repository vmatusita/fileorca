# F17 · relatório

A quarta das cinco runs do `PLANO-UX-QV.md` ("AVIF para JPG e Converter para WebP/AVIF", a run 2b), com a ficha no plano (a ficha da F17, com o D15) e o prompt em `docs/prompts/prompt-fase-17.txt`; o plano da run está em `docs/relatorios/fase-17-plano.md`. Ponto de partida: `624a168` (a F16, PR 32). PR: [vmatusita/fileorca#33](https://github.com/vmatusita/fileorca/pull/33), da branch `fase-17`.

## Resumo

1. Duas ferramentas novas de imagem, nos três idiomas: o AVIF to JPG (AVIF para JPG, AVIF a JPG), que transforma um AVIF em JPG com a transparência em branco e avisa, e o Convert to WebP (Converter para WebP, Convertir a WebP), que transforma JPG e PNG em WebP ou AVIF, Recomendada ou Forte, guardando a transparência.
2. Um AVIF largado em qualquer outra ferramenta de imagem diz "photo.avif is an AVIF file. Open it in AVIF to JPG.", com o link no idioma da página, como o HEIC.
3. As duas estão no hub de imagem (agora dez ferramentas), na home, no rodapé, no menu, na busca ("avif" acha as duas), na "Abrir com" e no compartilhar do celular; o Converter para WebP volta a ser o 3º chip do Comprimir.
4. Nada sai do aparelho: as saídas não levam metadados nem GPS, e o codificador e o decodificador AVIF só são buscados num gesto.
5. O kit de lançamento conta dez ferramentas de imagem, e as linhas marcadas para a 2b dizem o que o site faz hoje.

## O que entrou, por item da ficha

### 1. As duas ferramentas (fatia 1; § 703 a § 705)

- `src/tools/avif-to-jpg/` e `src/tools/convert-to-webp/`: o `Panel.tsx` (o `ImageTool`: `accepts`, `warm: []`, `success: 'converted'`, a operação `{ kind: 'convert', to: 'jpeg' }` ou `{ kind: 'convert', to, level }`, as opções e o `now` "WebP · Recommended"), o `mount.ts`, a página no molde (`AvifToJpgPage.astro`, `ConvertToWebpPage.astro`) e os textos `i18n/{en,pt,es}.ts`; as seis páginas em `src/pages/`.
- O registro (`src/tools/image/registry.ts`: `IMAGE_TOOL_IDS`, `IMAGE_PAGES`, `CONVERTER_FOR`), as rotas (`src/i18n/routes.ts`: `RouteId`, `TRANSLATED_PATHS`, `imageToolRoutes`), o tipo `ConvertToOptionsTexts` (`src/i18n/types.ts`), os textos (`src/tools/image/texts.ts`), os cartões dos três `common.ts`, o `IMAGE_EVENT_TOOLS` e a tabela de ferramentas do glossário (`docs/i18n/pt.md` e `es.md`).
- Os textos em inglês vêm do rascunho da F2, conferidos contra o motor (§ 704), com a frase de suporte pela página do caniuse lida em 10/nov/2026. O pt e o es, escritos na fatia 1 e revistos pela frente T (§ 703). O `src/engine/` não mudou.

### 2. Os ícones (frente S; § 706)

- Dois desenhos novos em `docs/design/assets/Icons/`: `image-stack` (AVIF to JPG) e `image-fast` (Convert to WebP), no `ICON_NAMES` (`src/icons/svg.ts`), no README dos ícones (74) e no `icons.test.ts`; o contraste do par do cartão de imagem, 6,94:1 nos dois temas.
- O `hub-icons.test.ts` ganhou o teste dos dois desenhos no hub e na home de cada idioma.

### 3. O `next`, o `related` e o chip que leva (frente S; § 707)

- O `next` e o `related` das irmãs voltam ao do `3812f49^`: o Converter para WebP é o 3º chip do Comprimir e do preset de 1 MB, e as duas voltam às relacionadas das irmãs. O `carry.chips` ganhou o `convert-to-webp` nos três idiomas.
- `tests/unit/image-registry.test.ts` (novo, 8 testes) e o `handoff.spec.ts` (o chip do Comprimir leva o JPG; com AVIF na saída, nenhum chip leva).

### 4. A recusa do AVIF (frentes T e M; § 708)

- `CONVERTER_FOR.avif = 'avif-to-jpg'`; o `errors.wrongTool` virou `{ heic, avif }`, uma frase por formato com o artigo escrito, e o `ImagePanel.tsx` escolhe pela chave.
- O `image-texts.test.ts` confere as 72 frases exatas, e a matriz confere a linha inteira com o link em en, pt, es e nas presets.

### 5. Os textos e as contagens (frente T; § 709)

- As 15 linhas de especificação que diziam que o AVIF não é aceito mandam o AVIF ao AVIF para JPG; a "Abrir com" sem ferramenta lista o AVIF; o hub diz dez, com uma linha nova por ferramenta no guia; as contagens calculadas ganharam 2 nos três idiomas; os comentários que contam e as amostras do `lint:texto` dizem 10, 48, 31 e 37.

### 6. O lugar no site (frente S; § 710)

- Nenhum leitor do registro mudou de código: o hub, a home, o rodapé, o menu, a busca, a 404, a OG, o sitemap, o hreflang, o schema, a "Abrir com" e o `share_target` (o `accept` com `image/avif` e `.avif`) pegam as duas sozinhos. O GA4 só ganhou os dois valores do `tool`.

### 7. A matriz e a medida do AVIF (frente M; § 711 e § 712)

- `tests/e2e/lib/matrix.ts` e `image-matrix.spec.ts`: o Convert to WebP em WebP com as oito fixtures que aceita (dois lotes), em AVIF com as quatro pequenas, e o AVIF to JPG com a `gen-avif.avif` e o AVIF com alfa feito no mesmo teste; a sonda do AVIF no navegador; a frase exata da recusa; cada página com 200.
- `tests/e2e/image-avif-speed.spec.ts` (novo): `[avif 12 MP] <navegador> <s>`.
- Os outros specs que ganharam as páginas: `image-smoke`, `handoff`, `image-privacy`, `launch-claims`, `events`, `budgets`, `a11y`, `layout-shift`, `tool-slot`, `ads`, `fo-ad-map` (184 → 190) e o `lib/ad-clearance.ts`.

### 8. O kit de lançamento (§ 713)

- `docs/lancamento/`: "10 image tools" no `product-hunt.md` (as contagens de caracteres refeitas), as linhas `<!-- muda com a 2b -->` do `show-hn.md`, do `alternativeto.md`, do `diretorios.md` e do `README.md`; a galeria não foi regerada (nenhuma imagem mostra a contagem nem o hub).

### Os documentos e as pendências

- `DECISOES.md`: § 701 a § 719 (abaixo).
- `docs/claude/`: seções novas no fim do `imagem.md`, do `playwright.md`, do `idiomas.md`, do `windows-git-bash.md`, do `design-e-oli.md` e do `ci.md`.
- `docs/PENDENCIAS.md`: o F2 2b em "Já corrigidos"; o grupo 13 fechado; o grupo 27, "O que a F17 deixou" (2 linhas: F17 m-1, a medida do runner; F17 m-2, o "menor arquivo" do glossário de pt). O total foi de 189 para 190 linhas. O F14 m-1 continua aberto: o `PLANO-FILEORCA.md` não tinha diferença no começo da run (§ 702).

## A evidência de cada critério da ficha

| # | Critério | Prova | Resultado |
|---|---|---|---|
| 1 | A matriz das duas com cada fixture que elas aceitam, nos dois navegadores | `image-matrix.spec.ts` e `image-presets.spec.ts` numa execução, `--workers=4`, no `d84ebfc` | **58 passaram (52,3 s)**; a tabela em `docs/relatorios/fase-17-matriz.md`. Controle negativo no `dist-base`: 9 reprovam ("/convert-to-webp/ exists — Expected: 200, Received: 404"; "Received string: gen-avif.avif is in AVIF format, which this tool doesn't take. Try JPG, PNG or WebP.") |
| 2 | A recusa de AVIF nas outras ferramentas com o link novo | `image-texts.test.ts` (72 frases), a matriz (en em todo lote, pt, es e as presets) e a tabela da recusa abaixo (36 páginas no navegador) | passa. Controles: "Expected: photo.avif is an AVIF file. Open it in AVIF to JPG. / Received: photo.avif is a AVIF file. Open it in AVIF to JPG." (o mutante do artigo); no `dist-base`, "Received: gen-avif.avif é um arquivo AVIF. Tente um arquivo JPG, PNG ou WebP." |
| 3 | O `gate:seo`, o `gate:links`, o `gate:conteudo` e o `launch-kit.test.ts` verdes | o `verificar --partes` (portões) e o Vitest | "seo: ok, 208 páginas indexáveis em 3 idiomas"; "links: ok, … nenhuma órfã"; "conteúdo: ok, 39 página(s) de ferramenta e de preset"; o `launch-kit.test.ts` com 10 testes. Controle: com o registro de dez e o kit antigo, o `launch-kit.test.ts` reprova em "equal the registries, in every phrase and in the counts line" |
| 4 | Cada página nova com os mesmos 2 arquivos JS e 6 requisições das irmãs | `budgets.spec.ts` (o teste novo: as requisições iguais às da irmã, uma a uma) e `i18n-budgets.spec.ts` | 2 arquivos e 6 requisições no Chromium (7 no WebKit, como a irmã), 28,1 a 28,3 KB com gzip; no `dist-base` os testes novos reprovam com "Expected: 200, Received: 404" |
| 5 | A densidade de anúncio em até 30 % a 360 × 740 | `ads.spec.ts` e `fo-ad-map.spec.ts` no build de teste | AVIF to JPG 17,8–18,5 %, Convert to WebP 16,4–17,3 %; o menor vão de 446 a 503 px a 360 e 150 px a 1280 |
| 6 | Nenhuma parte do CI acima de 700 s | a projeção (§ 717) e a execução completa final | nenhuma parte passa de 700 s por causa desta run; a 4 do WebKit (o `clearance.spec.ts`, F14 m-5) já passava no ponto de partida (746,0 s) e fica em ~745 s. A execução completa: na descrição da PR |
| 7 | O `pnpm verificar` verde | `pnpm verificar --partes` no `4d6d2ce` | as 25 partes passaram, soma 3.096,8 s (saída abaixo) |

E os critérios do prompt:

- **O "Dentro" da ficha** entrou inteiro, com a medida do AVIF no § 712; a válvula não cortou nada.
- **Nenhum item do "Fora"** foi tocado: `git diff --stat 624a168 -- src/engine fixtures lighthouserc.json .github .githooks .claude/settings.json PLANO-FILEORCA.md PLANO-MELHORIAS.md PLANO-UX-QV.md CLAUDE.md src/share src/sw src/calc src/tools/calc src/tools/pdf tests/e2e/clearance.spec.ts docs/relatorios/fase-02-matriz.md package.json pnpm-lock.yaml` não lista nenhum arquivo; nenhuma dependência, chave de storage, evento ou parâmetro novo.
- **Nada sai do aparelho:** o `image-privacy.spec.ts` (a foto com GPS vira AVIF e volta a JPG; os `.wasm` de AVIF são os do pacote; nada fora da origem), o `launch-claims.spec.ts` e o `events.spec.ts` (os eventos das duas com o `tool` igual ao id e nenhum parâmetro novo) passam com as páginas novas.
- **Os textos:** o `lint:texto` com 33 arquivos, 2.271 textos e **0 erro de gramática** (602 avisos: siglas e "apps", como no resto do site); o `english-leak`, o `glossary`, o `claude-md` e o `pendencias` passam.
- **O Lighthouse, o axe e o CLS:** 99/100/100/100 nas seis, o axe sem violação nos dois temas e navegadores com o resultado e a recusa, e o CLS sem gesto 0,000 (§ 715).
- **Os documentos** das decisões 11, 16 e 17: o kit (§ 713), o `docs/claude/` e o `docs/PENDENCIAS.md`.
- **Os testes antigos que mudaram:** na § 716, um por um; nenhum teste foi pulado, desligado ou afrouxado.
- **A revisão:** em `docs/relatorios/REVISAO-F17.md` (§ 719), sem achado alto ou médio aberto.

## As tabelas

### A matriz

O resumo por teste e navegador (de `docs/relatorios/fase-17-matriz.md`, onde estão as células de cada fixture). O WebKit 27.2 do Windows não abre AVIF: lá as saídas AVIF foram conferidas pelos bytes, e o AVIF to JPG leu o AVIF com o decodificador do site.

| Teste | Opções | Arquivos | Saídas | Recusados | Chromium | WebKit |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `convert-to-webp-webp-photos` | WebP, Recommended | 10 | 3 | 7 | 3,0 s | 7,2 s |
| `convert-to-webp-webp-rest` | WebP, Recommended | 12 | 5 | 7 | 2,8 s | 4,8 s |
| `convert-to-webp-avif` | AVIF, Recommended | 11 | 4 | 7 | 1,8 s | 3,2 s |
| `avif-to-jpg` (no mesmo teste) | JPG | 10 | 2 | 8 | 1,0 s | 2,5 s |
| os 18 lotes das outras ferramentas | | | | | 0,8 a 5,8 s | 1,6 a 6,2 s |

O maior lote do WebKit (7,2 s) fica abaixo dos 9,5 s da § 88. A transparência: o `gen-png-transparente.png` sai AVIF 800 × 600 com plano alfa ("transparência mantida"), e o mesmo AVIF, no AVIF to JPG, sai JPG 800 × 600 com os cantos brancos ("transparência em branco") e a nota no card.

### A recusa: a linha de um AVIF em cada ferramenta e idioma

Medida no navegador (Chromium, `photo.avif` = `fixtures/images/gen-avif.avif`), no `dist-base` e no `dist/`. Depois, o nome do conversor é um link para o AVIF to JPG do idioma; antes, nenhuma tinha link.

| Página | Antes | Depois |
| --- | --- | --- |
| en: Compress image, to 100 KB, to 1 MB, Resize image, YouTube thumbnail, Crop image, Rotate image, Image to PDF | photo.avif is in AVIF format, which this tool doesn't take. Try JPG, PNG or WebP. | photo.avif is an AVIF file. Open it in [AVIF to JPG]. |
| en: HEIC to JPG | … Try HEIC or HEIF. | photo.avif is an AVIF file. Open it in [AVIF to JPG]. |
| en: WebP to JPG | … Try WebP. | photo.avif is an AVIF file. Open it in [AVIF to JPG]. |
| en: PNG to JPG | … Try PNG or JPG. | photo.avif is an AVIF file. Open it in [AVIF to JPG]. |
| en: Convert to WebP | (a página não existia: 404) | photo.avif is an AVIF file. Open it in [AVIF to JPG]. |
| pt: Comprimir imagem, para 100 KB, para 1 MB, Redimensionar imagem, Miniatura do YouTube, Cortar imagem, Girar imagem, Imagem para PDF | photo.avif é um arquivo AVIF. Tente um arquivo JPG, PNG ou WebP. | photo.avif é um arquivo AVIF. Abra-o em [AVIF para JPG]. |
| pt: HEIC para JPG, WebP para JPG, PNG para JPG | … Tente um arquivo HEIC ou HEIF. / … WebP. / … PNG ou JPG. | photo.avif é um arquivo AVIF. Abra-o em [AVIF para JPG]. |
| pt: Converter para WebP | (404) | photo.avif é um arquivo AVIF. Abra-o em [AVIF para JPG]. |
| es: Comprimir imagen, a 100 KB, a 1 MB, Redimensionar imagen, Miniatura de YouTube, Recortar imagen, Rotar imagen, Imagen a PDF | photo.avif es un archivo AVIF. Prueba con un archivo JPG, PNG o WebP. | photo.avif es un archivo AVIF. Ábrelo en [AVIF a JPG]. |
| es: HEIC a JPG, WebP a JPG, PNG a JPG | … Prueba con un archivo HEIC o HEIF. / … WebP. / … PNG o JPG. | photo.avif es un archivo AVIF. Ábrelo en [AVIF a JPG]. |
| es: Convertir a WebP | (404) | photo.avif es un archivo AVIF. Ábrelo en [AVIF a JPG]. |

### As contagens

Medidas no `dist-base` e no `dist/` pelo mesmo script (`.cache/f17/measure-site.mjs`).

| Lugar | en antes → depois | pt antes → depois | es antes → depois |
| --- | --- | --- | --- |
| H1 da home | 46 tools. 0 uploads. → **48** | 29 ferramentas. 0 uploads. → **31** | 35 herramientas. 0 subidas. → **37** |
| Título do hub de imagem | Image tools: eight free tools, no upload → **ten** | Ferramentas de imagem: oito ferramentas grátis, sem upload → **dez** | Herramientas de imagen: ocho gratis, sin subir archivos → **diez** |
| H1 do hub de imagem | Eight image tools, zero uploads → **Ten** | Oito ferramentas de imagem, sem upload → **Dez** | Ocho herramientas de imagen, sin subir nada → **Diez** |
| Descrição do hub | "Eight free image tools…" → "**Ten** free image tools…" | "Oito ferramentas…" → "**Dez** ferramentas…" | "Ocho herramientas…" → "**Diez** herramientas…" |
| Cartões do hub de imagem | 8 → **10** | 8 → **10** | 8 → **10** |
| Cartões da home | 38 → **40** | 29 → **31** | 27 → **29** |
| Rodapé (resumo e links) | All 8 image tools → All **10** (8 → 10 links) | Todas as 8 → Todas as **10** | Las 8 → Las **10** |
| Menu (linha do hub de imagem) | 8 tools → **10** tools | 8 ferramentas → **10** | 8 herramientas → **10** |
| Cartão da Sobre | 8 · 12 · 14 · 11 · 0 → **10** · … | 8 · 12 · 8 · 3 · 0 → **10** · … | 8 · 12 · 14 · 3 · 0 → **10** · … |
| `accept` do manifest | 13 entradas → **15** (com `image/avif` e `.avif`) | 13 → **15** | 13 → **15** |
| Busca por "avif" | nada → AVIF to JPG, Convert to WebP | nada → AVIF para JPG, Converter para WebP | nada → AVIF a JPG, Convertir a WebP |
| Kit (`product-hunt.md`) | "8 image tools" → "**10** image tools" (4 frases e a linha das contagens) | — | — |

### O orçamento

| Página | JS inicial com gzip | Arquivos JS | Requisições (Chromium / WebKit) |
| --- | ---: | ---: | ---: |
| `/avif-to-jpg/`, `/pt/avif-para-jpg/`, `/es/avif-a-jpg/` | 28,1 KB | 2 | 6 / 7 |
| `/convert-to-webp/` | 28,2 KB | 2 | 6 / 7 |
| `/pt/converter-para-webp/`, `/es/convertir-a-webp/` | 28,3 KB | 2 | 6 / 7 |
| a irmã `/webp-to-jpg/` (e pt, es) | 28,2 KB | 2 | 6 / 7 |

- **Os arquivos novos de `dist/_astro/`** (66 → 68 JS): `AvifToJpgPage.astro_astro_type_script_index_0_lang.*.js` (277 B, 221 B com gzip) e `ConvertToWebpPage.astro_astro_type_script_index_0_lang.*.js` (732 B, 399 B com gzip). Nenhum outro arquivo novo nem sumido.
- **O grupo `island`** com gzip nível 9: 23.291 B antes (`island.CMhec-MJ.js`, 68.161 B crus) e **23.288 B** depois (`island.Hheme78w.js`, 68.196 B crus).
- **As outras páginas:** as 208 do ponto de partida carregam os mesmos arquivos JS, arquivo por arquivo pelo nome sem o hash (`.cache/f17/compare-js.mjs`); as 6 novas carregam a entrada própria e o `island.js`.

### Os anúncios

| Página | Densidade a 360 × 740 | Menor vão a 360 | Menor vão a 1280 | Caixas |
| --- | ---: | ---: | ---: | ---: |
| AVIF to JPG (en, pt, es) | 17,8–18,5 % | 446 a 503 px (por estado: repouso, processando, resultado, fila) | 150 px | 2, de 1.446 a 1.690 px entre elas |
| Convert to WebP (en, pt, es) | 16,4–17,3 % | 446 a 503 px | 150 px | 2 |

Os hubs de imagem passaram de 600 palavras e ganharam a `lateral-2` no computador, pela regra do mapa (§ 715).

### O Lighthouse das seis páginas (celular, três execuções, a representativa)

| Página | Desempenho | Acessibilidade | Boas práticas | SEO | CLS | LCP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/avif-to-jpg/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/convert-to-webp/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/pt/avif-para-jpg/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |
| `/pt/converter-para-webp/` | 99 | 100 | 100 | 100 | 0,000 | 1,97 s |
| `/es/avif-a-jpg/` | 99 | 100 | 100 | 100 | 0,000 | 1,97 s |
| `/es/convertir-a-webp/` | 99 | 100 | 100 | 100 | 0,000 | 1,88 s |

### A medida do AVIF (`[avif 12 MP]`, a `jpg-01-pixel2-retrato-gps.jpg`, 3024 × 4032)

| Onde | Chromium | WebKit |
| --- | --- | --- |
| Máquina, rodada 1 | 1,9 s | 1,5 s |
| Máquina, rodada 2 | 1,4 s | 1,5 s |
| Máquina, rodada 3 | 1,4 s | 1,5 s |
| Runner (execução completa final) | na descrição da PR | na descrição da PR |

### Os ícones

| Ferramenta | Ícone | Desenho | Onde aparece |
| --- | --- | --- | --- |
| AVIF to JPG | `image-stack` | a foto na frente e a cópia atrás, só no alto e à direita | cartão no hub de imagem e nas homes, "Abrir com", relacionadas do HEIC, do WebP e do PNG to JPG e do Convert to WebP, OG, busca |
| Convert to WebP | `image-fast` | a foto com três linhas de velocidade à esquerda | cartão no hub e nas homes, "Abrir com", relacionadas do Compress, do Resize, do AVIF to JPG e do WebP e do PNG to JPG, chip do Compress e do preset de 1 MB, OG, busca |

## Os testes

- **Vitest:** 136 arquivos e 2.144 testes no ponto de partida; 137 arquivos e 2.159 testes no fim (o `image-registry.test.ts`, 8, e os testes novos do `image-hub`, `hub-icons`, `open-with`, `image-tool-ops`, `image-texts` e `matrix-table`), todos verdes.
- **Playwright `--list`:** 2.406 testes em 84 arquivos por navegador no ponto de partida; 2.440 na fatia 1 (as páginas novas entraram sozinhas nos specs que leem o registro); **2.470 em 85** no fim (o `image-avif-speed.spec.ts` é o arquivo novo; a matriz +8, o `a11y` +6, o `budgets` +4, o `launch-claims` +2, o `events`, o `ads` +2 cada, o `share-target`, o `handoff`, o `image-privacy`, o `image-smoke` e o `layout-shift` +1 cada).
- **A junção** (`d84ebfc`, as três frentes): o `pnpm tipos` com 0 erro, o `pnpm lint` limpo, o build com 217 páginas, o Vitest inteiro verde; os specs das frentes nos dois navegadores, **1.518 passaram (13,4 min)**; a matriz e as presets, 58; os de anúncio no build de teste, 392 de 394 e os 2 do teste da `lateral-2` depois do exemplo novo (§ 715).
- **Os testes antigos que mudaram** (§ 716, 25 itens): os da recusa (`image-texts`, `lib/matrix.ts`), as contagens (`tool-count`, `home`, `image-hub`, `conteudo`, `routes`, `seo-checks`, `seo-pages`, `prontidao`, `footer-phone`), o `accept` (`open-with`, `share-target`), os ícones (`icons`), as operações (`image-tool-ops`), o chip (`handoff`), o mapa de anúncios (`fo-ad-map`, 184 → 190 e o exemplo da página curta), a tabela da matriz e as pendências (`pendencias`).

## O `pnpm verificar --partes`

No commit `4d6d2ce` (o último, com a revisão e o § 719; o código é o da junção e da correção do `fo-ad-map.spec.ts`, `349c67a`), com a máquina livre, em 10/nov/2026 (de 17:20 a 18:12):

```text
Resumo das partes do CI (pnpm verificar --partes, 25 partes lidas de .github/workflows/ci.yml)
  ok      46.4 s  build: pnpm verificar --build
  ok      85.9 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     390.7 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok      98.4 s  playwright: pnpm verificar --playwright=chromium --shard=1/8 --dist-pronto
  ok     136.5 s  playwright: pnpm verificar --playwright=chromium --shard=2/8 --dist-pronto
  ok     113.3 s  playwright: pnpm verificar --playwright=chromium --shard=3/8 --dist-pronto
  ok     145.7 s  playwright: pnpm verificar --playwright=chromium --shard=4/8 --dist-pronto
  ok      97.4 s  playwright: pnpm verificar --playwright=chromium --shard=5/8 --dist-pronto
  ok     157.6 s  playwright: pnpm verificar --playwright=chromium --shard=6/8 --dist-pronto
  ok     101.7 s  playwright: pnpm verificar --playwright=chromium --shard=7/8 --dist-pronto
  ok     106.5 s  playwright: pnpm verificar --playwright=chromium --shard=8/8 --dist-pronto
  ok      68.6 s  playwright: pnpm verificar --playwright=webkit --shard=1/14 --dist-pronto
  ok     100.4 s  playwright: pnpm verificar --playwright=webkit --shard=2/14 --dist-pronto
  ok      97.0 s  playwright: pnpm verificar --playwright=webkit --shard=3/14 --dist-pronto
  ok     364.3 s  playwright: pnpm verificar --playwright=webkit --shard=4/14 --dist-pronto
  ok      34.3 s  playwright: pnpm verificar --playwright=webkit --shard=5/14 --dist-pronto
  ok     145.8 s  playwright: pnpm verificar --playwright=webkit --shard=6/14 --dist-pronto
  ok      95.4 s  playwright: pnpm verificar --playwright=webkit --shard=7/14 --dist-pronto
  ok      52.6 s  playwright: pnpm verificar --playwright=webkit --shard=8/14 --dist-pronto
  ok      99.2 s  playwright: pnpm verificar --playwright=webkit --shard=9/14 --dist-pronto
  ok     114.0 s  playwright: pnpm verificar --playwright=webkit --shard=10/14 --dist-pronto
  ok     135.1 s  playwright: pnpm verificar --playwright=webkit --shard=11/14 --dist-pronto
  ok     117.8 s  playwright: pnpm verificar --playwright=webkit --shard=12/14 --dist-pronto
  ok      78.2 s  playwright: pnpm verificar --playwright=webkit --shard=13/14 --dist-pronto
  ok     114.0 s  playwright: pnpm verificar --playwright=webkit --shard=14/14 --dist-pronto
  soma 3096.8 s (parede 3096.8 s; cada parte com o limite de 900 s)
```

Todas as 25 partes passaram, com a parte maior no Lighthouse (390,7 s) e, no Playwright, a 4 do WebKit (364,3 s, a do `clearance.spec.ts`, como antes; F14 m-5). As partes dos specs novos: a 5 do Chromium (97,4 s, o `image-avif-speed` e o começo da matriz), a 6 do Chromium (157,6 s, a matriz) e a 9 do WebKit (99,2 s, a matriz e o `image-avif-speed`). No Playwright, 4.932 testes passaram e 8 foram pulados pelo próprio teste, todos no WebKit e anteriores à run (as medidas de CLS e de CPU lenta que só o Chromium faz: dois do `money-card`, quatro do `pdf-merge`, um do `guide-page` e um do `island-pdf-view`); nenhum instável.

A primeira execução (de 16:54 a 17:19, no mesmo commit) parou na parte 7 do Chromium: um `page.goto` do `money-privacy.spec.ts` em `/es/calculadora-de-refinanciamiento/` caiu com `net::ERR_NO_BUFFER_SPACE` (os soquetes do Windows; a pegadinha do `docs/claude/playwright.md`, que manda rodar de novo). As 9 partes anteriores tinham passado. A segunda execução, inteira e do zero, é a de cima.

O resto do `verificar`: o Vitest com 137 arquivos e 2.159 testes; os tipos com 0 erro; o `lint:texto` com 33 arquivos, 2.271 textos e 0 erro de gramática (602 avisos); o `gate:seo` (208 páginas indexáveis em 3 idiomas, hreflang recíproco, 3 sitemaps), o `gate:links` (15.882 links internos em 217 páginas, nenhuma órfã), o `gate:conteudo` (39 páginas de ferramenta e de preset), o `gate:prontidao` (22 itens), o `gate:design` (217 páginas e 1 CSS), o `gate:licencas` (os mesmos pacotes: o `package.json` e o `pnpm-lock.yaml` sem diff) e o `gate:dinheiro-saude` (70 páginas), todos ok.

## A projeção das partes do CI

A projeção com os tempos da execução completa da PR 32 e o `--list --shard` da junção (§ 717; `.cache/f17/fronts/M-project.mjs`): nenhuma parte passa de 700 s por causa dos testes desta run. A 4 do WebKit, com o `clearance.spec.ts` (F14 m-5), fica em ~745 s (746,0 s no ponto de partida; +6 s de soma desta run); a maior do Chromium, ~575 s (a 4); a 9 do WebKit, onde cai a matriz, ~355 s. A tabela de todas as partes está na § 717. O tempo de verdade de cada parte, da execução completa final, vai na descrição da PR.

## O custo

A última execução do CI antes deste relatório é a do push do `4d6d2ce` (`pnpm ci:custo 42890157989`): classe **leve**, **5 minutos cobrados**, **2,7 min de parede**, 3 jobs (o `classificar`, o `verificar (leve)` com 132 s, dos quais 101,4 s do `verificar --leve`, e o `ci-ok`), 7 pulados.

As execuções leves da run, uma por push: `cf8d19d` verde (o prompt gravado), `76ee170` e `0bb78f9` vermelhas (os testes de contagem, de lista e de ícone que as frentes ainda estavam mudando nas worktrees; nenhum commit foi feito por causa delas), e `c4002c6` e `4d6d2ce` verdes. O custo da execução completa, depois do `gh pr ready`, vai na descrição da PR.

## A conferência no Linux

Não houve no meio da run: o rótulo `ci` não existe (`gh label list`, só leitura), e criá-lo é do Victor (§ 718). A execução completa depois do `gh pr ready` faz esse papel; o que ela achou (a matriz no WebKit do Linux, que pode abrir AVIF, e o `[avif 12 MP]` do runner) vai na descrição da PR, e o grupo 27 manda copiar a medida do runner para um § (F17 m-1).

## A revisão

Três lentes Sonnet em contexto limpo sobre o `c4002c6`, numa worktree só de leitura com install, build e build de teste próprios, com um cético ("na dúvida, refutado"): (a) as ferramentas e a privacidade, (b) o site, o SEO e os idiomas, (c) o orçamento, os anúncios, a acessibilidade e o CI. **1 achado, baixo, nenhum alto ou médio:** o b-1 (a seção F17 do `docs/claude/imagem.md` citava o § 719 antes de ele existir), confirmado e resolvido pelo próprio § 719. As lentes a e c não acharam nada, depois de rodar a matriz e as presets (58), seis specs das ferramentas (118), sondas próprias de saída, metadados, transparência e recusa nos três idiomas, os portões, 18 arquivos do Vitest (306), o `lint:texto`, os orçamentos (710), os anúncios, o CLS e o axe (120), duas páginas no Lighthouse e o `--list --shard` das 22 partes. A segunda passada da lente b, sobre o diff dos documentos, não achou nada. Nenhum baixo novo foi para o grupo 27. O relato está em `docs/relatorios/REVISAO-F17.md` (§ 719).

A junção das três frentes teve um conflito só (a linha da busca do `prontidao.test.ts`, que as frentes T e S mudaram para o mesmo `13 + …`), resolvido com o comentário da frente S. Os testes da junção acharam uma coisa que nenhuma frente via sozinha: com os textos da frente T, o hub de imagem passou de 600 palavras e ganhou a `lateral-2`, e o teste que o usava como página curta reprovou nos dois navegadores; o exemplo passou a ser o hub de casa (§ 715 e § 716).

## As imagens

Em `docs/relatorios/fase-17/` (JPEG 80, 1x, movimento reduzido, Chromium do Playwright, `.cache/f17/shots.ts`, do `dist/` da junção):

- `avif-para-jpg-360-pt.jpg`: o resultado de um AVIF no AVIF para JPG a 360 px, com o antes e depois aberto e os chips.
- `converter-webp-avif-360.jpg`: o Convert to WebP com o AVIF escolhido e o resultado da PNG transparente ("Adjust · AVIF · Recommended").
- `hub-imagem-1280.jpg`: o hub de imagem em inglês a 1280 px, com os dez cartões.
- `recusa-avif-360-es.jpg`: um AVIF largado no Comprimir imagen a 360 px, com o link para o AVIF a JPG.

## A prévia

https://fase-17-fileorca.vmatusita.workers.dev/ (o Workers Builds publica cada push; é o build padrão, sem anúncio).

## As decisões novas

§ 701 a § 719 no `DECISOES.md`: a especificação e o que a exploração achou (701), os planos e o prompt (702), os nomes e as palavras de pt e es (703), os textos de en e a fonte da frase de suporte (704), a fatia 1 nos três idiomas e o `warm` (705), os ícones (706), as listas e o chip que leva (707), a recusa e o artigo (708), as frases desmentidas e as contagens (709), o lugar no site (710), a matriz (711), a medida do AVIF (712), o kit (713), o orçamento (714), os anúncios, o CLS, o axe, o Lighthouse e a `lateral-2` dos hubs (715), os testes antigos que mudaram (716), as partes do CI (717), o rótulo `ci` (718) e a revisão (719).

## A válvula de estouro

Não cortou nada: as duas ferramentas entraram nos três idiomas, com a matriz, a recusa com o link e os testes dos critérios. A primeira saída da válvula foi usada depois da execução completa: a PR separada das partes do CI (o WebKit em 15; adendo abaixo e § 720).

## A lista do que é do Victor

1. `git pull` e, na prévia ou no fileorca.com depois do deploy: converter um AVIF de verdade no celular e no computador; converter uma foto para WebP e outra para AVIF e abrir os resultados; largar um AVIF no Comprimir e seguir o link.
2. No Search Console, pedir a indexação das seis páginas novas (`/avif-to-jpg/`, `/pt/avif-para-jpg/`, `/es/avif-a-jpg/`, `/convert-to-webp/`, `/pt/converter-para-webp/`, `/es/convertir-a-webp/`).
3. Se a linha do `PLANO-FILEORCA.md` ainda faltar, pô-la (o texto está no grupo 24, F14 m-1).
4. Criar o rótulo `ci` (Issues → Labels), se ainda não existir.
5. Mesclar a PR das partes do CI (o WebKit em 15 partes; adendo abaixo e § 720) depois da execução completa dela; a 4 do WebKit, a do `clearance.spec.ts`, segue no F14 m-5.
6. Passar as candidatas da seção E do `PLANO-UX-QV.md` no Keyword Planner e no Google Trends, se ainda não passou, e gerar o prompt da F18 com a skill, com os números, o SHA da main e o grupo 27 do `docs/PENDENCIAS.md` (o F17 m-1 pede copiar o `[avif 12 MP]` do runner para um §).

## Adendo: a execução completa e a PR das partes

A execução completa da PR 33, depois do `gh pr ready` (`pnpm ci:custo 42903419182`, o commit `6649a73`): **verde**, 29 jobs, **198 minutos cobrados** e **17,5 min de parede**; o CI mesclou a PR no `39d1341` e o `pos-deploy` conferiu a produção.

- **As partes:** o Chromium de 301,6 a 595,4 s; o WebKit de 159,4 a 726,1 s, com duas acima de 700 s: a 4 (726,1 s, a do `clearance.spec.ts`, F14 m-5; 746,0 s no ponto de partida) e a 6 (710,3 s; 542,5 s na PR 32). A 6 subiu por um runner mais lento (os specs antigos dela de 17 a 33 % mais lentos) e pelos testes desta run nela (um bloco a mais do `fo-ad-map` e 2 do `events`, uns 26 s de soma). Pela válvula, a PR separada das partes passa o WebKit a 15 partes (§ 720), com a projeção de uns 630 s na maior parte; o merge dela é do Victor.
- **A medida do AVIF no runner:** `[avif 12 MP] chromium 2.0` e `[avif 12 MP] webkit 4.9` (no § 720). O WebP da mesma foto não foi medido no runner (F17 m-1).
- **A matriz no WebKit do Linux** passou; o log não diz se ele abriu AVIF sozinho.
- **O tempo de cada spec da F17** nessa execução está no § 720.
