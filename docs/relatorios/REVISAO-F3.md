# Revisão adversarial da F3

Revisão do código que está na `main` (F1a, F1b, F2 e os ajustes da prévia e do CI em partes), mais o que a F3 fez antes dela: a correção do aviso de cookies, o `gate:prontidao` e o hub. Run `fase-03`, 31/out/2026. Prompt: `docs/prompts/prompt-fase-03.md`. Plano e checklist: `docs/relatorios/fase-03-plano.md`.

## Método

- **Commit revisado:** `736b1cd5c332dcc023321f3cc9b6e9791f5952d7` (`docs: add the F3 plan and the review method`). Sobre a `main` em `f549f1b`, ele tem o aviso de cookies (`cf5fba8`, § 91), o `gate:prontidao` (`776bf40`, § 95) e o hub (`f5fa1c4`, § 96).
- **Onde:** uma worktree só de leitura, `.claude/worktrees/revisao-f3`, criada com `git worktree add --detach`. Ela teve o próprio `pnpm install --frozen-lockfile` e o próprio `pnpm build`. Nenhuma lente editou arquivo do repositório; cada uma escreveu só em `.cache/lente-<x>/` da worktree.
- **Seis lentes** (DECISOES § 92): (a) corretude, (b) privacidade, (c) política de anúncio e consentimento, (d) acessibilidade, (e) desempenho e SEO técnico, (f) aderência ao design system.
  - Cada lente foi um subagente Sonnet em contexto limpo, com o próprio `FO_PORT` (4174 a 4179) e a própria pasta de saída do Playwright.
  - O gabarito: as fichas F1a, F1b e F2, os critérios dos prompts dessas runs, o CLAUDE.md, o DECISOES.md, o `docs/design/`, a "Nota para a F3" e os baixos da F2.
  - Cada achado traz `arquivo:linha`, evidência rodada, a regra violada, a correção proposta e o custo no CI.
- **Severidade** (§ 93): crítico, alto, médio e baixo, pela régua da decisão 3 do prompt.
- **Céticos:** cada crítico, alto e médio teve um cético Sonnet próprio, em contexto limpo, com a tarefa de refutar. Ele reproduziu o problema, leu a regra e procurou teste que já cobrisse o caso. Os baixos de cada lente foram a um cético só, em lote. O veredito é confirmado, refutado ou rebaixado (às vezes subido), e só o que não foi refutado segue.
- **O que se corrige** (§ 94):
  - críticos e altos, sempre;
  - médios, quando a correção é local;
  - baixos, só os oito herdados da F2.
- **Estado de cada achado:** corrigido (com o commit e o §), pendência (com o dono) ou refutado.
- **Segunda passada:** subagentes novos em contexto limpo revisaram só o diff das correções contra o plano. O resultado está no fim deste arquivo.
- **Orquestração:** dois workflows, um para as seis lentes e os céticos e outro para a segunda passada. Os journals ficam fora do repositório; este arquivo transcreve o que eles devolveram.

## Resumo

Depois dos céticos, **nenhum achado crítico ou alto ficou de pé**.

- **Rebaixados de alto a médio:**
  - b-01, o removedor de metadados que deixava passar chunks privados;
  - d-01, a busca sem anúncio do "sem resultado";
  - d-02, os loops da Oli sem pausa (WCAG 2.2.2): o W3C ainda discute o caso, e a F1b já tinha deixado a decisão para o Victor.
- **Subido de baixo a médio:** d-06, a caixa pequena do Crop.
- **Médios:** todos os locais foram corrigidos, cada um com teste que falha no código de antes. O d-02 ficou como pendência do Victor, porque muda uma regra do design system (§ 103).
- **Baixos herdados da F2:** 1, 3 e 6 corrigidos, 7 corrigido na § 96, 2, 4 e 5 refutados, 8 fica para a F5 (o PDF de saída não tem metadado).
- **Os outros baixos** ficam como pendência, com a correção proposta, para a run 3b ou para o Victor.

## Tabela geral

| Lente | Achados | Crítico | Alto | Médio | Baixo | Refutados | Corrigidos | Pendentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (a) Corretude | 7 | 0 | 0 | 4 | 2 | 1 | 4 | 2 |
| (b) Privacidade | 7 | 0 | 0 | 4 | 2 | 1 | 4 | 2 |
| (c) Política de anúncio e consentimento | 8 | 0 | 0 | 3 | 2 | 3 | 3 | 2 |
| (d) Acessibilidade | 9 | 0 | 0 | 5 | 1 | 3 | 5 | 1 |
| (e) Desempenho e SEO técnico | 5 | 0 | 0 | 1 | 3 | 1 | 1 | 3 |
| (f) Aderência ao design system | 6 | 0 | 0 | 2 | 3 | 1 | 2 | 3 |
| **Total** | 42 | 0 | 0 | 19 | 13 | 10 | 19 | 13 |

As colunas de severidade contam o veredito final do cético, sem os refutados.

## Lente (a) · Corretude

Lente (a) Corretude sobre 736b1cd. O motor está sólido: 774 testes de unidade passam, e as matrizes e os testes de ferramenta passam em Chromium (27) e WebKit (64), com nenhuma requisição saindo da origem. Dos 7 pontos de partida do checklist, a suspeita do page.on('request') no worker foi descartada com prova. Os outros 6 viraram achados ou foram medidos. Achei 4 achados médios, todos com prova executada, e 3 baixos. Nenhum crítico nem alto. Os 4 médios: (1) falha ao carregar o engine-client vira "arquivo danificado" sem retry; (2) o worker do PDF não tem tratamento de erro e trava o painel para sempre; (3) o caminho da página sem OffscreenCanvas não roda no CI (a mensagem de aviso do teste não aparece no log do CI) e o teste que diz provar o worker passa com um mutante; (4) o strip de PNG e WebP é uma lista de bloqueio, então o chunk caBX (C2PA) sobrevive enquanto o cartão diz que os metadados saíram. Os portões de scripts/gates/ reprovaram 24 de 25 entradas quebradas.

**Conferido e certo:**

- Testes de unidade: `pnpm exec vitest run` completo = 48 arquivos, 774 testes, todos verdes (.cache/lente-a/vitest-all.txt); o subconjunto do motor (engine-*, strip, image-*, pdf-*, matrix-*, fixtures) = 20 arquivos, 334 testes verdes.
- Matriz e presets no Chromium (FO_PORT=4174): image-matrix + image-presets + image-batch = 27 testes verdes em 55 s. No WebKit (Windows, sem OffscreenCanvas no worker, então roda o caminho da página): matriz, presets, batch, smoke, island, tool, crop e privacy = 64 testes verdes em 2,8 min.
- SUSPEITA DESCARTADA: page.on('request') vê as requisições feitas de dentro de um worker dedicado. Script .cache/lente-a/worker-requests.ts: um fetch GET same-origin e um POST cross-origin feitos dentro de um Worker aparecem em page.on('request') e em context.on('request'), em Chromium e em WebKit. Além disso, image-privacy.spec exige que o worker do Resize busque mozjpeg_dec.wasm e squoosh_resize_bg.wasm, e o teste passa. Logo watchRequests() não é vácuo para o worker.
- Nenhum arquivo do usuário sai do aparelho: `grep fetch(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|importScripts` em src/ acha só runtime.ts (wasm de mesma origem) e search.ts (/search-index.json). A matriz exige `outside()==[]` e `writes==[]` em todo lote (matrix.ts:665-666).
- Fallback do worker para a página funciona: com `/_astro/worker-*.js` abortado (.cache/lente-a/worker-fail.ts), um lote de 2 arquivos em /compress-image/ termina com ZIP e '56% lighter' em Chromium e WebKit.
- O guarda de GPS é real: um mutante do dist que mantém todos os segmentos do JPEG (stripJpeg sem a lista de APPs) é reprovado por tool.spec.ts 'without gain' (`hasGps(bytes)` esperava false, recebeu true). O strip.test.ts também cobre a função.
- Portões pós-build contra um dist quebrado (.cache/lente-a/mutate.ts, 25 mutantes): cabecalhos 3/3 reprovados (COOP, sem nosniff, X-Robots-Tag); worker 2/3; seo 11/11 (robots bloqueando Googlebot e Mediapartners-Google, noindex em meta, canonical errado, hreflang removido, URL tirada ou sobrando no sitemap, título sem ' | FileOrca', og:image sumida, JSON-LD sem schema); links 3/3 (link morto, página órfã, src ausente); conteudo 5/5 (lorem ipsum, coming soon, TODO, título repetido, FAQ sem details). O único sobrevivente foi um .js com handler fetch em dist/_astro, que não é um Worker (sem `main`), então não é achado.
- Distância de 150 px dos anúncios nas páginas pt e es (que o ads.spec não cobre), medida com o mesmo TARGETS (.cache/lente-a/ads-i18n.ts): /pt/comprimir-imagem/ e /es/comprimir-imagen/ dão 166 px a 360 px e 150 px a 1280 px, em repouso e com fila de dois, em Chromium e WebKit. O código atende; só falta o teste.
- Sem skip, fixme, only, retries ou continue-on-error nos testes e nos portões: grep limpo; playwright.config.ts tem forbidOnly e retries 0. Os `if (...)` dentro de testes e2e (crop, smoke, coffee) têm `expect(...).not.toBeNull()` antes do `if`, então não são vácuos.
- Orçamento de JS e requisições (budgets.spec) exige status 200 e `scripts.size==2` por página de ferramenta; ads.spec e a11y exigem hidratação ou status 200, então um 404 não passa como página. A contagem '13 páginas de ferramenta' do gate:conteudo bate com 8 ferramentas + 3 presets + pt + es.
- Strip de JPEG por lista de permissão: só APP0, APP14 e o ICC do APP2 ficam; EXIF, XMP, IPTC, MPF e APP11 (C2PA) saem; o que vem depois do EOI não é copiado. A Orientation fica num Exif mínimo (documentado no § 33).
- APNG com Compress mantém a animação byte a byte (acTL, fcTL, fdAT preservados) em Chromium e WebKit; só Resize e PNG→JPG perdem os quadros sem avisar (ver a-05).

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| a-01 | Falha ao carregar o engine-client vira 'arquivo danificado' (decode) e não tenta de novo | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| a-02 | O worker do PDF não tem tratamento de erro: o painel trava em 'Building your PDF' para sempre, sem nenhum controle | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| a-03 | O caminho da página sem OffscreenCanvas não roda no CI, e o teste 'the work runs in the Web Worker' passa com o motor sempre na página | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| a-04 | O strip de PNG e de WebP é lista de bloqueio: chunks como caBX (C2PA), prVW e orNT sobrevivem em Compress e nos presets, e o cartão diz que os metadados saíram | médio | confirmado | médio | corrigido em e849869 (§ 100), o mesmo do b-01 |
| a-05 | PNG animado (APNG) vira imagem parada em Resize e PNG→JPG sem a nota de 'primeiro quadro' | baixo | confirmado | baixo | pendência (baixo fora dos herdados da F2; run 3b) |
| a-06 | A medida de distância dos anúncios só cobre páginas em inglês (pt e es só passam nos testes estáticos) | baixo | confirmado | baixo | pendência (baixo; run 3b) |
| a-07 | Dois portões ficam verdes sem ter conferido nada: lint:texto sem servidor e dinheiro-saude com 0 páginas | baixo | refutado | baixo | refutado |

### a-01 · Falha ao carregar o engine-client vira 'arquivo danificado' (decode) e não tenta de novo

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** src/tools/image/ImagePanel.tsx:299 e :325-327 (HOPELESS em :42)
- **Regra:** P2 critério 5 / DECISOES § 64 (o erro por arquivo diz a causa certa); sinal de tool_error 'decode' deve ser arquivo ruim e não bug de compatibilidade (§ 71, lista fechada de eventos). Régua da decisão 3: erro real de impacto pequeno ou raro = médio.
- **Correção proposta pela lente:** Em run(), quando `engine === null` (ou a exceção não vem do motor), liquidar com um motivo que não esteja em HOPELESS, para a próxima troca de opção tentar de novo. Dar a esse motivo um texto próprio ('Oli couldn't load her tools. Check your connection and reload the page.') nos 3 idiomas. Manter o evento na lista fechada, com reason 'encode', sem valor novo no GA4. Teste e2e: abortar o engine-client, escolher o arquivo, esperar a fala nova, liberar a rota, trocar a opção e esperar o resultado. (custo no CI: Um teste Playwright por navegador, uns 4 s cada. Soma 4 a 8 s a uma parte do CI. Nenhum portão novo.)

**Evidência da lente:**

> Script .cache/lente-a/engine-load-fail.ts: o chunk /_astro/engine-client.*.js é abortado e o arquivo é um JPG bom (fixtures/images/jpg-01-pixel2-retrato-gps.jpg, 4,3 MB). Chromium e WebKit mostram: "Oops, Oli couldn't read this file good-photo.jpg is damaged, so Oli can't read it. Try another copy of the file." Com a rede de volta e a opção Strong trocada, a mesma tela fica igual, sem nova tentativa. O dataLayer traz tool_error {codec:'unknown', reason:'decode'} e tool_complete {outcome:'failed'}. O código: `await import('./engine-client.ts').catch(() => null)` (:299), `engine ? ... : { ok:false, reason:'decode' }` (:325), `catch { result = { ok:false, reason:'decode' } }` (:327), e 'decode' está em HOPELESS, então run() marca o item como sem esperança (`item.next = settled || hopeless ? null`). O gatilho real é uma aba aberta durante um deploy (o chunk com hash sai do Workers Assets e dá 404) ou uma rede que cai. Nenhum teste cobre isso: grep de 'engine-client' e 'route.abort' em tests/ só acha o comentário do slowEngine.

**Cético:**

> O defeito é real, reproduz nos dois navegadores e não tem teste. Uma falha de rede ou 404 ao carregar o chunk do motor, que não tem nada a ver com o arquivo, vira reason 'decode'. O resultado é a mensagem errada ("damaged") para um arquivo bom, a falha marcada como HOPELESS (a troca de opção não tenta de novo) e um tool_error 'decode' no GA4, que o § 71 define como vindo do motor e que o dono lê como arquivo ruim.
> 
> A regra citada não diz isso literalmente. O critério 5 da F2 trata de corrompido, truncado, vazio e texto com extensão .png, e o § 64 trata do reconhecimento pela estrutura. Nenhum fala de falha de carga do chunk. O apoio real é o § 71 (o reason vem do motor, e aqui o painel o inventa) e a coerência com o assemble(), que já usa 'encode' para falha de infraestrutura. O achado vale como erro real, não como violação literal de um critério.
> 
> Severidade: pelo texto da régua é "medio" (erro real com impacto pequeno ou raro). O gatilho é raro: queda de rede no primeiro uso, ou aba velha aberta durante um deploy, e o chunk com hash some do Assets. Não é uma ferramenta nem um navegador específico, então não chega a "alto". Não é "baixo" porque a mensagem é errada, o evento polui o GA4 e, no Safari, a sessão fica inutilizável até o reload, culpando o arquivo. Não é "critico": nenhum arquivo sai do aparelho, nenhum número vai à URL e o arquivo entregue nunca é errado.
> 
> Ressalva sobre o conserto proposto: a mensagem "check your connection and reload the page" está certa e é necessária. A parte "liberar a rota, trocar a opção e esperar o resultado" não passa no WebKit como está escrita, porque o import() falho fica em cache. O teste em WebKit precisa esperar a fala nova e parar aí, ou o conserto precisa de um retry que não dependa do módulo em cache. O custo de CI estimado (4 a 8 s) é plausível.
> 
> O que rodou ou leu: Reproduzi com scripts próprios em .cache/cetico-a-01/ (repro.ts, retry.ts, webkit-cache.ts), servindo o dist/ da worktree na porta 4300 e bloqueando todo domínio do Google. A página é /compress-image/ e o arquivo é um JPG bom (fixtures/images/jpg-01-pixel2-retrato-gps.jpg, 4.360.452 B).
> 
> 1) Chunk abortado (MODE=abort) e chunk respondido com 404 em HTML (MODE=404, o que o Workers Assets faz depois de um deploy). Chromium e WebKit mostram o mesmo: "Oops, Oli couldn't read this file good-photo.jpg is damaged, so Oli can't read it. Try another copy of the file." Com a rede de volta e a opção Strong trocada, a tela não muda e não sai nenhuma requisição nova do engine-client (0 novas). O dataLayer traz tool_start, tool_error {codec:'unknown', reason:'decode'} e tool_complete {outcome:'failed'}.
> 
> 2) Código lido: ImagePanel.tsx:299 (`await import('./engine-client.ts').catch(() => null)`), :325 (`engine ? ... : { ok:false, reason:'decode' }`), :327 (`catch { result = { ok:false, reason:'decode' } }`), :42 ('decode' em HOPELESS) e :273-274 (`item.next = settled || hopeless ? null : ...`). O settle() em :135-139 emite o tool_error com o reason 'decode'. O mesmo padrão tem um precedente no próprio arquivo: a falha de assemble() em :342-343 vira 'encode', que não é HOPELESS.
> 
> 3) Teste que cubra: nenhum. grep em tests/ por engine-client, abort, route(, setOffline e offline acha só o slowEngine (tests/e2e/lib/page.ts:185, que atrasa o worker e não o engine-client) e a rota de woff2 no design.spec.ts. O commit posterior 11a0646 (offline depois de carregado) não cobre a primeira carga falhando e está fora do 736b1cd. Nenhum teste unitário de ImagePanel.
> 
> 4) Detalhe que muda o conserto, não o achado (retry.ts e webkit-cache.ts): depois da falha, um novo lote na mesma página no Chromium refaz o import() e funciona (requests=2, processa). No WebKit o import() do app fica preso na falha em cache: o novo lote não faz requisição (requests=1) e mostra "damaged" de novo para o arquivo bom (good-photo2.jpg) até a página ser recarregada. Um import() direto da mesma URL via page.evaluate funciona no WebKit e destrava o seguinte. Ou seja, no Safari a ferramenta fica morta na sessão, com a mensagem culpando o arquivo, e só o reload resolve.
> 
> Teste que já cobria: nenhum

### a-02 · O worker do PDF não tem tratamento de erro: o painel trava em 'Building your PDF' para sempre, sem nenhum controle

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** src/tools/image/pdf-client.ts:10-11 e :28; src/tools/image/ImagePanel.tsx:343-346
- **Regra:** P2 critério 5 (o lote não trava e o erro é por arquivo) e DECISOES § 64; contraste com o contrato do engine-client.ts, que trata o worker que não sobe ('Only a worker that cannot start is turned into the page path'). Régua da decisão 3: erro real raro = médio.
- **Correção proposta pela lente:** No pdf-client.ts, escutar `error` no Worker, fazer `Promise.race([api.build(...), broken])` e rejeitar. O catch de assemble() já liquida os itens. Trocar o texto de 'encode' nesse caso pelo texto de recarregar da a-01. Opcional: o PDF cair para o build na página, importando engine/pdf/build.ts dinamicamente, como o zipFiles faz com o ZIP. Teste e2e: abortar o worker do PDF e exigir que a tela saia de 'Building your PDF' em poucos segundos. (custo no CI: Um teste por navegador, uns 5 s. Soma até 10 s a uma parte do CI.)

**Evidência da lente:**

> Script .cache/lente-a/pdf-worker-fail.ts e pdf-hang.ts. Com o /_astro/worker-JmqecDMu.js (o worker do PDF) abortado, em /image-to-pdf/ com um JPG bom: após 12 s e depois após 35 s o painel diz '100% Building your PDF', com 0 botão de download e 0 controles (a lista de `button, a` dentro de #fo-tool-root vem vazia; só o role=status 'Building your PDF'). Sem Cancelar e sem Start over, só recarregando a página. Chromium e WebKit iguais. O pdf-client.ts cria `new Worker(...)` e faz `wrap()` sem escutar o evento 'error' e sem corrida, ao contrário do engine-client.ts (`broken`). A promessa de `build()` nunca resolve, e o try/catch de `assemble()` em ImagePanel.tsx:343 nunca dispara. Com o chunk /_astro/pdf-client.*.js abortado, o resultado é outro erro: todos os arquivos viram 'This browser couldn't save a.jpg. Try again in another browser.' (reason 'encode' no :345), que culpa o navegador por um problema de rede.

**Cético:**

> O defeito é real e reproduz nos dois navegadores. O painel fica em 'Building your PDF' sem controle, e nem trocar a opção nem soltar outro arquivo recupera, porque o worker quebrado fica guardado. A recuperação é só recarregar, e o contraste com o engine-client.ts é claro. Duas ressalvas ao achado. (a) A regra citada não diz isso: o critério 5 da F2 (docs/prompts/prompt-fase-02.md:178) fala de arquivo corrompido, truncado, vazio ou texto com extensão .png, e o § 64 trata de reconhecer o truncado pela estrutura. Nenhum dos dois cobre falha de carga de worker. O que vale é o princípio de 'não travar' e o contrato do engine-client ('Only a worker that cannot start is turned into the page path'), por analogia. (b) O gatilho é estreito: uma falha transitória só na requisição do worker do PDF, depois de o chunk pdf-client ter carregado. Aba velha depois de deploy erra primeiro no pdf-client e cai no caso com saída. A régua dá 'erro real com impacto pequeno ou raro' como médio: nada sai do aparelho, nada é perdido e recarregar resolve. Não chega a alto, porque não é erro funcional em uso normal. Não é baixo, porque é um beco sem saída sem controle algum. Mantenho médio. A correção proposta (ouvir 'error', Promise.race com `broken`, zerar o singleton, texto de recarregar em vez de 'encode') está certa.
> 
> O que rodou ou leu: Reproduzi com meus próprios scripts (.cache/cetico-a-02/prove.ts e recover.ts), contra o dist/ da worktree servido em 127.0.0.1:4301, com o Google bloqueado. Confirmei que /_astro/worker-JmqecDMu.js é o worker do PDF (contém PDFDocument). Leitura do código: src/tools/image/pdf-client.ts:10-11 faz `wrap(new Worker(...))` sem ouvir 'error' e sem corrida; a promessa de `build()` fica pendente. O catch de assemble() em ImagePanel.tsx:343 não dispara. O engine-client.ts:25-31,55,66 tem `broken` e Promise.race. Saída em Chromium e WebKit, um JPG bom em /image-to-pdf/, 10 s depois: (1) controle sem bloqueio: botão de download 1, 'Done! Your PDF is ready'. (2) worker do PDF abortado (a rota foi acionada uma vez): download 0, controls=[] (nenhum button nem a em #fo-tool-root), texto '100% Building your PDF', sem erro no console. O screenshot mostra o painel preso em 100%. (3) chunk pdf-client abortado: 'This browser couldn't save a.jpg. Try again in another browser.' com o botão 'Choose other files', ou seja, esse caso tem saída e só o texto culpa o navegador. Prova extra (recover.ts, Chromium): depois do bloqueio, removi o bloqueio (rede de volta), troquei o tamanho da página para Letter e escolhi um arquivo novo. Seguiu 'Building your PDF', 0 botões, nos dois casos, porque o `remote` do pdf-client é um singleton em módulo que nunca é refeito. Só recarregar a página deu 'Done!' com o botão de download. O repo ficou limpo (git status vazio) e o servidor foi encerrado.
> 
> Teste que já cobria: nenhum

### a-03 · O caminho da página sem OffscreenCanvas não roda no CI, e o teste 'the work runs in the Web Worker' passa com o motor sempre na página

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** tests/e2e/tool.spec.ts:41-48; src/tools/image/engine-client.ts:45-59; src/engine/image/work.ts:37-43 (ramos de HTMLCanvasElement)
- **Regra:** CLAUDE.md F1a (o motor cai para a página; 'os testes cobrem os dois caminhos sem depender disso') e DECISOES § 22. Régua: teste que não prova o que diz = médio.
- **Correção proposta pela lente:** (a) No teste existente, trocar o console.log por asserção: quando a página tem OffscreenCanvas, nenhum pedido a /_astro/process.*.js (esse chunk só é importado pelo caminho da página; o worker leva o processImage embutido). (b) Teste novo, nos dois navegadores: `page.route(/\/_astro\/worker-[\w-]+\.js$/, async route => { const r = await route.fetch(); await route.fulfill({ response: r, body: 'delete globalThis.OffscreenCanvas;\n' + await r.text() }); })`, subir o GPS_PHOTO, e exigir resultado válido, sem GPS e com um pedido a process.*.js. Opcional: o mesmo com HEIC e com uma imagem acima de 16,7 MP. (custo no CI: Um teste novo por navegador (uns 5 s) e uma asserção a mais. Soma uns 5 a 10 s a uma parte do CI.)

**Evidência da lente:**

> (1) Mutante: copiei o dist, troquei em engine-client.*.js `if(!a||!await Promise.race([...]))return s(...)` por `if(true)return s(...)` (o motor sempre na página) e servi na porta 4374. `FO_PORT=4374 pnpm exec playwright test tests/e2e/tool.spec.ts -g 'the work runs in the Web Worker' --project=chromium` => '1 passed (5.6s)'. O teste só afirma `workers.some(url => /worker-.../)`, e o worker sempre é criado, porque canvasInWorker() o consulta, mesmo quando o trabalho roda na página. O `console.log` do caminho usado não é asserção. (2) O CI: no log da run 41226056230 (5797 linhas, `gh run view --log`), os console.log chegam (28 linhas 'JS inicial'), mas a mensagem 'este navegador não tem OffscreenCanvas: o motor rodou na página' aparece 0 vezes em qualquer parte; as 64 execuções locais do WebKit no Windows a imprimem. Ou seja, no Linux do CI o worker tem OffscreenCanvas nos dois navegadores, e o ramo `document.createElement('canvas')`/`toBlob` e o carregamento dos codecs na thread principal só rodam na máquina do Victor. (3) O caminho é forçável: .cache/lente-a/force-page-path.ts intercepta o worker e antepõe `delete globalThis.OffscreenCanvas;`. No Chromium (que tem OffscreenCanvas) a página pede /_astro/process.BL9r16IW.js e o resultado sai ('72% lighter'); sem o prefixo, nenhum pedido a process.*.js (normal-path.ts).

**Cético:**

> O achado se sustenta. O teste "the work runs in the Web Worker..." passa com o motor sempre na página (mutante verde), então não prova o que o nome diz. Isso casa com a régua "teste que não prova o que diz = médio". A regra citada existe: CLAUDE.md:86 diz "os testes cobrem os dois caminhos sem depender disso", e nenhum teste em tests/ força o caminho da página. No CI Linux o WebKit tem OffscreenCanvas (a mensagem de aviso aparece 0 vezes no log, e os console.log chegam), então o caminho da página, incluindo document.createElement('canvas') e a carga dos codecs na thread principal, só roda na máquina do Victor. Não rebaixo para baixo porque a promessa escrita de cobertura dos dois caminhos fica sem teste no CI, que é o portão do merge automático. Não subo para alto porque forçado o caminho da página funciona (sem erro funcional) e o impacto real é só perder o alarme se o worker passar a falhar e o motor cair em silêncio para a página. Correção ao conserto proposto: o prefixo no worker sozinho não cobre o ramo HTMLCanvasElement em Chromium nem no WebKit do Linux, porque a página mantém OffscreenCanvas. O teste novo precisa também de `addInitScript(() => { delete window.OffscreenCanvas; })`, e a asserção de "nenhum pedido a process.*.js" no teste existente continua válida e barata.
> 
> O que rodou ou leu: Reproduzi tudo na worktree revisao-f3 (commit 736b1cd), com servidores só meus (4302 dist original, 4374 cópia mutada em .cache/cetico-a-03/mut), já encerrados.
> 
> (1) Teste lido: tests/e2e/tool.spec.ts:41-48 só afirma `workers.some(url => /\/_astro\/worker-[\w-]+\.js$/.test(url))`; o `console.log` da linha 48 não é asserção. src/tools/image/engine-client.ts:34-39 (`current()`/`start()`) cria o worker em qualquer caso, porque `canvas: api.canvasInWorker()` o consulta, mesmo quando o trabalho depois roda na página (engine-client.ts:52-53 e o `catch` de 55-58, que engole qualquer falha do worker e cai para `onPage`).
> 
> (2) Mutante: copiei dist/ e troquei em dist/_astro/engine-client.5wBR8ctJ.js `if(!a||!await Promise.race([a.canvas,a.broken.catch(()=>!1)]))return s(e,n,r,i);` por `if(true)return s(e,n,r,i);` (motor sempre na página). `FO_PORT=4374 pnpm exec playwright test tests/e2e/tool.spec.ts -g "the work runs in the Web Worker" --project=chromium` => "1 passed (8.5s)". Sonda própria (.cache/cetico-a-03/probe.ts), Chromium: original => process.*.js=[] (worker); mutante => process.*.js=["/_astro/process.BL9r16IW.js"] e o mesmo cartão "Done! Your image is 72% lighter.". O teste não distingue os dois.
> 
> (3) CI: no log da run 41226056230 (.cache/lente-a/ci-41226056230.log, 5797 linhas) o teste passa em chromium (linha 3709) e em webkit 2 de 2 (linha 5471). A mensagem "este navegador não tem OffscreenCanvas: o motor rodou na página" aparece 0 vezes, enquanto os console.log de budgets.spec.ts:58 chegam (28 linhas "JS inicial"). Logo, no Linux do CI o WebKit tem OffscreenCanvas e o caminho da página não roda no CI; só roda no WebKit do Windows do Victor (sonda: pristine/webkit => pageHasOffscreen=false, process.*.js pedido).
> 
> (4) Cobertura existente: grep em tests/ por OffscreenCanvas, `_astro/`, engine-client, `worker`: nenhum teste força o caminho da página nem afirma que process.*.js não é pedido. vitest roda em environment 'node' (vitest.config.ts:8), então nem os ramos de HTMLCanvasElement de work.ts:38-43 e :148 são exercidos por unit. slowEngine (tests/e2e/lib/page.ts:182) só segura o worker.
> 
> (5) Forçar o caminho existe, mas o conserto (b) do achado é incompleto. Script .cache/cetico-a-03/force-full.ts. Só com o prefixo `delete globalThis.OffscreenCanvas` no worker, em Chromium: pageHasOffscreen=true, process.*.js pedido, resultado JPEG válido de 717070 bytes, mas a página ainda usa `new OffscreenCanvas` (work.ts:38). Com prefixo no worker mais `page.addInitScript(() => delete window.OffscreenCanvas)`: espião => canvases=1 (document.createElement('canvas') chamado), JPEG válido, 72% lighter, igual nos dois navegadores. Não achei bug: o caminho da página funciona quando forçado; o toBlob (work.ts:148) não é chamado no Compress, que usa MozJPEG, então só uma ferramenta de conversão o exerce.
> 
> Teste que já cobria: nenhum

### a-04 · O strip de PNG e de WebP é lista de bloqueio: chunks como caBX (C2PA), prVW e orNT sobrevivem em Compress e nos presets, e o cartão diz que os metadados saíram

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 100), o mesmo do b-01.
- **Onde:** src/engine/image/strip.ts:126 (PNG_DROP), :145-165 (stripWebp); usado em process.ts:72 e :284
- **Regra:** P2 critério 4 / DECISOES § 33 (a saída sai sem metadados) e a fala do cartão 'Oli removed the photo metadata'. O critério nomeia GPS, Exif, XMP e IPTC, que de fato saem; o chunk C2PA não está nessa lista, mas a promessa na tela é mais ampla. Régua: impacto raro e sem GPS por padrão = médio.
- **Correção proposta pela lente:** Passar o stripPng e o stripWebp para lista de permissão. PNG: IHDR, PLTE, IDAT, IEND, tRNS, gAMA, cHRM, sRGB, iCCP, sBIT, cICP, pHYs, bKGD, acTL, fcTL, fdAT. WebP: VP8, VP8L, VP8X (sem os bits EXIF e XMP), ALPH, ANIM, ANMF, ICCP. Teste de unidade em strip.test.ts com um PNG que leva caBX, prVW e orNT, e um WebP com um chunk desconhecido. (custo no CI: Só Vitest, menos de 1 s. Nenhum e2e novo.)

**Evidência da lente:**

> Script .cache/lente-a/png-chunks.ts: PNG de 128x128 com os chunks IHDR, tEXt('GPS 48.8584N...'), caBX, prVW, orNT, IDAT, IEND. Em /compress-image/ a saída tem chunks=IHDR,caBX,prVW,orNT,IDAT,IEND (468 B) e o cartão diz 'Oli removed the photo metadata, including the GPS location.' No preset /compress-image/to-100kb/ (caminho 'fits' via originalStripped) a saída é IHDR,caBX,prVW,orNT,IDAT,IEND (49.450 B). Só tEXt/zTXt/iTXt/eXIf/tIME são removidos. Em /resize-image/ o PNG sai fresco do canvas (IHDR,IDAT,IDAT,IEND), o que prova que o problema é só o caminho de strip. O JPEG usa lista de permissão (só APP0, APP14 e ICC ficam) e está certo. Content Credentials (caBX) é o formato de PNGs gerados por IA e de câmeras recentes, e pode levar autor, dispositivo e, por especificação, asserções stds.exif com local. Nenhuma fixture nem o oráculo têm um chunk assim, então nenhum teste pega.

**Cético:**

> O defeito é real e reproduzido nos dois caminhos de strip (Compress lossless de PNG e originalStripped), com a prova de unidade mostrando que um chunk desconhecido leva o texto adiante em PNG e em WebP. O cartão e a Política dizem "photo metadata" e um manifesto de proveniência (caBX/C2PA) continua no arquivo. Há também a inconsistência entre formatos: o JPEG descarta o C2PA, o PNG e o WebP o mantêm. No Compress de PNG o IDAT é recomprimido, então o manifesto sai com a ligação por hash quebrada. Mantenho "medio", pela régua "erro real com impacto pequeno ou raro", e não subo porque (a) o § 33 e o critério 4 da F2 estão atendidos à letra, (b) não demonstrei GPS dentro de um caBX real, e a spec moderna tirou o stds.exif, e (c) só entram PNG e WebP com manifesto C2PA ou chunk privado, que na prática são PNG de gerador de IA ou de editor, não foto de celular. Não rebaixo para baixo porque a afirmação na tela fica falsa para esses arquivos num produto cuja promessa é privacidade, e nada no CI pegaria. Ressalvas sobre o conserto proposto: a lista de permissão do PNG não traz mDCV, cLLI, sPLT nem hIST (os dois primeiros afetam HDR), e tirar o C2PA é escolha de produto, então o teste de unidade deve fixar a decisão.
> 
> O que rodou ou leu: REPRODUZIDO por mim, na worktree revisao-f3 (commit 736b1cd), com o dist/ pronto servido na porta 4303 (já parada) e o Playwright em Chromium com o Google bloqueado.
> 
> 1. Script .cache/cetico-a-04/png-chunks.ts (cópia do script da lente). Entrada: PNG 128x128 com IHDR,tEXt(GPS),caBX,prVW,orNT,IDAT,IEND. Saída lida do download:
> - /compress-image/ -> 468 B, chunks=IHDR,caBX,prVW,orNT,IDAT,IEND. Cartão: "Oli removed the photo metadata, including the GPS location."
> - /compress-image/to-100kb/ -> 49450 B, chunks=IHDR,caBX,prVW,orNT,IDAT,IEND (caminho 'fits' por originalStripped). Cartão: "Oli kept the original image, without the photo metadata."
> - /resize-image/ -> chunks=IHDR,IDAT,IDAT,IEND (PNG fresco do canvas, sem o problema).
> O tEXt com o "GPS" saiu, como o § 33 manda. Só o que está fora da lista de bloqueio fica.
> 
> 2. Prova de unidade (.cache/cetico-a-04/unit-proof.ts, importa src/engine/image/strip.ts):
> - stripPng: IHDR,tEXt,caBX,iDOT,IDAT,IEND -> IHDR,caBX,iDOT,IDAT,IEND. O texto "GPSLatitude" que pus dentro do caBX sobrevive.
> - stripWebp: um chunk RIFF "C2PA" desconhecido sobrevive, com o texto dentro.
> 
> 3. Código: strip.ts:126 `PNG_DROP = tEXt,zTXt,iTXt,eXIf,tIME`, usado em :138; strip.ts:156 só tira 'EXIF' e 'XMP '. Usado em process.ts:72 (originalStripped: no-gain, cannot-encode, fits) e :284 (compressPng). O JPEG (strip.ts:95) usa lista de permissão e descarta o APP11 do C2PA. Logo a mesma coisa (C2PA) é tirada do JPG e mantida no PNG/WebP.
> 
> 4. Regra:
> - DECISOES § 33 lista exatamente esses chunks (PNG: tEXt, zTXt, iTXt, eXIf, tIME; WebP: EXIF e XMP), então o código faz o que o § diz e a escolha da lista de bloqueio é deliberada. O "Por quê" do § 33 fala da localização.
> - Critério 4 da F2 (prompt-fase-02.md:177): "Nenhuma saída leva GPS nem outra localização", lido em eXIf/iTXt/tEXt/zTXt etc. Isso é atendido: nenhum GPS por esses portadores.
> - A promessa mais larga está na ficha da F2 (linha 12, "nenhum metadado na saída"), no cartão (src/tools/image/i18n/en.ts:59-70), na Política (src/i18n/en/privacy.ts:24) e em image-tools.ts:28 ("leaves out the photo metadata, including the GPS location"). O CLAUDE.md (F2) define "sem metadados" como sem Exif, XMP, IPTC e GPS. Pela definição do projeto o caBX está fora, mas o texto mostrado ao usuário é mais amplo.
> - C2PA: o fetch do spec (v2.1) não chegou aos apêndices, e eu não confirmei se um manifesto real leva GPS. A v2.0 trocou a asserção stds.exif pelo c2pa.metadata, de esquemas fixos. Por isso o GPS via caBX continua hipótese, e a gravidade não sobe para crítico.
> 
> 5. Teste que cubra: grep em tests/. tests/unit/strip.test.ts:48-82 só testa tEXt+eXIf no PNG e EXIF+XMP no WebP. image-smoke.spec.ts, matrix.ts e metadataReport (tests/e2e/lib/images.ts:124-163) olham só Exif, XMP, IPTC, GPS e pngMetadataChunks. As únicas fixtures PNG (gen-png-transparente, gen-texto-extensao-png) não têm chunk desconhecido. Nenhum teste cobre.
> 
> Teste que já cobria: nenhum

### a-05 · PNG animado (APNG) vira imagem parada em Resize e PNG→JPG sem a nota de 'primeiro quadro'

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo fora dos herdados da F2; run 3b).
- **Onde:** src/engine/image/process.ts:342 (só `info.animated` do WebP gera a nota 'first-frame'); probe.ts (sem acTL)
- **Regra:** P2 decisão 6 (WebP animada vira o 1º quadro, dito no cartão); a mesma honestidade vale para o APNG. Impacto: raro.
- **Correção proposta pela lente:** Em probe.ts, detectar acTL no PNG e marcar `animated: true`. O processImage já empurra a nota 'first-frame' e o Compress já devolve o original limpo. Teste de unidade em engine-probe.test.ts e um caso no engine-process.test.ts. (custo no CI: Só Vitest, menos de 1 s.)

