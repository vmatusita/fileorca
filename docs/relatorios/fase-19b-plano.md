# F19b · plano

O gabarito da run F19b ("Guias novos com dado próprio"), escrito depois da exploração e da linha de base e antes das frentes. A ficha é o `docs/prompts/prompt-fase-19b.txt` e vence este plano; o que este plano decide além dela vai para o `DECISOES.md`, nos § reservados abaixo.

## 1. Ponto de partida e linha de base

- **Ponto de partida:** `a017fc4ce60c91b1b2829eb5c0306b5445e48635` (a F19a, PR #37, mesclada em 13/nov/2026 às 19h23 de Brasília). A decisão 0 passou: o `src/platform/changelog.ts`, a rota `how-it-works`, o `scripts/lib/repeticao.ts` e o `docs/relatorios/fase-19a.md` estão na `origin/main`.
- **Branch:** `fase-19b`; PR em rascunho [vmatusita/fileorca#38](https://github.com/vmatusita/fileorca/pull/38). O rótulo `ci` não existe no repositório (`gh label list`): a conferência no Linux no meio da run não acontece, e a execução completa sai do `gh pr ready` (pendência no grupo 30).
- **Linha de base**, no `dist-base` (worktree `.claude/worktrees/f19b-base`, em `a017fc4`, com o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`):
  - build: 238 páginas, sem erro;
  - Vitest: 150 arquivos, 2.373 testes, todos verdes;
  - Playwright `--list`: 2.719 testes no Chromium e 2.719 no WebKit, em 89 arquivos;
  - `dist/_astro/`: 70 arquivos JS, 4.979.656 bytes;
  - sitemaps: en 90 URLs, pt 62, es 77 (o índice com 3);
  - guias: o hub mostra 15 em en (10 de arquivo e 5 de dinheiro), 10 em pt e 15 em es; a home diz "See all 15 guides" (pt 10, es 15); o Menu diz "15 guides" (pt 10, es 15); o Sobre e os Termos não contam guias; o kit diz `guides=15 file-guides=10 money-guides=5`;
  - `pnpm guias:medir --check`: 0 diferença em 303,8 s;
  - a página do QR code carrega 2 arquivos JS (a entrada do `QrTool.astro` e o chunk `island`).

## 2. Os § reservados

| § | Assunto |
| --- | --- |
| 777 | A linha 16 do contrato (decisão 1) |
| 778 | As datas por guia: os novos com o dia da medida, os antigos sem mudança (decisão 2, § 207) |
| 779 | Os caminhos em pt e es dos guias novos (decisão 2) |
| 780 | Os nomes, os títulos e os cartões de cada guia; o título do guia 7 (decisões 2 e 5) |
| 781 | Guia 1: o que mede, as fixtures e o que ficou de fora (decisão 3.1) |
| 782 | Guia 2 (decisão 3.2) |
| 783 | Guia 3 (decisão 3.3) |
| 784 | Guia 4 (decisão 3.4) |
| 785 | Guia 5 (decisão 3.5) |
| 786 | O QR code nos tipos dos guias de arquivo: o grupo Utilidades, a amostra de textos, o cartão (decisão 4) |
| 787 | Os casos novos do oráculo e o hash do `calc.py` (decisão 5) |
| 788 | As fontes oficiais de cada guia, com a data da leitura (critério 5) |
| 789 | O `toolSection` e as relacionadas de cada guia (decisões 2 e 6) |
| 790 | A busca: os termos dos guias novos e as consultas que mudam por construção (decisão 6, § 190) |
| 791 | A área de anúncio dos guias novos (decisão 7) |
| 792 | O portão de repetição e a contagem de palavras nos guias (decisão 8; o `gate:conteudo` nos guias de dinheiro) |
| 793 | A entrada desta run na Novidades e o nascimento das páginas (decisão 6) |
| 794 | A ferramenta embutida: o `embed` do Comprimir imagem, do Converter para WebP e do QR code (§ 184) |
| 795 | As frentes e a junção ("Como trabalhar"; regra 6) |
| 796 | Os testes antigos que mudaram (critério 11; formato da § 341) |
| 797 | O orçamento, os anúncios, o CLS, o axe e o Lighthouse (critérios 7 e 8) |
| 798 | A revisão adversarial (passo 5; regra 3) |
| 799 | O `pnpm verificar --partes` e o CI (critério 13) |

As frentes escrevem os § delas em rascunho nas notas, com o marcador da frente; o agente principal os põe no `DECISOES.md` a partir do § 800, na ordem das frentes (§ 410).

## 3. Os guias

Datas: o dia de cada guia novo é o dia da medida (arquivo, em UTC) ou o dia da run em Brasília (dinheiro): 16/nov/2026, se a medida acontecer antes das 21h de Brasília. O `OWN_DAY` de `src/tools/guides/registry.ts` e o `GUIDE_OWN_DAY` de `src/tools/calc/page.ts` guardam esse dia; a frente que medir depois das 21h troca o dia do guia dela e diz nas notas.

### Guia 1 · `guides-compress-photo-for-online-form`

- **Caminhos:** `/guides/compress-photo-for-online-form/`, `/pt/guias/comprimir-foto-para-formulario-online/`, `/es/guias/comprimir-foto-para-formulario-en-linea/`.
- **Ferramenta:** Comprimir imagem, embutida com `initial={{ level: 'size' }}` (abre em "Up to a size", com 200 KB, o `START_KB`). Hub: imagem. `toolSection`: 2.
- **Relacionadas:** `compress-image-to-100kb`, `resize-image`, `crop-image`, `image-to-pdf`, o guia 2 e o `guides-social-media-image-sizes`.
- **Medida (navegador, Chromium e WebKit: o site decodifica e redimensiona pelo canvas):** as três fotos de celular (`jpg-01-pixel2-retrato-gps.jpg`, `jpg-02-iphone6-paisagem-gps.jpg`, `jpg-03-iphone5-paisagem-orientacao3-gps.jpg`) em "Up to a size" a 100, 200 e 500 KB: os bytes da saída (sempre ≤ o limite × 1.000), as dimensões de antes e de depois (se a dimensão caiu e para quanto, pela nota "reduced the dimensions" e pelo cabeçalho do JPG) e a qualidade a que o motor chegou. A qualidade não aparece na página: ela sai das tabelas de quantização (DQT) do JPG de saída, comparadas com as do MozJPEG do site em cada qualidade de 40 a 90 (o mesmo codificador WASM, no Node); só um casamento exato vira número, e sem ele a qualidade sai do guia (§ 781). O texto explica a conta de 1 KB do site (1.000 bytes, a leitura menor, que serve também a quem conta 1.024) e manda ao Redimensionar quem precisa de uma dimensão exata. Nenhum formulário real é citado sem a página oficial dele lida nesta run.

### Guia 2 · `guides-webp-vs-avif-vs-jpg`

- **Caminhos:** `/guides/webp-vs-avif-vs-jpg/`, `/pt/guias/webp-avif-ou-jpg/`, `/es/guias/webp-avif-o-jpg/`.
- **Ferramenta:** Converter para WebP (abre em WebP, Recommended). Hub: imagem. `toolSection`: 2.
- **Relacionadas:** `compress-image`, `avif-to-jpg`, `webp-to-jpg`, `guides-jpg-vs-png`, `guides-open-webp-save-as-jpg` e o guia 1.
- **Medida (navegador, Chromium e WebKit: a WebP do Chromium é a do próprio navegador, a do WebKit é a jSquash):** as mesmas três fotos em JPG (Comprimir imagem, Recommended), WebP e AVIF (Converter para WebP, Recommended): os bytes e a relação com o original; o `gen-png-transparente.png` nos três: a transparência mantida (WebP e AVIF) ou trocada por branco (JPG), lida nos bytes (o canal alfa da WebP e do AVIF, os cantos do JPG). Nenhum tempo medido ou prometido; nada de "o melhor formato". O suporte dos navegadores só com o MDN, lido nesta run (§ 788).

### Guia 3 · `guides-sign-pdf-without-printing`

- **Caminhos:** `/guides/sign-pdf-without-printing/`, `/pt/guias/assinar-pdf-sem-imprimir/`, `/es/guias/firmar-pdf-sin-imprimir/`.
- **Ferramenta:** Assinar PDF (o `PdfIsland`). Hub: PDF. `toolSection`: 2.
- **Relacionadas:** `protect-pdf`, `merge-pdf`, `image-to-pdf`, `compress-pdf`, o guia 4 e o `guides-combine-pdfs-on-phone`.
- **Medida:** a assinatura é desenhada pelo canvas da página e posta pelo pdf-lib: o caminho da pessoa é o navegador (Chromium e WebKit), e a saída é lida no Node. Os PDFs `gen-paginas-mistas.pdf`, `gen-fotos.pdf` e `pdf-formulario-irs-1040-2019.pdf` assinados nos três modos (desenhar com o mouse, imagem, digitar): as páginas, os bytes antes e depois, o texto da página ainda extraível (o marcador "Page N" pelo PDF.js), a assinatura como imagem (uma imagem a mais em cada página assinada) e nenhum campo novo (os widgets, o AcroForm e nenhum `/Sig` nem `/ByteRange`). O texto separa a assinatura desenhada da assinatura digital com certificado e diz que a validade depende de quem recebe e da lei do lugar, com uma fonte oficial por idioma (en: E-SIGN Act, 15 U.S.C. 7001 e 7006, no govinfo; pt: Lei 14.063/2020 e MP 2.200-2/2001, no Planalto; es: o eIDAS em espanhol no EUR-Lex ou, se ele não abrir, a fonte oficial em espanhol que abrir, § 788). Sem orientação jurídica.

### Guia 4 · `guides-what-a-pdf-password-protects`

- **Caminhos:** `/guides/what-a-pdf-password-protects/`, `/pt/guias/o-que-a-senha-do-pdf-protege/`, `/es/guias/que-protege-la-contrasena-de-un-pdf/`.
- **Ferramenta:** Proteger PDF (o `PdfIsland`). Hub: PDF. `toolSection`: 2.
- **Relacionadas:** `unlock-pdf`, `sign-pdf`, `compress-pdf`, `merge-pdf`, o guia 3 e o `guides-why-is-my-pdf-so-large`.
- **Medida (Node: qpdf em WASM, o mesmo código do worker):** `gen-paginas-mistas.pdf`, `gen-fotos.pdf` e `gen-ja-otimizado.pdf` protegidos pelo motor (`processPdf` com `kind: 'protect'`): o dicionário de cifra (`qpdfEncryption`: AES, 256 bits, R 6), abrir sem a senha falha e com ela abre (PDF.js), os bytes a mais (conferidos em duas execuções: a chave e o IV são sorteados, e o `--check` compara o Node exato). O `gen-cifrado-dono.pdf` (só restrições, sem senha de abrir) no Unlock PDF, modo de restrições (`kind: 'unlock'`, `password: null`): abre sem senha e sai sem `/Encrypt`; e o Proteger PDF o recusa (`restricted`). O texto diz o que a senha de abrir protege, o que as restrições não protegem (a documentação do qpdf: as restrições são um pedido que o leitor pode ignorar) e que uma senha curta se adivinha (o NIST SP 800-63B), sem prometer o que não foi medido.

### Guia 5 · `guides-qr-code-size` (o último a ser construído; a válvula o corta primeiro)

- **Caminhos:** `/guides/qr-code-size/`, `/pt/guias/tamanho-do-qr-code/`, `/es/guias/tamano-del-codigo-qr/`.
- **Ferramenta:** Gerador de QR code, embutido pelo `<script>` do próprio `QrTool.astro` (o `embed` divide o componente como as ferramentas de imagem, § 794). Hub novo: Utilidades (`utilities`, o grupo `util` do hub e do rodapé). Área de anúncio: `utilidades`, a do QR code (§ 791). `toolSection`: 2.
- **Relacionadas:** `resize-image`, `image-to-pdf`, `compress-image`, o `guides-social-media-image-sizes`, o `guides-photos-to-one-pdf` e o guia 1.
- **Medida (navegador, Chromium e WebKit: o PNG sai do canvas da página):** textos de comprimento crescente gerados pelo script (um link curto, um link longo, um texto com acento), na correção H do site: a versão e os módulos por lado (lidos do `viewBox` do SVG da prévia), o lado e os bytes do PNG exportado nos três tamanhos e a leitura de volta pelo jsQR (como o `qr-code.spec.ts`), com a Oli no meio. A amostra é de textos, não de fixtures: o `Sample` ganha a forma de textos e o teste a confere (§ 786). A zona de silêncio e a correção H com a Denso Wave (qrcode.com), lida nesta run; o tamanho impresso só como conta (módulos × milímetros por módulo); um mínimo impresso só com fonte oficial.

### Guia 6 · `guides-apr-vs-apy`

- **Caminhos:** `/guides/apr-vs-apy/`, `/es/guias/apr-o-apy/`. Calculadora: APR para APY (abre em 5 % com capitalização diária).
- **Relacionadas:** `compound-interest-calculator`, `savings-goal-calculator`, `simple-interest-calculator`, `credit-card-payoff-calculator`.
- **Oráculo:** o caso `guide:apr-vs-apy` com a entrada do exemplo da página (o `initial`), e a tabela da mesma APR nos cinco compostos que a calculadora oferece (anual, semestral, trimestral, mensal, diário), feita pelo motor. A APR deste site é a taxa nominal de um depósito, não a APR de um empréstimo da Regulation Z: o texto diz isso. Fontes: CFPB, Regulation DD, Appendix A (a fórmula do APY) e as páginas do CFPB sobre APR.

### Guia 7 · `guides-credit-card-minimum-payment`

- **Caminhos:** `/guides/credit-card-minimum-payment/`, `/es/guias/pago-minimo-de-la-tarjeta-de-credito/`. Calculadora: quitação do cartão.
- **Relacionadas:** `debt-payoff-calculator`, `debt-consolidation-calculator`, `personal-loan-calculator`, `apr-to-apy-calculator`.
- **Oráculo:** a calculadora não calcula o mínimo da fatura, e o guia não finge que calcula. Os casos `guide:credit-card-minimum-payment`: o pagamento que mal cobre os juros do primeiro mês e pagamentos fixos maiores, no mesmo saldo e na mesma taxa (meses e juros totais), com o exemplo principal sendo o que a calculadora mostra ao abrir. Fontes: CFPB, Regulation Z § 1026.7(b)(12) (o aviso do pagamento mínimo na fatura) e a pergunta do CFPB sobre o quadro dos três anos. O título promete só o que o guia mostra (§ 780).

### Guia 8 · `guides-how-much-house-can-i-afford`

- **Caminhos:** `/guides/how-much-house-can-i-afford/`, `/es/guias/cuanta-casa-puedo-pagar/`. Calculadora: quanto de casa dá para pagar.
- **Relacionadas:** `mortgage-calculator`, `rent-vs-buy-calculator`, `mortgage-calculator-15-vs-30-year`, `refinance-calculator`.
- **Oráculo:** o caso `guide:how-much-house-can-i-afford` com o exemplo da página (renda de 95 mil dólares, 28 % e 36 %), e a tabela feita pelo motor. Os 28 % e 36 % são regra de bolso, nunca regra de lei (a frase da calculadora); nenhuma página do CFPB lida pela exploração diz 28/36 ou 43 %: o guia cita a definição do CFPB da relação dívida/renda e o "cada credor fixa os próprios limites", e não atribui os números a uma fonte que não os diz.

## 4. A interface entre as frentes

- **Os ids, os caminhos, os cartões e as datas** estão na fatia 1 (`7c54ff1`): os registros, os `common.ts` dos três idiomas, os textos mínimos, as páginas e a entrada `new-guides` do `changelog.ts`. O guia 5 entra no registro pela frente M5, depois dos tipos da frente S.
- **Os donos dos arquivos que mais de uma frente toca:**

| Arquivo | Dono | Os outros |
| --- | --- | --- |
| `src/tools/guides/registry.ts` | fatia 1; o guia 5, M5; os tipos do QR, S | propõem nas notas (`toolSection`, relacionadas) |
| `src/tools/calc/registry.ts` | fatia 1 | propõem nas notas |
| `src/i18n/{en,pt,es}/common.ts` | fatia 1; os sinônimos da busca, S; o cartão do guia 5, M5 | E e T propõem nome e descrição nas notas |
| `src/i18n/routes.ts` | S (a área do QR) | — |
| `scripts/guides/lib/*.ts`, `data/guides-measured.json` | M1, depois M5 | ninguém mais muda (o hash) |
| `src/tools/guides/measured.ts` (`BUILDERS`) | M1, depois M5 | — |
| `src/tools/guides/measured-types.ts` | S (a amostra de textos) | — |
| `scripts/oracle/calc.py`, `fixtures/calc/`, `src/tools/calc/guides.ts`, `GuideWordsById` | O | — |
| os textos `src/i18n/en/guide-<slug>.ts` | E de cada guia (as tabelas mínimas, M1/O/M5) | — |
| os textos `src/i18n/{pt,es}/guide-<slug>.ts` | T de cada guia (as tabelas mínimas, M1/O/M5) | — |
| `tests/e2e/tool-guides.spec.ts`, `guide-page.spec.ts`, as listas de specs | S | M5 acrescenta o guia 5 |
| `tests/unit/guides-numbers.test.ts` (`FEMININE`) | junção | T propõe nas notas |
| `tests/unit/guides-card.test.ts` (`SPEC_N`), `guide-page.test.ts` (`dropped`, `grouped`, `left`) | M1, M5 | — |
| `docs/i18n/{pt,es}.md` (as linhas dos guias) | S | T propõe |
| `src/platform/changelog.ts`, `whats-new.ts` | fatia 1; S e M5 acrescentam o guia 5 | — |
| `docs/lancamento/` | S | — |
| `DECISOES.md`, `docs/PENDENCIAS.md`, `docs/claude/` | o agente principal | as frentes escrevem rascunhos nas notas |

## 5. As frentes e a ordem (decisão 9)

Cada frente é um agente Opus numa worktree própria (um workflow), com o `git merge --ff-only fase-19b` como primeiro passo e o trailer `Co-Authored-By` em todo merge (`git merge --no-ff -F <arquivo>`). As notas de cada frente vão para o `.cache/f19b/fronts/<frente>/notes.md` do checkout principal.

1. **Ao mesmo tempo, a partir da fatia 1:** M1 (os planos, o `BUILDERS` e o JSON dos guias 1 a 4, medidos o quanto antes, antes das 21h de Brasília), O (os casos dos guias 6 a 8, as fixtures, o hash, o `guides.ts` e o `calc-guides.test.ts`) e S (os tipos do QR, o `embed` do QR, o grupo Utilidades, a amostra de textos, o portão de repetição e a contagem de palavras nos guias, as contagens, o kit, os specs, os glossários).
2. **Depois de M1:** E1 a E4 (um por guia), cada um com o texto em inglês; depois de cada E, o T do guia (pt e es).
3. **Depois de O e de M1:** E6 a E8; depois de cada um, o T do guia (es).
4. **Depois de M1 e de S:** M5 (o guia 5 no registro, os cartões, os textos mínimos, as páginas, o plano e o JSON); depois, E5 e T5.
5. **A junção** (o agente principal): as branches na ordem M1, O, S, E e T de cada guia, M5, E5, T5; as notas aplicadas (cartões, `toolSection`, `FEMININE`); os testes e os specs nos dois navegadores; os de anúncio no build de teste.
6. **O fechamento:** o orçamento contra o `dist-base`, o Lighthouse da amostra, as imagens, a revisão adversarial (cinco lentes), o `pnpm verificar --partes`, o relatório e o `gh pr ready`.

A válvula: se a run estourar, o guia 5 e, depois dele, os de dinheiro vão para uma run `fase-19c` (§, grupo 30 e relatório). Nunca se cortam os guias 1 a 4 nos três idiomas, as medidas antes dos textos e os portões.

## 6. Cada critério e a prova

| Critério | Prova |
| --- | --- |
| 1. A linha 16 | `PLANO-MELHORIAS.md`, § 777 |
| 2. Os guias no ar, 200 e portões | `serve-dist` com status 200; `pnpm gate:conteudo`; `guides-numbers`, `guide-page`, `guides-entries`, `guides-measured` e `repeticao` (Vitest) |
| 3. As medidas | `pnpm guias:medir --check` com 0 diferença; o commit do JSON antes dos textos (hashes no relatório); as medidas dos 10 antigos iguais (o `--check` e o diff do JSON) |
| 4. O oráculo | o commit das fixtures antes dos textos; `calc-guides.test.ts`, `calc-oracle.test.ts`, `pnpm gate:dinheiro-saude` |
| 5. As fontes | § 788 (a tabela com a data da leitura); nenhuma frase jurídica, médica ou de recomendação (lentes b e c) |
| 6. O site | `pnpm gate:seo`, `gate:links`, `changelog.test.ts`, `launch-kit.test.ts`, `guides-hub.spec.ts`, `guides-search.spec.ts`, `navigation.spec.ts` |
| 7. Anúncio e orçamento | no build de teste com IDs, `ads.spec.ts` e `fo-ad-map.spec.ts`; `budgets.spec.ts` e `i18n-budgets.spec.ts`; os JS do QR contra o `dist-base` |
| 8. Lighthouse, axe e CLS | Lighthouse com configuração temporária em `.cache/` (um guia de arquivo, um de dinheiro e o do QR); `a11y.spec.ts`; `layout-shift.spec.ts` |
| 9. Privacidade | os specs de privacidade, `launch-claims.spec.ts`, `events.spec.ts` |
| 10. Textos | `pnpm lint:texto` com 0 erro; `english-leak`, `glossary`, `claude-md`, `pendencias` |
| 11. Testes antigos | § 796, um por um |
| 12. Docs | a seção F19b do `docs/claude/idiomas.md`; o grupo 30 do `docs/PENDENCIAS.md` |
| 13. Verificar e CI | `pnpm verificar --partes` (saída no relatório); `gh pr checks`; `pnpm ci:custo` |
| 14. Revisão | `docs/relatorios/REVISAO-F19b.md`, sem achado alto ou médio aberto |
