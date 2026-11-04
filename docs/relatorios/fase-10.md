# F10 · UX/UI: diagnóstico e proposta (relatório)

3/nov/2026 · branch `fase-10` · PR [vmatusita/fileorca#22](https://github.com/vmatusita/fileorca/pull/22) · ponto de partida `33be71e` · prévia: https://fase-10-fileorca.vmatusita.workers.dev/

A run não muda o site. Ela entrega:
- o diagnóstico das seis tarefas;
- a proposta em [`docs/propostas/ux-v2/`](../propostas/ux-v2/README.md): 18 itens (UX-01 a UX-18), 26 protótipos (mais a página de entrada) e a lista [`ESCOLHAS.md`](../propostas/ux-v2/ESCOLHAS.md);
- as imagens em `docs/relatorios/fase-10/`;
- os §§ 342 a 381 do `DECISOES.md`.

## Resumo

**Os cinco achados que mais pesam:**
1. **O aviso de cookies cobre o que importa na primeira visita.** A 360×740 ele ocupa de 25,8 % a 28,7 % da tela, fica por cima da única saída do erro com o foco nela (D-01, o único atrito que bloqueia; WCAG 2.4.11) e cobre metade do "Escolher imagens" em pt (D-02) e o número das calculadoras (D-28, D-37).
2. **A página pula depois do gesto.** O CLS da interação, que nenhum teste mede, passa de 0,05 em 34 das 120 sessões; no guia, chega a 0,202 (D-04, D-12, D-50).
3. **O próximo passo fica longe.** Os chips ficam a 0,74 a 0,95 tela do Baixar, e o Baixar PDF das calculadoras nunca está na tela do resultado (D-05, D-30, D-39).
4. **O guia esconde a ferramenta, que começa a quase duas telas no celular, e o que mediu** (D-47, G-17).
5. **Parece genérico onde a Oli e o mar faltam.** Há quatro sinais:
   - a home é uma grade de 37 cartões iguais, com a Oli como adesivo (G-01, G-02);
   - os hubs não têm o mar (G-05);
   - no escuro, o "fundo do mar" fica mais claro que o chão (G-07);
   - 21 ícones atendem 37 ferramentas (G-04).

**As recomendações principais:**
- **F11:** o cabeçalho A, o Menu de papel, com o tema Sistema → Claro → Escuro (UX-01), e o hub de guias nos três idiomas com o cartão de guia próprio (UX-02).
- **F12:**
  - o mapa A, com a densidade conservadora máxima de 22,3 % a 360×740 e o multiplex só a partir de 768 px (UX-07);
  - a parede com a pose `sad` (UX-06 e UX-08);
  - o café do 3º uso (UX-05).
- **F13, nesta ordem:**
  1. o aviso de cookies compacto (UX-09);
  2. a Oli com laços de menos de 5 s (UX-10, WCAG 2.2.2);
  3. a página de ferramenta A (UX-04);
  4. as calculadoras (UX-12);
  5. o guia (UX-13);
  6. as peças do PDF (UX-11);
  7. a home B (UX-03);
  8. o resto da lista.

## O que foi medido

- **As seis tarefas:**
  - comprimir imagem, HEIC para JPG e juntar PDF, em en, pt e es;
  - hipoteca, em en e es (não existe em pt);
  - SAC × PRICE, só em pt;
  - o guia "HEIC para JPG no Windows", em en, pt e es (§ 358).

  São 15 pares de tarefa e idioma.
- **A matriz:**
  - **as dimensões:** 360×740 e 1280×800, claro e escuro, a primeira visita (com o aviso aberto) e a volta. São 120 sessões no Chromium, sobre o `dist/` de `87ef4c8`, que tem o mesmo `src/` da `33be71e`;
  - **os estados:** repouso, arquivo em cima, processando, resultado, erro, próximo passo e lista;
  - **além da matriz:** 30 sessões no build `all` (os anúncios de hoje), 12 no fileorca.com com o Google abortado e 6 no WebKit. São 1.090 capturas no total, fora do Git.
- **As medidas:**
  - os toques até o resultado;
  - a posição do botão, do Baixar e do resultado contra a dobra;
  - o CLS da interação;
  - o tempo até o resultado;
  - o que o aviso cobre;
  - as telas até o conteúdo útil;
  - o JS e as requisições, pelas regras do `budgets.ts`.
- **Dados do GA4 e do Search Console:** não havia; `.cache/dados-f10/` não existe (§ 359).
- **Os concorrentes:** iLovePDF, Smallpdf, TinyPNG, Squoosh e a calculadora de hipoteca da NerdWallet, só em repouso, em 3/nov/2026. Nenhum material deles entrou no Git (§ 344).
- **O resultado:** 56 atritos D-NN (1 bloqueia, 20 atrasam e 35 incomodam), 23 achados G-NN de "parece genérico" e 12 marcas que ficam (U-NN). O detalhe está na seção 3 do README.

## Os itens

| Item | Título | Origem | Custo | Run | Recomendação |
|---|---|---|---|---|---|
| [UX-01](../propostas/ux-v2/README.md#ux-01) | Cabeçalho com menu e botão de tema | obrigatório 1 | M | F11 | A, o Menu de papel: um padrão em toda largura, 64 px e uma linha, com o tema Sistema → Claro → Escuro |
| [UX-02](../propostas/ux-v2/README.md#ux-02) | Hub de guias e as entradas dos guias | obrigatório 2; F5b F-12 | G | F11 | o hub nos três idiomas, com o cartão de guia próprio e as cinco entradas |
| [UX-03](../propostas/ux-v2/README.md#ux-03) | A home com a Oli no centro e os anúncios da área geral | obrigatório 3; G-01 a G-03, G-06, G-18 | M | F13 | B, o mar por categoria: sem JS, com o `<main>` de 8.872 para 4.696 px a 360 |
| [UX-04](../propostas/ux-v2/README.md#ux-04) | A página de ferramenta, do soltar ao resultado | obrigatório 4; F4-F7 e-2, f-1 e f-2 | G | F13 | A, um lugar só: o retângulo de altura fixa, a placa a 360, os chips perto do Baixar e o CLS da interação em 0 |
| [UX-05](../propostas/ux-v2/README.md#ux-05) | O card do café e a página de apoio | obrigatório 5 | M | F12 | o card no resultado com os textos da seção C; a linha do rodapé no topo do rodapé, longe da âncora |
| [UX-06](../propostas/ux-v2/README.md#ux-06) | A parede do bloqueador com a Oli triste | obrigatório 6 | M | F12 | como no protótipo, nos dois modos, com o escape e a variante da UE; o texto da Privacidade é decisão do Victor |
| [UX-07](../propostas/ux-v2/README.md#ux-07) | Mapa de anúncios de cada molde | obrigatório 7 | G | F12 | A, de borda a borda: no máximo 22,3 % a 360, o multiplex a partir de 768 px e 37 unidades |
| [UX-08](../propostas/ux-v2/README.md#ux-08) | A pose `sad` da Oli | obrigatório 8 | P | F12 | usar a `sad` na parede, depois da busca reversa |
| [UX-09](../propostas/ux-v2/README.md#ux-09) | O aviso de cookies compacto no celular | diagnóstico; F4-F7 f-1, ajuste-aviso-espaco, F3 f-06 | M | F13 | como no protótipo: 128 px a 360, o texto com o selo da página e o `keep()` do foco |
| [UX-10](../propostas/ux-v2/README.md#ux-10) | A Oli por estado, com laço curto | "para avaliar" A-6; F3 d-02 | M | F13 | A: todo laço que começa sozinho para antes de 5 s (WCAG 2.2.2) |
| [UX-11](../propostas/ux-v2/README.md#ux-11) | As peças das ferramentas de PDF | diagnóstico; 15 pendências da F5a | M | F13 | A, em dois commits: primeiro o CSS e a marcação, depois o comportamento |
| [UX-12](../propostas/ux-v2/README.md#ux-12) | Calculadoras e QR: o resultado, as tabelas, o erro e os rótulos | diagnóstico; 12 pendências | G | F13 | A: o Baixar PDF acima da dobra, o erro que não empurra e a tabela com cabeçalho de linha |
| [UX-13](../propostas/ux-v2/README.md#ux-13) | Página de guia: o que medimos e a ferramenta antes da prosa | diagnóstico; F5b F-2 e F-13 | G | F13 | A, construída junto com o UX-04 |
| [UX-14](../propostas/ux-v2/README.md#ux-14) | O resultado vai direto para a próxima ferramenta | "para avaliar" A-1 | M | F13 | como no protótipo, junto com o UX-04 |
| [UX-15](../propostas/ux-v2/README.md#ux-15) | O mar nos hubs e no tema escuro | "para avaliar" A-4 e A-5; G-05, G-07, G-21 | M | F13 | A nos dois lugares (dentro das regras); a B muda regra |
| [UX-16](../propostas/ux-v2/README.md#ux-16) | Ícones próprios por ferramenta | G-04, G-11 | P | F13 | os 27 ícones novos e o `file-drop` na DropZone |
| [UX-17](../propostas/ux-v2/README.md#ux-17) | Páginas institucionais e rodapé | G-06, G-13, G-14, G-15 | M | F13 | A: a 404 com a água, a Sobre com números e o rodapé com `<details>` no celular |
| [UX-18](../propostas/ux-v2/README.md#ux-18) | Soltar o arquivo em qualquer lugar da página | "para avaliar" A-3 | P | F13 | A: o soltar em todo o conteúdo, sem tocar no anúncio |

## O mapa de anúncios

A densidade a 360×740, pelo `.cache/f10/densidade.mjs`, sobre as 208 páginas do `dist/` e o protótipo do hub de guias. A trava é a leitura conservadora (§ 351 e § 360): as caixas de 300 px mais 100 px de âncora, contada uma vez, sobre o `<main>` sem as relacionadas.

| Molde | Área | Páginas | Anúncios por página | Ficha: máx · mediana | Conservadora: máx · mediana | Página da máxima | Com o multiplex de 1.700 px no celular (seção B como está) |
|---|---|---|---|---|---|---|---|
| Home | geral | 3 (en, es, pt) | 3–5 | 12,6 % · 10,7 % | **13,4 %** · 11,9 % | `/` | 26,0 % |
| Hub de categoria · arquivos | arquivos | 6 (es, en, pt) | 2–2 | 11,8 % · 10,1 % | **13,7 %** · 11,8 % | `/image-tools/` | 33,7 % |
| Hub de categoria · dinheiro | dinheiro | 3 (es, en, pt) | 3–5 | 16,1 % · 16,0 % | **17,8 %** · 17,2 % | `/pt/calculadoras-financeiras/` | 35,3 % |
| Hub de categoria · casa-saude | casa-saude | 2 (en) | 2–2 | 13,3 % · 13,2 % | **15,5 %** · 15,4 % | `/health-calculators/` | 36,8 % |
| Hub de guias (protótipo) | geral | 3 (en, pt, es) | 2–3 | 12,7 % · 12,5 % | **14,1 %** · 13,9 % | `prototipo:guides-hub` | 33,0 % |
| Ferramenta · imagem | arquivos | 33 (en, es, pt) | 2–3 | 15,7 % · 11,5 % | **22,3 %** · 17,5 % | `/png-to-jpg/` | 41,6 % |
| Ferramenta · pdf | arquivos | 36 (en, es, pt) | 2–3 | 14,5 % · 10,6 % | **20,1 %** · 15,9 % | `/merge-pdf/` | 39,0 % |
| Ferramenta · qr | utilidades | 3 (es, pt, en) | 2–2 | 10,7 % · 10,2 % | **14,8 %** · 13,9 % | `/qr-code-generator/` | 35,5 % |
| Calculadora · dinheiro | dinheiro | 44 (en, es, pt) | 3–5 | 16,1 % · 13,8 % | **21,0 %** · 17,2 % | `/apr-to-apy-calculator/` | 36,6 % |
| Calculadora · casa-saude | casa-saude | 11 (en) | 4–5 | 17,6 % · 15,2 % | **21,0 %** · 18,5 % | `/btu-calculator/` | 35,5 % |
| Guia · arquivo | arquivos | 30 (es, en, pt) | 4–5 | 15,6 % · 13,5 % | **18,7 %** · 16,2 % | `/guides/combine-pdfs-on-phone/` | 31,2 % |
| Guia · dinheiro | dinheiro | 10 (es, en) | 3–5 | 13,6 % · 11,5 % | **14,5 %** · 12,5 % | `/guides/extra-mortgage-payments/` | 26,1 % |
| Livres | — | 27 | 0 | 0 | 0 | — | — |

As suposições:
- **o multiplex tem 1.700 px a 360 px**, derivado do carregador público. A ajuda do AdSense não publica a altura, e no celular ele não cabe nos 30 %: por isso fica só a partir de 768 px (§ 361);
- **a âncora conta 100 px, uma vez;** a padrão tem 50 px;
- **a caixa de conteúdo tem 300 px**, a reserva do site; a ficha diz 280;
- **a distância de 1.110 px é lida de borda a borda.** A alternativa B lê de topo a topo e dá 24,0 % no pior molde;
- **o AdSense deixaria esconder a unidade por largura** (`display: none`). A F12 confere a ajuda; o plano B está na § 381.

## A pose `sad`

- **O `<symbol>` tem 902 bytes;** com as peças e o `oli-clip`, 2.555 bytes (limite 4.096). Ela não cria peça nova, e as nove poses não mudam de tamanho.
- **O SVG avulso** tem 2.393 bytes: [`docs/propostas/ux-v2/oli/oli-sad.svg`](../propostas/ux-v2/oli/oli-sad.svg).
- **A folha:** [`docs/propostas/ux-v2/oli/folha.html`](../propostas/ux-v2/oli/folha.html), com a pose sozinha e ao lado das nove, nos dois fundos, em 32, 64 e 128 px, e dentro da parede.
- **Os PNG de 512 px para a busca reversa:** [`oli-sad-512-light.png`](fase-10/oli/oli-sad-512-light.png) e [`oli-sad-512-dark.png`](fase-10/oli/oli-sad-512-dark.png).

## A saída das verificações (`.cache/f10/`)

Todas rodaram com o cwd na raiz do checkout, sobre o último commit antes do relatório (`a425fde`), e todas terminaram com o código 0.

**`node .cache/f10/diff.mjs` (critério 1)**

```text
diff.mjs · origin/main...HEAD · base 33be71e · HEAD a425fde
294 arquivo(s) no diff:
  DECISOES.md
  docs/prompts/prompt-fase-10.md
  docs/prompts/prompt-fase-10.txt
  docs/propostas/ux-v2/ (77)
  docs/relatorios/fase-10-plano.md
  docs/relatorios/fase-10/diagnostico/ (108)
  docs/relatorios/fase-10/oli/ (2)
  docs/relatorios/fase-10/prototipos/ (103)
git diff --stat nos caminhos proibidos: vazio
classe do CI esperada: portões

APROVADO
```

**`node .cache/f10/readme.mjs` (critério 2)**

```text
readme.mjs · 18 UX-NN · 56 D-NN · 37 pendências · 7 para avaliar
obrigatórios: 1→UX-01 2→UX-02 3→UX-03 4→UX-04 5→UX-05 6→UX-06 7→UX-07 8→UX-08

APROVADO
```

**`node .cache/f10/prototipos.mjs --browser chromium` (critério 3; com `file://`)**

```text
prototipos.mjs · 27 página(s) · chromium · light e dark · 360×740 e 1280×800
  1452 aberturas (http e file://), 968 análises do axe (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa), 0 screenshot(s), 1042 s
…
APROVADO
exit 0
```

**`node .cache/f10/prototipos.mjs --browser webkit` (critério 3)**

```text
prototipos.mjs · 27 página(s) · webkit · light e dark · 360×740 e 1280×800
  968 aberturas (http e file://), 968 análises do axe (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa), 0 screenshot(s), 917 s
…
APROVADO
exit 0
```

As variantes de cada protótipo estão nas saídas completas (`.cache/f10/saidas/final-prototipos-*.txt`). As 103 screenshots saíram do `--shots` no Chromium (100 da variante padrão de cada protótipo e 3 dos estados que a revisão acrescentou ao UX-04).

**`node .cache/f10/contraste.mjs --readme` (critério 4; a tabela está na seção 9 do README)**

```text
contraste.mjs · WCAG 2.2 · 104 par(es) · 3 token(s) --proposta-
…
APROVADO
```

**`FO_PORT=4187 node .cache/f10/densidade.mjs` (critério 5)**

```text
densidade.mjs · 211 páginas · 11 s · dist a425fde + docs/propostas/ux-v2/guides-hub.html
  Home: 3 páginas, 3–5 anúncios, ficha máx 12,6 %, conservadora máx 13,4 % (/)
  Hub de categoria · arquivos: 6 páginas, 2–2 anúncios, ficha máx 11,8 %, conservadora máx 13,7 % (/image-tools/)
  Hub de categoria · dinheiro: 3 páginas, 3–5 anúncios, ficha máx 16,1 %, conservadora máx 17,8 % (/pt/calculadoras-financeiras/)
  Hub de categoria · casa-saude: 2 páginas, 2–2 anúncios, ficha máx 13,3 %, conservadora máx 15,5 % (/health-calculators/)
  Hub de guias (protótipo): 3 páginas, 2–3 anúncios, ficha máx 12,7 %, conservadora máx 14,1 % (prototipo:guides-hub)
  Ferramenta · imagem: 33 páginas, 2–3 anúncios, ficha máx 15,7 %, conservadora máx 22,3 % (/png-to-jpg/)
  Ferramenta · pdf: 36 páginas, 2–3 anúncios, ficha máx 14,5 %, conservadora máx 20,1 % (/merge-pdf/)
  Ferramenta · qr: 3 páginas, 2–2 anúncios, ficha máx 10,7 %, conservadora máx 14,8 % (/qr-code-generator/)
  Calculadora · dinheiro: 44 páginas, 3–5 anúncios, ficha máx 16,1 %, conservadora máx 21,0 % (/apr-to-apy-calculator/)
  Calculadora · casa-saude: 11 páginas, 4–5 anúncios, ficha máx 17,6 %, conservadora máx 21,0 % (/btu-calculator/)
  Guia · arquivo: 30 páginas, 4–5 anúncios, ficha máx 15,6 %, conservadora máx 18,7 % (/guides/combine-pdfs-on-phone/)
  Guia · dinheiro: 10 páginas, 3–5 anúncios, ficha máx 13,6 %, conservadora máx 14,5 % (/guides/extra-mortgage-payments/)
  Livres: 27 páginas, sem anúncio

APROVADO
gravado: .cache\f10\densidade.json e .cache\f10\densidade.md
```

**`node .cache/f10/densidade768.mjs` (da revisão, c-04)**

```text
|---|---|---|---|---|---|---|---|
| hub | `/home-calculators/` | 2 | 485 px | 3388 px | 23.2 % | **26.1 %** | 31.7 % |
| hub | `/health-calculators/` | 2 | 485 px | 3403 px | 23.1 % | **26.0 %** | 31.6 % |
| tool | `/compress-image/to-1mb/` | 2 | 485 px | 3880 px | 20.2 % | **25.8 %** | 31.3 % |
| tool | `/png-to-jpg/` | 2 | 485 px | 3943 px | 19.9 % | **25.4 %** | 30.7 % |
| tool | `/merge-pdf/` | 2 | 485 px | 4181 px | 18.8 % | **23.8 %** | 28.3 % |
| hub | `/image-tools/` | 2 | 485 px | 3731 px | 21.0 % | **23.7 %** | 28.3 % |
| tool | `/es/unir-pdf/` | 2 | 485 px | 4289 px | 18.3 % | **23.4 %** | 27.8 % |
| tool | `/qr-code-generator/` | 2 | 485 px | 4289 px | 18.3 % | **23.1 %** | 27.4 % |
| tool | `/compress-image/` | 2 | 485 px | 4389 px | 17.9 % | **22.4 %** | 26.4 % |
| tool | `/pt/comprimir-imagem/` | 2 | 485 px | 4505 px | 17.4 % | **22.1 %** | 26.0 % |
| calc | `/apr-to-apy-calculator/` | 2 | 485 px | 4608 px | 17.0 % | **21.7 %** | 25.4 % |
| calc | `/btu-calculator/` | 2 | 485 px | 5031 px | 15.6 % | **19.6 %** | 22.7 % |
| home | `/pt/` | 2 | 485 px | 4735 px | 16.6 % | **18.7 %** | 21.4 % |
| home | `/es/` | 2 | 485 px | 4857 px | 16.2 % | **18.2 %** | 20.8 % |
| calc | `/mortgage-calculator/` | 2 | 485 px | 5695 px | 13.8 % | **17.1 %** | 19.4 % |
| guide | `/guides/combine-pdfs-on-phone/` | 2 | 485 px | 5737 px | 13.7 % | **17.1 %** | 19.3 % |
| hub | `/money-calculators/` | 2 | 485 px | 5235 px | 15.0 % | **16.9 %** | 19.1 % |
| home | `/` | 2 | 485 px | 5879 px | 13.4 % | **15.1 %** | 16.8 % |
| guide | `/guides/extra-mortgage-payments/` | 2 | 485 px | 6719 px | 11.7 % | **13.2 %** | 14.5 % |

Máxima conservadora: 26.1 %. Páginas: 19.
```

**`node .cache/f10/oli-sad.mjs` (critério 6)**

```text
ok  oli-sad.svg: só as cores fixas (#F7FAFD, #0F1B2D, #0B63F6, #FF9CA8)
  ok  oli-sad.svg: sem texto, imagem, script, estilo, degradê nem filtro
  ok  oli-sad.svg: LF e uma quebra de linha no fim, como as nove
  ok  folha.html em dia com o sprite e as medidas (igual ao que --gerar escreveria)
  ok  folha.html: o sprite inline é o spriteMarkup das dez poses
  ok  folha.html: o <symbol id="oli-sad"> é o que o sprite.ts monta
  ok  folha.html: lang="pt-BR" e <title>
  ok  folha.html: a sad aparece 14 vezes (sozinha, ao lado das nove e na parede, nos dois fundos)
  ok  folha.html: 68 <svg> da Oli, todos aria-hidden e sem viewBox no hospedeiro
  ok  folha.html: 2 caixa(s) [data-oli] aria-hidden
  ok  folha.html cita oli-sad-512-light.png
  ok  folha.html cita oli-sad-512-dark.png
  ok  oli-sad-512-light.png: PNG 512x512
  ok  oli-sad-512-light.png: 25.2 KB <= 500 KB
  ok  oli-sad-512-dark.png: PNG 512x512
  ok  oli-sad-512-dark.png: 34.0 KB <= 500 KB

APROVADO
```

**`node .cache/f10/imagens.mjs` (critério 7)**

```text
imagens.mjs · 213 imagem(ns) em docs/relatorios/fase-10/
  diagnostico/: 108 arquivo(s), 6.27 MB, maior 122.4 KB
  oli/: 2 arquivo(s), 0.06 MB, maior 34.0 KB
  prototipos/: 103 arquivo(s), 17.42 MB, maior 460.6 KB
  total: 23.75 MB de 25 MB; maior: 460.6 KB de 500 KB

APROVADO
```


## O `pnpm verificar --partes`

Uma vez, com a máquina livre, sobre o commit `a425fde` (o último antes do relatório; nenhum commit durante a execução). Todas as 21 partes passaram. A saída completa está em `.cache/f10/saidas/verificar-partes.txt`.

```text
Resumo das partes do CI (pnpm verificar --partes, 21 partes lidas de .github/workflows/ci.yml)
  ok      33.5 s  build: pnpm verificar --build
  ok     137.5 s  portoes: pnpm verificar --sem-playwright --sem-lighthouse --dist-pronto
  ok     356.7 s  lighthouse: pnpm verificar --lighthouse --dist-pronto
  ok      79.1 s  playwright: pnpm verificar --playwright=chromium --shard=1/5 --dist-pronto
  ok      86.8 s  playwright: pnpm verificar --playwright=chromium --shard=2/5 --dist-pronto
  ok      70.1 s  playwright: pnpm verificar --playwright=chromium --shard=3/5 --dist-pronto
  ok      87.9 s  playwright: pnpm verificar --playwright=chromium --shard=4/5 --dist-pronto
  ok      80.3 s  playwright: pnpm verificar --playwright=chromium --shard=5/5 --dist-pronto
  ok      42.5 s  playwright: pnpm verificar --playwright=webkit --shard=1/13 --dist-pronto
  ok      43.8 s  playwright: pnpm verificar --playwright=webkit --shard=2/13 --dist-pronto
  ok      51.1 s  playwright: pnpm verificar --playwright=webkit --shard=3/13 --dist-pronto
  ok      53.4 s  playwright: pnpm verificar --playwright=webkit --shard=4/13 --dist-pronto
  ok      59.6 s  playwright: pnpm verificar --playwright=webkit --shard=5/13 --dist-pronto
  ok      48.8 s  playwright: pnpm verificar --playwright=webkit --shard=6/13 --dist-pronto
  ok      30.3 s  playwright: pnpm verificar --playwright=webkit --shard=7/13 --dist-pronto
  ok      39.4 s  playwright: pnpm verificar --playwright=webkit --shard=8/13 --dist-pronto
  ok      60.9 s  playwright: pnpm verificar --playwright=webkit --shard=9/13 --dist-pronto
  ok      48.1 s  playwright: pnpm verificar --playwright=webkit --shard=10/13 --dist-pronto
  ok      53.9 s  playwright: pnpm verificar --playwright=webkit --shard=11/13 --dist-pronto
  ok      71.3 s  playwright: pnpm verificar --playwright=webkit --shard=12/13 --dist-pronto
  ok      49.3 s  playwright: pnpm verificar --playwright=webkit --shard=13/13 --dist-pronto
  soma 1584.4 s (parede 1584.4 s; cada parte com o limite de 900 s)
```

## O custo

A última execução do CI antes do relatório: a execução leve do push do `a425fde` (PR em rascunho, classe `leve`). O custo da execução final, a da classe `portões` que sai do `gh pr ready`, vai na descrição da PR.

### Execução 41743577253 (tentativa 1)

- Branch `fase-10`, commit `a425fde`, evento `pull_request`, criada em 2026-11-04T00:00:48Z, resultado `success`.
- Classe: **leve**.
- Minutos cobrados: **6** (soma dos jobs, cada um arredondado para cima).
- Tempo de parede: **3.8 min** (do início do primeiro job ao fim do último).
- Jobs: 3 rodaram, 7 pulados.

| Job | Resultado | Duração | Cobrado | Preparo | Total do verificar | Passos que mais pesam |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| alerta-dependabot | pulado | | 0 | | | |
| build | pulado | | 0 | | | |
| ci-ok | success | 20 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (11 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (5 s); Verdict (1 s) |
| classificar | success | 19 s | 1 |  |  | Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (9 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (5 s); Set up job (1 s) |
| merge | pulado | | 0 | | | |
| playwright (${{ matrix.part }}) | pulado | | 0 | | | |
| pos-deploy | pulado | | 0 | | | |
| verificar (leve) | success | 182 s | 4 | 28 s | 150.8 s | pnpm verificar --leve (151 s); Run actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 (9 s); Run actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 (8 s) |
| verificar (lighthouse) | pulado | | 0 | | | |
| verificar (portões) | pulado | | 0 | | | |

Jobs que rodaram o build do site no verificar: verificar (leve) (19 s).
Total do verificar: o maior foi 150.8 s (verificar (leve)); 0 de 1 partes acima do alvo de 700 s.

## A revisão

O método e o detalhe estão no [`REVISAO-F10.md`](REVISAO-F10.md). A revisão rodou sobre o commit fixo `4d8e946`, numa worktree só de leitura, com quatro lentes Sonnet em contexto limpo: (a) a evidência; (b) o design system, a Oli e a acessibilidade; (c) o anúncio, a parede e o café; (d) a viabilidade e o contrato.

- **As lentes:** 34 achados, 17 médios e 17 baixos, nenhum crítico ou alto.
- **Os céticos** (um por médio e um por lente para os baixos): 7 confirmados, 26 em parte e 1 refutado. A severidade final ficou em 1 médio (a-01: sete atritos apontavam para o UX-04 sem resposta no protótipo) e 32 baixos.
- **As correções:** um agente Opus corrigiu os 33 mantidos (`0889b29` a `d5f8fed`). O médio virou a resposta concreta do UX-04 A, com os estados novos no protótipo do juntar e do erro.
- **A segunda passada** (Sonnet, sobre o diff das correções) concordou e achou 1 médio novo (a faixa do juntar que sumia em dois estados) e 9 baixos. Os dez foram corrigidos no `a425fde`.
- **Nenhum achado crítico, alto ou médio ficou aberto** (critério 9), e não sobrou baixo da revisão. As escolhas que a revisão criou estão no grupo "Decisões avulsas" do `ESCOLHAS.md`.

## As decisões novas

Os §§ 342 a 357 registram as dezesseis decisões da ficha, uma por §. Os §§ 358 a 381 registram as decisões novas:

| § | Assunto |
|---|---|
| 358 e 359 | as URLs, o guia do diagnóstico e a falta de dados |
| 360 e 361 | como a densidade foi medida e o que muda da seção B |
| 362 | a leitura de "nenhum texto liga doação a anúncio" |
| 363 e 364 | o cabeçalho e o hub de guias |
| 365 a 367 | o destino das 37 pendências, a lista "para avaliar" e o que torna cada alternativa do FileOrca |
| 368 a 371 | o café, a parede, a home e a página de ferramenta |
| 372 a 379 | os itens UX-09 a UX-18 |
| 380 | as screenshots e o verificador dos protótipos |
| 381 | o que a revisão mudou |

## O que a válvula cortou

Nada. As segundas alternativas da home e da página de ferramenta (obrigatórios 3 e 4) foram feitas, inclusive a variação do juntar PDF.

## Para o docs/claude/

A próxima run copia estes blocos, cada um como uma seção nova no fim do arquivo de tema ("## F10: proposta de UX/UI"), com o texto igual.

**`docs/claude/design-e-oli.md`**

```markdown
## F10: proposta de UX/UI

Pegadinhas que a F10 achou (nos protótipos sobre o `docs/design/`; valem para quem construir a partir deles):

- **O `bundle.css` do `docs/design/` não é o CSS do site.**
  - **Medidas que diferem:** o site reserva 300 px no AdSlot de conteúdo e 644 px na lateral (o bundle diz 280 e 624); o `fo-seg__opt` tem 48 px (o bundle, 44); a Oli da DropZone fica em `top: -86px` no celular.
  - **Nomes que colidem:** o `.fo-hero` do bundle é o ResultHero das calculadoras, e o site usa o mesmo nome para o herói da home e da 404 (o ResultHero do site é `.fo-rhero`). O `.fo-page` do bundle é a prévia do ToolPage, com 360 px de largura, e colide com a célula da grade de páginas do PDF.
  - **Uma regra que o site não tem:** a `.fo-result__support a` pinta de branco também o botão da linha do café.
- **A animação de uma peça da Oli dentro de um `<use>` (o vapor da `coffee`) mira o elemento do `<symbol>` no sprite.** O seletor precisa pendurar num ancestral do sprite (`html`, `body`), nunca numa seção da página: o símbolo não descende dela.
- **Trocar a lista `animation` de [a] para [a, b] preserva a animação `a`** (o mesmo nome na mesma posição) e só começa a `b`. É assim que um aceno curto no `:hover` não recomeça o aceno de 3 s.
- **Uma regra `.x { display: grid }` vence o atributo `hidden`.** Use `.x:not([hidden])`. No `<dialog>`, o `display: flex` vai só em `[open]`, senão o diálogo fechado aparece.
- **O `::backdrop` herda as variáveis do `<html>`** a partir do Chrome 122 e do Safari 17.4.
- **Um `[popover]` no top layer com `position: absolute` usa o bloco inicial como referência.** Só o anchor positioning acerta a posição: o Chromium e o WebKit do Playwright suportam, com uma reserva `top`. Zere o estilo do navegador (`position: fixed`, `inset: 0`, `margin: auto`, `overflow: auto`).
- **Com cores forçadas, uma borda transparente aparece, e uma marca de estado feita só de borda ou de fundo some.** Marque o estado com peso ou com ícone também.
- **`aria-labelledby` num `<code>` reprova no axe** (`aria-prohibited-attr`): use um rótulo visível antes do código.
- **O `.fo-prose p` vence uma classe simples dentro de um cartão posto em texto corrido.** Use `span` ou um seletor `.fo-prose .x`.
- **Os ícones de `docs/design/assets/Icons/` têm `stroke="#0F1B2D"` no `<svg>` raiz,** como o `tests/unit/icons.test.ts` confere. Um ícone com `currentColor` no raiz, como os do UX-01 na proposta, reprova o teste: converta ao mover.
```

**`docs/claude/anuncios.md`**

```markdown
## F10: o mapa de anúncios

Pegadinhas que a F10 achou ao medir o mapa (`docs/propostas/ux-v2/ad-map.html`, DECISOES § 351, § 360 e § 361):

- **A margem de 150 px do `.fo-ad` não colapsa na grade do `.fo-main`** (gap de 16 px). Cada caixa de conteúdo soma 616 px ao `<main>`, e o vizinho fica a 166 px.
- **A lateral, a 1280 px, fica a 29 px dos botões de idioma e de busca do cabeçalho** (y 84), e o menu de idioma aberto (`position: fixed`) cai em cima dela. O `ads.spec.ts` não põe o cabeçalho nos alvos. Ponha `.fo-header a`, `.fo-header button` e os popovers, e dê à lateral um `padding-top` de 150 px.
- **O `gate:prontidao` conta toda caixa `fo-ad fo-ad--` do HTML,** mesmo a escondida por CSS naquela largura (150 palavras por caixa).
- **O multiplex a 1280 px:** a coluna tem 758 px, então o `ins` tem `floor(758 × 0,6)` = 454 px, e a caixa, 498 px com o rótulo. A 360 px, o carregador dá 1 coluna × 6 linhas: 1.666 px, que nenhum molde cabe em 30 %.
- **Para medir a densidade,** grave o `fo-consent`, espere `#fo-tool-root[data-hydrated="true"]` e meça com a ferramenta em repouso. A seção "O que medimos" dos guias de dinheiro não tem `data-content`, só o `h2#measured`.
- **A vinheta do AdSense tem "gatilhos adicionais" ligados por padrão desde 9/mar/2026:** o botão Voltar, 30 s parado, a volta à aba e o fim do artigo. Eles podem pôr uma vinheta durante o processamento, e desligar é do Victor, no painel.
```

**`docs/claude/playwright.md`**

```markdown
## F10: medidas de UX

Pegadinhas que a F10 achou ao medir o site e os protótipos:

- **No WebKit (o Safari e o do Playwright), o Tab pula os links por padrão.** Um teste de teclado usa `focus()` ou Option+Tab. Um popover aberto pelo clique não dá foco ao botão; pelo teclado, o foco volta ao botão no Esc.
- **O Chromium headless no Windows tem a barra de rolagem clássica:** um diálogo de 328 px fica em x 9 a 360 px, e no WebKit, em x 16.
- **O `boundingBox()` dá coordenadas da janela, não do documento.** Num `clip` de `fullPage`, some o `scrollY`.
- **Num contexto novo, o `document.fonts.ready` pode resolver antes de a fonte ser pedida.** Para medir quebra de linha, chame antes `document.fonts.load('600 24px Fredoka')` e o mesmo para a Figtree.
- **A captura de página inteira faz um relayout com a fonte já carregada.** Na hipoteca en a 360, a trilha passa a duas linhas (`layout-shift` de 0,207, na janela da captura), e os estados seguintes ficam 22 px mais baixos. Meça as posições antes de qualquer `fullPage`.
- **Com a máquina carregada, o Chromium no Windows pode falhar uma abertura com `net::ERR_NO_BUFFER_SPACE`.** Rodar de novo resolve.
- **O CLS da interação** vem de um `PerformanceObserver` de `layout-shift` instalado com `addInitScript`. Separe o carregamento do que vem depois do primeiro gesto e some as entradas sem `hadRecentInput`. A escolha no seletor de arquivo cai fora da janela de 500 ms do input.
```

**`docs/claude/windows-git-bash.md`**

```markdown
## F10: agentes em worktree

Pegadinhas que a F10 achou:

- **Um agente de workflow em worktree (`isolation: 'worktree'`) não consegue escrever no checkout principal:** o harness bloqueia. Ele lê o `.cache/` do principal pelo caminho absoluto, mas grava os scripts e as notas no `.cache/` da própria worktree, e o agente principal copia o que precisa antes do `git worktree remove`.
- **Dois agentes que acrescentam tokens no fim do mesmo CSS** (a seção 9 do `proto.css`) dão um merge automático se um mexe dentro dos blocos vazios e o outro acrescenta um trio novo depois. Confira com o script de contraste depois do merge.
- **Uma § citada antes de ser escrita** (por exemplo, "o destino está na § 365") prende a numeração. Reserve os números no plano e escreva as §§ na ordem, ou cite a decisão pelo assunto.
```

**`docs/claude/idiomas.md`**

```markdown
## F10: textos dos protótipos

- **Os textos em pt e es dos protótipos de `docs/propostas/ux-v2/` não passam pelo `lint:texto`,** que só lê os arquivos de tradução do site. A run que construir um item copia os textos da especificação para os arquivos de tradução e passa o glossário (`docs/i18n/`) e o LanguageTool lá.
```

## Para o PENDENCIAS

A próxima run cola estas linhas num grupo novo do `docs/PENDENCIAS.md` ("19. O que a F10 deixou"), no formato das seis colunas. A revisão não deixou baixo aberto: os 33 achados mantidos e os 10 da segunda passada foram corrigidos (`REVISAO-F10.md`). As linhas abaixo vêm do diagnóstico, das notas dos agentes e da exploração.

| Id | Fonte | Sev. | Defeito | Correção | Quem |
| --- | --- | --- | --- | --- | --- |
| F10 p-1 | `fase-10.md`; DECISOES § 347 | baixo | O Resumo do `PENDENCIAS.md` diz 12 no grupo 5 e soma 183, mas a tabela do grupo 5 tem 13 linhas: a "Idiomas R2-03" entrou sem atualizar o Resumo e o Total | Corrigir o Resumo (13) e o Total | Run F13 |
| F10 p-2 | DECISOES § 365; README da proposta, seção 6 | baixo | A F4 ACE-9 junta dois defeitos opostos: falta o cabeçalho de linha nas tabelas das calculadoras, e ele se repete na primeira coluna de 4 tabelas dos guias | Dividir em duas linhas: as calculadoras com o UX-12, os guias com o UX-13 | Run F13 |
| F10 p-3 | DECISOES § 365 | baixo | A F7 obs 3 fala da Mulch, mas os rótulos que empurram a etiqueta "example" são os da Paint ("Coverage per gallon", "Area of a door", "Area of a window"); a Mulch só quebra o "Bag size" a 320 px | Corrigir o texto da linha | Run F13 |
| F10 p-4 | DECISOES § 368 | baixo | A F5a D-12 cresceu: o "Copiar código" do Pix (`src/components/SupportCard.astro:57`) também usa o `fo-btn--sm` de 40 px no celular | Acrescentar à D-12; o UX-05 passa o botão a 52 px | Run F12 |
| F10 p-5 | DECISOES § 361 e § 363; D-07 | médio | A 1280 px, a lateral de anúncio começa em y 84, a 29 px dos botões de idioma e de busca, e o menu de idioma aberto (`position: fixed`) cai em cima dela; o `ads.spec.ts` não mede o cabeçalho. Aparece quando os anúncios ligarem | A lateral com `padding-top` de 150 px, o menu de idioma em `absolute` e o cabeçalho nos alvos do `ads.spec.ts` | Run F11 e F12 |
| F10 p-6 | DECISOES § 368 | médio | A linha do café no rodapé fica a 24 a 46 px da âncora do AdSense no fim da página (`components.css:458-466`), contra "o pedido de café nunca encosta num anúncio"; nenhum teste mede | A linha no topo do rodapé (UX-05) e um teste de distância com a âncora | Run F12 |
| F10 p-7 | DECISOES § 361; `docs/propostas/ux-v2/ad-map.html` | médio | Os "gatilhos adicionais" da vinheta do AdSense (botão Voltar, 30 s parado, volta à aba, fim do artigo) vêm ligados por padrão desde 9/mar/2026 e podem pôr uma vinheta durante o processamento | Desligar em Anúncios automáticos → Vinheta, antes de ligar os anúncios | Victor |
| F10 p-8 | DECISOES § 369; UX-06 | médio | O texto da Privacidade da seção A ("nada sai do aparelho" pela parede) não bate com a tag de recuperação do Google, que conta a detecção ao Google, nem com o evento `adblock_wall` no GA4 | Escolher o texto proposto na especificação do UX-06, nos três idiomas | Victor |
| F10 p-9 | DECISOES § 369 | baixo | O "Usar só desta vez" guarda a data no `localStorage` sem o Aceitar, pelo precedente da § 49; a leitura do art. 5(3) da ePrivacy é jurídica | Conferir a leitura antes de ligar a parede na UE (lá ela é só aviso) | Victor |
| F10 p-10 | DECISOES § 361; UX-07 | médio | O `gate:prontidao` conta toda caixa `fo-ad fo-ad--` do HTML (150 palavras por caixa), mesmo a escondida naquela largura; com o mapa, 111 das 181 páginas reprovariam (por largura, 0 no celular e 14 no computador) | Contar por largura, com as mesmas 150 palavras (pede o ok do Victor e um §), ou encolher o mapa | Run F12, com o ok do Victor |
| F10 p-11 | DECISOES § 377; UX-18 | baixo | O `dragover` do documento promete "copiar" na página inteira, e o `drop` fora da ilha some em silêncio (`ImagePanel.tsx:587-596`, `PdfPanel.tsx:658-666`), contra o README da DropZone | `dropEffect = 'none'` fora da ilha, com um teste, qualquer que seja a escolha do UX-18 | Run F13 |
| F10 p-12 | D-55 e D-56 | baixo | Quando os anúncios ligarem, a caixa de conteúdo do juntar PDF entra na primeira tela a 1280 (y 744), e o aviso de cookies aberto encosta nela (distância 0) | O mapa da F12 (com o UX-04 A, o 1º anúncio depois do "Como usar") e o aviso compacto (UX-09) | Run F12 |
| F10 p-13 | D-14 e D-51 | médio | No HEIC para JPG, o JPG sai maior que o HEIC (até +66 % no guia), e o card e a dica dizem que ele fica mais leve | O card do UX-04 que diz quando o arquivo cresce, e a dica do "Save as" corrigida | Run F13 |
| F10 p-14 | D-06 e D-17 | baixo | O erro manda tentar PNG para um `.png` que não é imagem, e no HEIC o erro de um PNG não aponta para o PNG para JPG | O erro "o conteúdo não bate com a extensão" e o chip da ferramenta certa (UX-04) | Run F13 |
| F10 p-15 | UX-12 (notas) | baixo | Com a fonte de reserva no WebKit, o rótulo "Window area" ainda quebra (163 de 158 px), o mesmo caso do F8 s-2 | Calibrar a `Figtree Fallback` também para o peso 600 | Run F13 |
| F10 p-16 | DECISOES § 370 | baixo | O número "2,6 MB → 717 KB" da faixa de imagem da home B vem do diagnóstico da F10, que está fora do Git | Gravar o número numa fixture ou no texto da ferramenta antes de usá-lo na home | Run F13 |
| F10 p-17 | DECISOES § 370 | baixo | A contagem do H1 da home (50, 29 e 39) e as 4 variantes de hipoteca e de saldo final do `HUB_MONEY_IDS`, que são presets, não estão decididas | Decidir a conta num §, lida dos registros no build | Run F13 |
| F10 p-18 | DECISOES § 361 e § 370 | baixo | A distância entre as duas laterais é de 800 px na home (UX-03) e de 1.200 px no mapa (UX-07) | Um número só para todos os moldes | Run F12 |
| F10 p-19 | DECISOES § 372 | baixo | Com o aviso compacto, o número das calculadoras a 360 continua coberto (32, 52 e 52 de 52 px) até o UX-12 subir o ResultHero para acima de 596 px | Fazer o UX-12 junto ou logo depois do UX-09 | Run F13 |
| F10 p-20 | DECISOES § 363 e § 379 | baixo | Os ícones do UX-01 (menu, sol, lua, sistema e livro) usam `currentColor` no `<svg>` raiz; o `tests/unit/icons.test.ts` exige `stroke="#0F1B2D"`, como os 39 do design system e os 27 do UX-16 | Converter ao mover para `docs/design/assets/Icons/` | Run F11 |

## O que é do Victor

1. `git pull` e abrir `docs/propostas/ux-v2/index.html` no navegador, com duplo clique.
2. Ler o README (`docs/propostas/ux-v2/README.md`), copiar o `ESCOLHAS.md` para `.cache/ESCOLHAS-marcado.md` e marcar lá.
3. Fazer a busca reversa da pose `sad` no Google Lens com os PNG de `docs/relatorios/fase-10/oli/` (15 min, como na F1b).
4. Gerar o prompt da F11 com a lista marcada e as seções "Para o docs/claude/" e "Para o PENDENCIAS" deste relatório.