**Evidência da lente:**

> Script .cache/lente-a/apng.ts com um APNG de 2 quadros (chunks IHDR,acTL,fcTL,IDAT,fcTL,fdAT,IEND). Compress mantém a animação (saída com acTL, fcTL, fdAT). Resize dá IHDR,IDAT,IDAT,IEND (sem acTL) e o cartão diz só 'Done! Your image is resized.' PNG→JPG dá um .jpg e 'Done! Your image is converted.' Nenhuma fala avisa que a animação foi perdida, enquanto o WebP animado avisa ('kept the first frame'). grep -i 'acTL|APNG' em src/, tests/, scripts/ e DECISOES.md não acha nada: o caso não foi decidido.

**Cético:**

> A perda silenciosa da animação existe. A decisão 6 do P2 só nomeia o WebP ('WebP animada vira o primeiro quadro, e o resultado diz isso'), então estender isso ao APNG é por analogia, não texto literal. O impacto é raro: APNG é incomum, e PNG→JPG ter que achatar é esperado. Em Resize, porém, a pessoa espera continuar com uma animação, e o cartão não avisa. É lacuna de verdade e não preferência de estilo, mas sem violar uma regra escrita, o que mantém baixo. A correção proposta é segura. Marcar animated=true no PNG só dispara a nota em processImage, porque o compressPng roda antes do ramo da nota e o Compress segue igual. O decode.ts:85 (too-large para animado) já vale para PNG grande, que hoje é too-large de qualquer jeito (DECISOES § 29, linha 375).
> 
> O que rodou ou leu: Reproduzi com um APNG de 2 quadros (IHDR,acTL,fcTL,IDAT,fcTL,fdAT,IEND) no dist/ servido na porta 4430, em Chromium e WebKit (script em .cache/cetico-a-baixos/apng.ts). Compress devolve anim.png com acTL, fcTL e fdAT, então a animação fica. Resize devolve IHDR,IDAT,IDAT,IEND (Chromium) ou IHDR,sBIT,sRGB,IDAT,IEND (WebKit), sem acTL, e o cartão diz só 'Done! Your image is resized.' PNG→JPG devolve anim.jpg e 'Done! Your image is converted.' Em nenhum dos dois aparece a nota de primeiro quadro. Em src/engine/image/probe.ts, o probePng não lê acTL, e só o VP8X do WebP seta animated. Em process.ts:342 a nota 'first-frame' depende de info.animated. grep -i 'acTL|APNG' em src/, tests/, scripts/, DECISOES.md, PLANO e docs/prompts não acha nada, então o caso nunca foi decidido nem testado. Só o WebP tem teste (engine-process.test.ts:145 e as fixtures animadas da matriz).
> 
> Teste que já cobria: nenhum

### a-06 · A medida de distância dos anúncios só cobre páginas em inglês (pt e es só passam nos testes estáticos)

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; run 3b).
- **Onde:** tests/e2e/ads.spec.ts:20-32 (TOOL_PAGES); tests/e2e/budgets.spec.ts:17-29 já inclui pt e es
- **Regra:** P2 critério 14 e P1a critério 2 (150 px nos três idiomas das páginas com anúncio).
- **Correção proposta pela lente:** Acrescentar '/pt/comprimir-imagem/' e '/es/comprimir-imagen/' em TOOL_PAGES do ads.spec.ts (a lista de SMALL_OF já serve, o JPG gerado vale). Considerar '/image-tools/' com os estados de repouso. (custo no CI: Dois testes de uma carga cada, uns 8 a 10 s por navegador. Soma uns 10 s a uma parte do CI.)

**Evidência da lente:**

> TOOL_PAGES do ads.spec.ts tem 11 caminhos, todos em inglês. Medi pt e es à mão com o TARGETS do próprio teste (.cache/lente-a/ads-i18n.ts): /pt/comprimir-imagem/ e /es/comprimir-imagen/ dão mínimo 166 px a 360 px e 150 px a 1280 px, em repouso e com fila de dois, em Chromium e WebKit. O código está dentro do requisito, hoje. Só não há teste que reprove se alguém quebrar o layout em pt ou es. O hub /image-tools/ também não entra.

**Cético:**

> É lacuna de cobertura real: as páginas pt/es do Compress são páginas de ferramenta com AdSlot e nenhum teste reprova se o layout delas quebrar. A regra citada está um pouco inflada. O critério 2 da P1a não diz 'três idiomas'. Quem cobre é o critério 14 da P2 ('toda página de ferramenta e de preset'). O risco prático é mínimo, porque a distância vem de CSS compartilhado (margin-block: var(--ad-clearance) e column-gap no global.css:66) e só o texto muda por idioma. Na parte do hub, o achado está parcialmente errado: ads.spec.ts (teste 'the hub keeps its one content AdSlot under the grid…') já mede a ordem do AdSlot e a distância da Oli no /image-tools/, que não tem Baixar, campo nem painel. Em síntese, fica só a lacuna pt/es, com custo de uns 10 s por navegador.
> 
> O que rodou ou leu: tests/e2e/ads.spec.ts:20-32: TOOL_PAGES tem 11 caminhos, todos em inglês. O git log -S mostra que /pt/ e /es/ de ferramenta nunca entraram na medida de distância (nem na F1a, nem na F1b). O budgets.spec.ts:17-29 inclui as duas. grep de 'fo-ad|CLEARANCE' em tests/ e scripts/ mostra que só o ads.spec.ts mede distância. Reproduzi a medida com o TARGETS do teste nas páginas pt e es, em Chromium e WebKit, em repouso e com fila de dois: mínimo de 166 px a 360 px e 150 px a 1280 px nas duas. O código hoje cumpre o requisito.
> 
> Teste que já cobria: parcial: o hub tem teste próprio de ordem e distância da Oli (ads.spec.ts, teste do hub). Nada cobre pt/es.

### a-07 · Dois portões ficam verdes sem ter conferido nada: lint:texto sem servidor e dinheiro-saude com 0 páginas

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** scripts/gates/lint-texto.ts:145 e :161-164 (exit 0); scripts/gates/dinheiro-saude.ts
- **Regra:** CLAUDE.md Testes ('Desligar, pular ou afrouxar teste é proibido'); portão que não reprova o que diz (decisão 2). É decisão documentada e o risco é pequeno, por isso baixo.
- **Correção proposta pela lente:** Para o lint:texto: no CI (variável CI=true), tratar 'servidor indisponível' como falha, e deixar o exit 0 só local. Para o dinheiro-saude: nada agora; a F4 precisa de um teste que garanta `páginas conferidas > 0` quando existir um hub. (custo no CI: Zero no caminho feliz.)

**Evidência da lente:**

> lint-texto.ts: se o LanguageTool não sobe em 90 s ou falha no meio, o script imprime 'AVISO, LanguageTool indisponível; nada reprovado' e sai com 0. É a decisão documentada do § 24 ('Sem servidor, avisa e não reprova'), mas o log do CI mostra só ok. No log da run 41226056230 o passo disse 'lint:texto: nenhum texto alterado' em 0,8 s. O gate dinheiro-saude imprime 'ok, 0 página(s) desses hubs conferida(s)' (rodado no dist copiado), pois não há hub YMYL antes da F4; a lib é coberta por ymyl.test.ts.

**Cético:**

> Nenhum dos dois portões afirma mais do que faz: ambos dizem na saída o que conferiram ou deixaram de conferir. Os dois comportamentos são decisões fechadas do PLANO, do DECISOES e da P1a, e o CLAUDE.md manda tratar as 'Decisões fechadas' como contrato. A correção proposta para o lint:texto (reprovar no CI quando o servidor cai) contradiria o PLANO:479. Pedir um teste de 'páginas conferidas > 0' na F4 é recomendação para a próxima fase, não defeito da F3. Não é desligar, pular nem afrouxar teste, porque nenhum teste foi afrouxado. Eu não rodei o lint:texto aqui, porque ele baixaria o JRE e o LanguageTool para o .cache.
> 
> O que rodou ou leu: scripts/gates/lint-texto.ts:157-158 e 179-181 saem com 0 e dizem na saída 'AVISO, LanguageTool indisponível…; nada reprovado'. Isso é o contrato escrito: PLANO-FILEORCA.md:479 ('Se a API não responder, ele avisa e segue, sem reprovar') e DECISOES § 24 ('Sem servidor, avisa e não reprova'). No log do CI 41226056230, 'lint:texto: nenhum texto alterado' é a saída honesta de um commit sem texto alterado contra o merge-base; o runner tem Java 17+, e com texto alterado o servidor local sobe e confere de verdade. scripts/gates/dinheiro-saude.ts imprime 'ok, 0 página(s) desses hubs conferida(s)', que declara a contagem. O prompt-fase-01a.md:101 aceita esse estado: 'conteúdo de dinheiro e saúde (com teste do próprio checador, já que ainda não há página desses hubs)'. O tests/unit/ymyl.test.ts tem controles positivos e negativos do checador (bloco faltando, fonte oficial errada ou de domínio falso, autor, datetime, taxa do dia).
> 
> Teste que já cobria: tests/unit/ymyl.test.ts cobre a lib do dinheiro-saude. O comportamento sem servidor do lint:texto é contrato documentado, sem teste próprio.

## Lente (b) · Privacidade

Nenhum arquivo, número digitado ou nome de arquivo sai do aparelho: provei com um proxy de log do lado do servidor mais context.on/page.on('request') nos dois navegadores, em 11 páginas de ferramenta com Aceitar e Recusar. A lista de eventos, o gtag.js só em fileorca.com, a ausência de COOP/COEP/SharedArrayBuffer e o PDF de saída (só Producer/Creator "FileOrca", sem data, XMP nem Exif) estão certos. Achei um alto e três médios. O alto: o Compress deixa passar chunks PNG privados (caBX, zxIf, exIf, dSIG, prVW, vpAg), contra a promessa "a partir dos pixels" e "removido de todo arquivo". Os médios: a Recusa não apaga o fo-coffee na hora, "Mudar minha escolha" desfaz uma Recusa gravada, e a política não diz que o GA4 segue recebendo pings sem cookie depois de Recusar. Há três baixos de teste e de transparência.

**Conferido e certo:**

- Nenhum arquivo sai (página E worker, Chromium e WebKit): .cache/lente-b/b1-leak.mjs sobe 1 a 3 arquivos com GPS em Compress, HEIC to JPG, Image to PDF e Resize e baixa o resultado. Todas as 8 combinações deram 0 requisições não-GET, 0 com corpo, 0 fora da origem, 0 same-origin com query, 0 nome de arquivo na URL e 0 WebSocket. O que o servidor viu (proxy logproxy.mjs) bate com o que o cliente viu (diferença 0).
- WebKit reporta requisições de worker ao Playwright: .cache/lente-b/probe-worker.mjs faz um worker de blob dar GET e POST na origem. context.on('request') e o servidor viram os dois, em Chromium e WebKit. A suspeita 'prova vácua no worker do WebKit' do apêndice está refutada para worker dedicado.
- PDF de saída limpo, Chromium e WebKit (b2-pdf.mjs, b12-pdf-heic.mjs): Info = só /Producer e /Creator 'FileOrca' (UTF-16 hex). Não há /CreationDate, /ModDate, /Metadata, XMP, 'Exif', 'GPS', 'pdf-lib' nem /ID. Os JPEG embutidos têm só JFIF e ICC sRGB (FFE0, FFE2, DQT/SOF/DHT), sem APP1/APP13/COM. O HEIC é recusado no Image to PDF e o PDF sai com 1 página.
- Saídas de Compress, HEIC to JPG e Resize com fixtures com GPS: varredura de bytes (b3-meta.mjs) sem 'Exif\0\0', 'GPS', 'ns.adobe.com/xap', 'x:xmpmeta', 'Photoshop 3.0', '8BIM', 'eXIf' (o 'Lat' x1 do ZIP do Compress é ruído de 3 bytes). O ZIP usa data fixa de 1980 (zip.ts:15).
- Número digitado e nome de arquivo não vão para URL, hash, document.title, dataLayer, localStorage nem requisição: b5-events.mjs, 11 páginas (en, pt, es, presets) x Aceitar/Recusar x 2 navegadores. Digitei 1357 e 1019 no Resize e 1357 no Crop, e um arquivo chamado 'a"><img src=x onerror=window.__xss=1>_IMG_9876_secret.jpg'. PROBLEMS: none.
- Conteúdo do usuário não vira HTML: o mesmo b5 não executou XSS e não injetou <img src=x>. Os sinks do src/ são só innerHTML de ícone/SVG próprio (search.ts:85, Icon.tsx:20), set:html de string do build e textContent para a consulta da busca (search.ts:101). Nada de uri-list, getData, clipboard.read nem fetch de URL do usuário.
- Lista fechada de eventos nos dois navegadores: b5 e b6-errors.mjs mostram só tool_start, tool_complete, download e tool_error, cada um só com os parâmetros de EVENT_PARAMS. Em tool_error, codec e reason saem de lista fechada (image/jpeg, empty, unknown, image/avif, image/heic; decode, empty, unsupported, wrong-tool, truncated). browser sai como chrome-156 e safari-27. 0 requisições fora da origem.
- gtag.js só em fileorca.com (b7-gtag.mjs, Google 100% stubado, nenhum pacote real foi para o Google): em fileorca.com há 1 requisição a googletagmanager.com/gtag/js?id=G-T4BBJN7S11 antes de qualquer clique, nos dois navegadores. Em www., staging., fileorca.com.evil.test, fileorca.workers.dev, abc123.fileorca.workers.dev e 127.0.0.1 há 0. consent.test.ts:51 cobre os mesmos hostnames em vm.
- Consent Mode v2: dataLayer = consent default denied[region] | default granted | js | config, nos dois navegadores (b4-consent.mjs passo 1). Com escolha gravada, o update vem antes do config (passo 7). Em fresh visit o localStorage fica {} e só Aceitar/Recusar grava fo-consent. Sob Recusar o fo-coffee nunca é escrito (b5: nenhum 'fo-coffee written under Decline').
- Sem COOP/COEP nem SharedArrayBuffer: dist/_headers não tem Cross-Origin-*, e curl -sI em fileorca.com (home, /compress-image/, libheif wasm) mostra nenhum Cross-Origin-*. b8-wasm.mjs lê a memória de cada um dos 18 .wasm do dist e nenhuma é shared (flags 0 ou 1). SharedArrayBuffer aparece em 0 arquivos de dist/_astro/*.js.
- Produção sem terceiros inesperados, só leitura: 7 páginas por curl, com 0 'cdn-cgi', 0 'cloudflareinsights', 0 googlesyndication e 0 google-adsense-account. A única referência ao Google é gtag/js?id=G-T4BBJN7S11. Não há Set-Cookie nem COOP/COEP. /ads.txt dá 404. O MX de fileorca.com aponta para route{1,2,3}.mx.cloudflare.net e o SPF para _spf.mx.cloudflare.net, o que confirma a promessa de Cloudflare Email Routing na política. O HTML do dist só tem âncoras externas (github, vmatusita.com.br, linkedin, policies.google.com, ko-fi, support.google.com), e o CSS/JS não carrega URL externa.
- Política em 3 idiomas contra o código: os seis eventos listados (iniciada, concluída, download, próximo passo, erro com navegador e formato, doação) existem no código com a mesma lista nas três línguas. As frases 'numbers you type' / 'números que você digita' / 'números que escribas' valem (b5). Padrões por região (UE+EEE+GB+CH negado, resto liberado) batem com consent.ts. Retenção, e-mails, bases legais e links do AdSense têm texto equivalente em en, pt e es. Não achei promessa que um idioma faça e outro não.
- Nada mais grava em storage: grep no src/ acha localStorage só em consent.ts, CookieNotice.astro e coffee.ts. Não há sessionStorage, IndexedDB, document.cookie, sendBeacon, XMLHttpRequest próprio, WebSocket, EventSource, serviceWorker nem console.*. O XMLHttpRequest que existe nos .js do dist é cola do Emscripten lendo o .wasm da própria origem.

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| b-01 | strip.ts é lista de bloqueio: o Compress de PNG (caminho principal) e o 'sem ganho' de JPEG/WebP deixam passar metadado, contra a promessa 'a partir dos pixels' | alto | rebaixado | médio | corrigido em e849869 (§ 100) |
| b-02 | Recusar não apaga o fo-coffee na hora: a política promete 'erased if you decline cookies later' mas só apaga quando uma ferramenta abre | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| b-03 | 'Mudar minha escolha de cookies' apaga a Recusa gravada antes de haver nova escolha: quem abre e abandona volta ao padrão 'granted' fora da UE | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| b-04 | A política diz 'storage denied until you accept' mas não diz que o gtag.js carrega e os eventos seguem sendo enviados (pings sem cookie) após Recusar e, na UE, antes de aceitar | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| b-05 | 'Valores também fechados': só outcome, reason e codec têm lista fechada em runtime; tool, lang, target, place e browser, e todos os valores do foTrack do bootstrap, passam como string livre | baixo | refutado | baixo | refutado |
| b-06 | A prova de 'nada sai' da matriz não pega GET same-origin com dados na query nem WebSocket | baixo | confirmado | baixo | pendência (baixo; run 3b) |
| b-07 | Transparência da política: sem período de retenção do GA4, sem nomes e validade dos cookies do Google, sem os parâmetros de evento, e o Cloudflare envia NEL/Report-To | baixo | confirmado | baixo | pendência do Victor (retenção do GA4) e nota no relatório (NEL e Speculation-Rules da zona) |

### b-01 · strip.ts é lista de bloqueio: o Compress de PNG (caminho principal) e o 'sem ganho' de JPEG/WebP deixam passar metadado, contra a promessa 'a partir dos pixels'

- **Severidade da lente:** alto. **Cético:** rebaixado, médio. **Estado:** corrigido em e849869 (§ 100).
- **Onde:** src/engine/image/strip.ts:126 (PNG_DROP), :95 (keepApp), :156 (stripWebp); src/engine/image/process.ts:284-291; src/tools/compress-image/i18n/en.ts:30 e :51; src/i18n/en/privacy.ts:24
- **Regra:** Prompt F2 critério 4 / DECISOES § 33 (nenhuma saída com GPS, Exif, XMP ou IPTC); promessa do FAQ e da Política de Privacidade nos 3 idiomas ('leaves out the photo metadata'); PLANO, Regras que nenhuma run quebra (privacidade). Decisão 3 da F3: promessa da Política que o código não cumpre = alto.
- **Correção proposta pela lente:** Trocar a lista de bloqueio por lista de permissão em strip.ts. PNG: manter só IHDR, PLTE, IDAT, IEND, tRNS, gAMA, cHRM, sRGB, iCCP, sBIT, bKGD, pHYs, cICP, mDCV, cLLI, acTL, fcTL, fdAT. JPEG: manter APP0 só se começar por 'JFIF\0', APP14 só se for 'Adobe\0', APP2 só ICC, e nenhum outro APPn. WebP: manter só VP8X, VP8, VP8L, ALPH, ANIM, ANMF, ICCP. Testes que falham sem o conserto: em tests/unit/strip.test.ts, PNG com caBX, zxIf, exIf, dSIG, vpAg e prVW; JPEG com APP0 JFXX e APP14 'Ducky'; WebP com chunk 'C2PA'. Opcional: uma fixture PNG com caBX na matriz do Compress, nos dois navegadores. Registrar num § e ajustar o texto do FAQ só se a lista de permissão deixar algo de fora. (custo no CI: Quase zero. Vitest +0,1 s. Com a fixture opcional na matriz, +3 a 5 s em uma parte do Playwright, bem abaixo do teto de 30 s da decisão 4.)

**Evidência da lente:**

> PNG, navegador de verdade, prova em .cache/lente-b/b9-png-chunks.mjs. Peguei fixtures/images/gen-png-transparente.png e inseri os chunks tEXt, eXIf, tIME (controles) e caBX, zxIf, exIf, dSIG, prVW, vpAg, cada um com o texto 'GPSLatitude=25.4284S GPSLongitude=49.2733W creator=Victor Matusita'. Saída:
> input chunks : IHDR tEXt eXIf tIME caBX zxIf exIf dSIG vpAg prVW IDAT...
> chromium /compress-image/ -> crafted.png (889601 B) IHDR caBX zxIf exIf dSIG vpAg prVW IDAT IEND
>    text present in bytes: true
> webkit   /compress-image/ -> crafted.png (889601 B) IHDR caBX zxIf exIf dSIG vpAg prVW IDAT IEND
>    text present in bytes: true
> Este é o caminho principal de todo PNG no Compress: process.ts:284 faz clean = stripPng(run.bytes) e :291 chama optimiseCleanPng, e o encode.ts:70 avisa que o OxiPNG 'keeps every chunk it is given'. Só tEXt/zTXt/iTXt/eXIf/tIME caem (PNG_DROP).
> JPEG e WebP no caminho 'sem ganho' (originalStripped, process.ts:68-72), prova em b11-strip-unit.mjs chamando stripJpeg/stripWebp reais:
> stripJpeg survivors: FFE0:JFIF. FFE0:JFXX. FFE0:Ocad. FFEE:Ducky ... | GPS text kept: true
> stripWebp survivors: VP8X VP8  C2PA Make | GPS text kept: true
> (stripJpeg:95 mantém qualquer APP0 e qualquer APP14, inclusive miniatura JFXX; stripWebp:156 só tira EXIF e 'XMP ' e mantém qualquer outro chunk.)
> A promessa que isso quebra: compress-image/i18n/en.ts:51 diz 'Oli saves each compressed copy from the pixels alone, so the GPS location, the camera model and the date taken do not travel to the new file'. A :30 diz 'Camera model, date and GPS location are removed from every file'. A privacy.ts:24 diz que as ferramentas salvam uma cópia 'that leaves out the photo metadata, including the GPS location'. Para PNG o Compress não salva dos pixels. O tests/unit/strip.test.ts:48-64 só cobre tEXt e eXIf, e nenhuma fixture do repositório tem chunk privado, então a matriz nunca viu isso. Ressalva honesta: o payload realista é o manifesto C2PA/Content Credentials (chunk caBX, em PNG de IA como ChatGPT/Firefly), que carrega criador e histórico de edição e pode carregar local; GPS em zxIf/exIf é raro. Se o cético achar o caso irreal, rebaixar para médio. O conserto de allowlist é pequeno.

**Cético:**

> O problema é real e reproduz em Chromium e WebKit pela interface, então não refuto. Mas a severidade 'alto' está alta demais. (a) A promessa concreta do FAQ e da Política é sobre GPS, modelo da câmera e data da foto. Os lugares onde um PNG, JPEG ou WebP real guarda isso (eXIf, tEXt/zTXt/iTXt com 'Raw profile type exif' e XMP, tIME, APP1/APP13, chunks EXIF/XMP) caem todos, e o conjunto de JPEG é quase uma lista de permissão já (só APP0, APP14 e ICC sobrevivem). (b) O único payload realista fora da lista é o manifesto C2PA/Content Credentials (caBX em PNG de IA como ChatGPT ou Firefly, ou Photoshop com credenciais): carrega gerador, histórico de edição, hora de assinatura e, no máximo, nome do criador se ele ligou isso, mas em geral não GPS nem modelo de câmera. GPS em zxIf/exIf/prVW/dSIG é caso fabricado pela lente (nome de chunk legado ou raro); o texto de GPS foi plantado por ela dentro do caBX. Logo não vira 'crítico' (arquivo com GPS) e o impacto de privacidade é pequeno e restrito a quem tem esse tipo de arquivo. (c) JPEG: APP0/JFXX (miniatura da mesma foto) e APP14 (12 bytes 'Adobe') não vazam nada novo no 'sem ganho', porque a imagem não foi alterada. WebP: chunk C2PA só existe em WebP assinado, raro. (d) Pela régua da decisão 3, o item é 'erro real com impacto pequeno ou raro' (médio). A frase 'promessa da Política que o código não cumpre' (alto) pesa porque a Política diz 'photo metadata' sem qualificar, e o texto 'from the pixels alone' é inexato para PNG; por isso não vai a baixo. A correção é local (lista de permissão em strip.ts, testes de unidade com caBX, zxIf, exIf, dSIG, vpAg, prVW, JFXX, APP14 e C2PA no WebP, mais um ajuste do leitor PNG_METADATA_CHUNKS para ser lista de permissão), custa uns 0,1 s no Vitest, e cabe na regra da decisão 4 (médio corrigido quando local, abaixo de 30 s). Alternativa mais barata: trocar 'from the pixels alone' por texto exato para PNG. Servidor da porta 4320 encerrado; nada fora de .cache/cetico-b-01/ foi escrito.
> 
> O que rodou ou leu: REPRODUZIDO. (1) Leitura: src/engine/image/strip.ts:126 `PNG_DROP = tEXt,zTXt,iTXt,eXIf,tIME` (lista de bloqueio; :138 mantém todo o resto); :95 `keepApp` mantém qualquer APP0 e qualquer APP14; :156 stripWebp só tira `EXIF` e `XMP `. process.ts:281-297 (compressPng) faz stripPng(run.bytes) e optimiseCleanPng sobre os bytes do próprio arquivo ("without decoding a pixel"); encode.ts:68 e codecs/png.ts:19 dizem que o OxiPNG mantém todo chunk recebido. O mesmo stripPng serve ao 'fits'/'no-gain' de Resize/Crop/Compress (originalStripped, process.ts:68-77). (2) Unidade, meu script .cache/cetico-b-01/unit.mjs chamando stripPng/stripJpeg/stripWebp reais: `PNG out: IHDR caBX zxIf exIf dSIG prVW vpAg IDAT... IEND | GPS text kept: true` (tEXt, eXIf e tIME caíram); `JPEG out segments: FFE0:JFIF FFE0:JFXX FFEE:Ducky FFE0:Ocad ... | GPS text kept: true`; `WebP out chunks: VP8X VP8 C2PA | GPS text kept: true`. (3) Navegador real pela UI, .cache/cetico-b-01/browser.mjs contra o dist/ (porta 4320, rede externa abortada), PNG fixtures/images/gen-png-transparente.png com tEXt, eXIf, tIME, caBX (JUMBF c2pa com autor e lat/long) e zxIf: `chromium -> crafted.png (889328 B; entrada 1096597 B) IHDR caBX zxIf IDAT IEND | GPS text in bytes: true | creator name in bytes: true`; o webkit idêntico. Ou seja, o Compress de PNG (caminho principal) devolve caBX/zxIf intactos nos dois navegadores. (4) Cobertura: grep por caBX|zxIf|C2PA|JFXX|dSIG|prVW em tests/, scripts/, src/, docs/, DECISOES.md não acha nada; strip.test.ts:48-64 só testa tEXt e eXIf; e2e/lib/png.ts:60 define PNG_METADATA_CHUNKS = eXIf,iTXt,tEXt,zTXt,tIME, o mesmo conjunto do bloqueio, então a matriz e o metadataReport são circulares e nunca veriam um chunk fora da lista. Nenhum teste cobre o caso. (5) Regra: DECISOES § 33 e a ficha da F2 (linhas 115 e 177 do prompt-fase-02.md, critério 4) definem o conjunto removido exatamente como o código faz (PNG: tEXt/zTXt/iTXt/eXIf/tIME; WebP: EXIF e XMP; leitores dos testes: os mesmos). O código cumpre o § 33; a lacuna é entre o texto das promessas (en.ts:51 'from the pixels alone', :30 'removed from every file'; privacy.ts:24 'leaves out the photo metadata') e o § 33. Para PNG, 'from the pixels alone' é literalmente falso (o próprio código diz que trabalha nos bytes do arquivo).
> 
> Teste que já cobria: nenhum

### b-02 · Recusar não apaga o fo-coffee na hora: a política promete 'erased if you decline cookies later' mas só apaga quando uma ferramenta abre

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/CookieNotice.astro:27-31 (hide/click não mexe no fo-coffee); src/tools/image/coffee.ts:61-77; src/tools/image/ImagePanel.tsx:519; src/i18n/{en,pt,es}/privacy.ts:67; DECISOES.md § 49
- **Regra:** Política de Privacidade (3 idiomas), seção 'Your cookie choice in the browser'; DECISOES § 49; decisão 3 da F3 (promessa da política que o código não cumpre; rebaixado a médio porque o dado nunca sai do aparelho e o apagamento acontece na próxima ferramenta).
- **Correção proposta pela lente:** No script inline do aviso, no ramo data-consent="denied" (CookieNotice.astro:30), apagar o fo-coffee do mesmo jeito que o forget() faz (remover a chave, ou regravar {uses:0,never:true} se havia never). Duas linhas, sem import. Teste e2e: Aceitar, 1 uso, ir a /privacy/, Recusar, e afirmar que o localStorage não tem {uses:1} antes de abrir ferramenta, nos dois navegadores. Alternativa: dizer na política 'erased the next time you open a tool'. (custo no CI: Cerca de 3 a 4 s: um teste e2e com uma carga por navegador, em uma parte.)

**Evidência da lente:**

> .cache/lente-b/b4-consent.mjs, igual em Chromium e WebKit:
> 3 after one use with Accept: localStorage = {"fo-coffee":"{\"uses\":1}","fo-consent":"granted"}
> 4 clicked change my choice: localStorage = {"fo-coffee":"{\"uses\":1}"}
> 5 chose Decline on /privacy/: localStorage = {"fo-coffee":"{\"uses\":1}","fo-consent":"denied"}
> 6 opened a tool page afterwards: localStorage = {"fo-consent":"denied"}
> Depois de Recusar, a contagem fica no navegador até a pessoa abrir uma página de ferramenta (forgetWithoutConsent no useEffect do ImagePanel). Quem recusa e não volta a uma ferramenta nunca vê o apagamento. A política diz sem ressalva, nos 3 idiomas (en 'it is erased if you decline cookies later'; pt 'é apagada se você recusar os cookies depois'; es 'se borra si rechazas las cookies después'). O DECISOES § 49 admite o atraso ('Quem recusa na página de privacidade fica com a contagem até abrir uma ferramenta'), mas a política não. Nota: o forget() mantém {uses:0,never:true} se a pessoa tinha pedido 'não mostrar de novo', então a chave nunca some. Isso é coerente com 'that is kept there too', mas vale uma frase.

**Cético:**

> O problema reproduz. A política afirma sem ressalva que a contagem é apagada ao recusar, e o código só apaga quando a pessoa abre uma página de ferramenta de imagem; quem recusa e não volta a uma ferramenta mantém {uses:N} no aparelho. Não é um falso positivo: a regra citada diz mesmo isso, nos 3 idiomas, e o § 49 só documenta o atraso no código, não na política. Fica abaixo de alto por quatro motivos: (1) o dado é só um contador, nunca sai do aparelho e nada o lê sem consentimento (countUse apaga em vez de ler); (2) o apagamento acontece na próxima visita a qualquer ferramenta de imagem, então a promessa é cumprida, só com atraso, e o caso exige Aceitar, usar, Recusar e nunca mais abrir uma ferramenta; (3) o atraso é uma decisão registrada da F1b; (4) o próprio texto da política ensina a limpar os dados do site. Não chega a baixo: é uma divergência verificável por qualquer pessoa que olhe o DevTools depois de recusar, na categoria que o § 93 trata como a mais séria da Privacidade, e o conserto é local (CookieNotice.astro está no escopo da F3, o prompt da F3 já altera o comportamento do aviso depois de Aceitar/Recusar) e barato, dentro do § 94 para médio. A observação sobre {uses:0,never:true} procede e é coerente com "that is kept there too". Correção proposta pelo achado (apagar ou regravar no ramo denied do clique, ou ajustar a frase da política para "na próxima vez que você abrir uma ferramenta") serve; se for em código, o teste deve afirmar o localStorage logo depois do Recusar, sem abrir ferramenta.
> 
> O que rodou ou leu: Reproduzi com um script próprio (.cache/cetico-b-02/repro.mjs) sobre o dist/ servido por `PORT=4321 node scripts/serve-dist.ts`, com page.route abortando todo domínio do Google, em Chromium e WebKit. Fluxo: /resize-image/, Aceitar, um uso, /privacy/, "Change my cookie choice", Recusar. Saída, igual nos dois navegadores:
> - depois de 1 uso com Aceitar: {"fo-coffee":"{\"uses\":1}","fo-consent":"granted"}
> - depois de Recusar em /privacy/: {"fo-coffee":"{\"uses\":1}","fo-consent":"denied"}
> - depois de /about/, de / e de /pt/privacidade/: o fo-coffee continua lá
> - depois de abrir /resize-image/ de novo: {"fo-consent":"denied"} (só aí some).
> Código lido: CookieNotice.astro:30 (o clique em [data-consent] só faz save(v), apply(v), hide(); não toca no fo-coffee) e :31 (o "change my choice" só remove fo-consent). O único apagamento é ImagePanel.tsx:519 `useEffect(() => forgetWithoutConsent(), [])` e coffee.ts:61-77 (forget), que só roda quando um painel de ferramenta de imagem monta ou em countUse. Política (grep): en privacy.ts:67 "it is erased if you decline cookies later", pt "é apagada se você recusar os cookies depois", es "se borra si rechazas las cookies después"; nenhuma ressalva de prazo ("next time", "próxima vez" não aparecem). DECISOES § 49 (linha 289) admite o atraso: "Quem recusa na página de privacidade fica com a contagem até abrir uma ferramenta", mas o § 49 não pediu para a política dizer isso, e o plano da F3 (fase-03-plano.md:199 e :204) lista a frase "erased if you decline" como item "a conferir". Regra: o § 93 põe "promessa da Privacidade não cumprida" em alto; o atenuante é real (ver abaixo), então médio.
> 
> Teste que já cobria: nenhum. coffee.spec.ts:172-189 ('Decline after the line showed erases the count...') só afirma `coffee(page) === null` depois de abrir /compress-image/ de novo (linha 182-183), ou seja, codifica o atraso e passaria sem o apagamento imediato; coffee.spec.ts:192-207 cobre Recusar antes de qualquer uso (nada gravado), não Aceitar e depois Recusar. Nenhum teste afirma o estado do fo-coffee logo depois do Recusar.

### b-03 · 'Mudar minha escolha de cookies' apaga a Recusa gravada antes de haver nova escolha: quem abre e abandona volta ao padrão 'granted' fora da UE

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/CookieNotice.astro:31
- **Regra:** Política de Privacidade, 'Consent by region and your choices' ('You can change your choice at any time'); Consent Mode v2 (DECISOES § 9): uma escolha gravada tem de ser respeitada até a pessoa a mudar; GDPR Art. 7(3) / LGPD Art. 8 §5 (revogar tem de ser tão fácil quanto consentir, e reabrir o seletor não pode ser uma revogação do Recusar).
- **Correção proposta pela lente:** Em CookieNotice.astro:31, não remover a chave ao reabrir: só chamar show() e focar o primeiro botão. A chave passa a ser sobrescrita por save(v) quando a pessoa escolher. Se a decisão for manter o removeItem (por causa do 'o aviso volta'), então reaplicar o consent update com o valor antigo na próxima carga até haver nova escolha. Teste e2e: Recusar, reabrir pelo botão, ir a outra página sem escolher, e afirmar update denied no dataLayer, nos dois navegadores. (custo no CI: Cerca de 3 s: um teste e2e, uma carga por navegador.)

**Evidência da lente:**

> O handler de [data-consent-change] faz localStorage.removeItem(K) antes de qualquer escolha nova. b4-consent.mjs, Chromium e WebKit:
> 7 privacy page: stored = {"fo-consent":"denied"} | dataLayer: consent:default:denied[region] | consent:default:granted | consent:update:denied | js | config
> 8 clicked change (Decline was stored): localStorage = {}
> 9 next page, nothing chosen: notice = true | dataLayer: consent:default:denied[region] | consent:default:granted | js | config
> No passo 9 não há consent update: o estado efetivo é analytics_storage/ad_storage 'granted' (padrão de fora da UE), embora a pessoa tivesse Recusado. Em fileorca.com o gtag.js carrega nessa página e grava os cookies _ga de novo, sem ação afirmativa. Os testes consent.spec.ts e events.spec.ts cobrem o botão reabrindo o aviso e Recusar depois, mas nenhum cobre abrir e abandonar.

**Cético:**

> O defeito é real e reproduz nos dois navegadores: o handler apaga a Recusa gravada antes de existir nova escolha, e a página seguinte, fora da UE, volta ao padrão granted sem consent update, com o gtag.js carregando em fileorca.com. Mantive "medio" pela régua (erro real com impacto pequeno ou raro): só afeta quem está fora de UE/EEE/GB/CH, já recusou, foi à página de privacidade, clicou em "mudar" e saiu sem escolher; o aviso segue visível para recusar de novo; o estado resultante é o mesmo de um visitante novo, que a própria Política já declara como granted. Não sobe a "alto" porque não há promessa escrita quebrada nem fluxo principal afetado, e a base jurídica citada (GDPR 7(3), LGPD 8 §5) está exagerada: na UE o padrão é denied e o abandono cai no lado seguro. A correção proposta (não remover a chave ao reabrir, só show() e foco; save(v) sobrescreve na escolha) é adequada, e falta um teste e2e de Recusar, reabrir, ir a outra página sem escolher e afirmar update denied. Obs. de colateral: com a chave mantida, o § 49 (contagem do café) não muda, pois ele lê o valor gravado.
> 
> O que rodou ou leu: 1) Código lido (commit 736b1cd): src/components/CookieNotice.astro:31 `document.addEventListener('click', ... if(e.target.closest('[data-consent-change]')){ try{localStorage.removeItem(K);}catch(x){} show(); ...focus })`. O botão existe só em src/views/LegalView.astro:35 (action 'consent-choice', página de privacidade). A linha 34 só esconde o aviso se stored()==='granted'||'denied'; o bootstrap src/analytics/consent.ts:47-49 declara default denied[região UE/EEE/GB/CH], depois default granted, e só faz 'update' se houver valor gravado.
> 2) Reproduzi com script próprio (.cache/cetico-b-03/repro.mjs, servidor serve-dist na porta 4322, rotas do Google abortadas, Chromium e WebKit, mesma saída nos dois): Recusar na /privacy/ grava {"fo-consent":"denied"} e o dataLayer ganha consent:update:denied; na página seguinte o aviso não aparece e o update denied é reaplicado. Clicar "Change my cookie choice": localStorage = {} e aviso visível. Navegar para /about/ sem escolher: aviso visível, localStorage = {}, dataLayer = default denied[region] | default granted | js | config, sem nenhum consent update. Ou seja, fora da UE o estado efetivo volta a granted sem ação afirmativa. O controle (visitante novo sem clicar em nada) dá exatamente o mesmo dataLayer, então abrir e abandonar equivale a apagar a Recusa. Em produção o HTML de /privacy/ tem o mesmo removeItem(K) e o gtag.js (G-T4BBJN7S11) é injetado, então o gtag carregaria nesse estado.
> 3) Regra citada: a Política (src/i18n/en/privacy.ts:77-84) diz "Elsewhere, analytics and ad storage are granted by default, and you can decline in the cookie notice" e "You can change your choice at any time with the button below"; DECISOES § 9 e PLANO linhas 128/739 fixam o padrão granted fora da UE/GB/CH. O texto não promete que abrir o seletor e sair preserve a escolha antiga, então não é promessa quebrada (não chega a "alto"). O argumento de GDPR Art. 7(3) não se aplica na prática: na UE/EEE/GB/CH o padrão é denied, e a fusão Aceitar, abrir e abandonar cai em denied (lado seguro); em produção com anúncios o aviso próprio some onde o __tcfapi diz que o GDPR se aplica. O prejuízo real é só o caso inverso, fora da UE: quem recusou, abre o seletor e sai, volta a ter GA/ad storage. O aviso continua visível e não modal em toda página até a pessoa escolher, então ela pode recusar de novo.
> 4) Testes: grep em tests/ mostra consent.spec.ts:80-88 (Aceitar, reabrir, Recusar, afirma update denied), coffee.spec.ts:176-181 (reabrir e Recusar) e events.spec.ts; nenhum abre o seletor e abandona. Nada cobre o caso.
> 
> Teste que já cobria: nenhum

### b-04 · A política diz 'storage denied until you accept' mas não diz que o gtag.js carrega e os eventos seguem sendo enviados (pings sem cookie) após Recusar e, na UE, antes de aceitar

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** src/analytics/consent.ts:54 (injeção incondicional do gtag.js); src/i18n/en/privacy.ts:38-39, :81-82, :92
- **Regra:** Política de Privacidade (Analytics e Consent by region); GDPR Art. 13 (transparência sobre o tratamento); decisão 3 da F3 (promessa da política). Não é falha de promessa literal, por isso médio.
- **Correção proposta pela lente:** Não mudar o código (o Consent Mode v2 é decisão fechada, § 9). Acrescentar à seção 'Analytics' e à de consentimento, nos 3 idiomas, uma frase: 'Even when you decline, or before you accept in the EEA, UK and Switzerland, Google Analytics may receive cookieless pings (page view and the events above, without cookies or identifiers).' Teste de unidade que confira a frase nos 3 idiomas (o gate:prontidao já confere frases da Privacidade). Alternativa mais forte, só se o Victor quiser: Consent Mode básico (não injetar o gtag.js até o Aceitar na UE). (custo no CI: Zero para a opção de texto. Cerca de 0,1 s de Vitest para o teste de frase.)

**Evidência da lente:**

> b7-gtag.mjs: em fileorca.com, antes de qualquer clique, há 1 requisição a www.googletagmanager.com/gtag/js?id=G-T4BBJN7S11 em Chromium e WebKit (stub local, nada foi ao Google). O injetor em consent.ts:54 só confere o hostname, não o consentimento. b5-events.mjs: com Recusar, o dataLayer recebe mesmo assim tool_start e tool_complete (ex.: 'chromium /resize-image/ denied events= tool_start{...} tool_complete{...,"outcome":"resized"} | ls= {"fo-consent":"denied"}'). Esse é o Consent Mode 'avançado': com analytics_storage=denied o Google continua recebendo hits sem cookie (documentado em support.google.com/analytics/answer/9976101). A política só fala em armazenamento: 'analytics and ad storage are denied by default until you accept' e 'What it can store in your browser depends on the choice'. Mas em 'Legal bases' diz que o consentimento (GDPR 6(1)(a)) é a base 'for Google Analytics'. Quem lê 'Decline' entende que a medição para; o código mantém a medição sem cookie. Não consegui medir o envio real porque o Google ficou bloqueado, então esta parte é comportamento documentado do Google, não medido por mim.

**Cético:**

> O fato se sustenta: o gtag.js carrega em fileorca.com antes de qualquer escolha, e os eventos seguem para o dataLayer depois de Recusar. Isso é o Consent Mode avançado, e o Google documenta que ele manda pings sem cookie nesse caso. A política não faz uma promessa literal falsa: ela fala só de armazenamento, e o código cumpre isso. Por isso não é "alto" na régua (promessa que o código não cumpre), e o próprio achado já diz isso. Também não é só preferência de estilo. A política cita o consentimento como base legal "for Google Analytics" e não diz que o Google recebe a requisição do gtag.js e os pings (IP, user agent) antes de aceitar na UE, no Reino Unido e na Suíça, nem depois de Recusar no resto do mundo. A omissão atinge todo visitante dessas regiões, não é um caso raro. O impacto prático é pequeno: o Google diz que os pings não identificam a pessoa, e a frase "where the law requires it" suaviza o texto. Fica "medio" (erro real, impacto pequeno), sem chegar a "alto". A correção por texto, nos 3 idiomas, é a certa. Mudar para Consent Mode básico seria mudança de decisão fechada (§ 9) e só valeria se o Victor quisesse. O risco do achado é só de transparência, não de arquivo ou número saindo do aparelho.
> 
> O que rodou ou leu: 1) Código lido em src/analytics/consent.ts. A linha 54 injeta o gtag.js só pela condição `location.hostname==='fileorca.com'`, sem olhar o consentimento. A linha 53 (`foTrack`) chama `gtag('event', ...)` sem nenhum portão de consentimento. Os `gtag('consent','default', ...)` vêm antes do `config`, no padrão do Google (Consent Mode avançado).
> 
> 2) Reproduzi com um script próprio (.cache/cetico-b-04/repro.mjs). Servi o dist/ da worktree com `PORT=4323 node scripts/serve-dist.ts`. Usei o Chromium com `--host-resolver-rules=MAP fileorca.com 127.0.0.1`, para o hostname ser fileorca.com, e `page.route` abortando todo domínio do Google (nada saiu). Saída:
> - Antes de qualquer clique houve 1 requisição a `https://www.googletagmanager.com/gtag/js?id=G-T4BBJN7S11`.
> - Cliquei em Decline. O localStorage ficou `fo-consent=denied`, e o dataLayer terminou com `consent update` (as quatro chaves em denied) e `["event","donate_click",{"lang":"en","place":"footer"}]`. O evento foi para o dataLayer com a recusa já gravada.
> 
> 3) Documentação do Google (support.google.com/analytics/answer/9976101, lida por WebFetch): no modo avançado "Google tags load before the consent dialog appears", e com o consentimento recusado "Tags send cookieless pings", que podem incluir user agent, resolução de tela e IP, e que o Google usa para modelagem. No modo básico as tags ficam bloqueadas até o consentimento. O envio real dos pings eu não medi, porque o Google ficou bloqueado. O pedido do gtag.js antes do consentimento é medido: o navegador o tentou.
> 
> 4) Texto da política lido em src/i18n/{en,pt,es}/privacy.ts. A seção de Analytics diz "What it can store in your browser depends on the choice". A seção de consentimento diz "analytics and ad storage are denied by default until you accept", e o código cumpre isso (armazenamento negado). "Legal bases" diz "Consent (GDPR 6(1)(a)...) for Google Analytics and for ad cookies, where the law requires it". Nenhum texto da política, do aviso de cookies (`cookie.body`) nem das páginas diz que a medição para ao recusar, nem que o Google recebe pings sem cookie. Fiz grep por decline, refuse, opt out, no tracking e cookieless em src/i18n e src/tools: nada.
> 
> 5) Cobertura em testes: nenhuma. O consent.spec.ts e o consent.test.ts só provam o `consent update` e os padrões por região. O events.spec.ts não olha os eventos com Recusar. Não há teste de frase da Política de Privacidade (grep em tests/ e scripts/gates/prontidao.ts, que não tem frase de privacidade nem de consentimento neste commit). Isso corrige a frase do achado "o gate:prontidao já confere frases da Privacidade", que é falsa em 736b1cd. O teste de frase para os 3 idiomas teria de ser novo, em Vitest.
> 
> Teste que já cobria: nenhum

### b-05 · 'Valores também fechados': só outcome, reason e codec têm lista fechada em runtime; tool, lang, target, place e browser, e todos os valores do foTrack do bootstrap, passam como string livre

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** src/analytics/events.ts:40; src/analytics/consent.ts:53; src/layouts/BaseLayout.astro:45
- **Regra:** PLANO, eventos do GA4 ('lista fechada'); DECISOES § 10 ('Nenhum evento leva nome de arquivo, conteúdo ou número digitado'); prompt da F3, escopo da lente b ('os valores também são fechados').
- **Correção proposta pela lente:** Estender CLOSED_VALUES com tool (IMAGE_PAGE_IDS do registro), lang (en, pt, es), target (IMAGE_TOOL_IDS mais 'home') e place ('result', 'footer', 'support_page'), e validar browser por /^(edge|firefox|chrome|safari)-\d+$|^other$/. Espelhar o mesmo no bootstrap (um objeto de valores permitidos em JSON, como já é feito com EVENT_PARAMS). Testes em consent.test.ts. (custo no CI: Zero (só Vitest).)

**Evidência da lente:**

> events.ts:40: const CLOSED_VALUES = { outcome, reason, codec }. cleanParams deixa passar qualquer string em tool/lang/target/place/browser. consent.test.ts mostra que o tipo recusa 'IMG_1.jpg' em tool só em tempo de compilação (@ts-expect-error). O foTrack do bootstrap (consent.ts:53) filtra só as chaves: foTrack('donate_click',{place:'secret.jpg',lang:'x'}) manda os dois valores. Hoje só data-track estático (Footer.astro:51, SupportCard.astro:23) alimenta o foTrack e o ImagePanel usa constantes, então não há vazamento. É defesa em profundidade que a regra 'lista fechada' promete e o runtime não cumpre.

**Cético:**

> O contrato é cumprido ao pé da letra. DECISOES § 10 fecha os parâmetros, com tipos e conferência em execução. O § 71 e o item 4 do prompt da F2 pedem valores fechados novos de outcome, codec e reason 'com teste', e o cleanParams faz isso. Os três vêm do motor ou dos bytes do arquivo, o único caminho em que dado do usuário poderia chegar a um evento. tool, lang, target e place são constantes de código fechadas por tipo e por e2e. O achado admite que não há vazamento e chama de defesa em profundidade. Isso é endurecimento opcional (custo zero, o próprio docs/relatorios/fase-03-plano.md já o chama de baixo), não lacuna contra requisito ou regra. A promessa da Política ('nenhum evento leva nome de arquivo, conteúdo nem número') é verdadeira por construção hoje.
> 
> O que rodou ou leu: Reproduzi a parte mecânica com .cache/cetico-b-baixos/b05.ts (Node 24 sobre events.ts e consent.ts): cleanParams('donate_click',{place:'secret.jpg',lang:'x'}) devolve os dois valores, e o foTrack do bootstrap também. Mas procurei o caminho real: todo `track()` de src/ passa valores de código (ImagePanel.tsx:191 `tracked={tool:page,lang}` vindo do registro e da rota; `chip.target` do registro; `place:'result'`; `browser` sai de browserLabel, que só captura `\d+` depois de um nome fixo). O foTrack só é chamado pelo listener de BaseLayout.astro:45, que lê `data-track` e `data-track-place` estáticos (Footer.astro:51 e SupportCard.astro:23). A citação do achado ('os valores também são fechados', 'escopo da lente b') não está no prompt da F3: a linha 93 diz só 'Os eventos usam a lista fechada'. tsconfig inclui `**/*` (tests entram no astro check), então os @ts-expect-error de consent.test.ts rodam de verdade, e events.spec.ts / tool.spec.ts / image-smoke.spec.ts:384-397 comparam os eventos reais com toEqual e a lista de chaves.
> 
> Teste que já cobria: tests/unit/consent.test.ts:76-94 (cleanParams: parâmetro fora da lista e outcome, reason e codec fora da lista); tests/e2e/events.spec.ts:16-53 (toEqual nos eventos reais de donate_click, next_step_click e tool_start); tests/e2e/image-smoke.spec.ts:384-397 (chaves permitidas e nenhum nome de arquivo nos eventos); tipos conferidos pelo astro check

### b-06 · A prova de 'nada sai' da matriz não pega GET same-origin com dados na query nem WebSocket

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; run 3b).
- **Onde:** tests/e2e/lib/matrix.ts:198-212 e :671-672
- **Regra:** Prompt F2 critério 10 (nenhum byte do arquivo sai); decisão 3 da F3 (teste que não prova o que diz = médio; rebaixado a baixo porque o código atual está limpo e o teste cobre o caso realista de POST/fora da origem).
- **Correção proposta pela lente:** Em watchRequests, também registrar page.on('websocket') e afirmar nos testes: websockets==[]; nenhuma URL same-origin com search ou hash; todas as same-origin em uma lista (a página, /_astro/*, /search-index.json, fontes, manifest). Mudança em um arquivo de lib e uma asserção em runCase. (custo no CI: Zero a +1 s por parte.)

**Evidência da lente:**

> watchRequests() só registra 'request' e afirma outside()==[] e writes==[] (método diferente de GET). Um new Image().src='/p?d='+base64 ou fetch('/p?d=...') para a própria origem passaria (GET, mesma origem). page.on('websocket') não é observado, e o Playwright não reporta WebSocket como 'request'. Eu medi o que o teste não mede, em .cache/lente-b/b1-summary.json: sameOriginWithQuery=0, websockets=0, nameInUrl=0 nas 8 combinações. Ou seja, hoje é verdade, mas nenhum teste do repositório reprovaria a regressão.

**Cético:**

> A lacuna é real: uma regressão que mandasse bytes ou um número digitado em GET same-origin com query, ou por WebSocket (até para outro domínio), passaria em todos os testes de 'nada sai'. O Cloudflare receberia a URL nos logs dele. Fica em baixo porque o código atual está limpo (o grep confirma), o teste cobre fetch e XHR cross-origin e todo não-GET, e o critério da F2 diz 'requisição para fora do domínio', que o teste prova. Não sobe a médio: as mensagens dos expects ('no request leaves the page origin', 'no request writes anything') descrevem o que o teste de fato mede. A correção proposta (page.on('websocket') e checar search/hash das same-origin) é pequena e só mexe em matrix.ts.
> 
> O que rodou ou leu: Rodei .cache/cetico-b-baixos/b06.ts: importa o watchRequests real de tests/e2e/lib/matrix.ts, abre /compress-image/ no Chromium (dist servido na porta 4431) e dispara `new Image().src='/p?d='+btoa(...)` e `fetch('/p?w=7771&h=3331')`. Os dois entram em log.urls, mas outside() e writes ficam vazios. Depois abri `new WebSocket('ws://127.0.0.1:4432/leak?d=segredo')`, de outra origem: nem apareceu em log.urls nem em outside(); só page.on('websocket') o viu. O controle, um fetch cross-origin simples, apareceu em outside(). Procurei outros observadores: tool.spec.ts:21 usa a mesma lógica (outras origens e não-GET), budgets.spec.ts:34 só olha a carga inicial, e image-smoke.spec.ts:382-397 olha só page.url() e o dataLayer. Nenhum teste olha query de sub-requisição same-origin nem WebSocket. `grep` em src/ não acha WebSocket, sendBeacon, XMLHttpRequest, EventSource nem `new Image(`.
> 
> Teste que já cobria: nenhum

### b-07 · Transparência da política: sem período de retenção do GA4, sem nomes e validade dos cookies do Google, sem os parâmetros de evento, e o Cloudflare envia NEL/Report-To

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência do Victor (retenção do GA4) e nota no relatório (NEL e Speculation-Rules da zona).
- **Onde:** src/i18n/{en,pt,es}/privacy.ts:36-48, :104-114; produção: cabeçalhos Report-To e Nel
- **Regra:** GDPR Art. 13(2)(a) (período de retenção ou critério); prompt F3 decisão 7 (cada afirmação do Show HN precisa de prova).
- **Correção proposta pela lente:** Quando o Victor fixar a retenção no GA4, pôr o número na política. Listar _ga e _ga_<id> (2 anos) e dizer os parâmetros dos eventos (tool, lang, outcome, reason, file format, browser). No texto do Show HN, escrever 'the only third party the page talks to is Google Analytics; Cloudflare delivers the site'. Anotar no relatório que Speculation-Rules e NEL vêm de configuração da zona, fora do repositório. (custo no CI: Zero.)

**Evidência da lente:**

> privacy.ts:109 diz 'Analytics data: kept for the period set in the Google Analytics retention settings', sem número (pendência do Victor, o GA4 usa 2 meses por padrão e vai até 14). A política não cita _ga/_ga_<id> nem a validade deles, nem que os eventos levam tool, lang, outcome, reason, codec, target e place (lista de 6 eventos sem parâmetros). curl -sI https://fileorca.com/ mostra, fora do _headers do repositório: 'Nel: {"report_to":"cf-nel","success_fraction":0.0,...}', 'Report-To: ...a.nel.cloudflare.com...' e 'Speculation-Rules: "/cdn-cgi/speculation"'. O NEL faz o navegador mandar à Cloudflare relatos de falha de rede (IP, URL, erro). Entra em 'Cloudflare processes technical request data', mas a frase do Show HN 'o que sai é só o Analytics' deveria dizer 'além da entrega pela Cloudflare'. Sem Set-Cookie e sem /cdn-cgi/ no HTML (verificado).

**Cético:**

> Só a retenção é lacuna que se sustenta: GDPR Art. 13(2)(a) pede o período ou o critério, e 'o que estiver na configuração' aponta para onde ele está sem dizê-lo. Depende do Victor fixar o valor no GA4, e é baixo (não é promessa quebrada, que seria alto). Os outros pontos são boa prática, não requisito do repositório. O PLANO (:732) pede 'cookies de anúncio e de Analytics' e o controlador, sem exigir nomes de cookie ou parâmetros. O NEL manda relato só de falha de rede (success_fraction 0.0) à Cloudflare, que a política já cobre em 'Site delivery'; Speculation-Rules e NEL vêm de configuração da zona, fora do repositório. A frase 'o que sai é só o Analytics' do Show HN está em docs/lancamento/, que não existe no commit 736b1cd (é untracked na pasta principal), então não pude conferi-la e ela fica fora do escopo deste commit. Vale a anotação no relatório e a troca da frase quando o texto entrar.
> 
> O que rodou ou leu: Li src/i18n/{en,pt,es}/privacy.ts: o item de retenção dos três idiomas diz 'o período definido nas configurações de retenção do Google Analytics', sem número (en :109, pt e es nas linhas equivalentes). O texto está igual em produção (curl em https://fileorca.com/privacy/ traz 'retention settings.' e 'Last updated: October 31, 2026'). A seção de Analytics lista os 6 eventos em linguagem comum e só cita parâmetros em 'Tool error, with the browser and the file format'. Não nomeia _ga/_ga_<id> nem a validade, e diz só 'what it can store in your browser'. `curl -sI` em / e em /privacy/ confirma `Nel: {"report_to":"cf-nel","success_fraction":0.0,...}`, `Report-To` com a.nel.cloudflare.com e `Speculation-Rules: "/cdn-cgi/speculation"`, sem Set-Cookie, e o HTML não tem `cdn-cgi`. O fase-03-plano.md já registra 'a retenção do GA4 sem número (pendência do Victor)'.
> 
> Teste que já cobria: nenhum (routes.test.ts:66 só compara as seções entre os idiomas, não o conteúdo)

## Lente (c) · Política de anúncio e consentimento

Nenhum achado crítico ou alto na lente (c). "O que derruba conta" fecha item por item: hoje a produção não tem meta, ads.txt (404), carregador nem unidade; o carregador e o push só rodam em fileorca.com (executei a trava de verdade); a distância de 150 px vale também nas páginas pt e es (medi em Chromium e WebKit); o ads.txt tem a linha oficial; a Privacidade traz as frases do AdSense. Rodei o gate:prontidao uma vez: 18 itens ok. Há três médios provados: o aviso próprio só olha o __tcfapi duas vezes (com stub definido depois do load ele fica na tela para sempre); a âncora do AdSense deixa o foco do teclado inteiro debaixo dela quando o aviso já foi fechado (WCAG 2.4.11, e um teste afirma esse estado); e a checagem da trava do hostname no gate:prontidao passa mesmo sem trava no carregador (provei com um site de mentira), além de a trava só ser testada como texto. Os baixos: uma Aceitar dada em página sem a CMP vira ad_* granted na página de anúncio na UE; a regra "nenhum texto liga doação a anúncio" contradiz a tabela do próprio plano (o código segue a tabela, e o Sobre e os Termos vão além dela); o hub fora do ads-pages.test.ts; a Privacidade não cobre outros fornecedores além do Google; e a heurística de bloqueador de anúncio dá falso positivo.

**Conferido e certo:**

- Produção sem anúncio hoje (curl GET em fileorca.com): /ads.txt dá 404; em /, /compress-image/, /image-tools/ e /privacy/ há 0 `google-adsense-account`; as tool pages têm 2 `fo-ad` e a home e a Privacidade têm 0; nenhum `cdn-cgi`. O `grep adsbygoogle` acha 2 linhas por página só no script do CookieNotice, que não é carregador.
- gate:prontidao rodado uma vez na worktree: 18 itens ok (meta em 38 HTML, ads.txt exato, sem carregador só com o ID, carregador só nas páginas com área, dist real sem anúncio com 28 AdSlots neutros, páginas obrigatórias, Privacidade, robots, sitemaps). Saída em .cache/lente-c/prontidao-run.txt.
- ads.txt confere com a ajuda oficial: WebFetch de support.google.com/adsense/answer/12171612 dá o exemplo `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`, com pub- e sem ca-. config.ts:122-124 gera igual, e o build `all` serviu esse texto exato.
- A trava do hostname EXECUTA como deveria (node .cache/lente-c/guard.ts, build `all` servido como 127.0.0.1 e como https://fileorca.com por page.route, Google abortado ou stub local). Em 127.0.0.1: 0 carregador, 0 push. Em fileorca.com a 1280 px: 1 carregador e 2 pushes; a 360 px: 1 push (o trilho não pede anúncio abaixo de 1280). Em /privacy/, / e /support/ em fileorca.com: 0 carregador. Em abc.fileorca.workers.dev: 0 carregador e 0 push. O gtag.js só tentou carregar em fileorca.com. Saída em .cache/lente-c/guard-out.txt.
- O hub /image-tools/ no estado `all` tem carregador, 2 unidades e 2 pushes a 1280 px (guard.ts), e o gate cobre o carregador dele pelo mapa de rotas (adArea).
- Distância de 150 px nas páginas pt e es (node .cache/lente-c/ads-i18n.ts, os mesmos TARGETS e distance() do ads.spec.ts, em repouso, com resultado e com lote de 2, a 360 e 1280 px, Chromium e WebKit): menor vão 166 px no celular e 150 px a 1280 px, todos ok. Saída em .cache/lente-c/ads-i18n-out.txt.
- Mais conteúdo que anúncio, conferido de forma independente com visibleText() sobre o dist real: 216 palavras por AdSlot no hub (já com o guia da § 96) e de 273 a 412 nas ferramentas e presets, sempre acima das 150 do gate.
- Rótulo do AdSlot por idioma (Advertisements, Publicidade, Anuncios) e `aside.fo-rail` com aria-label localizado, em ads.test.ts:57-65 e ads.spec.ts:292-298. O push é um só por unidade (AdSlot.astro:20) e nada na ilha o repete, então não há atualização automática de anúncio.
- O breakpoint do trilho é coerente: global.css:63-67 usa min-width 1280px e o push usa matchMedia('(min-width: 1280px)'). Abaixo disso o aside fica display:none e a unidade nem pede anúncio.
- Lugares sem anúncio: ads.spec.ts:260-271 cobre home, jurídicas, apoio e 404 nos 3 idiomas; todos os 21 caminhos respondem 200 no serve-dist (o /404.html dá 307 e depois o 404 real), então o teste não é vazio. ads-pages.test.ts:78-86 cobre as mesmas páginas nos 3 estados das variáveis.
- Privacidade nos 3 idiomas contra a página oficial do AdSense (WebFetch de support.google.com/adsense/answer/1348695): têm a frase de fornecedores terceiros incluindo o Google e cookies com base em visitas anteriores, a frase dos cookies de publicidade do Google, o opt-out pelo Ads Settings e o link de sites parceiros (privacy.ts en:51-62, pt:51-62, es:51-62).
- Café: o texto do card de resultado e do rodapé confere com a tabela de Doações do PLANO nos 3 idiomas (tools/image/i18n/*.ts:70-75; common.ts:23). O botão é um .fo-btn neutro, nunca sun. A regra 3º uso, 7 dias e 'não mostrar' está em coffee.ts:40-45. O adblock só vale com `adsOn = buildAdsConfig().scriptEnabled` (page.ts:84), as três variáveis, e em fileorca.com (coffee.ts:48-50).
- Prévia e localhost nunca pedem anúncio: as unidades `ins` existem no HTML, mas sem carregador e sem push (guard.ts, casos 'localhost' e 'preview').
- Estado da worktree: `git status --short` vazio ao fim; só escrevi em .cache/lente-c/ (e o gate escreveu em .cache/prontidao/, como autorizado); servidores 4476, 4477 e 4478 encerrados.

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| c-01 | Aviso próprio só consulta o __tcfapi duas vezes: se a CMP do Google definir depois do load, os dois avisos ficam juntos na UE | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| c-02 | A âncora do AdSense cobre inteiro o foco do teclado quando o aviso já foi fechado; o scroll-padding só leva em conta o aviso | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| c-03 | O gate:prontidao não reprova um carregador sem a trava do hostname (a string da trava do push do AdSlot basta), e a trava só é testada como texto | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| c-04 | Na UE, o Aceitar dado no aviso próprio em página sem a CMP vira ad_storage, ad_user_data e ad_personalization 'granted' na página de anúncio, antes da mensagem do Google | baixo | confirmado | baixo | pendência do Victor (antes de ligar os anúncios; § 103) |
| c-05 | A regra 'nenhum texto liga doação a anúncio' contradiz a tabela de textos do PLANO; o código segue a tabela e o Sobre e os Termos vão além dela | baixo | refutado | baixo | refutado |
| c-06 | O hub /image-tools/ fica fora do ads-pages.test.ts: no estado 'all' nada confere as unidades e os pushes dele | baixo | refutado | baixo | refutado |
| c-07 | A Privacidade só nomeia o Google; a ajuda do AdSense pede aviso e opt-out dos outros fornecedores e redes que servem anúncio, se a conta não os desligar | baixo | refutado | baixo | refutado |
| c-08 | A heurística de bloqueador de anúncio trata 'unidade com altura 0' e 'loader ainda não terminou' como bloqueio, então pode mostrar o café já no 1º uso a quem não bloqueia | baixo | confirmado | baixo | pendência (baixo; revisar ao ligar os anúncios) |

### c-01 · Aviso próprio só consulta o __tcfapi duas vezes: se a CMP do Google definir depois do load, os dois avisos ficam juntos na UE

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/CookieNotice.astro:29 e :35 (tcf() agora e no load, uma vez); tests/e2e/consent.spec.ts:58-68 (o stub é definido antes de qualquer script)
- **Regra:** PLANO, tabela da Plataforma, linha 'Consentimento' (o aviso próprio some onde o __tcfapi diz que o GDPR se aplica); docs/design/components/CookieNotice/README.md ('Some onde o __tcfapi diz que o GDPR se aplica'); DECISOES § 9 e § 35
- **Correção proposta pela lente:** Trocar o `tcf()||addEventListener('load',tcf,...)` por uma checagem limitada no tempo, por exemplo `var n=0,t=setInterval(function(){if(tcf()||++n>40)clearInterval(t);},250)` (10 s), ou um acessor `Object.defineProperty(window,'__tcfapi',{configurable:true,set:...})` que chama o tcf() quando a CMP definir a função. Teste novo no consent.spec.ts: addInitScript que define o __tcfapi 300 ms depois do load e espera o aviso sumir (os testes existentes ficam como estão). (custo no CI: cerca de +3 s por navegador (uma carga a mais), nos 3 jobs de Playwright; 0 s no job verificar)

**Evidência da lente:**

> Script .cache/lente-c/tcf.ts (build `all` servido como https://fileorca.com por page.route; adsbygoogle.js é um stub local que define window.__tcfapi, que responde addEventListener com gdprApplies:true; todo o resto do Google abortado). Saída: A CMP definida antes do load: hidden em 100, 500, 1500 e 4500 ms. B CMP definida 300 ms depois do load: VISIBLE nos quatro instantes. C CMP definida 3000 ms depois do load: VISIBLE nos quatro. D CMP definida num requestIdleCallback depois do load: VISIBLE nos quatro. Controles: E gdprApplies=false e F sem CMP, visível, como esperado. O código: `tcf()||window.addEventListener('load',tcf,{once:true})`, e depois nunca mais olha. O único teste (consent.spec.ts:58) usa addInitScript, ou seja, o caso A. Limite da prova: só com anúncios ligados dá para saber quando a CMP real define o __tcfapi (ela chega pelo adsbygoogle.js, que é carregado de forma assíncrona e injeta o script do Funding Choices). O load espera scripts inseridos antes dele, então o caso comum provavelmente cai no A; qualquer inicialização tardia cai no B.

**Cético:**

> O achado se sustenta. O mecanismo é verificável: a checagem do __tcfapi roda uma vez, agora ou no load, e depois nunca mais. Reproduzi isso com script e build meus (B e D deixam o aviso visível, A e C o escondem), e o código confirma nas linhas 29 e 35. A regra citada (PLANO linha 128 e README do CookieNotice) diz de fato que o aviso some onde o __tcfapi diz que o GDPR se aplica. Nenhum teste cobre o caso: consent.spec.ts:59 e :70 usam addInitScript, então a CMP já existe antes de qualquer script, que é o caso A. Mantive "medio" e não subi, porque o gatilho depende de a CMP real do Google definir o __tcfapi depois do load. Isso o plano e o autor reconhecem não poder provar sem anúncios ligados, e o caso comum (script inserido antes do load, que o atrasa) provavelmente fica seguro. Também não desci para "baixo", porque a falha atinge exatamente o que o aviso próprio existe para evitar: dois avisos de consentimento na UE, com risco de um clique no aviso próprio sobrepor a recusa na CMP. O conserto proposto (repetir a checagem por uns 10 s, ou observar a definição de window.__tcfapi) é barato e coerente com o contrato, e o teste novo com addInitScript tardio é viável.
> 
> O que rodou ou leu: 1) Código lido em src/components/CookieNotice.astro: linha 29 define tcf(), que chama window.__tcfapi('addEventListener', 2, ...) e esconde o aviso se gdprApplies===true; linha 35 faz `tcf()||window.addEventListener('load',tcf,{once:true})` e nunca mais olha. Se __tcfapi não é função no load, a função retorna sem registrar nada e o aviso fica visível para sempre. O AdsenseHead.astro (linhas 13-16) insere o adsbygoogle.js como script async no head, sem relação com o aviso. Outras buscas por __tcfapi em src/ e tests/: só CookieNotice.astro e consent.spec.ts:59 e :70.
> 
> 2) Reproduzi com script próprio (.cache/cetico-c-01/tcf.ts, saída em .cache/cetico-c-01/tcf-out.txt). Usei o build com as 3 variáveis de anúncio (.cache/prontidao/all), servido do disco como https://fileorca.com por page.route. Todo domínio do Google ficou abortado e o adsbygoogle.js era um stub meu. Resultado (aviso em 100, 500, 1500 e 4500 ms):
> - A, CMP definida durante o adsbygoogle.js, antes do load: hidden nos quatro instantes (cmpAt interactive@96, load@136).
> - B, CMP definida 300 ms depois do load: VISIBLE nos quatro (cmpAt complete@446, load@138).
> - C, o adsbygoogle.js insere de forma síncrona um 2º script async (800 ms de latência) que define a CMP: hidden. O load esperou o script (load@946, cmpAt@946).
> - D, o adsbygoogle.js faz fetch de config (400 ms) e só então insere o 2º script: VISIBLE (cmpAt complete@661, load@137).
> - E, gdprApplies=false: visível. F, sem CMP: visível. Os dois controles se comportam como esperado.
> Ou seja, o mecanismo reproduz: o aviso próprio some só se a CMP existir até o load. Uma inserção de script síncrona antes do load (C) é segura. Qualquer inicialização atrás de fetch, timer ou requestIdleCallback (B, D) deixa os dois avisos juntos.
> 
> 3) Regra conferida. O PLANO (tabela da Plataforma, linha "Consentimento", linha 128) diz que "o aviso próprio some onde o __tcfapi diz que o GDPR se aplica". O docs/design/components/CookieNotice/README.md repete isso, e o docs/relatorios/fase-03-plano.md:223 já marcava a lacuna como "Suspeita" a provar com anúncios ligados. Não há decisão em DECISOES.md que aceite a checagem única.
> 
> 4) Limite da prova, que pesa na severidade. Baixei o adsbygoogle.js genérico de Google (GET, 206 KB). Ele não contém "fundingchoices" nem "googlefc". Só tem um stub próprio de __tcfapi, que depende de um tcString já existente (linha ~115142, jo()). Logo, o momento em que a CMP real define o __tcfapi não dá para ler sem anúncios ligados. Se a injeção for em cadeia de scripts síncronos, cai no caso C e o problema não aparece. Se passar por fetch ou timer, cai no caso D. A produção não tem anúncios hoje, então não dá para medir.
> 
> 5) Impacto se o gatilho acontecer: na UE, o aviso próprio fica junto com o diálogo da CMP. Pelo `apply()` (linha 19), um clique em Aceitar no aviso próprio faz gtag('consent','update', granted) e pode sobrepor uma recusa feita na CMP. É erro real, mas só em condição de tempo e em visitante da UE. Não toca em nenhum item de "critico" nem de "alto" da régua (nenhum arquivo sai do aparelho, nenhum número vai para a URL ou o GA4, nenhum item de "O que derruba conta"). Encaixa em "medio: erro real com impacto pequeno ou raro".
> 
> Teste que já cobria: nenhum

### c-02 · A âncora do AdSense cobre inteiro o foco do teclado quando o aviso já foi fechado; o scroll-padding só leva em conta o aviso

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/CookieNotice.astro:23 (reserve() zera o scroll-padding quando o aviso some) e :32 (lift() mede a âncora mas só a usa para subir o aviso); tests/e2e/cookie-footer.spec.ts:152 (afirma scrollPadding 'auto' com a âncora na tela)
- **Regra:** WCAG 2.2 AA, critério 2.4.11 Focus Not Obscured (Minimum); DECISOES § 36 (a garantia de foco não coberto); PLANO, Monetização (âncora liberada) e docs/design/README.md:98
- **Correção proposta pela lente:** Em lift(), guardar a altura da âncora (h) e fazer o reserve() usar `max(altura do aviso, h) + 8` em scrollPaddingBottom quando houver âncora, mesmo com o aviso fechado. Estender o focusin da § 36 para tratar o topo da âncora como o limite de baixo. Teste novo: âncora sintética de 100 px, aviso recusado, 45 Tabs a 360 px e nenhum foco inteiro sob a âncora. A asserção `scrollPadding: 'auto'` de cookie-footer.spec.ts:152 afirma o estado de hoje, então vai mudar para a altura da âncora e isso precisa de um § (como a § 82 e a § 96 fizeram). (custo no CI: cerca de +3 s por navegador, nos 3 jobs de Playwright; 0 s no verificar)

**Evidência da lente:**

> Script .cache/lente-c/anchor-focus-all.ts, Chromium, 360x740, build `all` em localhost (rodapé com .fo-footer--anchor), aviso recusado, âncora simulada como a do events.spec.ts:62 (ins fixo de 100 px com data-anchor-status=displayed, a partir de y=640). Resultado: `scroll-padding-bottom=""` e, andando com Tab, `ENTIRELY under the anchor: summary "Can I compress an iPhone pho…" top=668 bottom=740` e `a "About" top=715 bottom=733` (links do rodapé), tanto na página parada quanto com o resultado na tela. O Baixar fica em 480-540, a salvo. O navegador não rola quando o elemento já está dentro da janela, porque não sabe do anúncio. O aviso resolve isso com o scroll-padding e o focusin (§ 36), mas só enquanto está aberto: `h=box.hidden?0:...`. Depois da escolha, a âncora fica sem reserva. O cookie-footer.spec.ts:152 chega a afirmar `scrollPadding: 'auto'` com a âncora na tela depois do Recusar. A saída está em .cache/lente-c/anchor-focus-all-out.txt. WebKit: sem prova (o Tab do WebKit não anda em link, e o script não consegue medir). A âncora foi simulada; a real fica a cargo do Victor no console.

**Cético:**

> O defeito é real e reproduz em Chromium e WebKit. Sem aviso aberto, nada reserva espaço para a âncora fixa. O navegador não rola um elemento que já está dentro da janela, mesmo quando um anúncio fixo o cobre, e o foco fica inteiro sob a âncora. Isso é falha de WCAG 2.2 AA, critério 2.4.11, no texto "não inteiramente oculto por conteúdo criado pelo autor"; o script do AdSense é incluído pelo autor. O controle com scroll-padding provou a causa e a correção do achado.
> 
> Reparos ao achado, que não o derrubam. (1) Das quatro referências de regra, só o critério WCAG sustenta o achado. O README:98 diz que nada do site cobre a âncora, o inverso do que o achado precisa, e a § 36 protege o foco do aviso. (2) O código segue a ficha da F3, que manda sumir o scroll-padding depois da escolha, e o cookie-footer.spec.ts:155 fixa isso. Por isso a correção pede um § novo, como o achado já diz. (3) O visitante recorrente tem o mesmo problema, o que torna o caso mais comum que o descrito.
> 
> Severidade medio e não alto. Por escopo, o Baixar fica a salvo (480-540) e a maioria das paradas afetadas está em FAQ e rodapé. Por alcance, só afeta usuário de teclado em tela estreita (a 360x740 a âncora começa em 640) e só depois do AdSense entrar. Por contorno, a âncora real do Google costuma ter botão de fechar e dá para rolar à mão. O radio das opções a 696 px é a única parada dentro da ferramenta, e depende da altura da tela: em telas mais altas a âncora começa abaixo dele. Isso encaixa em "erro real com impacto pequeno ou raro", e não em "falha de WCAG no fluxo principal". Não rebaixo a baixo porque é violação objetiva de um critério AA que a ficha lista na lente (d) e que o próprio projeto já tratou como regra (§ 36). Não testei a âncora real do Google, porque os domínios estavam bloqueados; a simulação tem a mesma geometria fixa que o projeto usa nos testes.
> 
> O que rodou ou leu: Escrevi e rodei .cache/cetico-c-02/repro.ts (Playwright, 360x740, dist/ servido por mim em 127.0.0.1:4341, domínios do Google bloqueados). A âncora é simulada como a de events.spec.ts:62, um ins fixo de 100 px com data-anchor-status=displayed, e o rodapé leva .fo-footer--anchor como em cookie-footer.spec.ts. Andei 75 Tabs em /compress-image/.
> 
> Chromium:
> - Aviso recusado: scroll-padding-bottom="" e 3 foco(s) distintos inteiros sob a âncora, listados duas vezes porque o ciclo de Tab deu a volta: o input radio do grupo de opções (.fo-seg__opt, top=696, bottom=709, scrollY=0), o summary "Can I compress an iPhone p…" (668-740) e o link "About" do rodapé (715-733). Mais 12 parcialmente cobertos, o que 2.4.11 tolera.
> - Visitante recorrente (localStorage fo-consent=denied, o aviso nunca abre): o mesmo resultado, scroll-padding-bottom="". Este é o caso mais comum, e o achado só mediu o do Recusar.
> - Aviso aberto com a âncora: 0 focos cobertos (scroll-padding 316px). A garantia da § 36 funciona enquanto o aviso existe.
> - Controle com `html{scroll-padding-bottom:108px}` em stylesheet, aviso recusado: 0 inteiros e 0 parciais sob a âncora. A causa é só a falta de reserva depois da escolha.
> 
> WebKit: o caso do visitante recorrente reproduz (radio em top=696, summary "Why does my PNG barely get…" em 668-740 e 691-763). O caso "Recusar" deu 0 paradas por limitação do meu script, então não conta.
> 
> Código lido: CookieNotice.astro:23 (reserve() com h=box.hidden?0:… e scrollPaddingBottom='' sem aviso), :26 (o focusin sai com `box.hidden`) e :32 (lift() só grava --fo-anchor no box). cookie-footer.spec.ts:155 afirma scrollPadding:'auto' com a âncora na tela depois do Recusar.
> 
> Testes: grep em tests/ por data-anchor-status acha só events.spec.ts:75 e cookie-footer.spec.ts:137. Nenhum anda de Tab com a âncora e o aviso fora. O teste de 45 Tabs (events.spec.ts:86) roda sem âncora e com o aviso aberto.
> 
> Produção, só curl: a página não carrega AdSense e o rodapé não tem --anchor, então o problema é de depois do lançamento.
> 
> Teste que já cobria: nenhum

### c-03 · O gate:prontidao não reprova um carregador sem a trava do hostname (a string da trava do push do AdSlot basta), e a trava só é testada como texto

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** scripts/lib/prontidao.ts:171; tests/unit/prontidao.test.ts:140-146 e :101; tests/unit/ads.test.ts:69 e :81
- **Regra:** CLAUDE.md, Testes e DECISOES § 93 (médio: portão que não reprova o que diz); PLANO, Monetização ('Clicar nos próprios anúncios', DECISOES § 34)
- **Correção proposta pela lente:** No checkAllBuild(), separar os <script> do HTML e exigir a trava dentro de cada script que contém `adsbygoogle.js` (carregador) e de cada script que contém `adsbygoogle||[]` (push). Acrescentar em prontidao.test.ts o caso 'carregador sem trava e push com trava'. Em ads.test.ts, executar de verdade o texto do carregador e do push com `new Function('location','document','window','matchMedia', …)` e hostname 'localhost' (nada acontece) e 'fileorca.com' (anexa o script, faz o push). O trilho também tem que respeitar o matchMedia. (custo no CI: cerca de 0 s (Vitest e regex, no job verificar))

**Evidência da lente:**

> A checagem faz `html.includes('location.hostname==="fileorca.com"')` na página inteira. Toda página de ferramenta tem essa string também no <script> do push de cada AdSlot (AdSlot.astro:19-20), então ela existe mesmo se o carregador do <head> perder a trava. Prova: .cache/lente-c/gate-fp.ts chama checkAllBuild() num site de mentira (.cache/lente-c/fake/tool/index.html) com o carregador SEM trava no <head> e um push COM trava, e a saída é `ok   Carregador só nas ferramentas, nunca em página jurídica ou institucional []`. O teste de unidade (prontidao.test.ts:101 e :145) não pega isso porque o site de mentira só tem o carregador, e trocar a string por 'true' tira a única ocorrência. Do outro lado, ads.test.ts:69 e :81 provam a trava só por `toContain` na string do HTML; nenhum teste executa o script. Eu o executei: ele funciona (ver 'checked'), então isto é um portão e um teste que não provam o que dizem, não um defeito do produto.

**Cético:**

> Regra: DECISOES § 95 (linha 596) e a coluna 'como foi conferido' da própria linha do portão prometem 'o carregador ... sempre com a trava do hostname'. O código confere a página inteira, não o carregador, então o portão não reprova o que diz. Isso cai no médio da régua (§ 93: 'teste que não prova o que diz', 'portão que não reprova o que diz'). Não é crítico nem alto: o produto está certo (o carregador e o push têm a trava) e o risco prático é pequeno, porque `tests/unit/ads.test.ts:81` (`expect(withAds).toContain('if(location.hostname==="fileorca.com")')` sobre o `AdsenseHead` no estado `all`) reprova se alguém tirar a trava do componente. Essa cobertura é só do fonte, por texto, e não faz o portão provar o que anuncia, por isso não rebaixo para baixo. A correção proposta é local, de custo próximo de zero no CI (Vitest e regex no job verificar), então cabe no § 94 para médio.
> 
> O que rodou ou leu: Reproduzi duas vezes. (1) `node .cache/lente-c/gate-fp.ts`: carregador sem trava no head e push com trava no site de mentira, saída `ok   Carregador só nas ferramentas, nunca em página jurídica ou institucional []`. (2) Prova mais forte, com HTML de verdade: peguei `.cache/prontidao/all/compress-image/index.html` (o build `all` do portão), troquei só a trava do carregador do `<head>` por `if(true)` (cópia em `.cache/cetico-c-03/site/`) e rodei `checkAllBuild` (`.cache/cetico-c-03/run.ts`). Saída: `loader head script w/o lock: true`, `lock occurrences left: 2`, `ok   Carregador só nas ferramentas... []`. A página de ferramenta tem 3 ocorrências da string (1 no carregador de `AdsenseHead.astro:14-17`, 2 nos pushes do `AdSlot.astro:19-20`), então o `html.includes('location.hostname==="fileorca.com"')` de `scripts/lib/prontidao.ts:171` é verdadeiro mesmo sem a trava no carregador. O teste de unidade `tests/unit/prontidao.test.ts:101` e `:145` usa um site de mentira só com o carregador (sem push), então a troca por `true` tira a única ocorrência e o teste passa sem ver este caso. A grep em tests/ e scripts/ por `new Function`, `vm.run`, `eval(` não acha nada: nenhum teste executa o texto do carregador ou do push. `ads.test.ts:69` e `:81` só usam `toContain` na string.
> 
> Teste que já cobria: Parcial: tests/unit/ads.test.ts:81 (toContain da trava no AdsenseHead, estado all) e :69 (push do AdSlot). Nenhum teste cobre o carregador sem trava no HTML construído nem executa o script. O teste de unidade do portão (prontidao.test.ts:145) não pega o caso porque o site de mentira não tem push.

### c-04 · Na UE, o Aceitar dado no aviso próprio em página sem a CMP vira ad_storage, ad_user_data e ad_personalization 'granted' na página de anúncio, antes da mensagem do Google

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência do Victor (antes de ligar os anúncios; § 103).
- **Onde:** src/analytics/consent.ts:49 (replay de fo-consent no <head>); src/ads/AdsenseHead.astro:48-51 (o carregador, e com ele a CMP, só vem nas páginas de ferramenta); src/components/CookieNotice.astro:29
- **Regra:** PLANO, linha 'Consentimento' da tabela da Plataforma ('a CMP do Google cuida da UE, do Reino Unido, da Suíça'); política de consentimento da UE do Google
- **Correção proposta pela lente:** Decisão do Victor, registrada num §. Opção simples: no replay do <head>, para as regiões negadas por padrão, não tocar nas chaves ad_* (replay só de analytics_storage) nas páginas com anúncio. Ou carregar o Funding Choices em todas as páginas, o que muda a arquitetura (ADR). Antes de ligar os anúncios, o Victor decide e confere o comportamento na UE com a CMP real. (custo no CI: cerca de 0 a 3 s (um teste em consent.spec.ts))

**Evidência da lente:**

> .cache/lente-c/tcf2.ts (build `all` como fileorca.com, stub da CMP definido pelo adsbygoogle.js): na home não há __tcfapi e o aviso aparece; depois do Aceitar, `fo-consent = granted`. Em /compress-image/ o __tcfapi existe (gdprApplies:true) e o aviso fica oculto, e o dataLayer traz `default denied (region UE…)`, `default granted` e `update {"ad_storage":"granted","analytics_storage":"granted","ad_user_data":"granted","ad_personalization":"granted"}`. Esse update vem só da escolha antiga, antes de a CMP do Google perguntar. A CMP vem com o adsbygoogle.js, que só as páginas com área de anúncio carregam, então home, jurídicas, Apoio e 404 ficam na UE só com o aviso próprio. O consentimento dado ali conta como de anúncio, pois o texto do aviso fala em anúncios. O próprio Google segura os pedidos de anúncio na UE até a mensagem ser respondida, e isso reduz o dano. Fica a incoerência com 'a CMP do Google cuida da UE' e com a Privacidade ('uma mensagem de consentimento do Google vai pedir a sua escolha antes de os anúncios usarem cookies').

**Cético:**

> O mecanismo é real. A escolha dada no aviso próprio, em página sem CMP (home, jurídicas, Apoio, 404), vira ad_storage, ad_user_data e ad_personalization 'granted' na página de anúncio antes da mensagem do Google. Isso destoa de 'a CMP do Google cuida da UE' (PLANO, linha Consentimento) e da frase da Privacidade 'uma mensagem de consentimento do Google vai pedir a sua escolha antes de os anúncios usarem cookies'. O PLANO não define a interação entre a escolha do aviso próprio e a CMP. 'O que derruba conta' não cobre consentimento, e o Google segura ou limita os anúncios na UE sem TC string. Fica como decisão do Victor, a conferir com a CMP real, e baixo é a severidade certa. Eu não elevaria nem refutaria.
> 
> O que rodou ou leu: Reproduzi com .cache/cetico-c-baixos/c04.ts sobre o build 'all' do lente-c, servido na porta 4432. Os domínios do Google ficam bloqueados, e o adsbygoogle.js é um stub que define __tcfapi. Na home não há __tcfapi e o aviso aparece, com o texto 'We use Google Analytics ... and ads to keep FileOrca free'. O Aceitar emite `consent update` com as quatro chaves 'granted'. Em /compress-image/ o __tcfapi existe, o aviso fica oculto, e o dataLayer traz `default denied (region ...)`, `default granted` e `update {ad_storage, analytics_storage, ad_user_data, ad_personalization = granted}`. Esse update vem do replay de src/analytics/consent.ts:49, que não olha região nem se a página tem a CMP. Ele roda no <head>, antes de o carregador do AdSense ser criado. O CookieNotice.astro:29 (tcf) só decide esconder o aviso; não toca no replay. Li também a ajuda do Google sobre CMP (answer/13554116): tráfego de CMP não certificada só é elegível a anúncios não personalizados ou limitados, o que reduz o dano.
> 
> Teste que já cobria: nenhum (consent.spec.ts:59-80 só prova que o aviso fica oculto onde o __tcfapi diz que o GDPR se aplica; nenhum teste olha o replay das chaves ad_* numa página com a CMP)

### c-05 · A regra 'nenhum texto liga doação a anúncio' contradiz a tabela de textos do PLANO; o código segue a tabela e o Sobre e os Termos vão além dela

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** src/i18n/en/support.ts:8 (e pt e es:8); src/i18n/en/about.ts:15 (e pt e es:15); src/i18n/en/terms.ts:67 (título 'Ads and donations')
- **Regra:** PLANO, Doações, 'Regras' (linha 429), contra a tabela de textos (linha 426)
- **Correção proposta pela lente:** Registrar num § a leitura adotada ('ligar' = condicionar ou trocar; descrever quem paga o quê é permitido) e tirar o 'Ads and' do título da seção dos Termos (e equivalentes em pt e es), ou então reescrever o Sobre sem a frase dos anúncios. O texto do Apoio fica, porque é contrato do plano. (custo no CI: 0 s)

**Evidência da lente:**

> PLANO-FILEORCA.md:426 manda o texto da página de apoio 'Ads cover the costs; coffees pay for new tools' e a linha 429 manda 'Nenhum texto liga doação a anúncio'. support.ts:8 copia a tabela palavra por palavra nos 3 idiomas, então não é defeito do código. Já o Sobre (about.ts:15: 'Ads cover the running costs, and optional coffees pay for new tools') e o título 'Ads and donations' dos Termos (terms.ts:67) não estão na tabela. Sobre e Termos juntam os dois assuntos por conta da F1b. A frase não condiciona nem troca uma coisa pela outra, então a leitura mais provável da regra é 'não pedir doação em troca de tirar anúncio nem de desligar o bloqueador'. O caso de 'café no 1º uso para quem bloqueia anúncio' (PLANO:416) é um vínculo explícito do próprio plano.

**Cético:**

> A leitura literal da regra (nunca citar os dois no mesmo texto) é incompatível com o texto que o próprio plano manda, e o texto específico (tabela, contrato) vence a frase geral. Só resta a leitura de que ligar é condicionar ou trocar (doe e tiro o anúncio, ou desligue o bloqueador e doe), e nenhum texto faz isso. Sobre e Termos só descrevem quem paga o quê, no mesmo sentido da tabela. O título 'Ads and donations' junta dois assuntos num título, sem ligar um ao outro. O que sobra é a falta de um § registrando a leitura adotada, o que é nota de documentação, não lacuna de código, regra ou requisito.
> 
> O que rodou ou leu: Li PLANO-FILEORCA.md:426 e :429. A linha 426 é a tabela de textos, com o texto da página de apoio 'Ads cover the costs; coffees pay for new tools' nos 3 idiomas. A linha 429 é a regra 'Nenhum texto liga doação a anúncio'. As duas são do mesmo plano e ficam na mesma seção. support.ts:8 copia a tabela. about.ts:15 diz a mesma coisa que a tabela (anúncios cobrem os custos, cafés pagam novas ferramentas). Em terms.ts:67-72 a seção 'Ads and donations' tem parágrafos separados: um sobre anúncios de terceiros e outro sobre a doação, que 'is voluntary. It buys nothing and changes nothing on the site'. Pesquisei texto que condicione, troque ou ofereça uma coisa pela outra (grep de café/anúncio, bloqueador, 'liga/ligar doação' em src e docs) e não achei nenhum. A linha do café (src/tools/image/i18n/en.ts:72) não menciona anúncio.
> 
> Teste que já cobria: nenhum (e nenhum precisa: não há texto que viole a leitura mais provável da regra)

### c-06 · O hub /image-tools/ fica fora do ads-pages.test.ts: no estado 'all' nada confere as unidades e os pushes dele

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** tests/unit/ads-pages.test.ts:6-12 e :30-33 (o glob exclui src/tools/image/* e o hub não está em NO_ADS nem em TOOL_PAGES)
- **Regra:** DECISOES § 81 (anúncios para todas as páginas de imagem); PLANO, 'Como o anúncio liga'
- **Correção proposta pela lente:** No ads-pages.test.ts, acrescentar um caso do ImageToolsView (props { lang: 'en' }) nos 3 estados: 0 ou 2 `class="adsbygoogle"`, 2 `fo-ad fo-ad--`, a meta e o carregador de acordo com o estado. (custo no CI: cerca de 1 s (Vitest))

**Evidência da lente:**

> O glob lista só src/tools/*/*Page.astro e presets, e NO_ADS lista só as páginas sem anúncio, sem o ImageToolsView. A meta e o carregador do hub entram pelo gate:prontidao (adArea no mapa de rotas), que só confere o carregador e a string da trava (ver c-03). Rodei o build `all`: o hub tem 2 `ins.adsbygoogle`, 2 pushes a 1280 px e 1 carregador, certo hoje. Nada falharia se o hub perdesse uma unidade ou o rail.

**Cético:**

> As quebras plausíveis são pegas hoje: perder unidade ou rail (image-hub.test.ts e ads.spec.ts), perder `withAds` ou o carregador (prontidao), e mexer no AdSlot (ads-pages.test.ts). O que não existe é um caso do hub nos estados 'client' e 'all' do ads-pages.test.ts, com a contagem de `class="adsbygoogle"` e a meta. Isso só pegaria um `area` errado no hub, que vem do mapa de rotas. É um acréscimo de conforto, não uma lacuna que deixe passar um defeito real.
> 
> O que rodou ou leu: A afirmação 'nada falharia se o hub perdesse uma unidade ou o rail' é falsa. Rodei `pnpm exec vitest run tests/unit/image-hub.test.ts` (6 passed). A linha 70 exige 1 `.fo-ad--content`, a 71 exige 1 `.fo-ad--rail`, e a 72 exige nenhum `.fo-ad--rail` dentro de `main`. tests/e2e/ads.spec.ts:273-290 repete a contagem de content e rail a 360 e 1280 px, o AdSlot abaixo da grade e a distância da Oli. O carregador do hub, no build com as três variáveis, é conferido por checkAllBuild em scripts/lib/prontidao.ts:162-176. O hub tem `adArea: 'arquivos'` em src/i18n/routes.ts:75, então `page.ads` é true e a falta do carregador reprova. O gate:prontidao está nos passos do verificar.ts:30. ImageToolsView.astro:42 passa `withAds` e usa o mesmo AdSlot.astro que as 100+ páginas de ferramenta do ads-pages.test.ts.
> 
> Teste que já cobria: tests/unit/image-hub.test.ts:70-72 (unidades), tests/e2e/ads.spec.ts:273-290 (ordem e distância) e scripts/lib/prontidao.ts checkAllBuild (carregador do hub com as três variáveis)

### c-07 · A Privacidade só nomeia o Google; a ajuda do AdSense pede aviso e opt-out dos outros fornecedores e redes que servem anúncio, se a conta não os desligar

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** src/i18n/en/privacy.ts:51-62 (pt e es:51-62); scripts/lib/prontidao.ts:51-58
- **Regra:** AdSense, 'Required content' (support.google.com/adsense/answer/1348695)
- **Correção proposta pela lente:** Duas saídas, ambas fora do código: o Victor restringe os fornecedores de tecnologia de anúncios no AdSense (Privacy & Messaging) e na lista de bloqueio de redes de terceiros, ou a Privacidade ganha uma frase com o link de opt-out (aboutads.info/choices) nos 3 idiomas. Acrescentar o passo à lista 'O que é do Victor'. (custo no CI: 0 s)

**Evidência da lente:**

> WebFetch de support.google.com/adsense/answer/1348695: 'Notify your site visitors of the third-party vendors and ad networks serving ads on your site', mais links desses fornecedores e a menção de que o visitante pode recusar os cookies deles (o exemplo é www.aboutads.info/choices), 'if you haven't opted out of third-party ad serving'. O texto atual diz 'Google is the advertising partner' e lista só Ads Settings e partner-sites. O gate confere só as frases do Google e esses dois links. As frases obrigatórias do AdSense estão todas presentes (ver 'checked').

**Cético:**

> Hoje não falta nada que a ajuda exija de forma incondicional. O próprio achado reconhece que a pendência é condicional e 'fora do código', e a lista de fornecedores só existe depois de o Victor configurar o Privacy & Messaging e a lista de redes. Não é defeito da F3. É um passo para a lista do Victor ('restringir os fornecedores de tecnologia de anúncios, ou citar o aboutads.info/choices na Privacidade'), que pode entrar no relatório como nota de zero custo, sem ser achado.
> 
> O que rodou ou leu: Li a página oficial (WebFetch de support.google.com/adsense/answer/1348695). O incondicional é: dizer que o Google e outros fornecedores usam cookies para anunciar com base em visitas anteriores, que os cookies do Google deixam o Google e os parceiros anunciar com base nas visitas ao site ou a outros, e que dá para optar por sair em Ads Settings. A página diz que aboutads.info é uma alternativa ao Ads Settings, não um acréscimo. A parte de avisar quais outros fornecedores e redes servem anúncios, linkar cada um e dar o opt-out deles vale 'if you have not opted out of third-party ad serving', ou seja, depende de configuração da conta AdSense. src/i18n/en/privacy.ts:51-62 tem as três frases, o link do Ads Settings e o de partner-sites, nos 3 idiomas, e o gate confere isso (prontidao.ts:51-58). Ainda não existe conta nem unidade: os anúncios estão desligados, com o AdSlot sem unidade.
> 
> Teste que já cobria: nenhum (o gate confere só as frases do Google e os dois links, que é o incondicional)

### c-08 · A heurística de bloqueador de anúncio trata 'unidade com altura 0' e 'loader ainda não terminou' como bloqueio, então pode mostrar o café já no 1º uso a quem não bloqueia

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; revisar ao ligar os anúncios).
- **Onde:** src/tools/image/coffee.ts:48-50; src/tools/image/ImagePanel.tsx:118-122 e :373
- **Regra:** PLANO, Doações, item 3 (café no 1º uso 'para quem bloqueia anúncio, detectado pelo espaço de anúncio que não carrega')
- **Correção proposta pela lente:** Medir depois de um atraso (por exemplo 3 s depois do load da página) e tratar `data-ad-status="unfilled"` como não bloqueio. Só a ausência do `adsbygoogle.loaded` com o script já terminado (evento `error` do <script>) indica bloqueio. Revisar com o anúncio real, na hora de ligar os anúncios. (custo no CI: cerca de 0 s (Vitest))

**Evidência da lente:**

> isAdBlocked() devolve true com `!loaded || unitHeight === 0`, avaliado no instante em que o resultado chega. O <ins> do AdSlot é `display:block` e sem conteúdo, com offsetHeight 0 até o anúncio ser preenchido; sem anúncio de volta (sem preenchimento) ele continua em 0; `adsbygoogle.loaded` só vira true depois que o script termina. O § 49 admite que 'no navegador não dá para provocar' e só testa a regra pura em coffee.test.ts. Não consegui reproduzir com a CMP e o anúncio reais, que só existem com os anúncios ligados, e por isso a prova é por leitura do código. Os limites: precisa de anúncios ligados, de produção e do Aceitar (sem ele o café nunca aparece).

**Cético:**

> Só sobrevive o ramo `!loaded`. Quem aceitou os cookies e solta o primeiro arquivo antes de o adsbygoogle.js terminar (rede lenta) recebe o café já no 1º uso, mesmo sem bloqueador. O ramo `unitHeight===0` só dispara com display:none. Esse é o caso de bloqueador pretendido, e só falharia por falso positivo se o AdSense real colapsar a unidade sem preenchimento com display:none, o que não consegui provar sem anúncio real. O dano é mínimo: uma linha suave, no máximo uma vez por 7 dias, só com o Aceitar e com 'não mostrar de novo'. A regra pura é prova de intenção (coffee.test.ts:51-57), e a detecção por 'espaço de anúncio que não carrega' é a do PLANO:416. Mantém baixo, com a justificativa reescrita: a corrida do `loaded`, não 'altura 0 até o preenchimento'. Conferir com o anúncio real na hora de ligar.
> 
> O que rodou ou leu: Medi com .cache/cetico-c-baixos/c08.ts (build 'all', adsbygoogle.js falso, Chromium, 1280x800, Aceitar dado, primeiro uso). O mecanismo descrito no achado está errado: a unidade vazia NÃO tem altura 0. Em `.fo-ad` (components.css:335) o `ins` fica numa grade `auto 1fr` com `.fo-ad--content{min-height:300px}` e ocupa 256 px mesmo vazio. Resultados da linha do café no 1º uso: anúncio preenchido, false; carregou sem preencher (insHeight 256), false; preenche só depois de 6 s (insHeight 256), false; script bloqueado (loaded=false), true; `ins` com display:none (filtro cosmético), true (altura 0). O ramo `!loaded` é real: com o adsbygoogle.js chegando 6 s depois e `waitUntil:'domcontentloaded'`, o arquivo é solto antes de o script rodar e o café aparece no 1º uso (insHeight 256, loaded false, shownAt gravado). Com `waitUntil:'load'` o teste esperava o script, porque o script injetado atrasa o load e a corrida não aparece.
> 
> Teste que já cobria: tests/unit/coffee.test.ts:51-57 (só a regra pura isAdBlocked, que trava `unitHeight 0 → true`); nenhum teste cobre a medida feita no instante do resultado nem a corrida com o carregamento do script

## Lente (d) · Acessibilidade

Revisei WCAG 2.2 AA no fluxo principal em Chromium e WebKit, com scripts do Playwright e axe só em .cache/lente-d/ e o dist/ servido na porta 4277. A parte mecânica está sólida: axe com 0 violações com o aviso aberto e a página no fim, nos dois caminhos de tema; foco nunca coberto; reflow a 320 px; espaçamento de texto; alvos de toque. Achei 2 altos: a busca não anuncia "sem resultado" (4.1.3) e os loops infinitos da Oli não têm pausa nem limite de 5 s (2.2.2, nível A). Achei 2 médios: o resultado é anunciado várias vezes, com "Done!" de valores intermediários a cada troca de opção, e o foco cai no body ao reescolher no aviso de cookies. Dos baixos da F2, os cinco de acessibilidade (1 a 5) se confirmam; o 6 virou o médio. Não rodei leitor de tela real: o que é anúncio vem da árvore de acessibilidade e das mutações do DOM.

**Conferido e certo:**

- axe (wcag2a, wcag2aa, wcag21a/aa, wcag22aa, best-practice) com o aviso aberto e a página rolada ao fim: 0 violações em 144 combinações (9 páginas: /, /compress-image/, /privacy/, /image-tools/, /pt/, /pt/comprimir-imagem/, /es/comprimir-imagen/, /contact/, /support/; 360 e 1280 px; claro e escuro; por prefers-color-scheme e por html[data-theme]; Chromium e WebKit). Script .cache/lente-d/axe-notice.ts. Nota: o axe devolve 10 a 19 nós de color-contrast como 'incomplete' ali (rodapé encoberto pelo aviso: o axe não consegue medir); o a11y.spec os mede no topo da página, onde o rodapé não está encoberto.
- axe pelo caminho data-theme (com a media query dizendo o outro tema) nos estados resultado de lote, Crop com erro de campo e busca sem resultado, a 360 e 1280 px, nos dois temas, nos dois navegadores: 0 violações (.cache/lente-d/axe-states-attr.ts). Os blocos de tokens do tokens.css são idênticos nos dois caminhos.
- WCAG 2.4.11 com o aviso aberto: Tab pela página inteira em Chromium a 320x256, 360x740, 740x360 e 1280x800 em 5 páginas: nenhum elemento da página fica totalmente escondido (os 3 'hidden' por execução são os controles do próprio aviso); a 320x256 (zoom de 400%) o aviso ocupa 230 de 256 px e os elementos ficam só parcialmente cobertos, o que o critério AA permite (.cache/lente-d/tab-notice.ts). Foco programático em cada um dos 15 links do rodapé (7 em es) a 320, 360, 768 e 1280 px nos dois navegadores: 0 fora do aviso (footer-focus.ts).
- Foco no Baixar depois do resultado, com o aviso aberto, em /compress-image/, /crop-image/ e /image-to-pdf/, a 360x740, 320x568, 1280x800 e 740x360, nos dois navegadores: elementFromPoint no Baixar devolve o próprio botão (hits=self) e o botão está acima do aviso (flow-notice.ts). Única exceção: a caixa do Crop a 740x360 (celular deitado) fica parcialmente sob o aviso, por ser mais alta que o espaço livre.
- WCAG 2.4.7: anel de foco sólido de 3 px no knob do BeforeAfter (value 50 para 51 com ArrowRight), no radio do segmentado (ArrowRight mantém o foco e reprocessa, status diz 'Done! ... 93% lighter.'), na miniatura de escolha e na caixa do Crop, nos dois navegadores (rings.ts). Teclado no Crop: Shift+Seta e Seta mudam a caixa e os 4 campos acompanham (77,0,480,480).
- WCAG 1.4.10: scrollWidth igual a 320 em 18 páginas/estados por navegador (inclui lote com ZIP, Crop com lote, pt e es com resultado, 404, licenças, apoio), com o aviso aberto e depois de Recusar (reflow.ts). WCAG 1.4.12: com line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em e parágrafos com 2em, a 360 px, em início e resultado de Compress, Crop e es: só o texto sr-only do botão de busca (fo-header__search-text) é cortado, e é de propósito; nada visível é cortado.
- WCAG 2.5.8: todo controle interativo tem 24 px ou mais, a 360 e 1280 px, em páginas e estados (início, lote, Crop, Resize, busca). As únicas medidas menores são links de predefinição dentro de lista, de 18 px de altura, com 34 a 39 px entre eles (exceção de espaçamento do 2.5.8), e o axe target-size não reprova (targets.ts).
- Contraste de componente (1.4.11), calculado dos tokens: stroke sobre bg/surface/sunken 15,6 a 17,3 no claro e 4,07 a 4,67 no escuro; focus 4,59 a 5,09 no claro e 5,28 a 7,02 no escuro; on-deep sobre deep 13,16:1 (as faixas de design do 3:1 ficam atendidas).
- Teclado da busca: Enter no botão leva o foco ao combobox; Esc fecha e o foco volta ao botão de busca nos dois navegadores (no Chromium o 1º Esc limpa o texto do input type=search, comportamento nativo). Menu de idioma: Enter abre o popover, Tab entra nos links (Chromium), Esc fecha e devolve o foco ao botão. Skip link: abre #main e o próximo Tab vai ao primeiro foco do conteúdo (Chromium; o WebKit não para em link por padrão) (widgets.ts, search-focus.ts).
- Erro de campo (3.3.1): NumberField põe role=alert, aria-invalid=true e aria-describedby no campo, nos dois navegadores. O Resize diz a faixa ('Type a whole number from 1 to 20,000.').
- Nomes e idiomas: no pt e no es o resultado em lote tem nomes acessíveis traduzidos (slider 'Comparar antes e depois', 'Baixar photo-1.jpg', 'Mostrar ...', grupo 'Compressão') e status traduzido; html lang é en, pt-BR e es; o foco vai ao Baixar ao fim do lote e o progressbar tem aria-valuetext (i18n-names.ts, tree.ts).
- Movimento reduzido: sob prefers-reduced-motion o CSS global zera animações (global.css) e o design.spec.ts confere getAnimations() vazio nos estados; no processamento os loops da onda e do nado são indicador de progresso (exceção de essencial, Nota 4 do 2.2.2) e não entram no achado d-02.

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| d-01 | A busca não anuncia 'sem resultado' (mensagem de status sem role nem aria-live) | alto | rebaixado | médio | corrigido em e849869 (§ 101) |
| d-02 | Loops infinitos da Oli e do vapor começam sozinhos, passam de 5 s e não têm pausa (2.2.2, nível A) | alto | rebaixado | médio | pendência do Victor (decisão de design já deixada a ele na F1b; § 103) |
| d-03 | O resultado é lido várias vezes, com 'Done!' de valores intermediários, a cada troca de opção (aria-live no card mais role=status) | médio | confirmado | médio | corrigido em cfa95b0 (§ 102), baixo 6 da F2 |
| d-04 | Ao reabrir o aviso de cookies por 'Change my cookie choice' e escolher, o foco cai no body (não volta ao botão) | médio | confirmado | médio | corrigido em e849869 (§ 101) |
| d-05 | Baixo F2-2: o erro dos campos do Crop não diz a faixa aceita | baixo | refutado | baixo | refutado (baixo 2 da F2) |
| d-06 | Baixo F2-3: caixa pequena do Crop não se arrasta com o ponteiro (as alças de 48 px cobrem o centro) | baixo | rebaixado | médio | corrigido em cfa95b0 (§ 102), baixo 3 da F2 |
| d-07 | Baixo F2-1: a caixa do Crop (role=group focável) não expõe valor | baixo | confirmado | baixo | corrigido em cfa95b0 (§ 102), baixo 1 da F2 |
| d-08 | Baixo F2-4: a escolha da foto na fila é só miniatura de 52 px e borda, sem rótulo visível | baixo | refutado | baixo | refutado (baixo 4 da F2) |
| d-09 | Baixo F2-5: o BeforeAfter diz só '50', sem aria-valuetext | baixo | refutado | baixo | refutado (baixo 5 da F2) |

### d-01 · A busca não anuncia 'sem resultado' (mensagem de status sem role nem aria-live)

- **Severidade da lente:** alto. **Cético:** rebaixado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/SearchBox.astro:32-33 (bloco [data-search-empty], hidden, sem role) e src/search/search.ts:93-94 (empty.hidden e aria-expanded). Vale também para a busca em linha da 404, que usa o mesmo SearchBox.
- **Regra:** WCAG 2.2, critério 4.1.3 Status Messages (AA); https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html. A busca está no escopo da lente.
- **Correção proposta pela lente:** Pôr no SearchBox.astro, fora de qualquer elemento hidden, um <p class="fo-sr" role="status" data-search-status></p>. Em search.ts render(), escrever nele o mesmo texto do título vazio quando none (e esvaziar quando houver resultados). Teste: nos dois testes de navigation.spec.ts que já chegam ao estado vazio (por volta das linhas 71 e 93), acrescentar expect(dialog.getByRole('status')).toContainText('heic') e o equivalente em pt. (custo no CI: cerca de 0 s: usa dois testes que já carregam a página e abrem a busca; sem carga nova.)

**Evidência da lente:**

> Script .cache/lente-d/widgets.ts, em Chromium e WebKit, digitando 'youtube downloader' no diálogo: search empty state: {"emptyText":"No tool called \"youtube downloader\"","liveAncestor":false,"liveInDialog":0,"input":{"role":"combobox","aria-expanded":"false",...}}. Ou seja, o bloco aparece, o input perde o aria-activedescendant e nenhum ancestral nem elemento do diálogo tem aria-live, role=status ou role=alert. `grep -rn 'role="status"\|aria-live' src` só acha ImagePanel.tsx:695 e :902 (a ferramenta); nada na busca. A página do W3C (Understanding 4.1.3, lida com curl) diz que mensagens breves sobre o estado de uma busca, como "Searching...", "18 results returned" ou "No results returned", são mensagens de status e precisam de role. Usuário de leitor de tela que digita uma consulta sem resultado não ouve nada.

**Cético:**

> O problema existe e a regra diz o que o achado afirma: a mensagem "No tool called X" é resultado de uma ação (a busca) e não é anunciada, o que descumpre o 4.1.3 (AA). Mas "alto" na régua pede falha de WCAG no fluxo principal. A busca é um atalho opcional, com alternativas de navegação em toda página, e o defeito só ocorre numa consulta sem resultado, o que dá impacto pequeno e raro. Isso é "médio: erro real com impacto pequeno ou raro". Na prática a consequência é a mesma, porque pelo § 94 o médio com correção local (um `<p role="status" class="fo-sr">` e uma linha em render(), sem custo de CI) é corrigido na F3. Se o Victor ou a revisão entenderem que a busca é parte do fluxo principal (ela é a rota de recuperação da 404), "alto" também se defende. Não achei motivo para "refutado".
> 
> O que rodou ou leu: Reproduzido por mim. Li src/components/SearchBox.astro:31-36 (o bloco [data-search-empty] nasce com `hidden`, sem role nem aria-live) e src/search/search.ts:91-98 (render() só faz `empty.hidden = !none`, `aria-expanded` e troca o textContent do título; select(-1) remove o aria-activedescendant). Rodei meu script .cache/cetico-d-01/repro.ts contra o dist/ servido em PORT=4360 (Chromium e WebKit, domínios do Google bloqueados): no diálogo, digitando "youtube downloader", saída: `live regions present in the document (open dialog): []`, `liveInDialog: 0`, cadeia de ancestrais do bloco vazio (div > div > dialog#fo-search-dialog > body > html) sem role nem aria-live, `inputActivedesc: null`, `inputExpanded: "false"`, ariaSnapshot do diálogo mostrando só `paragraph: No tool called "youtube downloader"` (parágrafo comum, não `status`). Na 404, a busca em linha: `liveInside: 0, liveAncestor: false, emptyVisible: true`, igual nos dois navegadores. `grep -rnE 'role="status"|aria-live|role="alert"' src` só acha ImagePanel.tsx (695, 790, 902) e NumberField.tsx:107: nada na busca. Regra: baixei o Understanding 4.1.3 do W3C com curl; o texto diz que a lista de resultados não é status, mas que mensagens breves como "Searching...", "18 results returned" ou "No results returned" são status se não tomam foco nem recarregam a página. O defeito de 4.1.3 (AA) é real. A ressalva é o enquadramento "alto" da régua (§ 93 e decisão 3 do prompt da F3): "falha de WCAG A ou AA no fluxo principal". O fluxo principal do site é soltar a imagem, ajustar, ver o resultado e baixar; a busca é atalho de navegação opcional (home, hub, cabeçalho e rodapé listam as mesmas ferramentas), e o defeito só aparece no caso raro de consulta sem resultado, num catálogo pequeno com sinônimos nos três idiomas. Quem usa leitor de tela ainda alcança o parágrafo vizinho ao campo com o cursor virtual, ou limpa e redigita. A correção proposta funciona (uma região role="status" fora de qualquer `hidden`, escrita em render()), é local e cobre também a 404, porque ambas usam o SearchBox.
> 
> Teste que já cobria: nenhum

### d-02 · Loops infinitos da Oli e do vapor começam sozinhos, passam de 5 s e não têm pausa (2.2.2, nível A)

- **Severidade da lente:** alto. **Cético:** rebaixado, médio. **Estado:** pendência do Victor (decisão de design já deixada a ele na F1b; § 103).
- **Onde:** src/styles/components.css:14 ([data-oli="wave"] > svg com fo-float ... infinite alternate) e :17-18 (.oli-steam path com fo-steam ... infinite); keyframes em :19 e :22
- **Regra:** WCAG 2.2, critério 2.2.2 Pause, Stop, Hide (A): https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html; régua da decisão 3 (falha A no fluxo principal é alto). Contraria só o texto 'loops' do design/README.md:74, que é documento read-only.
- **Correção proposta pela lente:** Opção mais barata, sem controle novo: limitar cada loop a até 5 s e deixar a Oli em repouso. Para a wave, keyframes 0%/100% em repouso e 50% deslocada, duração calc(var(--dur-float) * 1.5), count 1; para o vapor, animation-iteration-count: 2 (3,6 s). Registrar num § novo do DECISOES que a mudança troca o 'loop' do README da Oli pelo limite do 2.2.2 (a pasta docs/design é read-only, então a decisão é do Victor). Alternativa mais cara: botão 'Pausar animações' (G186), que traria estado e um local novo no localStorage. Teste: nos testes 'motion without the preference' do design.spec.ts, asserir que todo getAnimations() fora de .fo-level/.fo-water--moving tem getComputedTiming().endTime <= 5000 (sem esperar 5 s); os testes 'the wave floats in a loop' e 'the coffee steam rises in a loop' seguem verdes porque ainda movem nos primeiros segundos, mas o nome deles muda. (custo no CI: cerca de 0 s: a asserção lê endTime no teste que já carrega a página.)

**Evidência da lente:**

> Script .cache/lente-d/states.ts, document.getAnimations() com iterations === Infinity, igual em Chromium e WebKit: '/' , '/compress-image/', '/pt/' e '/crop-image/' têm fo-float(3000ms) em <svg oli=wave> running; '/support/' tem dois fo-steam(1800ms) running; '/privacy/', '/image-tools/' e a 404 não têm. O dropzone ocioso, ponto de entrada do fluxo principal, e o herói da home ficam em movimento contínuo (flutua 6 px e gira 2 graus). O Understanding 2.2.2 (lido com curl) define 'moving' como conteúdo que 'conveys a sense of motion', cita animações, e as técnicas suficientes são G4, G11 (menos de 5 s), G152 (parar em n ciclos dentro de 5 s), G186, G191; prefers-reduced-motion (C39) não está entre elas. Mitigação real, mas que a norma não reconhece como mecanismo: com prefers-reduced-motion nada se move. A F1b registrou 'baixo, Victor decide' (fase-01b.md:1171); pela régua da F3 é falha A no fluxo principal. Os loops do processamento (onda e nado) são indicador de progresso e ficam de fora (Nota 4 do 2.2.2).

**Cético:**

> O problema reproduz nos dois navegadores e a regra citada diz o que o achado afirma. O que não se sustenta é a severidade. O achado trata como falha A estabelecida algo que o W3C ainda discute (issue #3766 aberta). Ele diz que a norma 'não reconhece' prefers-reduced-motion como mecanismo, mas o glossário de 'mechanism' admite mecanismo fornecido pela plataforma ou pelo agente de usuário. O site implementa a forma forte da mitigação (animation: none, testado em todos os estados). O movimento é decorativo e de baixa amplitude, e o próprio contrato de design (README:74 e § 44) manda o loop, com o ponto já registrado como baixo na F1b e 'aberto' no plano da F3. Isso é uma lacuna real pela leitura estrita do 2.2.2 e pela prática comum de auditoria, mas não uma falha inequívoca, então 'medio'. Não refuto porque o critério se aplica (sem exceção para decoração), não há pausa nem limite de 5 s, e a correção é barata. A correção proposta no achado é boa, mas muda um contrato do design system e precisa ser registrada como decisão do Victor, não só aplicada.
> 
> O que rodou ou leu: REPRODUZIDO. Script próprio .cache/cetico-d-02/loops.ts (document.getAnimations() com iterations===Infinity, 1280x800, Google bloqueado), servidor do dist/ na porta 4361 (já encerrado). Sem preferência, Chromium e WebKit iguais: '/', '/pt/', '/es/' têm 1 fo-float (3000 ms, alternate, running) no <svg> da Oli wave dentro de div.fo-hero (128x128); '/compress-image/' e '/crop-image/' têm o mesmo na div.fo-drop idle (112x112); '/support/' tem 2 fo-steam (1800 ms, infinito, running, nos paths do símbolo do sprite); '/privacy/', '/image-tools/' e a 404 não têm nada. Com reducedMotion 'reduce': lista vazia em todas as 9 rotas nos dois navegadores. O movimento é visível: .cache/cetico-d-02/visible.ts tira screenshot do elemento da Oli a cada 450 ms (6 quadros) e os 6 hashes são diferentes na home, no dropzone e no apoio (vapor), nos dois navegadores. Código: src/styles/components.css:14 e :17-18 (keyframes em :19 e :22), como no achado. A amplitude é pequena (translateY -6px e rotate -2deg).
> 
> REGRA. Texto do 2.2.2 e Understanding lidos com curl (w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): 'moving' é conteúdo que 'conveys a sense of motion'; começa sozinho, passa de 5 s e está em paralelo com outro conteúdo, então o critério se aplica, sem exceção para decoração. Técnicas suficientes listadas: G4, SCR33, G11, G152, SCR22, G186, G191; C39 não aparece, mas a mesma página diz 'There may be other ways of meeting the criterion not covered by these techniques'. Ponto contra o achado: o glossário do WCAG 2.2 (w3.org/TR/WCAG22) define 'mechanism' com a Nota 1: 'The mechanism may be explicitly provided in the content, or may be relied upon to be provided by either the platform or by user agents'. Logo a frase 'a norma não reconhece como mecanismo' não se sustenta no texto normativo. A questão é ABERTA no próprio W3C: w3c/wcag issue #3766 (aberta desde 28/mar/2024, 13 comentários) pergunta se prefers-reduced-motion satisfaz o 2.2.2. Há resposta rascunhada pedindo cautela e um participante dizendo que a media query sozinha não é técnica suficiente, mas ninguém a classifica como falha e outro comentário diz que a decoração 'could be met simply by turning them off'. O site faz a forma forte (animation: none, não só reduzir; DECISOES § 44), então a leitura estrita é 'falha provável', não 'falha estabelecida'.
> 
> CONTRATO DO PROJETO. docs/design/README.md:74 manda 'loops com ease-in-out' e DECISOES § 44 fixa a wave e o vapor em loop. docs/relatorios/fase-01b.md:1171 já registrou o ponto como baixo, 'Fica para o Victor decidir', e docs/relatorios/fase-03-plano.md:243 o trata como '2.2.2 aberto'. Corrigir exige um § novo no DECISOES trocando o 'loop' do README pelo limite do 2.2.2, e a pasta docs/design é read-only.
> 
> TESTES. Rodei design.spec.ts -g 'prefers-reduced-motion: reduce|motion without the preference' no Chromium (FO_PORT=4261): 11 passed. Eles provam a mitigação (getAnimations() vazio com a preferência, em idle, arrastando, processando, resultado, erro, /support/ e 404) e que sem a preferência há animação rodando. Nenhum teste afirma o limite de 5 s nem um controle de pausa, e o axe não tem regra para animação CSS.
> 
> SEVERIDADE. Pela régua da decisão 3, 'alto' pede uma falha de WCAG A estabelecida. Aqui o critério se aplica e o site não tem controle na página nem limite de 5 s, mas depende de um mecanismo da plataforma que o glossário admite e o W3C não resolveu. O impacto é pequeno: movimento decorativo de 6 px, aria-hidden, e uma preferência do sistema o desliga por completo em todos os estados. Cabe em 'medio' (erro real, impacto pequeno), não em 'alto'. A lacuna é real e o custo é perto de zero, então vale corrigir como médio local: cap de 5 s em wave e vapor, ou pausa (G186), com § no DECISOES e teste lendo endTime. Precisa da decisão do Victor, porque contraria o 'loop' do README.
> 
> Teste que já cobria: Parcial: design.spec.ts (describes 'prefers-reduced-motion: reduce' e 'motion without the preference', 11 testes, passam no Chromium) cobre só a mitigação (nada se move com a preferência; algo se move sem ela). Nenhum teste cobre o caso do achado (loop sem pausa e acima de 5 s sem a preferência).

### d-03 · O resultado é lido várias vezes, com 'Done!' de valores intermediários, a cada troca de opção (aria-live no card mais role=status)

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102), baixo 6 da F2.
- **Onde:** src/tools/image/ImagePanel.tsx:695 (<section class="fo-result fo-deep" aria-live="polite">) e :902-903 (<p class="fo-sr" role="status">{m.announce}); texto do status montado em :376 e :394
- **Regra:** WCAG 2.2, 4.1.3 Status Messages (AA) pede que a mensagem chegue, não que chegue várias vezes; F2 baixo 6 e DECISOES § 86(5) (a região de status é a que fala). O README do ResultCard (docs/design/components/ResultCard/README.md:17) manda aria-live=polite no card, que é o que gera a duplicata.
- **Correção proposta pela lente:** Tirar o aria-live do <section> em ImagePanel.tsx:695 e deixar só o role=status, que já diz a fala da Oli (preserva a intenção do README: 'o leitor de tela ouve a fala da Oli'). Registrar o desvio do texto do README num §. Testes que usam role=status (island.spec.ts:43,47,113; tool.spec.ts:192; image-batch.spec.ts:68) não mudam. Teste novo no island.spec.ts: depois do resultado, expect(page.locator('.fo-result [aria-live], .fo-result[aria-live]')).toHaveCount(0) e exatamente um role=status com a frase. (custo no CI: cerca de 0 s: asserção num teste que já chega ao resultado.)

**Evidência da lente:**

> .cache/lente-d/states.ts: depois do resultado há duas regiões vivas com a mesma frase: section.fo-result[aria-live=polite] com 'Done! Your 3 images are 84% lighter.−84%lighter Before 384 KB After 62.3 KB ... Download all ... Start over ...' e p.fo-sr[role=status] com 'Done! Your 3 images are 84% lighter.'. .cache/lente-d/tree.ts, MutationObserver nas duas regiões ao trocar Compression para Strong num lote de 3 fotos: o card (polite) mudou 4 vezes, com os textos 'Done! Your 3 images are 87% lighter.' , '...90% lighter.', '...93% lighter.' e de novo '...93%', e só depois o p[role=status] recebeu 'Done! Your 3 images are 93% lighter.'. Num lote de N fotos o card dispara N+1 vezes. As cifras de 87% e 90% não são o resultado final. A semântica ARIA exposta (não testei leitor de tela real) é de anúncio duplicado e de valores errados. Não é falha de 4.1.3 (a mensagem chega), por isso médio.

**Cético:**

> O comportamento reproduz e é pior do que a duplicata da F2: com N arquivos, o card dispara de N+1 vezes, com três nós de texto por passo (frase 'Done!', placa, tamanho), e fala 'Done!' com cifras que ainda não valem enquanto o lote processa. O valor final sai certo no role=status, então nenhuma informação se perde, e não há falha de WCAG 2.2 A/AA (4.1.3 satisfeito), o que exclui 'alto'. É erro real de anúncio no fluxo de mudar uma opção, com impacto pequeno (ruído e cifras transitórias para quem usa leitor de tela), o que se encaixa em 'medio' da régua. Não é só 'baixo': 'Done!' dito antes da hora com números errados é um erro, não uma lacuna de capricho. Ressalvas para a correção: o desvio do README do ResultCard (e do docs/design/README.md:104) precisa ser registrado num §, e a prova com leitor de tela real falta. A correção proposta (tirar o aria-live do <section> e deixar o role=status) é coerente: os testes que leem role=status não mudam, e o AX mostra que o status já é atomic.
> 
> O que rodou ou leu: Código: ImagePanel.tsx:695 tem <section class="fo-result fo-deep" aria-live="polite"> e :902-903 tem <p class="fo-sr" role="status">{m.announce}. O card fica montado durante uma nova rodada, porque showCard (:610) inclui phase==='processing' && !showLevel, e saysFor (:456-465) recalcula a frase só com as linhas já prontas. Reproduzi num servidor próprio (PORT=4362, serve-dist, Google bloqueado), com scripts em .cache/cetico-d-03/live.ts e muts.ts, no Chromium. Lote de 3 fotos em /compress-image/, depois Compression = Strong. Linha do tempo: o card (mesmo elemento, não recriado) muda aos 83 ms ('Done! Your 3 images are 87% lighter.'), aos 139 ms ('90%') e aos 199 ms ('93%'), e de novo aos 205 ms (o tamanho do ZIP). O p[role=status] só recebe 'Done! Your 3 images are 93% lighter.' aos 205 ms. Em cada passo mudam três nós de texto do card: a frase, a placa ('−87%') e o 'After' ('50.6 KB'). Com N=1 o card muda uma vez e o status repete a mesma frase em seguida (duplicata). A árvore AX do Chromium (CDP Accessibility.getFullAXTree) confirma: o card tem live=polite, atomic=false, relevant='additions text'; o status tem live=polite, atomic=true. Pela semântica ARIA, cada troca de nó de texto no card é uma mensagem a falar, com 'Done!' e cifras que ainda não são as finais. Não testei leitor de tela real. Regra: o README do ResultCard:17 e docs/design/README.md:104 mandam o aria-live no card, e o código as segue, então o defeito vem do cruzamento com o role=status da §86(5). A §86(5) diz que o status é esvaziado para a frase igual ser dita de novo; não diz que o status é o único que fala, e a citação do achado está parafraseada além do texto. O WCAG 4.1.3 não reprova (a mensagem chega), como o próprio achado admite. O item já constava na F2 como baixo 6 ('anunciado duas vezes', fase-03-plano.md:307); o achado traz o dado novo dos valores intermediários.
> 
> Teste que já cobria: nenhum

### d-04 · Ao reabrir o aviso de cookies por 'Change my cookie choice' e escolher, o foco cai no body (não volta ao botão)

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em e849869 (§ 101).
- **Onde:** src/components/CookieNotice.astro:27 (hide) e :31 (clique em [data-consent-change] move o foco ao primeiro botão do aviso e nada o devolve)
- **Regra:** WCAG 2.2, 2.4.3 Focus Order (A) (o foco não preserva o contexto depois de uma ação do usuário) e o padrão de diálogo do WAI-ARIA APG (devolver o foco a quem abriu). O aviso está no escopo da lente.
- **Correção proposta pela lente:** No handler de [data-consent-change], guardar document.activeElement numa variável; em hide(), se document.activeElement estiver dentro do aviso ou for o body, e o guardado ainda estiver no documento, chamar .focus(), e esquecer a variável. Teste: no fluxo do consent.spec.ts:83 ('Change my cookie choice'), depois de Accept/Decline, expect(botão 'Change my cookie choice').toBeFocused(). (custo no CI: cerca de 1 a 2 s por navegador (uma ação a mais num teste que já existe).)

**Evidência da lente:**

> .cache/lente-d/notice-focus.ts em /privacy/, nos dois navegadores: '1) after Accept by keyboard, focus on: BODY'; '2) after "Change my choice" focus on: BUTTON Decline'; '3) after choosing again, focus on: BODY (the "Change my choice" button was Change my cookie choice)'. O aviso tira o foco do botão da página por ação da pessoa e, ao fechar, o foco vai para o body: o usuário de teclado perde a posição (o botão estava no meio da página; o aviso fica no fim do DOM).

**Cético:**

> O problema é real e reproduz nos dois navegadores. Depois de reabrir o aviso pelo botão da página de privacidade e escolher, o foco cai no body e o ponto de partida do teclado fica no fim do DOM, onde está o aviso. O usuário de teclado perde o lugar no meio da página. A correção sugerida funciona, e o ordem certa é guardar o elemento antes de ocultar e focar depois do hide(), para não disparar o focusin da § 36 com o aviso ainda visível.
> 
> A severidade "medio" se sustenta pela régua. Não é "alto" porque (1) o fluxo é secundário: só quem reabre a escolha na página de privacidade, e o fluxo principal de ferramenta não é afetado; (2) o impacto é pequeno, pois a página não rola e há poucos focáveis entre o botão e o rodapé; (3) o enquadramento como falha de 2.4.3 é defensável pelo Understanding e pelo APG, mas não é violação normativa inequívoca. Também não é "baixo": é erro real de teclado com correção barata. O primeiro Aceitar/Recusar, sem origem, também termina no BODY, mas isso é o comportamento esperado de um aviso sem gatilho e não faz parte do achado.
> 
> Nada na documentação do componente (docs/design/components/CookieNotice/README.md), no PLANO ou no DECISOES fala de devolver o foco, então o achado é lacuna de qualidade de acessibilidade e não desvio de requisito escrito. O axe não pega esse caso.
> 
> O que rodou ou leu: Código lido em src/components/CookieNotice.astro (worktree revisao-f3, commit 736b1cd): a linha 27 é `function hide(){box.hidden=true;reserve();}` e a 31 é o handler de [data-consent-change], que faz `show()` e `box.querySelector('button').focus()`. Não existe variável que guarde o botão de origem, e o hide() não devolve o foco. O botão vem de src/views/LegalView.astro:35 (só nas páginas de privacidade).
> 
> Reproduzi com um script próprio (.cache/cetico-d-04/focus.ts, servidor local na porta 4363, rotas do Google bloqueadas), em /privacy/, 1280x800, com espera de 300 ms para o ajuste de foco do navegador. Saída:
> - chromium 2) após "Change my cookie choice": foco em BUTTON "Decline" (aviso visível)
> - chromium 3) após escolher: foco em BODY (a página não rolou, scrollY 2088 antes e depois)
> - chromium 5) Shift+Tab: vai para o último link do rodapé ("Like these tools? Support them…"), isto é, a posição de teclado é a do aviso, no fim do DOM
> - webkit 2) BUTTON "Decline"; webkit 3) BODY
> 
> Sem a espera, o Chromium ainda mostra o botão oculto como activeElement até a próxima renderização; o WebKit já vai ao BODY. O comportamento final é o mesmo nos dois.
> 
> Regra: o Understanding do WCAG 2.2 para 2.4.3 (baixei o HTML do w3.org e li) traz como exemplo de caixa de diálogo não modal "when the dialog is closed, the focus order goes from the button to the following element" e, para a modal, "focus returns to the button or the element following the button". É exemplo informativo, não texto normativo. O texto normativo ("foco em ordem que preserva sentido e operação") fica só discutível aqui. O aviso tem role="dialog" e o código já move o foco para dentro ao abrir, então só metade do padrão de diálogo do APG está implementada (falta devolver o foco ao fechar).
> 
> Correção testada por simulação, sem editar o repositório (.cache/cetico-d-04/fix-sim.ts): guardar o document.activeElement no clique de [data-consent-change] e dar .focus() nele depois de hide(). Resultado: "chromium with simulated fix, focus on: BUTTON 'Change my cookie choice'" e o mesmo no webkit. Servidor local encerrado no fim.
> 
> Teste que já cobria: nenhum

### d-05 · Baixo F2-2: o erro dos campos do Crop não diz a faixa aceita

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado (baixo 2 da F2).
- **Onde:** src/tools/crop-image/i18n/en.ts:78 (invalid: 'Type a whole number that keeps the box inside the image.') e src/tools/crop-image/Panel.tsx:80 (error={texts.invalid}); contraste com src/tools/resize-image/i18n/en.ts:81
- **Regra:** WCAG 2.2, 3.3.3 Error Suggestion (AA), no limite: há sugestão, mas vaga quando a faixa é conhecida. Baixo da F2 (item 2).
- **Correção proposta pela lente:** Texto com {min} e {max} ('Type a whole number from {min} to {max}.') e fmt() com limits no Panel.tsx; trocar nos três idiomas e no teste image-smoke.spec.ts:334-358 que confere o texto. (custo no CI: 0 s (o mesmo teste, outra string).)

**Evidência da lente:**

> .cache/lente-d/widgets.ts nos dois navegadores: /resize-image/ error: "Type a whole number from 1 to 20,000."; /crop-image/ error: "Type a whole number that keeps the box inside the image." O Panel.tsx do Crop já calcula limits.min e limits.max por campo (fieldLimits) e não os usa no texto. aria-invalid e aria-describedby estão certos.

**Cético:**

> A mensagem já traz a sugestão de correção: diz o que fazer (número inteiro que mantém a caixa dentro da foto). O WCAG 3.3.3 pede que a sugestão seja dada, não que traga a faixa numérica exata, e o próprio achado admite 'há sugestão'. A faixa do Crop muda com os outros três campos, então dizer a regra é uma redação correta, não uma lacuna. O que sobra é preferência de redação. Duas afirmações do achado estão erradas: o teste que 'confere o texto' não confere, e não há três idiomas para trocar. Sem violação de regra, não é achado.
> 
> O que rodou ou leu: Li src/tools/crop-image/i18n/en.ts:78 e Panel.tsx:80 (error={texts.invalid}) e a saída .cache/lente-d/widgets.out: o Crop diz 'Type a whole number that keeps the box inside the image.' e o Resize diz 'from 1 to 20,000'. O NumberField liga o erro com role=alert, aria-invalid e aria-describedby. Conferi docs/design/README.md:30 ('Erro diz o que houve e o que fazer'). Procurei teste que confira o texto do Crop e não achei: image-smoke.spec.ts:334-358 é o teste de axe e só olha a visibilidade do erro do Resize. O Crop só tem texto em inglês (src/tools/crop-image/i18n tem só en.ts).
> 
> Teste que já cobria: nenhum (e nenhum precisa: a regra do design, 'diz o que fazer', está cumprida)

### d-06 · Baixo F2-3: caixa pequena do Crop não se arrasta com o ponteiro (as alças de 48 px cobrem o centro)

- **Severidade da lente:** baixo. **Cético:** rebaixado, médio. **Estado:** corrigido em cfa95b0 (§ 102), baixo 3 da F2.
- **Onde:** src/tools/crop-image/CropEditor.tsx:82-96 (pointerdown pega o [data-corner] mais próximo) e src/styles/components.css:307-308 (alça de var(--tap-min) = 48 px)
- **Regra:** WCAG 2.2, 2.5.7 Dragging Movements (AA) satisfeito pelas alternativas de teclado e campos; baixo da F2 (item 3).
- **Correção proposta pela lente:** Em onPointerDown, só tratar como alça quando a caixa for grande o bastante (por exemplo, lado maior que 2 x 48 px na tela); senão mover. Ou diminuir a alça quando a caixa é pequena. Teste no image-crop.spec.ts com a caixa a 9%. (custo no CI: cerca de 1 s (um caso a mais no image-crop.spec.ts).)

**Evidência da lente:**

> .cache/lente-d/crop-small.ts, Chromium, modo Free, foto de 640 px: caixa de 105 px na tela, centro = fo-crop__box; caixa de 52 px (60 px da foto, 9%), centro = fo-crop__handle (data-corner=se). Abaixo de uns 50 px na tela só dá para redimensionar pelo ponteiro, não mover. Há alternativa (setas e os 4 campos), por isso baixo.

**Cético:**

> O defeito é real e reproduz nos dois navegadores. A interação documentada no cabeçalho do CropEditor ('arraste dentro dela para mover') deixa de valer abaixo de uns 52 px de tela por lado. Numa foto de 4000 px, mostrada a 560 px (ou a uns 280 px no celular de 360 px), uma caixa de até uns 370 px da foto (ou uns 740 px no celular) não se move pelo ponteiro. A régua da F3 define medio como 'erro real com impacto pequeno ou raro': há saídas (setas, os quatro campos, ou encolher pelos dois cantos), por isso não é alto, e o WCAG 2.5.7 fica satisfeito pelas alternativas. Mas é um erro funcional de código, não texto nem preferência, e passa sem teste, então subo de baixo para medio. Uso 'rebaixado' só porque o enunciado manda marcar mudança de severidade assim.
> 
> O que rodou ou leu: Reproduzi com o dist/ da worktree na minha porta 4433, em Chromium e WebKit, modo Free, foto de 640 px mostrada a 560 px (script .cache/cetico-d-baixos/crop-pointer.ts). Caixa de 60 px da foto (52 px na tela): o ponto do centro cai em .fo-crop__handle[data-corner=se] e arrastar a partir dele mexe na largura e altura (0,0,60x60 vira 0,0,64x53). Caixa de 40 px (35 px na tela): o mesmo. Caixa de 62 px (54 px na tela) e maiores: o centro cai em .fo-crop__box e arrastar move (x 0 vira 34, y 0 vira 23). O limite é de uns 52 px de tela nos dois lados. Em CropEditor.tsx:82-96 o pointerdown usa closest('[data-corner]') e as alças têm var(--tap-min) = 48 px, centradas no canto de dentro da borda. Nenhum teste cobre caixa pequena: image-smoke.spec.ts:158-189 só arrasta caixa grande. O piso pelo ponteiro é 2% do lado menor (minSide em box.ts), então o código deixa o ponteiro encolher a caixa até onde nunca mais consegue movê-la.
> 
> Teste que já cobria: nenhum

### d-07 · Baixo F2-1: a caixa do Crop (role=group focável) não expõe valor

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** corrigido em cfa95b0 (§ 102), baixo 1 da F2.
- **Onde:** src/tools/crop-image/CropEditor.tsx:137-141 (role="group", tabindex=0, aria-label, aria-describedby)
- **Regra:** WCAG 2.2, 4.1.2 Name, Role, Value (A): o valor existe nos campos; baixo da F2 (item 1).
- **Correção proposta pela lente:** Pôr aria-valuetext não vale em role=group; trocar o role por 'application' é pior. Mais simples: um aria-live=off e atualizar o aria-describedby para incluir os campos, ou nome dinâmico 'Crop area, x 80, y 0, 480 by 480' (aria-label calculado do box atual). Testar no image-crop.spec.ts. (custo no CI: 0 s.)

**Evidência da lente:**

> .cache/lente-d/tree.ts: crop box attrs: {"class":"fo-crop__box","role":"group","tabindex":"0","aria-label":"Crop area","aria-describedby":"cr-keys"}; a árvore mostra só '- group "Crop area"'. Os campos X, Y, Width e Height ao lado (textbox com valor, 'X': 80) são o caminho acessível e acompanham as setas, então o valor chega por eles.

**Cético:**

> Lacuna real: um controle que responde a setas é exposto como group, sem papel de controle e sem valor, e a mudança de posição ou tamanho não é anunciada ao ficar no foco. No NVDA em modo navegação, a seta nem chega à página, e a ajuda 'Arrow keys move the box' engana. Os campos espelham o mesmo valor e são totalmente operáveis, e a decisão está registrada, então o impacto é pequeno e não passa de baixo. O 4.1.2 fica no limite (a falha F59 trata de div com resposta de controle sem papel). A correção sugerida pelo achado é fraca: o aria-label dinâmico não é relido no foco parado. Algo como uma região viva polida com 'x, y, largura por altura' depois das setas serviria melhor.
> 
> O que rodou ou leu: CropEditor.tsx:137-141: div role=group, tabindex=0, aria-label, aria-describedby, com onKeyDown que move e redimensiona. .cache/lente-d/tree.out mostra só '- group "Crop area"', sem valor, e os campos X, Y, Width e Height como textbox com valor. Não há região viva nem aria-valuetext no crop-image/*.tsx. O único teste, image-smoke.spec.ts:140, confere só o nome acessível. O DECISOES § 74 documenta que 'o caminho acessível é a caixa mais os campos'. O axe da lente d passou sem violação.
> 
> Teste que já cobria: nenhum (image-smoke.spec.ts:140 prova só o nome)

### d-08 · Baixo F2-4: a escolha da foto na fila é só miniatura de 52 px e borda, sem rótulo visível

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado (baixo 4 da F2).
- **Onde:** src/components/FileCard.tsx:81 (button.fo-file__pick com aria-label 'Show {name}' e aria-pressed); src/styles/components.css:226-229 (borda de 3 px na foto escolhida)
- **Regra:** WCAG 2.2, 4.1.2 e 3.3.2 (instruções) no limite; sem violação de A ou AA clara. Baixo da F2 (item 4).
- **Correção proposta pela lente:** Dar title/tooltip igual ao aria-label ou um texto visível 'Preview' ao lado da miniatura quando a ferramenta tem comparação ou caixa. (custo no CI: 0 s.)

**Evidência da lente:**

> .cache/lente-d/tree.ts: listitem 'photo-1.jpg': button 'Show photo-1.jpg' [pressed] (o nome e o estado estão certos para leitor de tela). Para quem enxerga, o único sinal de que a miniatura é um botão é o cursor; não há texto nem tooltip. O anel de foco é visível (rings.ts: solid 3px rgb(11, 99, 246)) e o alvo tem 52 px.

**Cético:**

> Não há violação de A nem de AA, e o próprio achado diz 'sem violação clara'. Nome, papel e estado estão certos (4.1.2). O 3.3.2 trata de campo de entrada e já é atendido pelo texto onde o gesto importa (Crop). Nas outras ferramentas, escolher a miniatura só troca qual foto a comparação mostra, que é um extra. Pôr title ou texto visível é preferência de afordância, não lacuna de regra, de requisito ou de corretude.
> 
> O que rodou ou leu: FileCard.tsx:81: button.fo-file__pick com aria-label 'Show {name}' e aria-pressed, e a lente d (tree.out) confirma nome e estado corretos. Alvo de 52 px, bem acima de 24 px (2.5.8), e anel de foco visível, medido pela lente em rings.ts. Estado escolhido por borda de 3 px (forma, não só cor, components.css:226-229). O Crop explica o gesto em texto visível: batchNote 'Pick an image in the list to adjust its box.' (en.ts:79), a introdução (linha 11) e as perguntas frequentes (linhas 23 e 53). island.spec.ts 'picks the file of the queue it shows' cobre o comportamento. O README do FileCard no design não prevê esse toggle (components.css:222 diz que o design não tem estado para ele), então não há requisito visual contra o qual medir.
> 
> Teste que já cobria: island.spec.ts (nome, aria-pressed e troca de foto); a instrução visível está no batchNote e na introdução do Crop

### d-09 · Baixo F2-5: o BeforeAfter diz só '50', sem aria-valuetext

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado (baixo 5 da F2).
- **Onde:** src/tools/image/BeforeAfter.tsx:35-43
- **Regra:** WCAG 2.2, 4.1.2 Name, Role, Value (A): nome, papel e valor presentes; baixo da F2 (item 5).
- **Correção proposta pela lente:** aria-valuetext='{position}% {afterTag-like}' (por exemplo '50% do resultado visível') com texto nos 3 idiomas; acrescentar uma asserção no island.spec.ts. (custo no CI: 0 s.)

**Evidência da lente:**

> .cache/lente-d/tree.ts: '- slider "Compare before and after": "50"' (também em pt: 'Comparar antes e depois' = 50). Teclado e anel de foco funcionam (ArrowRight muda 50 para 51; rings.ts). O valor numérico existe, só sem unidade.

**Cético:**

> Nome, papel e valor estão presentes (4.1.2), como o próprio achado admite. Num range de 0 a 100 o '50' já se lê como porcentagem, e o VoiceOver diz '50%'. Não existe regra que exija aria-valuetext num slider nativo, e o valor da posição não carrega informação para quem não vê as imagens: a informação útil são os tamanhos, que estão nas etiquetas. O aria-valuetext do WaterLevel existe porque o design manda, e o design não manda para o BeforeAfter. O que sobra é preferência de redação, não achado.
> 
> O que rodou ou leu: BeforeAfter.tsx:35-43 é um <input type=range min=0 max=100> nativo com aria-label. O README do componente em docs/design/components/BeforeAfter/README.md diz que o controle é um range invisível e que 'o leitor de tela anuncia Compare before and after', ou seja, é exatamente o que está implementado. A lente d mostra 'slider "Compare before and after": "50"' e island.spec.ts:170-180 cobre nome, valor inicial 50 e a seta mudando para 51. As etiquetas 'Before · X' e 'After · Y' são texto no DOM antes do range, então o tamanho chega ao leitor de tela. As imagens têm alt vazio, são decorativas.
> 
> Teste que já cobria: island.spec.ts:170-180 (nome, valor 50, seta); o design não pede valuetext

## Lente (e) · Desempenho e SEO técnico

Desempenho e SEO técnico estão em bom estado. Nenhum achado crítico nem alto. A produção (main f549f1b) é idêntica ao dist/ da worktree, salvo o delta esperado dos três commits da F3 (aviso de cookies, guia do hub, H1 do hub). Todas as 35 URLs dos sitemaps dão 200 sem x-robots-tag, e não há /cdn-cgi/ nem cloudflareinsights no HTML. Os orçamentos de JS e de requisições passam em todas as 38 páginas (máx. 21,2 KB e 6 requisições). O Lighthouse local dá 100 nos dois modelos e 99 a 100 em 10 outras páginas. O CLS pior caso, com o aviso aberto, é 0,0043. O CI fecha todas as partes em menos de 440 s. Os achados reais são cinco. Dois são médios: o caminho da página sem OffscreenCanvas bloqueia a thread principal por 2,4 a 3,0 s, baixa o .wasm duas vezes e não tem teste que o force; e a memória de um lote longo cresce 13 MB por HEIC, porque o ZIP é montado cedo e duplica as saídas. Três são baixos: LCP e INP sem asserção, favicon só em data: SVG e /_astro/ em 404 com cache immutable.

**Conferido e certo:**

- Produção = main: build.txt devolve f549f1bfaa618bb296c679014710c998dcebf529; robots.txt de produção é byte a byte o public/robots.txt (diff vazio); sitemap-index e os 3 sitemaps (19/8/8 URLs) idênticos aos do dist/.
- 35 URLs dos sitemaps em produção (curl GET): todas HTTP 200, nenhuma com x-robots-tag, zero ocorrências de cdn-cgi ou cloudflareinsights no HTML.
- Comparação do HTML de produção com o dist/ das 35 páginas após normalizar os hashes de /_astro: a única diferença é o script reserve() do aviso (todas as páginas) e, no hub, o H1 e a seção do guia (f5fa1c4). O CSS de produção difere do dist/ só nas duas regras do .fo-footer (cf5fba8).
- URL inexistente: /nope-xyz/, /pt/nope-xyz/ e /ads.txt dão 404. /404 dá 200 com x-robots-tag: noindex. /404.html dá 307 para /404. As maiúsculas em /Compress-Image/ dão 404.
- Redirects: http://fileorca.com/ (e com caminho) e https://www.fileorca.com/ (e com caminho e query) dão 301 direto para https://fileorca.com/... Observação: http://www.fileorca.com/ dá dois saltos 301 (http→https em www, depois www→apex), sempre terminando no apex. A zona fica fora do repositório.
- Cabeçalhos reais em produção: nosniff, Referrer-Policy strict-origin-when-cross-origin, content-security-policy frame-ancestors 'self', HSTS max-age=31536000; includeSubDomains, sem COOP/COEP. /_astro/* devolve Cache-Control: public, max-age=31536000, immutable com Content-Encoding br. /build.txt devolve no-store. HTML e manifest devolvem max-age=0, must-revalidate.
- IndexNow: https://fileorca.com/4ad5aef34d8b1746ec596c51d0f4fa1a.txt devolve 200 text/plain com o corpo igual a INDEXNOW_KEY (src/platform/site.ts:22) e ao arquivo do dist/.
- fileorca.vmatusita.workers.dev devolve x-robots-tag: noindex e canonical para https://fileorca.com/. Os 35 og:image de produção dão 200 image/png, e o dist/ tem PNG de 1200x630.
- Varredura própria do dist/ (.cache/lente-e/seoscan.ts), sem usar o gate: canonical igual à URL em todas as 35 indexáveis; og:title, og:description e og:url iguais ao title, à description e ao canonical; html lang e og:locale coerentes (en_US, pt_BR, es_ES); hreflang en/pt-BR/es/x-default nas 20 páginas com equivalentes; hub e ferramentas só em inglês sem hreflang (correto); JSON-LD sem aggregateRating nem review; WebApplication com offers.price 0; BreadcrumbList coerente com o breadcrumb visível; Person e AboutPage só no Sobre; CollectionPage com ItemList de 8 no hub; descrições de 139 a 159 caracteres; título mais longo com 69 caracteres (/es/licencias/).
- robotsProblems() (scripts/lib/seo-checks.ts:73) lido: reprova Disallow com valor em qualquer bloco, inclusive Googlebot e Mediapartners-Google; exige o Sitemap do índice. O gate:seo compara dist/robots.txt com public/robots.txt.
- Orçamentos em todas as páginas, não só nas do budgets.spec.ts (.cache/lente-e/allpages.ts, Chromium, 360x740): 38 páginas (35 do sitemap mais 3 de 404), máx. 6 requisições e 21,2 KB gzip de JS (Crop). Home, hub, páginas legais e 404 carregam 0 arquivos JS (só 2,1 KB inline) e 4 requisições. No CI, o WebKit do Linux soma /manifest-en.webmanifest e fecha as ferramentas em 7 de 8; o par '/' para '/compress-image/' usa exatamente 3 de 3 novas.
- Lighthouse (celular, `pnpm lhci` uma vez): /compress-image/ e /image-tools/ com 100/100/100/100, LCP 1,50 s e 1,35 s, CLS 0,000; o LCP é o texto do aviso, não a Oli. Extra (lhci collect, saída em .cache/lente-e/.lighthouseci): /, /resize-image/, /heic-to-jpg/, /image-to-pdf/, /privacy/, /pt/comprimir-imagem/, /crop-image/ e /compress-image/to-100kb/ ficam entre 99 e 100 (LCP 1,35 a 1,59 s, CLS máx. 0,001). A única exceção é um 93 em / numa execução ruidosa, com TBT 298 ms; em 3 execuções repetidas de / e /pt/ deu 100 com TBT 0.
- CLS com o aviso aberto (.cache/lente-e/cls.ts): 35 páginas e 2 URLs de 404, a 360x740 e a 1280x800, mais a rolagem até o fim. Pior caso 0,0043 (/es/acerca-de/ a 1280). O reserve() do cf5fba8 não introduz salto relevante.
- INP no caminho com worker (CPU 4x, lote de 20 fotos de 12 MP, toques durante o processamento): pior duração de interação 72 ms, pior atraso de entrada 22 ms, maior long task 137 ms. Dentro do orçamento de 200 ms.
- Memória de lote, caminho com worker (.cache/lente-e/mem.ts, Chromium, 30 fotos de 12 MP no Compress): processos de 84 MB para 468 a 521 MB, JS heap 3 MB. Image to PDF com 40 fotos: 714 MB, heap 141 MB. Sem vazamento: após Start over e GC forçado (CDP), o heap volta a 3 MB e o processo do navegador a 21 a 26 MB. A expansão da fila para 30 e 60 miniaturas não aumenta o renderer, por causa do teto do cache de decodificação do Chromium.
- CI (gh run view, só leitura), run 41228880941 (d097f07), verde: verificar --sem-playwright 169 s; chromium 309 s; webkit 1/2 255 s; webkit 2/2 380 s. Run 41226056230 (cf5fba8): 164, 392, 254 e 431 s. O gate:prontidao custa uns 12 s no CI (2 builds de 5,8 s cada). Todas as partes ficam abaixo de 700 s.
- O CI do próprio commit revisado (736b1cd, run 41227322450) falhou uma vez em webkit 2/2: island.spec.ts:143 esperava 2 downloads e recebeu 1. A corrida foi corrigida no d097f07 (espera o ZIP novo antes de clicar no download da linha). Não reporto como achado, mas registro para a lente (a).
- Cloudflare Speed Brain: todas as respostas trazem Speculation-Rules: "/cdn-cgi/speculation"; o JSON devolve prefetch conservative de href_matches /*. É só prefetch, sem JS, e não aparece no HTML, então não conta como /cdn-cgi/ no HTML (pós-deploy). Não executa GA4 nem anúncio. Fica fora do repositório (zona).
- Cabeçalho gerado: src/platform/headers.ts gera X-Robots-Tag só se !launched; o dist/_headers e a produção concordam (sem noindex no site, com noindex em /404 e /:lang/404 e em workers.dev).

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| e-01 | Caminho da página (worker sem OffscreenCanvas) bloqueia a thread principal por 2,4 a 3,0 s, baixa o .wasm duas vezes e nenhum teste o força | médio | confirmado | médio | corrigido em cfa95b0 (teste do caminho da página) e 20daa39 (warm) (§ 102) |
| e-02 | Memória de lote longo: o ZIP montado cedo duplica as saídas (~13 MB por HEIC de 12 MP) e nada mede nem avisa o limite | médio | rebaixado | baixo | pendência (baixo; régua de memória do lote longo, run 3b) |
| e-03 | LCP ≤ 2,0 s e INP ≤ 200 ms da tabela do PLANO não têm asserção; o Lighthouse CI só cobre 2 páginas | baixo | refutado | baixo | refutado |
| e-04 | Favicon só como data:image/svg+xml; /favicon.ico dá 404 e o Google lista PNG/ICO/GIF/JPEG, não SVG | baixo | confirmado | baixo | pendência (baixo; favicon.ico para o Google, run 3b) |
| e-05 | /_astro/* devolve Cache-Control immutable de 1 ano também nas respostas 404 | baixo | confirmado | baixo | pendência (baixo; limitação do _headers, registrada na § 103) |

### e-01 · Caminho da página (worker sem OffscreenCanvas) bloqueia a thread principal por 2,4 a 3,0 s, baixa o .wasm duas vezes e nenhum teste o força

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (teste do caminho da página) e 20daa39 (warm) (§ 102).
- **Onde:** src/tools/image/engine-client.ts:45-59 (processFile/onPage), :76-79 (warm); src/tools/image/ImagePanel.tsx:516; tests/e2e/tool.spec.ts:41-48
- **Regra:** PLANO 'Orçamento de desempenho' (INP ≤ 200 ms garantido por Web Worker); 'Nota para a F3' do relatório da F2, item 3 (caminho na página sem OffscreenCanvas); DECISOES § 22; prompt F3 lente (e). Limita-se a Safari antes do 16.4 e a quem não consegue criar o Worker.
- **Correção proposta pela lente:** (1) Teste e2e novo (Chromium basta): page.route em /_astro/worker-*.js prefixando `delete self.OffscreenCanvas;`, processar um JPG e afirmar o resultado, que nenhuma exceção ocorreu e que cada .wasm foi pedido uma vez só. (2) No engine-client, quando `canvasInWorker()` der false, não chamar `worker.api.warm` dos codecs de imagem (hoje o warm baixa uma cópia que nunca é usada: 1,4 MB no HEIC) ou aquecer o caminho da página (import de process.ts). (3) Registrar no DECISOES § 22 que o INP desse caminho não cumpre 200 ms (uma tarefa de 2 a 3 s por foto de 12 MP) e que é uma exceção aceita. (custo no CI: +~3 s em uma parte do Playwright (1 teste, 1 carga, 1 JPG); 0 s no restante.)

**Evidência da lente:**

> Script .cache/lente-e/pagepath.ts: Chromium, CPU normal, o script do worker é servido com `delete self.OffscreenCanvas;` na frente. Saída real. Normal em /compress-image/: long tasks [99] ms; em /heic-to-jpg/: [78] ms. Worker sem OffscreenCanvas em /compress-image/: long tasks [102, 2402] ms, e depois do drop baixa de novo process.js, runtime, jpeg e mozjpeg_enc.wasm (300 KB). Em /heic-to-jpg/ (heic-02, 6 MB): long tasks [86, 58, 3038] ms; o warm já baixou libheif.wasm (1429K) e libheif.js (86K) no worker, e depois do drop a página baixa libheif.wasm 1429K, libheif.js 86K, process.js 34K e heic.js (6 arquivos, 1552 KB). Com CPU 4x (.cache/lente-e/inp.ts) a long task é de 14.997 ms no Compress e 11.223 ms no HEIC; a página não responde a toque nesse intervalo (o Cancelar também não). No caminho com worker, o maior long task é 150 ms no Compress e 362 ms no HEIC a 4x. O teste tool.spec.ts:41-48 afirma só que existiu um worker `worker-*.js`; em engine-client.ts:22-32 o worker é criado sempre, então o teste passa igual com o motor na página. Grep por OffscreenCanvas|window.Worker|addInitScript nos testes: nenhum caso força o caminho (só tool.spec.ts:42 e um comentário em lib/page.ts:175). O INP ≤ 200 ms da tabela do PLANO depende de 'Processamento em Web Worker'.

**Cético:**

> O achado se sustenta. Reproduzi a trava da thread principal, a segunda baixada dos .wasm e o warm desperdiçado (1,4 MB no HEIC), e provei que o teste de tool.spec.ts:41 passa com o trabalho na página, junto com mais 40 testes de Chromium. Isso cabe literalmente na régua do medio: "erro real com impacto pequeno ou raro" (só Safari antes do 16.4 e quem não consegue criar o Worker, hoje uma fração pequena do tráfego; o INP de campo vem do Chrome e nem enxerga esse público) e "teste que não prova o que diz" (o nome diz que o trabalho roda no Worker, mas a asserção só vê que um Worker foi criado, o que acontece sempre). Não sobe para alto: não há violação de orçamento medido, de WCAG nem de promessa de privacidade, o caminho é uma escolha deliberada e já documentada (§ 22: sem ele a ferramenta falharia nesses navegadores) e o resultado sai correto. Também não desce para baixo: além do teste vazio, uma regressão que mande todos os navegadores para a thread principal passaria despercebida no CI, e o PLANO apoia o INP justamente no Worker. Ressalvas ao texto do achado: os tempos (2,4 a 3,0 s; 15 s a 4x) saíram menores na minha máquina (1,1 a 1,5 s; 6,5 s a 4x), e o Linux WebKit do CI não pôde ser checado. O fix proposto (teste com page.route prefixando `delete self.OffscreenCanvas;`, não aquecer codec quando canvasInWorker for false, registrar a exceção no § 22) é adequado.
> 
> O que rodou ou leu: 1) Leitura: engine-client.ts:22-32 cria o Worker sempre (start() roda em current()); :53 manda para onPage() quando canvasInWorker() dá false; :76-79 warm() chama worker.api.warm sem esperar worker.canvas. worker.ts:19 devolve typeof OffscreenCanvas !== 'undefined'. tool.spec.ts:41-48 só afirma workers.some(url => /worker-*.js/) e só faz console.log se o OffscreenCanvas da PÁGINA falta.
> 
> 2) Reprodução (cópia do script da lente em .cache/cetico-e-01/pagepath.ts, porta 4380, Chromium, Google bloqueado). Normal: long tasks [] em /compress-image/ e em /heic-to-jpg/, 0 arquivos baixados depois do drop. Worker com `delete self.OffscreenCanvas;` na frente: /compress-image/ long task [1238] ms (outra rodada [1537]) e depois do drop baixa de novo process.js, jpeg.js, runtime.js, mozjpeg_enc.js e mozjpeg_enc.wasm (5 arquivos, 300 KB). /heic-to-jpg/: long task [1125] ms; o warm já baixou libheif.wasm 1429K e libheif.js 86K no worker, e depois do drop a página baixa libheif.wasm 1429K, libheif.js 86K, process.js, heic.js etc. (6 arquivos, 1552 KB). Ou seja, a cópia dupla e o warm desperdiçado são reais. Os tempos que medi são menores que os do achado (1,1 a 1,5 s contra 2,4 a 3,0 s; o achado provavelmente foi medido com a máquina disputada). Com CPU 4x (inp.ts da lente, porta 4380): caminho com worker 0 long tasks; caminho na página 1 long task de 6451 ms (o achado diz 14.997 ms). A ordem de grandeza (segundos de thread principal travada contra zero) se confirma; o número exato não.
> 
> 3) O teste não prova o que diz: copiei o dist/ para .cache/cetico-e-01/site/dist, pus `delete self.OffscreenCanvas;` na frente de worker-SVpHrSbF.js (o worker de imagem) e servi na porta 4280. Confirmei que nesse build o trabalho roda na página (long task 1537 ms, mozjpeg_enc.wasm baixado de novo). Rodei os testes ORIGINAIS, sem editar: `FO_PORT=4280 pnpm exec playwright test tests/e2e/tool.spec.ts -g "the work runs in the Web Worker" --project=chromium` passou (1 passed). Depois tool.spec.ts + island.spec.ts + budgets.spec.ts inteiros no mesmo build: 41 passed. Nenhum teste de Chromium detecta que o trabalho passou para a thread principal, nem uma regressão que mande TODOS os navegadores pelo caminho da página.
> 
> 4) Cobertura: grep em tests/ por canvasInWorker, OffscreenCanvas, window.Worker, addInitScript: só tool.spec.ts:41-42 e um comentário em lib/page.ts:175. O WebKit do Windows do desenvolvedor cai no caminho da página (os relatórios da F1a/F1b/F2 mostram a linha "o motor rodou na página"), mas só localmente e só pela corretude do resultado, não por desempenho. No ci-log.txt da lente essa linha não aparece nas partes de WebKit do CI (a página tem OffscreenCanvas lá), então o CI Linux provavelmente não exercita o caminho; não consegui rodar WebKit Linux para confirmar.
> 
> 5) Regra: PLANO-FILEORCA.md:300 diz INP ≤ 200 ms com "Processamento em Web Worker". DECISOES § 22 (linha 124-127) e a nota da F2 (docs/relatorios/fase-02.md:1806) já dizem que o motor roda na página e baixa outra cópia dos .wasm, mas nenhuma das duas registra que o INP desse caminho não cumpre a meta; o INP nesse caminho nunca foi medido antes. O build usa o alvo padrão do Vite 8 (safari16.4), sem lookbehind nem static block no dist, então nada indica que o site pare de carregar em Safari 15/16.0-16.3. Nenhuma política de navegadores exclui Safari < 16.4. Servidores 4280 e 4380 encerrados; git status limpo; escrevi só em .cache/cetico-e-01/.
> 
> Teste que já cobria: nenhum (tool.spec.ts:41-48 existe, mas passa igual com o trabalho na página; o WebKit do Windows local só cobre a corretude do resultado, não o desempenho nem o download duplicado)

### e-02 · Memória de lote longo: o ZIP montado cedo duplica as saídas (~13 MB por HEIC de 12 MP) e nada mede nem avisa o limite

- **Severidade da lente:** médio. **Cético:** rebaixado, baixo. **Estado:** pendência (baixo; régua de memória do lote longo, run 3b).
- **Onde:** src/tools/image/ImagePanel.tsx:250-265 (assemble/zipFiles), :339-348 (ZIP montado ao fim de todo lote), :228-230 (outUrl e previewUrl por item); src/engine/image/zip.ts
- **Regra:** 'Nota para a F3' da F2, item 4 (memória de lotes longos no celular e régua do lote longo); P2 c.6 ('lote sem limite'); prompt F3 lente (e).
- **Correção proposta pela lente:** Duas opções locais. (a) Montar o ZIP só quando a pessoa clica em 'Download all' (mostrar 'Preparing…'); corta a memória pela metade e o trabalho de CPU no fim de cada lote. No Safari, confira o download iniciado depois de um await. (b) Manter o ZIP cedo e registrar no DECISOES o custo medido (~2x a soma das saídas) e uma régua: um teste/script que processe 30 fotos e falhe se o Private Bytes passar de um teto escolhido. Em qualquer caso, anotar no relatório que o limite real em celular não foi medido. (custo no CI: (a) 0 s, até -1 s por lote nos testes de ZIP; (b) ~+8 s em uma parte (30 fotos), só no Chromium.)

**Evidência da lente:**

> Script .cache/lente-e/mem.ts (Chromium, soma do Private Bytes de todos os processos da instância; JS heap por performance.memory). HEIC to JPG com heic-02 repetido: 20 arquivos = 611 MB (navegador 277 MB, renderer 303 MB); 60 arquivos = 970 MB (navegador 791 MB, renderer 148 MB), isto é, ~12,9 MB por arquivo de memória do processo do navegador, linear. Compress com 30 fotos de 12 MP = 468 a 521 MB. Image to PDF com 40 fotos = 714 MB, com heap de página de 141 MB (buildPdf em pdf-client.ts:24-29 lê todos os blobs em ArrayBuffers de uma vez, em Promise.all). Depois de Start over e GC forçado tudo volta (navegador 21 a 26 MB, heap 3 MB): não há vazamento. Os ~13 MB por arquivo correspondem a duas cópias da saída (o blob de cada item mais o ZIP 'stored', que copia todos). Extrapolando: um álbum de 150 HEIC de iPhone passa de 1,9 GB só no processo do navegador. Em celular não foi medido (só Chromium no desktop). A pendência 'régua do lote longo' da F2 segue sem teste nem medida no repositório; grep por performance.memory|measureUserAgentSpecificMemory em tests/ e scripts/ não acha nada.

**Cético:**

> O fato é real e o achado está medido com precisão, mas a severidade média não se sustenta pela régua.
> 1) Não há defeito funcional nem regra violada. Nenhum orçamento de memória existe (os orçamentos são JS, requisições, Lighthouse e CLS). O critério 3 da ficha da F2 (prompt-fase-02.md:89) pede que "a memória não cresça lote a lote (bitmaps fechados, URLs revogadas, saídas guardadas como Blob)", e isso vale: medi o retorno ao nível-base do navegador depois de Start over. A cláusula "lote sem limite" (linhas 83 e 168 e PLANO item 11) é uma proibição de inventar teto, não um requisito de memória. A "Nota para a F3" item 4 só manda olhar a memória; não fixa limite.
> 2) O 2x é decisão de desenho e vem da ficha. O prompt da F2 (linha 86) manda o ZIP montado no worker ao fim do lote, com o ResultCard dizendo "Download all · ZIP 9.4 MB", e o § 69 fecha que "o Download só aparece quando o ZIP existe: o cartão nunca mostra um Download desligado". A correção (a) do achado (montar o ZIP só no clique) contradiz essas duas fontes (o rótulo precisa do tamanho do ZIP) e ainda arrisca o download no Safari depois de um await, como o próprio achado admite. Só (b) cabe, e (b) é documentação mais uma medida.
> 3) A régua automatizada proposta em (b) não é portável. O CI é Ubuntu; o Private Bytes do script é do Windows via PowerShell. O performance.memory não enxerga os blobs (3 MB de heap contra 613 MB nos processos, medido por mim). Um teste confiável pediria leitura de /proc em Linux e teto sensível à versão do Chromium: risco de teste instável. O custo de CI de "+8 s" não considera isso.
> 4) É pendência já registrada e aceita. O relatório da F2 (fase-02.md:1743 e :1756) diz que a régua do lote longo "fica para a F5 (pendência)", e o plano da F3 a lista como "sem teste". O achado acrescenta a medida (útil) mas não é defeito novo.
> 5) Impacto não demonstrado: o número de 1,9 GB para 150 HEIC é extrapolação em desktop; o celular, onde estaria o risco, não foi medido. Lotes típicos (até 30 fotos) dão 390 a 520 MB por esse mesmo cálculo. Sem falha observada, não é "erro funcional" (alto) nem "erro real" com impacto verificado (médio). Resta a lacuna de medida e de registro: baixo.
> O que vale registrar no DECISOES/relatório: o custo medido (~2 vezes a soma das saídas no processo do navegador, 12,9 MB por HEIC de 12 MP, sem vazamento) e que o limite em celular não foi medido; a régua automática fica para a F5, com leitura de processo no Linux. Nada disso muda código.
> 
> O que rodou ou leu: REPRODUZI os números do achado, com o meu script .cache/cetico-e-02/mem2.ts (Chromium, porta 4381, Google bloqueado, soma do Private Bytes de todos os processos da instância, via procmem.ps1) sobre o dist/ da worktree, HEIC to JPG com 20 HEIC de 12 MP.
> - ZIP montado cedo (código de hoje): 612, 614 e 613 MB em três execuções (achado: 611). Navegador 277, renderer 303 a 306, linha de base 82 MB. Rótulo "Download all · ZIP 126 MB"; ZIP de 126.273.122 bytes, 6,02 MB por arquivo.
> - Sem o ZIP (engoli a chamada Comlink `zip` do worker; o nome da API é `zip`, não `zipFiles`, e conferi que o cartão não aparece e a barra fica em "Zipping 20 files…"): processo do navegador 156 MB contra 277 MB com o ZIP. A diferença, ~120 MB, é uma cópia das saídas. Confirma que o ZIP cedo duplica as saídas no processo do navegador (onde ficam os blobs). O renderer oscila entre 149 e 306 MB conforme o GC e não separa os casos.
> - Sem vazamento: depois de Start over e GC forçado, navegador 20 MB (linha de base 18). O renderer fica em ~200 MB por causa da memória WASM do worker, que não encolhe, mas não cresce de lote a lote.
> - performance.memory mostra 3 MB de heap com 613 MB nos processos: os blobs não aparecem no heap de JS.
> - grep em tests/ e scripts/ por performance.memory, measureUserAgentSpecificMemory, usedJSHeapSize e PrivateMemory: nada de teste de memória (confirma "sem teste nem medida"). O fase-03-plano.md:261 já lista o item como "sem teste".
> - Não medi celular nem o PDF/Compress; só o caso do ZIP.
> FONTES: src/tools/image/ImagePanel.tsx:339-350 (assemble ao fim de todo lote, com o ZIP fora do cartão até existir), src/tools/image/engine-client.ts:62, src/engine/image/zip.ts, docs/prompts/prompt-fase-02.md linhas 83 a 89, DECISOES § 69 e § 86, docs/relatorios/fase-02.md:1743 e :1756.
> 
> Teste que já cobria: nenhum

### e-03 · LCP ≤ 2,0 s e INP ≤ 200 ms da tabela do PLANO não têm asserção; o Lighthouse CI só cobre 2 páginas

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** lighthouserc.json:5, :11-16
- **Regra:** PLANO 'Orçamento de desempenho': linhas LCP no celular ≤ 2,0 s e INP ≤ 200 ms; 'Lighthouse CI: reprova a PR que piorar'.
- **Correção proposta pela lente:** Em lighthouserc.json, acrescentar largest-contentful-paint ≤ 2000 (error, median-run) e total-blocking-time ≤ 200 como proxy de INP; manter 'url' e acrescentar "/" (modelo da home) com numberOfRuns 3. Nos dois modelos o LCP simulado é determinístico (1,35 a 1,52 s), então há 0,4 s de folga. (custo no CI: As asserções custam 0 s. Mais uma URL com 3 execuções custa uns 25 s na parte `verificar` (hoje 169 s).)

**Evidência da lente:**

> lighthouserc.json: `url` = ["/compress-image/", "/image-tools/"]; assert: categories:performance ≥ 0,9 (error), cumulative-layout-shift ≤ 0,05 (error), as demais categorias em warn. Não há largest-contentful-paint, total-blocking-time nem interaction-to-next-paint. O score 0,9 aceita LCP bem acima de 2,0 s. scripts/gates/lighthouse.ts só reprova se o elemento LCP for a Oli. A medida real hoje: LCP 1,35 a 1,59 s em 10 páginas e INP de 72 ms (e-01 trata do caminho sem worker). Não há medição de INP em lugar nenhum do repositório (grep: 'interaction-to-next-paint|PerformanceEventTiming|INP' em tests/ e scripts/ dá 0). Home, páginas legais, pt/es e as demais 12 páginas de ferramenta não entram no Lighthouse; só o budgets.spec.ts as cobre (JS e requisições).

**Cético:**

> A premissa 'rule' está mal lida. O PLANO não manda asserção de LCP nem de INP no CI. Essas linhas são metas de campo (p75, Search Console, PLANO:673), garantidas por mecanismos de projeto que existem e têm teste (preload da Fredoka no gate:design, LCP não é a Oli no design.spec.ts:343, worker, ads.spec). O escopo de duas páginas é o que o PLANO e a ficha da F1a pedem. O que sobra é um reforço opcional, não uma lacuna de requisito: um gate de LCP de laboratório <= 2000 ms custa 0 s e há folga de uns 0,5 s. Pode ir como sugestão, mas não como achado contra o PLANO.
> 
> O que rodou ou leu: Li lighthouserc.json: url = /compress-image/ e /image-tools/; asserções = performance >= 0,9 (error), CLS <= 0,05 (error), demais categorias em warn. Não existe LCP, TBT nem INP em nenhum teste ou script (grep). Os 6 relatórios em .lighthouseci/reports (Lighthouse 12.6.1, mobile) dão performance 1,0 e LCP 1,35 a 1,50 s. Constantes do LCP em lighthouse@12.6.1: p10 2500, mediana 4000, peso 25. Calculei que a nota 0,9 tolera um LCP de uns 3,5 s com as outras métricas perfeitas, então o núcleo factual do achado é verdadeiro. Só que a regra citada não exige o que ele pede. PLANO linhas 294-306: LCP é 'p75' e INP é métrica de campo, e a coluna 'Como garantir' prescreve mecanismos de projeto (fonte com preload, sem imagem no topo, Web Worker, anúncio depois da ferramenta). A única linha de CI é 'Lighthouse CI: Desempenho >= 90', que está implementada. O PLANO linha 306 diz 'Lighthouse só nas páginas-modelo de cada molde', e o critério da F1a (linha 760) diz 'Lighthouse >= 90 no celular na página-modelo'. Duas páginas (ferramenta e hub, este acrescentado na F2) cumprem a ficha; home, páginas legais e pt/es ficam de fora por especificação. O INP não é medido pelo Lighthouse de navegação, e o TBT (peso 30 na nota) já entra no score >= 0,9. O próprio docs/relatorios/fase-03-plano.md:359 classifica 'INP e LCP sem asserção' como informativo.
> 
> Teste que já cobria: lighthouserc.json (performance >= 0,9 e CLS <= 0,05, que já limitam o LCP a uns 3,5 s e o TBT); scripts/gates/lighthouse.ts e design.spec.ts:343 (LCP não pode ser a Oli); budgets.spec.ts (JS e requisições)

### e-04 · Favicon só como data:image/svg+xml; /favicon.ico dá 404 e o Google lista PNG/ICO/GIF/JPEG, não SVG

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; favicon.ico para o Google, run 3b).
- **Onde:** src/layouts/BaseLayout.astro:69-71; DECISOES.md § 45
- **Regra:** Google Search Central, 'Define a favicon to show in search results' (link acima). SEO técnico do PLANO.
- **Correção proposta pela lente:** Servir public/favicon.ico (48x48, saída do mesmo resvg) para o fallback do Google. Navegadores não pedem /favicon.ico quando há <link rel=icon>, então não entra nas 8 requisições da primeira página. Não acrescentar um <link rel=icon> PNG: o WebKit já usa 7 de 8 (manifest) nas páginas de ferramenta. (custo no CI: 0 s.)

**Evidência da lente:**

> dist/index.html: `<link rel="icon" href="data:image/svg+xml,%3Csvg..." type="image/svg+xml">` e `<link rel="apple-touch-icon" href="/icon-180.png">`. curl: https://fileorca.com/favicon.ico → 404; /icon-180.png → 200 image/png. A página oficial https://developers.google.com/search/docs/appearance/favicon-in-search diz que o Googlebot-Image precisa rastrear o arquivo, lista os formatos BMP, GIF, ICO, PNG, JPEG, PPM e TIFF, e aceita rel=icon, shortcut icon, apple-touch-icon e apple-touch-icon-precomposed. O data: URI não é um arquivo rastreável. O ícone nos resultados do Google depende só do apple-touch-icon de 180 px, sem garantia.

**Cético:**

> Os fatos reproduzem e a citação do Google está correta para a versão atual da página. Mas o dano é menor do que o texto sugere. O apple-touch-icon PNG de 180 px, quadrado e rastreável, é um caminho que o Google documenta, então o site cumpre a elegibilidade. O que não dá para provar é como o Google escolhe entre o rel=icon inutilizável e o apple-touch-icon: a documentação não diz, e a pesquisa que fiz não achou nada sobre data URI nem sobre fallback. Mantenho como baixo (endurecimento de SEO técnico, sem violação do PLANO) com uma correção ao 'fix': o caminho documentado exige um <link>, e um /favicon.ico sem link só funcionaria se o Google tivesse o fallback antigo, que a página não promete. Um <link rel=icon> apontando para arquivo pode custar uma requisição no WebKit, que já usa 7 de 8 nas páginas de ferramenta (informação do achado, não medida por mim), e o § 45 escolheu a data URI justamente para isso. Fica como decisão do dono, a registrar no DECISOES.
> 
> O que rodou ou leu: BaseLayout.astro:69-71 e dist/index.html: o único <link rel="icon"> é um data:image/svg+xml; há também <link rel="apple-touch-icon" href="/icon-180.png"> e o manifest com PNG de 192 e 512. public/ só tem robots.txt e a chave do IndexNow, e dist/ não tem favicon.*. curl na produção: /favicon.ico dá 404 text/html; /icon-180.png e /icon-192.png dão 200 image/png. Li a página oficial do Google (Last updated 2026-10-27) e ela diz: 'Googlebot-Image must be able to crawl the favicon file'; 'Google Search supports the following favicon file formats: BMP, GIF, ICO, PNG, JPEG, PPM, and TIFF'; os rel aceitos são icon, shortcut icon, apple-touch-icon e apple-touch-icon-precomposed; o quadrado deve ter no mínimo 8x8 px. Uma data URI não é arquivo rastreável, e SVG não está na lista atual. Os testes não cobrem isso: o grep por favicon e data:image/svg em tests/ só acha a folha da Oli e o design-checks.
> 
> Teste que já cobria: nenhum

### e-05 · /_astro/* devolve Cache-Control immutable de 1 ano também nas respostas 404

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; limitação do _headers, registrada na § 103).
- **Onde:** src/platform/headers.ts:36
- **Regra:** Higiene de cache de ativos com hash (ADR-001, item 3); impacto pequeno e raro: um navegador que pediu um chunk antigo durante ou depois de uma troca de versão guarda o 404 por um ano para aquela URL, que não deve voltar a existir sem rollback.
- **Correção proposta pela lente:** Não há como condicionar ao status em _headers. Registrar a limitação no DECISOES, ou deixar a proteção para o tratamento de falha de carga do engine-client (que a lente (a) revisa). Nada a fazer no CI. (custo no CI: 0 s.)

**Evidência da lente:**

> curl -D - https://fileorca.com/_astro/nope.abc.js → `HTTP/1.1 404 Not Found`, `Content-Type: text/html`, `Cache-Control: public, max-age=31536000, immutable`. A regra `/_astro/*` casa pelo caminho, não pelo status.

**Cético:**

> Reproduz, e o mecanismo é real no Chromium. Mas não é erro de código: é consequência inerente do cache imutável que o PLANO manda (linhas 194 e 303) com Worker só de assets, e _headers não condiciona ao status. Como o hash muda a cada build, a URL em 404 só volta a existir em rollback ou em defasagem de propagação durante o deploy. Por isso o impacto é raro e a gravidade é baixa; o 'fix' do achado é só registrar a limitação no DECISOES (não há correção de CI) e eventualmente tratar a falha de carga no engine-client, que é da lente (a). O pedido de 'rule' em ADR-001 item 3 não é violado, porque o item 3 não fala de cache. Mantenho baixo por ser lacuna de documentação e de tratamento de erro, sem remédio dentro da arquitetura.
> 
> O que rodou ou leu: curl em https://fileorca.com/_astro/nope.abc.js: HTTP/1.1 404, Content-Type text/html, Cache-Control: public, max-age=31536000, immutable. /_astro/ também devolve 404 com immutable. /nope-page devolve 404 com max-age=0, must-revalidate. headers.ts:36 e dist/_headers aplicam a regra '/_astro/*' pelo caminho. Prova no navegador, com .cache/cetico-e-baixos/cache404.ts: um servidor que responde 404 com esse cabeçalho e depois passa a responder 200 na mesma URL (simulando rollback). No Chromium, o fetch depois do reload continua 404 e o <script> dá erro, com um único acerto no servidor, ou seja, o 404 ficou em cache por um ano e nem o reload revalidou. No WebKit o 404 não é guardado e a URL restaurada carrega (200). tests/unit/platform.test.ts:51 e image-privacy.spec.ts:76-127 só travam o cabeçalho imutável, nenhum cobre o 404. Não há retry com cache-busting no src/ (grep por retry, preloadError e cache:'reload').
> 
> Teste que já cobria: nenhum

## Lente (f) · Aderência ao design system

Comparei cada componente do site com o README e o preview.html do design system. Fiz screenshots lado a lado a 360 e 1280 px nos dois temas, e um diff de estilo computado (um script meu de Playwright sobre o dist/, com o servidor na porta 4279) entre o preview e a página. Footer, CookieNotice, Header, Breadcrumb, DropZone, FAQ, ToolCard e AdSlot saem iguais ao preview, salvo desvios que já estão no DECISOES (§ 20, 40, 44, 46, 48, 54, 91). Não achei desvio visível em componente de toda página, então não há achado alto nem crítico. Tokens, o amarelo só no Baixar, as nove poses com aria-hidden e a voz estão cumpridos no dist/ de hoje. As lacunas são dos guardas: dois testes que deixam passar o que dizem barrar (médios) e quatro baixos.

**Conferido e certo:**

- Footer e CookieNotice com o aviso aberto, rolado até o fim: screenshots em .cache/lente-f/shots/site-*-{360,1280}-{light,dark}.png. Em 16 cargas (home, Compress, hub, Privacidade; 360/1280; claro/escuro) scrollHeight == fim do rodapé, o rodapé é deep e a faixa clara não existe mais.
- Cobertura do § 91 em larguras e idiomas além do teste: ckm.ts mediu 10 páginas (en, pt, es, 404, legais) a 320, 360, 768, 1024 e 1280 px. Resultado: nenhum PROBLEM (resto abaixo do rodapé <= 1 px, o último texto do rodapé fica acima do aviso, sem rolagem horizontal).
- Footer contra preview.html: diff de estilo computado (csdiff.ts), 4 combinações de tema e largura. Só diferem margin-top 64 contra 24 (molde da página), padding-bottom (a reserva do § 91) e o ícone do café em 20 px (icon-sm, README Ícones). Fonte, cores, h2 em caption, links, onda e base são idênticos.
- CookieNotice contra preview.html: csdiff.ts sem diferença de fonte, padding, borda, raio, sombra (shadow-pop) e botões. Decline e Accept são iguais, ambos neutros (nenhum brand nem sun), 440 px à esquerda a partir de 768 px. Textos em en, pt e es sem exclamação, com a privacidade ao lado.
- Header: computado igual ao preview a 1280 px (logo 44 px, busca em pílula com Ctrl K, idioma EN). A 360 px, a busca só com ícone (§ 46) e o gap de 8 px em vez de 12 px. O menu de idioma e o diálogo de busca (screenshots h-lang e h-search) seguem o preview do ToolSearch.
- Tokens: audit.ts percorreu 38 páginas, 360 e 1280 px, claro e escuro. Zero cor computada fora da paleta do tokens.css (texto, fundo, bordas, sublinhado e sombras). Raios só 6, 10, 16, 20, 24, 999, 50% e 22 (o 24 menos o traço, derivado). Nenhum gradiente em elemento, nenhum backdrop-filter, filter ou emoji. A única borda de um lado só é o separador do afixo do NumberField (1 px hairline), que não é card com acento.
- Amarelo (sun): em todas as páginas no estado inicial não há elemento amarelo. Nos estados resultado, vários arquivos e erro (flow.ts, 4 temas e larguras), o único elemento sun é a.fo-btn--download, um por tela ("Download · 1.2 MB" ou "Download all · ZIP"). Nenhum fo-btn--sm, e só um fo-btn--brand (Choose images).
- Oli: o dist/ só tem as poses wave, lost, coffee e peek nas páginas, e swim, cheer e oops pela ilha, todas da lista fechada de 9 (poses.ts). Todo [data-oli] e todo svg dentro dele tem aria-hidden="true". Os tamanhos são 88/112 (DropZone), 72/96 (ResultCard), 96/128 (home, apoio, 404). O svg sem [data-oli] só aparece no sprite fora da tela.
- Voz, varredura de 1010 (en), 363 (pt) e 363 (es) textos de TEXTS, painel e ferramentas (voice.ts): zero palavra proibida, emoji, "up to", → ou ↔. O "!" só existe em panel.done e doneMany (um por tela visível). Os acertos de "su/sus" no espanhol são posse de terceiros ("sus propias políticas"). Nenhum "voseo" nem "usted". Sem "Something went wrong" nem código solto. Nenhuma string solta (aria-label, alt, title) fora do i18n.
- Glifos no HTML: glyphs.ts leu o texto visível e os atributos de 38 páginas do dist/ e não achou nenhum caractere fora do subconjunto latino das fontes, nem seta, nem emoji.
- Tipografia: typo.ts achou 32 combinações em todas as páginas. Só Fredoka (24, 28, 36 e 52 px, peso 600) e Figtree em tamanhos da escala, mais ui-monospace nas licenças. Caixa alta só em 12 px (rótulo do AdSlot, sobretítulo) e 13 px (título de coluna do rodapé), como o bundle.css. Nenhuma fonte de sistema como identidade.
- Estados da ferramenta contra os previews (DropZone, WaterLevel, ResultCard, FileCard e fila, OliMessage e erro, OptionGroup, NumberField, BeforeAfter, NextStepChips, ToolCard, hubband, SupportCard, FAQ): screenshots c-*, pair-* e t-*. Só diferem em itens decididos (§ 19, 20, 40, 44, 48, 54).
- cssdiff.ts (bundle.css contra components.css, por regra): cada diferença de propriedade mapeia para uma decisão registrada. As alturas do AdSlot de 300 e 644 px são do § 20. O transform no lugar de height e transition são do § 44. O ResultCard do celular é do § 54. O SupportCard com H1 de 28 px é do § 48. A Oli do DropZone em -86 px é do § 40.
- AdSlot: o rótulo é "Advertisements", "Publicidade" ou "Anuncios", caption 12 px, ad-ground, radius-xs, sem traço nem cor de categoria, margem de 150 px embutida. Ele sai do bundle.css idêntico (menos os 300 e 644 px do § 20).
- Hub (§ 96): o H1 usa o estilo display e o sobretítulo é diferente do H1. Os textos novos do guia não têm palavra proibida e todas as afirmações saem dos cartões. O OG do hub e o da home em pt estão no padrão (logo, Fredoka, Oli sobre disco water).
- Hex em src/ fora de CSS: só #0C2B5E, #F7FAFD, #B4C3D8, #0B63F6, #0F1B2D, #14B8A6, #FF6B57 e #14407E (theme-color, manifest, imagens OG). Todos são tokens.
- Páginas pt e es (lang.ts): nenhuma string em inglês. As únicas misturas são os nomes de biblioteca da /licenses ("MozJPEG and libjpeg-turbo"). O es usa "tú" e as saídas do resultado vêm nos dois idiomas.
- git diff f549f1b 736b1cd mostra docs/design/, PLANO, .github, scripts/ci e as ADR intactos. Só entra +1 linha no package.json (o script gate:prontidao).

| Id | Achado | Lente | Cético | Final | Estado |
| --- | --- | --- | --- | --- | --- |
| f-01 | O teste do amarelo só enxerga var(--sun…): o hex literal do sun passa nos dois testes | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| f-02 | O teste de voz cobre 6 das 8 palavras proibidas e não tem teste de emoji nem de uma exclamação por tela | médio | confirmado | médio | corrigido em cfa95b0 (§ 102) |
| f-03 | Nenhum portão cobre cor funcional (rgb, hsl, nome), raio e sombra literais, degradê, vidro e borda de um lado só | baixo | confirmado | baixo | pendência (baixo; run 3b) |
| f-04 | "1 files couldn't be read": o plural da fala de lote com uma falha está errado nos três idiomas | baixo | confirmado | baixo | pendência (baixo; run 3b) |
| f-05 | A nota "Oli removed the photo metadata, including the GPS location" aparece sempre, mesmo quando o arquivo não tinha metadado | baixo | refutado | baixo | refutado |
| f-06 | Depois de "Change my cookie choice", a reserva do aviso não se recalcula quando a largura muda | baixo | confirmado | baixo | pendência (baixo; run 3b) |

### f-01 · O teste do amarelo só enxerga var(--sun…): o hex literal do sun passa nos dois testes

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** tests/unit/quality.test.ts:52-77 (hex em :52-61, amarelo em :63-77)
- **Regra:** CLAUDE.md "Regras que nenhuma run quebra" (amarelo sun só no Baixar); docs/design/README.md Cor e Nunca ("Amarelo fora do Baixar"); PLANO Paleta; § 52 (o teste do amarelo "pega a família inteira"). Um teste que não prova o que diz é médio pela decisão 3.
- **Correção proposta pela lente:** Em quality.test.ts, além do var(), reprovar fora de .fo-btn--download o hex literal da família (#FFC93C, #B8870F, #0F1B2D só em contexto de lábio não vale; basta #FFC93C e #B8870F) e o rgb equivalente, em src/styles/*.css e nos <style> dos .astro. Melhor ainda: no gate:design, varrer o CSS do build (onde o Lightning CSS devolve #ffc93c e #b8870f minúsculos) e exigir que toda regra com esses valores ou com var(--sun…) tenha .fo-btn--download no seletor. Com teste de controle negativo no design-checks.test.ts. (custo no CI: Menos de 1 s: é regex sobre arquivos já lidos no gate:design (pós-build) e no Vitest. Nenhuma carga de navegador nova.)

**Evidência da lente:**

> O teste "keeps sun (yellow) only on the Download button" procura só var(--sun|on-sun|sun-edge|shadow-lip-sun|shadow-lip-on-deep). O teste de hex aceita qualquer hex que apareça no tokens.css, e #FFC93C e #B8870F estão lá. Reproduzi a lógica dos dois num CSS sintético (.cache/lente-f/sunloophole.ts): `.fo-banner { background: #FFC93C; box-shadow: 0 4px 0 #B8870F; border: 2px solid #FFC93C }` => hex test offenders: [] e sun test offenders: []. Fora desses dois testes, nada barra: o gate:design só confere as variáveis --color-* do tema e não olha o amarelo, e theme.test.ts só prova que o tema do Tailwind não mapeia o sun. Hoje o site cumpre: no audit computado (audit.ts, 38 páginas, 2 temas, 2 larguras) o amarelo só aparece em a.fo-btn--download. A lacuna é o guarda: o projeto mescla sozinho quando o CI passa, e a F4 (calculadoras) vai trazer CSS novo.

**Cético:**

> O problema é real e reproduzido: um portão de regra central ("amarelo só no Baixar", das regras que nenhuma run quebra) reprova só a grafia var(--sun…). O mesmo amarelo escrito em hex, rgb() ou nome passa nos dois testes e no gate:design, e nada mais o pega. Na régua da decisão 3 isso é "portão que não reprova o que diz", ou seja, médio. Não vai a alto: o site cumpre hoje, não há defeito visível, e a violação exigiria contornar a regra dos tokens. Também não cabe baixo, porque o merge é automático, o teste é a única proteção e a F4 traz CSS novo. A correção é local e quase de graça no CI: regex sobre arquivos já lidos. Ajuste ao fix proposto: não basta cobrir #FFC93C e #B8870F. O ideal é checar, no gate:design sobre o CSS do build (minúsculo, #ffc93c e #b8870f), o hex, o rgb/hsl equivalente, as cores nomeadas yellow e gold, e var(--sun…) com fallback, exigindo .fo-btn--download no seletor. Isso cobre background, border, box-shadow, fill e stroke, e deve trazer um controle negativo em design-checks.test.ts.
> 
> O que rodou ou leu: 1) Li tests/unit/quality.test.ts:52-77. O teste do amarelo (63-77) só reprova a regex /var\(--(?:sun|on-sun|sun-edge|shadow-lip-sun|shadow-lip-on-deep)\)/ fora de .fo-btn--download. O teste de hex (52-61) aceita qualquer hex que apareça em docs/design/tokens.css, e #FFC93C (--sun, --sun-edge escuro) e #B8870F (--shadow-lip-on-deep, --shadow-lip-sun escuro) estão lá (tokens.css:21, 45-46, 62, 75).
> 
> 2) Reproduzi a lógica dos dois testes em .cache/cetico-f-01/loophole.ts (cópia fiel, com o src/ como parâmetro). Saída: "REAL src hex offenders: []", "REAL src sun offenders: []" (o site cumpre hoje). Com um CSS sintético `.fo-banner { background: #FFC93C; box-shadow: 0 4px 0 #B8870F; border: 2px solid #FFC93C }`: "SYNTH hex offenders: []" e "SYNTH sun offenders: []". Controle: o mesmo `.fo-banner { background: var(--sun); }` é pego ("CONTROL sun offenders (var)": 1 item). Ou seja, o furo é só na grafia.
> 
> 3) Rodei os validadores puros do gate:design (.cache/cetico-f-01/gate-replay.ts) sobre CSS no formato do build `.fo-banner{background:#ffc93c;border:2px solid #ffc93c;box-shadow:0 4px 0 #b8870f;fill:rgb(255 201 60)}.fo-chip{background:gold}`: checkThemeVars [], checkTextColors [], checkMotion []. Só `color:#ffc93c` é pego (checkTextColors é lista de permissão apenas para `color:`). Então o gate:design também não cobre background, border, box-shadow, fill nem stroke. O furo é maior do que o achado diz: rgb(255 201 60) e cor nomeada (gold, yellow) também passam.
> 
> 4) Procurei outro teste que cubra. grep -rIil "ffc93c|b8870f" fora de node_modules, dist e .cache só acha docs/design/tokens.css, tokens.json e PLANO-FILEORCA.md; nenhum teste ou script. grep de "yellow|amarelo|--sun" em tests/e2e dá só o título de events.spec.ts:56 ("no yellow"), cujas asserções checam apenas a classe fo-btn dos botões, não cor. theme.test.ts só prova que o tema do Tailwind não mapeia o sun. Nenhum e2e olha cor computada de amarelo (os getComputedStyle de tests/e2e são de padding, fundo do rodapé, label e placeholder). Nenhum teste cobre o caso.
> 
> 5) Regra: CLAUDE.md:47 ("amarelo (`sun`) só no Baixar"), docs/design/README.md:50 ("Nada mais é amarelo") e :118 ("Amarelo fora do Baixar" em Nunca), PLANO:203/240. DECISOES § 52 diz que o teste "pega a família inteira" e define a família como os cinco tokens, o que o teste cumpre. A regra de produto é "nada além do Baixar é amarelo", e o teste não a garante em outra grafia. O build real tem o amarelo só em `.fo-btn--download` (dist/_astro/island.*.css: background:var(--sun) etc.).
> 
> 6) Atenuantes conferidos: (a) hex literal de valor de token é legítimo em src/seo/images.ts, manifest e src/oli/sprite.ts, então o teste de hex é permissivo por desenho, e o furo real está no teste do amarelo; (b) escrever o hex em vez de var() já fere "nenhuma cor fora dos tokens" (CLAUDE.md), então é improvável; (c) estilos inline em .tsx/.astro (`style=`) também não entram na varredura, mas hoje nenhum usa cor.
> 
> Teste que já cobria: nenhum

### f-02 · O teste de voz cobre 6 das 8 palavras proibidas e não tem teste de emoji nem de uma exclamação por tela

- **Severidade da lente:** médio. **Cético:** confirmado, médio. **Estado:** corrigido em cfa95b0 (§ 102).
- **Onde:** tests/unit/routes.test.ts:84-85
- **Regra:** docs/design/README.md Voz ("Sem emoji na interface. Sem seamless, effortless, unlock, supercharge, magic…" e "Exclamação só no sucesso, uma por tela"); critério de voz da ficha da F2 (prompt-fase-02.md:168) e da lente (f) da F3; CLAUDE.md "Idioma". Teste que não prova o que diz é médio (decisão 3, § 93).
- **Correção proposta pela lente:** Trocar a regex por /\b(seamless|effortless|unlock\w*|supercharge\w*|magic\w*|mágic\w*|ai-powered|revolutionary|best-in-class)\b/i e acrescentar dois testes sobre o mesmo `text`: (1) /\p{Extended_Pictographic}/u não casa; (2) "!" e "¡" só existem em panel.done e doneMany de cada ferramenta e cada string tem no máximo um. Se um dia a linha do café ou a placa ganhar "!", o teste reprova. (custo no CI: Menos de 0,1 s (unit sobre strings que o teste já monta). Nenhum custo em Playwright.)

**Evidência da lente:**

> A regex é /\b(seamless|effortless|supercharge|AI-powered|revolutionary|best-in-class)\b/i. O README proíbe seamless, effortless, unlock, supercharge, magic, AI-powered, revolutionary e best-in-class: faltam unlock e magic, e o \b final deixa passar "supercharged" e "magical". Rodei a regex (node -e): "Unlock your photos", "Compress with magic", "A magical way to shrink images", "Supercharged compression", "Boost with ✨ and 🚀 emoji" e "Done! Saved! Great!" => todas "passes the test". Nenhum outro teste ou portão guarda a lista: grep -rn "seamless" scripts tests só acha essa linha. O gate:conteudo (PLACEHOLDERS) tem outra lista. Hoje os textos estão limpos (voice.ts: 1010 + 363 + 363 strings sem nenhuma das 8, sem emoji, "!" só em panel.done e doneMany), e o dist/ não tem glifo fora do latim (glyphs.ts).

**Cético:**

> O problema se reproduz: a guarda cobre 6 das 8 palavras do README e deixa passar variantes (supercharged, magical). Não há teste de emoji. A regra de exclamação só tem guarda na linha do café. A correção sugerida passa limpa nos textos de hoje (0 acertos). O defeito é de guarda, não de conteúdo: hoje nenhuma regra é violada, e o risco é uma run autônoma futura (F4 em diante, merge automático com CI verde) escrever "unlock" ou "magic" e passar. A régua da decisão 3 põe "teste que não prova o que diz" e "portão que não reprova o que diz" em médio. O teste afirma proibir as palavras do README e as fichas F2:168 e F3 citam o lint:texto, que só confere gramática. Impacto zero hoje e um único arquivo de teste a mexer sustentam médio, não alto. Não rebaixo para baixo porque a lacuna é de uma regra escrita e de um critério de ficha. O achado exagera ao dizer que não há teste de exclamação por tela: a linha do café está coberta no e2e. Isso reduz o escopo da lacuna sem derrubar o achado.
> 
> O que rodou ou leu: 1) Código: tests/unit/routes.test.ts:85 tem /\b(seamless|effortless|supercharge|AI-powered|revolutionary|best-in-class)\b/i, e o README (docs/design/README.md:31) proíbe 8 palavras. Faltam unlock e magic. grep -rn em tests, scripts e src acha essa regex como única guarda dessa lista. O PLACEHOLDERS de scripts/lib/conteudo.ts é outra coisa (coming soon, lorem, TODO...). O lint:texto (scripts/gates/lint-texto.ts:1-3) reprova só erro de gramática, e o README e as fichas F2:168 e F3 (lente f) pedem a voz.
> 2) Reprodução (node -e com a regex): "Unlock your photos", "Compress with magic", "A magical way...", "Supercharged compression", "Boost with ✨ and 🚀", "Done! Saved! Great!" e "Desbloqueie" => todas passam (não pegas). "Seamless flow" => pega. Reproduziu.
> 3) Nenhum teste de emoji: grep por Extended_Pictographic, \p{ e emoji em tests e scripts não acha nada. O único portão de glifo é checkArrows (só → e ↔, scripts/lib/design-checks.ts:353). O glyphs.ts do achado é script avulso de .cache, não teste do repositório.
> 4) Exclamação: não há teste da regra "uma por tela" sobre os textos. Cobertura parcial que o achado não cita: tests/e2e/coffee.spec.ts:238-239 faz expect(text).not.toMatch(/[!¡]/) na linha do café, nos 3 idiomas. A placa (Placard) e os demais textos não têm guarda.
> 5) Estado atual limpo: rodei um script em .cache/cetico-f-02/scan.ts sobre TEXTS, IMAGE_PANEL_TEXTS e IMAGE_TOOL_TEXTS com a regex apertada (unlock\w*, magic\w*, mágic\w*, desbloque\w*) e Extended_Pictographic. Resultado: en 1010, pt 363 e es 363 strings, 0 acertos. "!" só em panel.done e doneMany (22 em en, 2 em pt, 2 em es). Sobre o dist (38 páginas, .cache/cetico-f-02/dist-scan.ts): sem palavra proibida nem emoji; os "!" são só o <!DOCTYPE> e o texto das licenças de terceiros em /licenses.
> 6) Ressalvas na correção sugerida: (a) em es, "¡Listo!" tem "¡" e "!", então "no máximo um" tem de contar só "!". (b) unlock\w* vai colidir com a ferramenta "Unlock PDF" da F5 (PLANO:69 e 847) quando os textos de PDF entrarem na varredura. É preciso decidir a exceção antes. (c) \p{Extended_Pictographic} casa © (U+00A9), que o rodapé tem no dist; sobre TEXTS dá 0 acertos, mas num teste sobre o HTML do dist reprovaria o ©.
> 
> Teste que já cobria: parcial: tests/e2e/coffee.spec.ts:238-239 cobre só a linha do café contra [!¡] nos 3 idiomas; nenhum teste cobre unlock, magic, emoji nem a contagem de exclamação nos textos.

### f-03 · Nenhum portão cobre cor funcional (rgb, hsl, nome), raio e sombra literais, degradê, vidro e borda de um lado só

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; run 3b).
- **Onde:** scripts/gates/design.ts:84-90; scripts/lib/design-checks.ts:87 (checkThemeVars), :104 (checkTextColors), :144 (checkMotion); tests/unit/quality.test.ts:52-61
- **Regra:** CLAUDE.md "Nenhuma cor fora dos tokens"; docs/design/README.md Forma (raio, sombra) e Nunca (degradê, vidro fosco, card com borda colorida só à esquerda); PLANO "Nunca (cara de IA)". Baixo porque o site cumpre e o gap é de proteção.
- **Correção proposta pela lente:** Ampliar o gate:design (CSS do build, lista de exceção curta e escrita): reprovar funções de cor (rgb, hsl, hwb, lab, lch, oklab, oklch e color()) e nomes de cor fora de var(--token) ou color-mix de tokens (usado no rodapé e na linha do café); border-radius só var(--radius-*), 0, 50%, inherit ou calc de tokens; box-shadow só var(--shadow-*), none, 0 4px 0 var(--stroke) (Placard) e 0 0 0 1px var(--stroke) (BeforeAfter); `gradient(` só no .fo-dogear::after; reprovar backdrop-filter e filter com blur. Controles negativos no design-checks.test.ts. (custo no CI: Menos de 1 s no gate:design (regex sobre o CSS que ele já lê); sem Playwright.)

**Evidência da lente:**

> As checagens que existem: hex fora do token (só hex), `color:` só com token de texto, variáveis --color-*, --radius-*, --shadow-* e --font-* do tema, e movimento. Montei um CSS que quebra a regra de tokens e quatro "Nunca" do README (degradê azul-roxo, rgb()/hsl()/nome de cor, border-left de 6 px, radius de 13 px, sombra rgba, backdrop-filter, drop-shadow) e passei por todas as funções (.cache/lente-f/loopholes.ts): hex test [], checkTextColors [], checkMotion [], checkThemeVars [] => nada reprova. O próprio plano já lista a linha "'Nunca' do README: degradê, vidro, borda colorida só à esquerda — sem teste". O audit computado (audit.ts) mostra que o dist/ de hoje está limpo: zero cor fora da paleta, zero gradiente em elemento, zero backdrop, raios só de token.

**Cético:**

> A regra existe e é explícita: CLAUDE.md ("Nenhuma cor fora dos tokens"), docs/design/README.md (Forma e Nunca) e o prompt da F1b, linha 45 ("cor, raio ou sombra fora dos tokens"). A trava mecânica cobre só três coisas: hex, `color:` e variáveis do tema. Como o projeto faz merge automático quando o CI passa, um degradê, um rgb() ou um raio literal numa run futura passa sem reprovar. O site cumpre hoje e os gates não mentem sobre o que cobrem (os nomes e as mensagens são estreitos). Por isso é lacuna de proteção, não defeito visível, e baixo é a severidade certa.
> 
> O que rodou ou leu: Reproduzi em .cache/cetico-f-baixos/loop.ts: passei 10 CSS ruins (linear-gradient, background rgb(), border hsl(), border-color:red, border-left:6px, border-radius:13px, box-shadow rgba, backdrop-filter, filter drop-shadow com rebeccapurple) pelo teste de hex do quality.test.ts, por checkTextColors, checkMotion e checkThemeVars. Todos devolveram 0 problemas. Só o caso `color:transparent` com degradê foi pego, e só pelo checkTextColors, por causa do `color:`. Li scripts/gates/design.ts:84-90 (só checkThemeVars, checkMotion e checkFonts rodam sobre o CSS) e tests/unit/quality.test.ts:52-61 (só hex e amarelo). Procurei em tests/ e scripts/ por gradient, backdrop-filter, border-left, border-radius e rgb(/hsl( e não achei guarda. O dist/ de hoje está limpo: o único gradient( é o .fo-dogear::after, que é o desenho previsto, e não há backdrop-filter, rgb nem hsl. A lacuna é só de proteção. O docs/relatorios/fase-03-plano.md:294 registra a mesma coisa ("'Nunca' do README: degradê, vidro, borda colorida só à esquerda", sem teste).
> 
> Teste que já cobria: nenhum

### f-04 · "1 files couldn't be read": o plural da fala de lote com uma falha está errado nos três idiomas

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; run 3b).
- **Onde:** src/tools/image/i18n/en.ts:46 (pt.ts:45, es.ts:45); src/tools/image/ImagePanel.tsx:376
- **Regra:** docs/design/README.md Voz (erro diz o que houve, sem culpar, frase correta nos três idiomas); CLAUDE.md Idioma. Baixo: só o leitor de tela ouve.
- **Correção proposta pela lente:** Duas chaves por idioma (some e someOne) escolhidas por count === 1, no mesmo ponto de ImagePanel.tsx:376, e uma asserção em tests/unit/image-island.test.ts ou no island.spec.ts. (custo no CI: Menos de 0,1 s no unit. Se for no e2e, usa o lote misto que o image-batch.spec.ts já carrega (custo zero de carga nova).)

**Evidência da lente:**

> Dois arquivos bons mais um que não é imagem, em /compress-image/ (flow.ts): o texto do status é "Done! Your 2 images are 72% lighter. 1 files couldn't be read; the rest are ready.". Em /pt/comprimir-imagem/ e /es/comprimir-imagen/ (lang.ts), com 1 arquivo ruim: "1 arquivos não puderam ser lidos; o resto está pronto." e "No se pudieron leer 1 archivos; el resto está listo.". O texto vai em m.announce (região role=status, lida pelo leitor de tela) e a fmt() só troca {count}, sem plural.

**Cético:**

> É erro gramatical real nos três idiomas, vai para o leitor de tela e é fácil de acontecer: basta um arquivo ruim num lote. A regra de Voz (README) não fala de plural. O que pesa é que o próprio projeto trata singular e plural nas outras falas. O impacto é pequeno (só a região de status) e o conserto é de uma chave por idioma. O único teste que toca a frase é image-batch.spec.ts:68, com 4 falhas, então o caso de 1 falha não está coberto.
> 
> O que rodou ou leu: Rodei .cache/cetico-f-baixos/says.ts contra o dist/ com 2 JPG bons e 1 arquivo que não é imagem. O role=status disse: EN "...1 files couldn't be read; the rest are ready."; PT "1 arquivos não puderam ser lidos; o resto está pronto."; ES "No se pudieron leer 1 archivos; el resto está listo.". O código está em ImagePanel.tsx:376 (`fmt(t.errors.some, { count: failed })` sem escolher singular) e em en/pt/es.ts:45-46 (uma chave só). O `errors.all` não tem o problema, porque só é usado com vários arquivos (linha 792). O mesmo arquivo já separa singular e plural em outras falas (`done`/`doneMany`, `unchanged`/`unchangedMany`, `single = tot.count === 1` na saysFor), então faltou nesta.
> 
> Teste que já cobria: nenhum (tests/e2e/image-batch.spec.ts:68 só cobre 4 falhas)

### f-05 · A nota "Oli removed the photo metadata, including the GPS location" aparece sempre, mesmo quando o arquivo não tinha metadado

- **Severidade da lente:** baixo. **Cético:** refutado, baixo. **Estado:** refutado.
- **Onde:** src/tools/image/ImagePanel.tsx:744; src/tools/image/i18n/en.ts:70 (pt.ts:69, es.ts:69)
- **Regra:** docs/design/README.md princípios 4 e 5 ("Diga com números", "Privacidade que dá para conferir"): a fala só diz o que aconteceu. Baixo: o resultado é seguro, só a frase é imprecisa.
- **Correção proposta pela lente:** Mostrar a nota só quando o motor viu metadado na entrada (o process.ts já passa por strip.ts e pode devolver o booleano), ou trocar para uma frase sempre verdadeira, como "The copy has no photo metadata, so no GPS location either.". (custo no CI: Zero se for só texto; com o booleano, um caso a mais num teste que já existe (tool.spec.ts:17), sem carga nova.)

**Evidência da lente:**

> A linha é <li>{t.result.metadata}</li> sem condição. Em says.ts, /png-to-jpg/ com gen-png-transparente.png (PNG sem Exif nem GPS) mostra "Transparent areas became white… Oli removed the photo metadata, including the GPS location.", e a Compress com gen-webp-animada.webp mostra "This image was already optimized, so Oli kept the original image, without the photo metadata. … Oli removed the photo metadata, including the GPS location.", duas frases de metadado na mesma tela. A saída de fato não tem metadado, mas o texto afirma uma remoção que não houve.

**Cético:**

> A nota é o aviso de privacidade que o PLANO exige em todo resultado, descrito como garantia da ferramenta (a saída nunca leva metadado), e não um relato por arquivo. Nunca é falsa na direção que importa: nenhuma saída tem metadado, e a nota só é imprecisa no tempo verbal quando a entrada já não tinha nenhum. Trocar a frase por "sem metadados" seria uma preferência de redação, não uma lacuna de requisito ou de regra, e tornar a nota condicional contradiz o aviso em toda saída e quebraria a matriz, que o exige. A repetição na tela de "sem ganho" não se contradiz: as duas frases dizem que a saída está sem metadado.
> 
> O que rodou ou leu: Reproduzi a frase (png-to-jpg com gen-png-transparente.png e a Compress com gen-webp-animada.webp mostram "Oli removed the photo metadata, including the GPS location."), mas ela é uma linha constante de propósito. PLANO-FILEORCA.md:75 manda: "Toda saída de imagem aplica a orientação da foto e descarta os metadados, inclusive o GPS, e a tela avisa". tests/e2e/lib/matrix.ts:645 trata como contrato: o comentário diz "the metadata line on every card" e a matriz afirma a frase em todo caso, inclusive nos que não têm metadado. image-presets.spec.ts:138 faz o mesmo. Os princípios 4 e 5 do README, citados no achado, não dizem que a fala só relata o que foi removido: o 4 é "Diga com números" e o 5 é "Privacidade que dá para conferir", sobre PrivacySeal e FAQ.
> 
> Teste que já cobria: tests/e2e/lib/matrix.ts:645 e tests/e2e/image-presets.spec.ts:138 (afirmam a frase como comportamento previsto)

### f-06 · Depois de "Change my cookie choice", a reserva do aviso não se recalcula quando a largura muda

- **Severidade da lente:** baixo. **Cético:** confirmado, baixo. **Estado:** pendência (baixo; run 3b).
- **Onde:** src/components/CookieNotice.astro:34-35 (o `return` da linha 34 vem antes do addEventListener('resize') e do ResizeObserver da 35); handler de reabertura na :31
- **Regra:** § 36 e § 91 (o aviso nunca cobre o foco nem o rodapé); WCAG 2.4.11. Baixo: só quem reabre o aviso e muda a largura (girar o celular).
- **Correção proposta pela lente:** Mover addEventListener('resize', reserve) e o ResizeObserver para antes do `return` da linha 34 (os dois já ignoram o aviso quando hidden, porque reserve() zera a altura), ou registrá-los dentro de show(). Teste: no cookie-footer.spec.ts, reabrir pelo botão e trocar a largura de 1280 para 320 em /es/privacidad/. (custo no CI: Cerca de 2 a 3 s em cada navegador (uma carga a mais no cookie-footer.spec.ts, já com o mesmo padrão de uma carga por página).)

**Evidência da lente:**

> reopen2.ts, /es/privacidad/, 1280 -> 320 px, rolada ao fim. Primeira visita: room 260 px, resto -32 px (o aviso fica abaixo do rodapé). Reaberto pelo botão "Cambiar mi elección de cookies": room 224 px (do 1280), o aviso tem 244 px de altura e o último texto do rodapé passa 4 px por baixo do topo do aviso. Em /pt/privacidade/ o resto é -18 px (sem sobreposição). O scroll-padding e a trava de foco do § 36 usam o mesmo valor velho. Com escolha gravada, o script retorna antes de registrar o recálculo, e show() mede uma vez só.

**Cético:**

> O defeito é real e reproduz, e vem de uma ordem de linhas. O impacto é pequeno e raro: exige escolha gravada, clique em reabrir e mudança de largura depois (girar o celular). O efeito são 4 px de sobreposição em ES a 320 px e a sobra de espaço no caminho inverso. O foco continua protegido, porque o handler de focusin do § 36 mede o retângulo real do aviso. Só o scroll-padding usa o valor velho, então o achado exagera ao dizer que a trava de foco usa o mesmo valor velho. Isso mantém a falha em baixo, sem risco de WCAG 2.4.11.
> 
> O que rodou ou leu: Rodei .cache/cetico-f-baixos/reopen2.ts (cópia da prova, porta 4435) com 1280 para 320 px, rolando ao fim. /es/privacidad/, primeira visita: room 260 px, aviso de 244 px, sobreposição -32 px. Reaberto pelo botão: room 224 px (o valor do 1280), aviso de 244 px, o último texto do rodapé passa 4 px por baixo do aviso. /pt/privacidade/ reaberto: -18 px, sem sobreposição. No código, CookieNotice.astro:34 faz `return` antes do `addEventListener('resize',reserve)` e do ResizeObserver da linha 35, e o handler de reabertura (:31) chama só `show()`, que mede uma vez. O botão `data-consent-change` só existe em LegalView.astro:35, páginas jurídicas que nunca têm AdSlot nem o carregador do AdSense. Por isso o `resize` de `lift` (linha 33), que também chama `reserve`, nunca é registrado onde o aviso é reaberto, e não há atenuante. Nenhum teste cobre: cookie-footer.spec.ts só usa setViewportSize com o aviso aberto desde a primeira visita, e não há teste de reabrir pelo botão e redimensionar.
> 
> Teste que já cobria: nenhum

## Segunda passada

Três revisores Sonnet novos, em contexto limpo, na mesma worktree só de leitura, movida para o commit `1380bb8` (as correções da primeira passada), com `pnpm install --frozen-lockfile` e `pnpm build` próprios. Cada um conferiu o fechamento dos achados da sua área com a prova da primeira passada rodada contra o `dist/` novo e procurou problema novo só no diff `736b1cd..1380bb8`. Cada achado novo crítico, alto ou médio teve um cético.

| Área | Fechados | Achados novos |
| --- | --- | --- |
| consentimento | 8 de 8 (c-01, c-02, c-03, b-02, b-03, d-01, d-04, b-04) | p2-consentimento-01 (baixo); p2-consentimento-02 (baixo) |
| integridade | 2 de 2 (f-01, f-02) | p2-integridade-01 (médio, cético: confirmado); p2-integridade-02 (baixo); p2-integridade-03 (baixo); p2-integridade-04 (baixo); p2-integridade-05 (baixo) |
| motor | 9 de 9 (a-01, a-02, a-03, a-04, b-01, d-03, d-06, d-07, e-01) | p2-motor-01 (médio, cético: confirmado); p2-motor-02 (baixo); p2-motor-03 (baixo) |

**Nenhum crítico ou alto, nem antes nem depois da segunda passada.** Os achados novos foram corrigidos no commit seguinte (§ 104), cada um com teste que falha no código de antes. O detalhe de cada um, com a evidência e o veredito do cético, está abaixo.

### Área consentimento

As 8 correções da área de consentimento fecharam, cada uma com prova rodada na dist de 1380bb8 em Chromium e WebKit. Os testes novos reprovam no script velho (7 falhas) e passam no novo. Os testes velhos events.spec.ts e consent.spec.ts não mudaram (git diff vazio) e passam (34 de 34). A § 91 vale com a reserva da âncora, e as § 35 e § 36 seguem. Achei dois problemas novos, ambos baixos: o aviso própria piscou até 500 ms na UE porque o polling substituiu a checagem no load (p2-consentimento-01), e o gate:prontidao não confere a trava em carregador por `<script src>` (p2-consentimento-02). Não achei crítico, alto ou médio. Fora da minha área, o ads.spec.ts do WebKit reprovou uma vez em /compress-image/ sob carga e passou três vezes depois, sozinho e em reexecução, sem relação com o consentimento.

- **c-01** fechou: Na dist nova (porta própria, Chromium e WebKit) a CMP definida 100 ms, 300 ms e 3 s depois do load, aos 20 s, em stub com fila e em resposta ok=false e depois ok=true esconde o aviso próprio; os controles gdprApplies=false e sem CMP o mantêm; aos 35 s (fora da janela de 30 s) ele fica, como a § 101 diz. O script da primeira passada (cetico-c-01/tcf.ts) rodado contra o build de anúncios com o script novo do aviso: os cenários B (300 ms após o load) e D (CMP vinda de 2º script com XHR), que antes ficavam VISIBLE por 4,5 s, agora escondem (hidden em 500 ms e 1500 ms). consent-choice.spec.ts passa nos dois navegadores (10 de 10) e reprova no código velho (2 das 7 falhas, ambas toBeHidden). Ressalva em p2-consentimento-01.
- **c-02** fechou: O script da primeira passada (cetico-c-02/repro.ts) contra o dist novo, 360x740 e âncora de 100 px: aviso recusado e visitante que volta, 0 foco inteiro sob a âncora e 0 parcial em 73 e 74 paradas (Chromium) e 69 (WebKit, caso returning); scroll-padding-bottom 108 px. A mesma prova contra uma cópia do dist com o script velho (736b1cd): 6 inteiros e 12 parciais sob a âncora (radio, summary das perguntas, link About). cookie-footer.spec.ts passa 12 de 12 (Chromium e WebKit) e, contra o código velho, os dois testes do achado reprovam. A reserva acompanha a âncora (100 px: 108/132; 50 px: 58/96; dispensada: auto/96), sem laço de mutação (0 registros em 1,5 s). A § 91 continua valendo: em 360 e 1280 px, nos dois navegadores, com aviso aberto ou fechado e âncora de 0 ou 100 px, o documento termina no rodapé (abaixo 0 a 1 px), body sem padding, rodapé de fundo diferente do body e a última linha a 24 a 33 px do aviso/âncora. As garantias das § 35 e § 36 seguem: events.spec.ts (aviso acima da âncora, 45 Tabs sem foco coberto, foco movido sem scroll-padding) passa inalterado.
- **c-03** fechou: O script da primeira passada (cetico-c-03/run.ts), com carregador sem trava e push travado, agora reprova: '/compress-image/: carregador sem a trava do hostname'. No build de anúncios real (.cache/prontidao/all e client) com o script novo do aviso, checkAllBuild e checkClientBuild dão ok (o script do aviso, que cita adsbygoogle, não dá falso positivo). Mutações: carregador sem trava (M1) e trava num script e carga em outro (M3) reprovam; push sem trava reprova (teste unitário). prontidao.test.ts e consent.test.ts passam (32 testes). Lacuna residual de variante em p2-consentimento-02.
- **b-02** fechou: consent-choice.spec.ts: Aceitar, contagem {uses:2}, reabrir pela Privacidade e Recusar deixa fo-coffee nulo na hora; com never:true sobra {uses:0,never:true}; verde em Chromium e WebKit, e reprova no código velho. A lógica do forget() inline espelha a do coffee.ts (JSON inválido apaga, never fica).
- **b-03** fechou: consent-choice.spec.ts: Recusar, abrir 'Change my cookie choice', fo-consent segue 'denied' com o aviso aberto, a página seguinte não mostra o aviso e o dataLayer reaplica exatamente um consent update denied. Verde nos dois navegadores, reprova no código velho. consent.spec.ts ('the privacy page button reopens the choice') passa sem mudança.
- **d-01** fechou: Na dist nova, em Chromium e WebKit, o diálogo de busca tem <p class=fo-sr role=status data-search-status> como irmão do bloco escondido, na árvore de acessibilidade (ariaSnapshot: 'status: Nenhuma ferramenta chamada "youtube"'); o texto muda a cada tecla ('y', 'yo', ...), esvazia quando há resultado ('compr' dá ''), e a busca inline da 404 faz o mesmo. navigation.spec.ts (10 de 10) e a11y.spec.ts nos estados da busca, 404 e Privacidade (14 de 14) passam; a caixa de 1x1 px não muda o layout.
- **d-04** fechou: O script da primeira passada (cetico-d-04/focus.ts): depois de escolher no aviso reaberto o foco vai para o botão 'Change my cookie choice' (BUTTON) nos dois navegadores; no dist com o script velho caía em BODY. consent-choice.spec.ts (teste por teclado, Enter) verde. O Tab seguinte no WebKit do Windows não anda a partir de botões nem no controle sem fluxo, então é artefato do ambiente, não da correção.
- **b-04** fechou: A frase aparece no <main> de /privacy/, /pt/privacidade/ e /es/privacidad/ do dist e o gate checkRequiredPages passa nas 4 linhas (A Privacidade tem o que o AdSense pede: ok). A afirmação confere com o código: o gtag.js carrega em produção sem depender da escolha e o foTrack não consulta o consentimento, então depois da Recusa seguem pings sem cookies. prontidao.test.ts tem o corte da frase como caso negativo.

#### p2-consentimento-01 · O aviso próprio fica na tela até 500 ms (antes ~3 ms) na UE quando a CMP do Google chega antes do load

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** src/components/CookieNotice.astro:44
- **Regra:** § 101 (c-01) e PLANO Consentimento: o aviso próprio some onde o GDPR se aplica e a CMP do Google assume; a correção não pode piorar o caso comum que o load já cobria.
- **Correção proposta:** Manter a checagem do load além do polling: `addEventListener('load',function(){if(!box.hidden)tcf();},{once:true})`, ou sondar a cada 100 ms nos primeiros 3 s e a cada 500 ms depois, até 30 s. Acrescentar ao consent-choice.spec.ts um caso com a CMP definida antes do load e a asserção de que o aviso some em menos de 200 ms depois do load.

**Evidência:**

> O polling de 500 ms (`var tries=0;(function look(){...setTimeout(look,500)...})()`) trocou o `tcf()||addEventListener('load',tcf,{once:true})`, que checava a CMP no load. Medido com o carregador falso e a CMP em formas da primeira passada, Chromium, amostra de 2 ms. Script novo: A (CMP antes do load) aviso na tela 502 ms, some 486 ms depois do load; G (CMP 5 ms depois do carregador) 501 ms; B (300 ms depois do load) 499 ms; C (2º script, 800 ms) 997 ms. Script velho: A 17 ms (some 3 ms depois do load) e C 823 ms (4 ms depois do load). Logo, onde a CMP chega antes do load, o aviso próprio com role=dialog aparece e some meio segundo depois (e o rodapé ganha e perde a reserva). Os dois avisos nunca ficam juntos por mais que o próximo tick, mas é um piscar que antes não havia. Saídas em .cache/passada2-consentimento/c01-timing-new.txt e c01-timing-old.txt.

#### p2-consentimento-02 · O gate:prontidao só confere a trava em carregador inline; `<script src=...adsbygoogle.js>` sem trava passa

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** scripts/lib/prontidao.ts:175
- **Regra:** Linha do gate 'Carregador só nas ferramentas, nunca em página jurídica ou institucional ... com a trava do hostname' (DECISOES § 95 e § 101); 'O que derruba conta': dev, CI e prévia nunca pedem anúncio.
- **Correção proposta:** No laço de scripts, reprovar também qualquer tag `<script ... src="...adsbygoogle.js|pagead2.googlesyndication.com...">` ('carregador por src, sem trava possível'), e cobrir o push com `adsbygoogle[^;]*\.push` em vez da forma exata. Um caso negativo no prontidao.test.ts com o carregador por src.

**Evidência:**

> A correção do c-03 percorre `<script ...>(corpo)</script>` e exige a trava só nos scripts cujo corpo casa LOADER ou PUSH. Um carregador por tag externa tem corpo vazio e é pulado. Rodei checkAllBuild sobre o build de anúncios (script novo do aviso) trocando o carregador inline por `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=..." crossorigin="anonymous"></script>`: a linha 'Carregador só nas ferramentas...' deu ok, embora a linha afirme 'com a trava do hostname'. O mesmo para um push `window.adsbygoogle.push({})` sem a forma `||[]` (teste M4) e para a trava só em comentário (M6). O carregador real de hoje é inline e trancado (M1 e M3 reprovam como deveriam), então é lacuna de defesa em profundidade, sem defeito no site. Prova em .cache/passada2-consentimento/c03.ts e c03-out.txt (M2, M4, M6 = ok).

### Área integridade

Rodei em contexto limpo, sem editar o repositório (git status limpo), na worktree em 1380bb8. Os testes unitários tocados (73) e a suíte inteira (778) passam. Os 60 testes de e2e tocados passam em Chromium e WebKit, também numa porta privada e com 12 repetições a 8 workers (36 de 36 em cada navegador).

**Fechamento:** f-01 e f-02 fecharam. f-01 foi provado com 7 mutantes de CSS, e o literalYellow só tem lacunas laterais (p2-02, baixo). f-02 foi provado com 11 mutantes, todos pegos.

**Os testes novos falham sem a correção (teste de integridade).**
- **Cookie:** reconstruí o dist com o script do CookieNotice de 736b1cd. Todos os 7 testes de c-01, c-02, b-02, b-03 e d-04 reprovam (CMP a 300 e a 3000 ms, Recusar apaga a contagem, Mudar minha escolha, foco de volta, âncora com o aviso fechado, o caso 'âncora e aviso juntos' alterado). Os 4 testes antigos do cookie-footer seguem verdes.
- **Caminho 45 Tabs:** o laço dos 45 Tabs sozinho, sem o poll, já acusa a âncora no código antigo (7 Tabs cobertos no Chromium, 21 no WebKit).
- **Motor:** mutantes no dist reprovam o a-01 (reason load virando decode), o a-02 (sem o race com broken no PDF), o a-03 (motor sempre na página, no tool.spec), o e-01 (warm antigo, com 'no codec fetched twice') e o d-03 (aria-live de volta no cartão).
- **Crop e unitários:** o d-06 (caixa pequena) reprova nos dois navegadores quando o corner volta ao antigo. Os testes de strip (3), prontidão (c-03 e b-04) e a voz do routes reprovam no código de antes.

**Asserções mudadas (§ 99):** todas legítimas. As linhas antigas do cookie-footer (96 px, 'auto') foram mantidas e passaram a valer depois da âncora sair. As do navigation, image-smoke e tool.spec ficaram mais estritas. O island só sincronizou, sem mudar asserção. Só não estão listadas na § 99 a fixture PRIVACY do prontidao.test.ts (esticada pelo gate novo) e o reforço do quality.test.ts, que não afrouxam nada.

**Tempo:** medido local, os 13 testes novos (consent-choice 5, cookie-footer 1, engine-paths 3, launch-claims 3, crop 1) somam cerca de 21 s no Chromium e 30 s no WebKit, em paralelo 6,9 s e 9,5 s de parede. O maior é o CMP de 3 s (4,4 a 4,6 s) e o launch-claims (4 a 5 s por ferramenta). No fator 5x documentado e com 2 workers dá uns 40 s por parte do WebKit e uns 50 s no Chromium, dentro dos 700 s. Não achei timing frágil no WebKit: o caso de 300 ms e o events passaram 12 de 12 em cada navegador sob carga.

**Cuidado de infraestrutura:** as outras passadas usam as mesmas portas 4282, 4182 e 4291; as portas 4282 e 4291 estavam ocupadas por servidores alheios (EADDRINUSE), então usei 4411 a 4414 e encerrei só os meus. O único achado de severidade medio é o p2-01 (gate:prontidao e o carregador estático); os outros quatro são lacunas de cobertura, baixas.

- **f-01** fechou: Fechou para o que o achado descreve (o teste só via var(--sun)). Rodei o teste real 'keeps sun' numa cópia da árvore (.cache/passada2-integridade/mut-quality) com uma regra .fo-banner acrescentada em src/styles/components.css: #FFC93C reprova, #ffc93c reprova, #B8870F reprova, rgb(255, 201, 60) reprova, rgba(255,201,60,.4) reprova, color-mix(in srgb, #FFC93C 50%, white) reprova, var(--sun) reprova; a mesma cor dentro de .fo-btn--download passa (controle). No src real o teste passa (0 infratores). O literalYellow é derivado do tokens.css (só #FFC93C e #B8870F, porque o #0F1B2D é compartilhado), sem flag g, e as 4 amostras do próprio teste provam o regex. A § 99 descreve certo a mudança da asserção do cookie-footer. Lacunas que sobram (hsl, rgb com espaços, TSX/inline) viraram o p2-integridade-02, baixo.
- **f-02** fechou: Fechou. Numa cópia da árvore (.cache/passada2-integridade/mut-routes) rodei o teste novo 'keeps the voice of the design README' contra 11 mutantes: unlock, seamlessly, effortlessly, supercharged, magic, AI-Powered, revolutionary, best-in-class, 'mágicas' (pt), emoji ✨ no H1, '!' no H1 do About e 'Done!!' no done. Os 11 reprovam com a mensagem certa (o regex cobre as 8 palavras do README e as variações) e o baseline passa. O TEXTS cobre todas as páginas (common, home, privacy, terms, about, contact, licenses, support, not-found), mais o painel e as ferramentas. O scan do dist (365 strings em pt e em es, 1013 em en) tem 0 palavra ou emoji. As exclamações só aparecem em panel.done e panel.doneMany (22 em en, 2 em pt, 2 em es); os outros '!' do dist são '<!DOCTYPE' e o texto da licença de terceiros, que está fora do TEXTS. O teste antigo de regex em 'uses the fixed texts' ficou, nada foi afrouxado.

#### p2-integridade-01 · gate:prontidao não reprova carregador do AdSense escrito como <script src> sem a trava do hostname (regressão do c-03)

- **Severidade:** médio; cético: confirmado, médio. **Estado:** corrigido (§ 104).
- **Onde:** scripts/lib/prontidao.ts:175-179
- **Regra:** Gate que não reprova o que diz (item 'carregador com a trava do hostname'); teste que não prova o que diz. AdSenseHead.astro hoje gera o carregador inline com a trava, então nada falha hoje, mas o gate deixou de proteger contra o snippet padrão do AdSense.
- **Correção proposta:** Em checkAllBuild, ao achar uma tag <script> cujo atributo src case com LOADER, exigir que a página tenha um <script> inline com a trava que antecede o carregador, ou simplesmente reprovar qualquer <script src> do AdSense (o site só carrega o AdSense por script inline travado). Acrescentar ao prontidao.test.ts o caso 'carregador estático sem trava' (esperado: reprova).

**Evidência:**

> A trava passou a ser conferida só no corpo de cada <script>. Um carregador estático <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-…" crossorigin> (o trecho que a própria ajuda do AdSense manda colar) tem corpo vazio, e o laço o pula. Sonda em .cache/passada2-integridade/mut-prontidao (a mesma fixture do prontidao.test.ts, que importa o checkAllBuild real): carregador estático em toda página com área de anúncio e nenhuma trava na página dá checkAllBuild = [] (aprova). No código de antes (loader && !html.includes(trava)) essa mesma página reprovava com 'carregador sem a trava do hostname'. O teste novo do c-03 só cobre o carregador inline (replace da trava por 'true'); nenhum caso usa src. A checagem de página jurídica continua pegando o carregador estático (/privacy/: 'carregador numa página sem área').

**Cético:**

> O achado se sustenta. A correção do c-03 trocou a checagem da página inteira por uma checagem por <script> que olha só o corpo, e com isso o gate perdeu a proteção contra o carregador escrito como <script src>, que é o snippet padrão da ajuda do AdSense. O item "carregador com a trava do hostname" não reprova o que diz, e o teste novo não prova o que o comentário "review c-03" sugere, porque cobre só o inline.
> 
> Severidade medio, não alto: nenhum item de prontidão falha hoje, porque o AdSenseHead.astro gera o carregador inline com a trava e o build real passa. O risco é futuro (uma run ou o dono colar o snippet padrão), e a consequência seria carregar anúncio em *.workers.dev, uma trava de política, não perda de arquivo do usuário nem item de prontidão falhando agora. Isso encaixa em "teste/gate que não prova o que diz", que a régua põe em medio. Também não é baixo, porque é uma regressão real de uma guarda que existia, criada pela própria revisão, e o conserto é barato (reprovar qualquer <script src> do AdSense ou exigir trava inline anterior, mais um caso no teste).

#### p2-integridade-02 · literalYellow só vê hex e rgb() com vírgula, e só em CSS

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/unit/quality.test.ts:55-63
- **Regra:** Teste que não prova tudo o que diz ('o hex e o rgb() que só a família do amarelo usa'); PLANO: amarelo só no Baixar.
- **Correção proposta:** Aceitar espaços ou vírgulas no rgb (rgba?\(\s*255[\s,]+201[\s,]+60) e rodar o mesmo literalYellow sobre os style={{…}} dos .tsx e os style="…" dos .astro, com as mesmas amostras positivas e negativas.

**Evidência:**

> Mutantes na cópia .cache/passada2-integridade/mut-quality, rodando o teste real 'keeps sun': rgb(255 201 60), rgb(255 201 60 / 40%), hsl(43 100% 62%), oklch(0.85 0.16 85) e gold numa regra .fo-banner passam (sobrevivem). Amarelo literal fora de CSS também passa nos dois testes 'cores só dos tokens': export const __yellow = { background: '#FFC93C' } em ImagePanel.tsx e <footer style="background:#FFC93C"> no Footer.astro (o teste de hex deixa passar porque #FFC93C é um hex do tokens.css, e o 'keeps sun' só lê CSS). O código real não usa rgb com espaços nem estilo inline com cor (grep vazio), então é lacuna, não defeito.

#### p2-integridade-03 · launch-claims aceita GET para a própria origem com dado na query

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/e2e/launch-claims.spec.ts:36-37
- **Regra:** Teste que não prova o que diz; CLAUDE.md: nenhum número digitado vai para '?' na URL.
- **Correção proposta:** Acrescentar expect(sent.filter(r => new URL(r.url).search !== ''), 'no query string').toEqual([]) à fase online e à offline. Custa zero, porque hoje não há query.

**Evidência:**

> O critério é origem própria + método GET + corpo vazio. Sonda .cache/passada2-integridade/worker-leak.mjs, nos dois navegadores: o worker de imagem alterado por page.route faz um POST para https://example.invalid e um GET /leak?x=1. O context.on('request') vê os dois, inclusive os do worker, no Chromium e no WebKit; o POST (WebKit com postDataBuffer null, pelo método) reprova no teste, mas o GET /leak?x=1 passa em todos os três critérios. No fluxo real nenhuma requisição própria tem '?' (lista vazia nos dois navegadores). A frase do teste e do Show HN é 'nenhum byte do arquivo sai do aparelho'; um dado na query de um GET para o próprio servidor não é visto.

#### p2-integridade-04 · A lista de permissão do strip tem metade sem teste (APNG, HDR, animação do WebP)

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/unit/strip.test.ts:70-118
- **Regra:** Teste que não prova o que a § 100 afirma (a lista inteira do que fica).
- **Correção proposta:** No teste de PNG, acrescentar à lista keepers os tipos acTL, fcTL, fdAT, cICP, mDCV e cLLI, e no de WebP um ANIM e um ANMF, todos esperados no resultado.

**Evidência:**

> Os três testes novos falham no strip.ts de antes (736b1cd): 3 reprovados e 13 aprovados, então provam o que dizem sobre os chunks que saem. Mas na cópia .cache/passada2-integridade/mut-strip2 retirei acTL, fcTL, fdAT, cICP, mDCV e cLLI do PNG_KEEP e o strip.test.ts inteiro passou (16 de 16). O teste de PNG só confere 9 dos 18 tipos que a § 100 diz que ficam, e o de WebP não confere ANIM nem ANMF. Um regresso que tire a animação de um APNG ou o HDR no caso 'sem ganho' não seria visto, e nenhuma fixture ou teste do repositório tem esses chunks (grep vazio).

#### p2-integridade-05 · O 'tentado de novo' do a-01 não tem teste

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/e2e/engine-paths.spec.ts:42-51
- **Regra:** Teste que não prova uma das duas metades da correção declarada.
- **Correção proposta:** Depois da mensagem de load, soltar a rota (page.unroute) e mudar uma opção, ou arrastar o arquivo de novo, e exigir o resultado. Isso prova que o arquivo bom é tentado outra vez.

**Evidência:**

> Os dois testes do a-01 e do a-02 reprovam nos mutantes (load vira decode: reprova; sem o Promise.race com broken no pdf-client: reprova em 30 s; warm antigo: reprova com 'no codec fetched twice'; engine sempre na página: o tool.spec reprova no Chromium com 'OffscreenCanvas no worker: true'). Mas com `load` colocado no HOPELESS do dist (island.*.js) os dois testes de engine-paths passam (2 passed), e nenhum teste do repositório fala em HOPELESS ou em refazer o arquivo (grep vazio). A § 102 diz que o motivo load 'fica fora do HOPELESS'; isso não é provado.

### Área motor

Os nove achados da área motor fecham no commit 1380bb8. Rodei a prova de cada um contra o dist/ novo, nos dois navegadores, com o servidor na porta 4281. Para os que têm teste novo, fiz também mutantes numa cópia do dist/. Conferi os pontos que você pediu para vigiar. Strip: o novo strip.ts não tirou nada necessário. Removi e decodifiquei no Chromium todas as fixtures PNG, WebP e JPG, um APNG, um PNG de 16 bits, um PNG indexado com tRNS e um WebP com alfa e ICCP, e os pixels e a contagem de quadros ficaram idênticos. Painel: nenhum caminho travado. O chunk do motor, o chunk process.*, o worker do PDF (abortado, em 404 e lançando no topo) e o chunk pdf-client terminam na fala 'load', e o painel recupera depois (Chromium com lote novo, PDF com troca do tamanho da página). Ilha de 2 arquivos JS: budgets.spec com 21 de 21 verdes nos dois navegadores. tool_error: o único valor novo é 'load', e a lista fechada, o cleanParams e o consent.test o cobrem. Os testes novos matam os mutantes que tentei: warm antigo, caminho da página sempre ligado, worker sem checar canvas e PDF sem a corrida com o broken. Achei três coisas novas. A principal (medio) é o p2-motor-01: o a-01 cobriu o chunk do motor, mas o .wasm e a cola dos codecs, carregados dentro do motor, ainda mostram 'danificado' (HEIC) ou 'este navegador não grava JPG' (Compress) quando a rede cai ou o hash some depois de um deploy. Com isso, a frase do § 103 (e-05), de que o a-01 cobre o efeito visível, não é verdadeira para os codecs. Os outros dois são baixos e de teste: o p2-motor-02 (APNG e cICP sem asserção) e o p2-motor-03 (caixa pequena do Crop só provada na metade que move). Eslint e tsc (tsconfig só com os arquivos do motor e do painel) sem erro. Transparência: rodei por engano um 'git checkout -- .' na worktree, que não fez nada (árvore limpa, HEAD 1380bb8, 0 arquivos alterados), e mudei por um instante a porta do .cache/cetico-a-03/force-full.ts, que já voltei ao original; tudo o mais ficou em .cache/passada2-motor/. Os servidores 4281 e 4282 foram encerrados e o dist/ mutante foi apagado.

- **a-01** fechou: Rodei o retry.ts do cético contra o dist/ novo. Com o chunk engine-client abortado, um JPG bom mostra 'Oli couldn't load what she needs to read good-photo.jpg. Check your connection and reload the page.' e o tool_error sai com reason 'load' (engine-paths.spec.ts, Chromium e WebKit, 4 repetições, 12 de 12 verdes). O 'load' está fora do HOPELESS (ImagePanel.tsx:58). Com a rede de volta e um lote novo, o Chromium processa de verdade (2 requisições, 'Done! Your image is 72% lighter'). O WebKit não pede o chunk de novo (cache do import que falhou) e repete a fala 'load', que manda recarregar: está certo. O chunk process.*.js do caminho da página em 404 também vira 'load' nos dois navegadores. Ressalva: o mesmo defeito continua um nível abaixo, nos codecs (.wasm e cola) carregados dentro do motor; ver p2-motor-01.
- **a-02** fechou: Rodei prove.ts e recover.ts do cético. Com o worker do PDF (worker-JmqecDMu.js) abortado, o Image to PDF acaba em 'Oli couldn't load ... a.jpg. Check your connection and reload the page.' no Chromium e no WebKit, sem 'Building your PDF'. Também com o chunk pdf-client abortado, com o worker em 404 text/html e com o worker que lança no topo (4 casos, todos 'load'). Recuperação: com a rede de volta, mudar o tamanho da página para Letter produz o PDF no mesmo painel (um worker novo). Mutante: tirei o Promise.race com o broken do pdf-client no dist e o teste engine-paths 'a PDF worker that cannot start' falha (Building your PDF fica na tela).
- **a-03** fechou: engine-paths.spec.ts ('without OffscreenCanvas in the worker') passa nos dois navegadores, 4 vezes. Mutante 1 do cético (processFile sempre pela página, if(true)) no dist: o tool.spec.ts 'the work runs in the Web Worker' falha no Chromium ('OffscreenCanvas no worker: true', esperado false). Mutante 2 (confiar no worker sem checar canvas, if(!a)): o teste engine-paths falha (o .result nunca aparece). No WebKit do Windows a asserção do tool.spec vale pelo caminho oposto (canvas false, process.*.js pedido). Observação: o ramo document.createElement('canvas') do work.ts:40 (Safari antes do 16.4) ainda não é forçado por teste no CI, porque a página do Chromium e a do WebKit Linux têm OffscreenCanvas. Rodei o force-full.ts com OffscreenCanvas apagado na página e no worker, nos dois navegadores: JPG válido, 'Done! Your image is 72% lighter'. Só lacuna de teste, não é regressão.
- **a-04** fechou: strip.test.ts: 16 verdes. unit-proof.ts do cético: PNG com tEXt, caBX e iDOT sai com IHDR,IDAT,IEND e sem 'GPSLatitude'; WebP com chunk C2PA sai sem ele. No navegador (png-chunks.ts, cópia minha), o PNG com tEXt, caBX, prVW e orNT sai com IHDR,IDAT,IEND por /compress-image/ (366 B), /compress-image/to-100kb/ (caminho sem ganho) e /resize-image/. Regressão procurada: removi e decodifiquei com ImageDecoder no Chromium todos os PNG, WebP e JPG de fixtures/images, um APNG, um PNG de 16 bits com gAMA, sBIT, bKGD e pHYs, um PNG indexado com tRNS e hIST, e um WebP com alfa e ICCP. Os pixels de cada quadro ficaram idênticos e a contagem de quadros também (WebP animado 2 para 2, APNG 2 para 2). Nada necessário foi tirado.
- **b-01** fechou: unit.mjs e browser.mjs do cético (a cópia do browser.mjs gravando só na minha pasta). O PNG com tEXt, eXIf, tIME, caBX e zxIf passa por /compress-image/ e sai com IHDR IDAT IEND, no Chromium e no WebKit, sem 'GPSLatitude', sem o nome do autor e sem a latitude e a longitude do payload C2PA. JPG com JFXX, Ducky e Ocad no APP0 e no APP14 sai só com JFIF e sem o texto de GPS. WebP com EXIF e C2PA sai com VP8X e VP8 apenas.
- **d-03** fechou: live-count.ts: um MutationObserver nas regiões vivas durante um lote de 3 JPGs registra 2 mudanças de texto nos dois navegadores ('Compressing images' e depois 'Done! Your 3 images are 84% lighter.'), e a frase do cartão (.fo-result__says) não está dentro de região viva. island.spec.ts passa nos dois (10 de 10) com a asserção nova: nenhum [aria-live] nem role=alert não vazio no #fo-tool-root, e um só role=status.
- **d-06** fechou: crop-pointer2.ts e crop-pointer3.ts, Chromium e WebKit. Caixa de 52 px na tela: arrastar pelo centro move (x 100 para 134, y 100 para 123, tamanho igual). Arrastar pela metade de fora da alça SE e da NW redimensiona (60 para 102, depois 102 para 127). Caixa grande (336 px): a alça SE redimensiona nas três posições testadas (inclusive 6 px para dentro). O teste novo do image-crop.spec.ts passa nos dois. Ressalva menor: o teste só prova a metade 'move'; ver p2-motor-03.
- **d-07** fechou: image-crop.spec.ts e image-smoke.spec.ts (6 testes por navegador) passam nos dois navegadores. O nome acessível da caixa é 'Crop area, 480 by 480 pixels, at 80, 0' e vira '... at 86, 0' depois de ArrowRight. axe da caixa com resultado, verde. Tipos (tsc num tsconfig meu só com os arquivos do motor e do painel) e eslint sem erro.
- **e-01** fechou: Mutante: troquei o warm() do dist pelo antigo (api.warm direto) e o teste de caminho da página falha no Chromium, com a lista de .wasm repetidos (mozjpeg_enc.wasm, etc.). No dist novo o teste passa, 4 repetições em cada navegador (12 de 12 verdes), com cada .wasm pedido uma vez só. Todo o engine-paths roda estável. Bônus: image-matrix, image-presets, image-privacy, image-batch e image-smoke passam no Chromium e no WebKit, e o budgets.spec dá 21 de 21 verdes nos dois, então a ilha continua com 2 arquivos JS.

#### p2-motor-01 · O .wasm e a cola dos codecs, carregados dentro do motor, ainda viram 'danificado' ou 'este navegador não grava JPG'

- **Severidade:** médio; cético: confirmado, médio. **Estado:** corrigido (§ 104).
- **Onde:** src/engine/image/process.ts:181 e :347; src/engine/image/codecs/runtime.ts:12-45
- **Regra:** Régua da decisão 3 (DECISOES § 93): erro real de impacto pequeno (a saída é segura: o original sem metadados volta no Compress, e no HEIC nada sai). PLANO: o tool_error acha bug de compatibilidade; o § 102 a-01 diz que um arquivo bom não é chamado de danificado quando o motor não carrega.
- **Correção proposta:** Fazer o carregador de codec lançar um erro próprio: em codecs/runtime.ts, envolver compileWasm, bytesOf e os import() da cola num helper que lance new EngineError('load'), com 'load' somado ao FailureReason de types.ts. O ImagePanel e o events.ts já aceitam 'load'. No process.ts:181, devolver 'cannot-encode' só quando o codificador de fato não existe (WebP no Safari) e deixar o 'load' subir. Teste novo no engine-paths.spec.ts: abortar /\.wasm$/ em /heic-to-jpg/ e em /compress-image/ e exigir a fala de 'load' e o evento ['load'], nos dois navegadores (duas cargas por navegador, uns 8 s). Corrigir a frase do e-05 no DECISOES.

**Evidência:**

> Cópia minha wasm-fail.ts e wasm-404.ts contra o dist/ novo: com todo .wasm abortado, ou respondido com 404 text/html, a página já carregada e o JS do motor intactos, nos dois navegadores. (1) /heic-to-jpg/ com o HEIC bom heic-06: 'a.heic is damaged, so Oli can't read it. Try another copy of the file.' e tool_error reason 'decode' (cai no HOPELESS, não é tentado de novo). (2) /compress-image/ com o JPG bom jpg-02: 'This browser can't save JPG files, so Oli kept the original image, without the photo metadata.' e tool_error reason 'encode', com browser chrome-156 ou safari-27. Causa: compileWasm e bytesOf lançam Error comum, e o processImage devolve fail(reasonOf(error, stage)), que usa 'decode' ou 'encode'. No Compress o process.ts:181 trata qualquer erro que não seja EngineError como 'codec não grava'. É a mesma classe do a-01 (rede fora, ou chunk sumido depois de um deploy), um nível abaixo do chunk que a correção cobriu. O § 103 (e-05) diz que a correção do a-01 cobre o efeito visível do 404 em /_astro/*, mas os hashes do .wasm e da cola dos codecs também mudam a cada build e o efeito visível continua errado. O tool_error é a ferramenta que o PLANO usa para achar bug de compatibilidade em produção, e passa a registrar 'encode' e 'decode' falsos.

**Cético:**

> Reproduz nos dois navegadores, nos dois modos de falha e nas duas ferramentas. É a mesma classe do a-01 (REVISAO-F3 linha 71: médio, confirmado, corrigido no § 102), um nível abaixo do que a correção cobriu. Pela régua do § 93, "erro real de impacto pequeno" é médio. A saída é segura: o Compress devolve o original sem metadados e o HEIC não gera nada. Mesmo assim, o arquivo bom é chamado de danificado (HEIC) ou de "este navegador não grava JPG" (Compress). O HEIC não é retentado, porque 'decode' está no HOPELESS. O tool_error, que o PLANO usa para achar bug de compatibilidade, registra 'encode' e 'decode' falsos. O .wasm é a requisição lazy mais pesada e a mais provável de falhar (libheif tem 1,4 MB), e um deploy no meio da sessão invalida o hash. Não vejo razão para subir (nada sai do aparelho e nenhum número vai à URL) nem para descer a baixo, já que o a-01 equivalente foi tratado como médio. A correção proposta é viável, com uma ressalva: o helper de 'load' deve cobrir só falha de fetch, de resposta !ok e de import() da cola. Um WebAssembly.CompileError real, como o webp_enc_simd num navegador sem SIMD, deve continuar sendo 'cannot-encode'. A frase do e-05 no DECISOES também precisa ser corrigida.

#### p2-motor-02 · Nenhum teste prova que o strip guarda os chunks do APNG e do HDR do PNG

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/unit/strip.test.ts:71 (keepers); src/engine/image/strip.ts:141-144
- **Regra:** Régua: teste que não prova o que diz. O § 100 afirma 'Prova: três testes novos ... falham no código antigo' e lista os chunks que ficam.
- **Correção proposta:** No teste do PNG, somar acTL, fcTL, fdAT, cICP, mDCV e cLLI a keepers (e um chunk fdAT antes do IDAT). Opcional: no WebP, somar ANIM e ANMF à lista que o teste confere.

**Evidência:**

> O teste novo do PNG confere a presença de IHDR, PLTE, tRNS, gAMA, cHRM, sRGB, iCCP, sBIT, bKGD, pHYs, IDAT e IEND (a lista keepers), mas não de acTL, fcTL, fdAT, cICP, mDCV e cLLI, que o § 100 diz que ficam. Um mutante que tire qualquer desses seis do PNG_KEEP segue verde (leitura do teste: nenhuma asserção os nomeia). O risco de uma lista de permissão é justamente tirar o que a imagem precisa, e o APNG e o cICP são os dois casos em que a falta muda o que a pessoa vê (animação, cor HDR). Rodei o strip-regress.ts: hoje o APNG sai com 2 quadros idênticos aos do original, então o código está certo e só falta o teste.

#### p2-motor-03 · O teste da caixa pequena do Crop não prova que a metade de fora da alça ainda redimensiona

- **Severidade:** baixo. **Estado:** corrigido (§ 104).
- **Onde:** tests/e2e/image-crop.spec.ts:322-349; src/tools/crop-image/CropEditor.tsx:92-96
- **Regra:** Régua: teste que não prova o que diz (a decisão cita as duas metades da regra e só uma tem prova).
- **Correção proposta:** No mesmo teste, depois de mover, apertar 12 px fora do canto SE da caixa (fora do retângulo, em cima da alça), arrastar 25 px e exigir que cr-width e cr-height cresçam. Custo: segundos, na mesma carga.

**Evidência:**

> O § 102 (d-06) afirma: dentro da caixa pequena o ponteiro a move, 'e a metade de fora de cada alça ainda a redimensiona'. O teste novo só arrasta pelo centro. Mutante no dist (corner:r&&i?null:... trocado por corner:r?null:..., ou seja, caixa pequena nunca redimensiona com o ponteiro): o teste 'the box says what it covers, and a small box moves with the pointer' continua passando no Chromium (1 passed), enquanto o crop-pointer2.ts mostra que arrastar a alça SE por fora move a caixa (x 134 para 163) em vez de redimensioná-la (60 para 102 no código real). Sem esse teste, uma regressão que tire o redimensionamento de toda caixa pequena passa pelo CI.

