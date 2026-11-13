# Plano de melhorias do FileOrca (F9 a F13)

3/nov/2026 · Victor Yuki Matusita · complementa o PLANO-FILEORCA.md (v7.1). Onde os dois conflitam, vale este arquivo, e só nos itens da seção "Mudanças no contrato". O resto do PLANO continua valendo.

## Resumo

Seis runs e três paradas suas. A F9 vem primeiro porque é ela que deixa todas as outras mais rápidas e mais baratas.

| # | Run | O que entrega | Merge |
|---|---|---|---|
| 1 | **F9 · CI e runs mais rápidos e baratos, e preparo do repositório público** | Build único por execução; CI completo só quando a PR fica pronta; PR só de documentação roda leve; preparo dos jobs do Playwright mais rápido; CLAUDE.md enxuto; auditoria para publicar; proteção contra PR de fork | Seu (mexe em .github/workflows/) |
| — | Você | Lê a auditoria, dá o merge, torna o repositório público e configura (seção F) | — |
| 2 | **F9b · Ajuste do CI público** | As partes do CI redivididas para as máquinas de 4 vCPU do repositório público | Seu |
| 3 | **F10 · UX/UI: diagnóstico e proposta** | Protótipos, cabeçalho com menu, hub de guias, Oli triste, card do café, mapa de anúncios. Não muda o site | Automático |
| — | Você | Escolhe o que entra (ESCOLHAS.md) | — |
| 4 | **F11 · Navegação, guias e tema** | Menu no cabeçalho, hub de guias em en, pt e es, tema Sistema/Claro/Escuro | Automático |
| 5 | **F12 · Monetização** | Anúncios no máximo das regras (com a home), parede do bloqueador com a Oli triste, café "me ajude" | Automático |
| 6 | **F13a e F13b · UX/UI: implementação** | O que você aprovou na F10 | Automático |

**Por que a F9 primeiro.** Hoje cada execução completa do CI tem 20 jobs e custa uns 170 minutos cobrados. Cada uma das 18 partes do Playwright refaz o build e reinstala o navegador; a instalação chegou a 356 s numa parte. PR em rascunho e push só de documentação disparam o CI inteiro de novo, então uma run gasta de 2 a 4 execuções. O `pnpm verificar` local já passou de 15 min (1.169 s na F6, § 242). E o CLAUDE.md tem 78 KB, que entram no contexto de cada agente e subagente de toda run.

## Suas respostas (3/nov/2026)

- **Repositório:** otimizar e tornar público.
- **Bloqueador de anúncio:** bloqueio que não fecha, com "usar só desta vez" uma vez por dia.
- **Anúncios:** o máximo dentro das regras.
- **UX/UI:** evolução com a Oli no centro, com protótipo e escolha sua antes do código.

## Mudanças no contrato

| # | Tema | Antes (PLANO v7.1 e CLAUDE.md) | Agora |
|---|---|---|---|
| 1 | Repositório | `vmatusita/fileorca`, privado | Público, depois da auditoria da F9 e da sua conferência (seção F) |
| 2 | Travas da main | Hook pre-push, .claude/settings.json e CLAUDE.md | As três, mais um ruleset do GitHub: PR obrigatória, check `ci-ok` obrigatório, sem force push e sem exclusão da main |
| 3 | Quando o CI roda | Completo em toda PR, a cada push | PR em rascunho roda só um job leve; com o rótulo `ci`, roda tudo. PR pronta roda tudo. PR só de documentação roda os portões e pula o Playwright e o Lighthouse. O build é feito uma vez por execução |
| 4 | CLAUDE.md | "As runs só acrescentam; nunca apagam" | A F9 compacta uma vez, sem perder regra (um teste confere). Depois, as runs acrescentam no arquivo do tema em docs/claude/, e a regra de nunca apagar volta a valer |
| 5 | Revisão adversarial | De 5 a 6 lentes em toda fase | Proporcional ao risco (regra 3 de "Regras novas de toda run") |
| 6 | Cabeçalho | Logo, busca e idioma; "o cabeçalho não tem menu" | Ganha menu (as categorias do idioma, Guias e Apoie) e o botão de tema |
| 7 | Tema escuro | Segue o sistema | Segue o sistema por padrão; Sistema, Claro e Escuro no cabeçalho, com a escolha guardada no navegador |
| 8 | Anúncio na home | Nenhum | Sim, pelo mapa da seção B |
| 9 | Anúncio no conteúdo | No máximo um a cada duas telas | No máximo um a cada 1,5 tela (1.110 px a 740 px de altura), multiplex no fim e segunda unidade lateral no computador. Densidade de anúncio ≤ 30% no celular vira trava testada. Área nova `geral` (home e hub de guias) |
| 10 | Espaço de anúncio sem unidade | Caixa neutra reservada, mesmo sem anúncio | Sem ID de unidade, o espaço não aparece; distância e densidade são testadas no build de teste com IDs |
| 11 | Quem bloqueia anúncio | Card do café já no 1º uso | Parede com a Oli triste (seção A). O café sai desse gatilho |
| 12 | Oli | Nove poses, lista fechada; "nunca cobra nada" | 10ª pose, `sad`, usada só na parede: fala triste, sem culpa e sem pedir clique. Outra pose nova só se você escolher na F10 |
| 13 | Textos do café | Tom de transparência | Tom "me ajude com um café" (seção C). Continua sem contagem regressiva, sem culpa, sem bloquear a tela e sem ligar doação a anúncio |
| 14 | Fonte de verdade | Ficha > PLANO > CLAUDE.md > DECISOES > código | Ficha > PLANO-MELHORIAS (nestes itens) > PLANO > CLAUDE.md e docs/claude/ > DECISOES > código |
| 15 | Catálogo | "Escopo: 48 ferramentas em quatro áreas"; "o catálogo é o teto"; o "remover metadados" no backlog com gatilho | O teto abre só para as candidatas da seção E do PLANO-UX-QV.md que passarem na regra da seção E. Para o "remover metadados", essa regra substitui o gatilho do backlog. O "Fora do escopo" e os outros itens do backlog não mudam. |

**O que não muda:** 150 px entre anúncio e Baixar, campos, menus, painel e Oli; nada acima da ferramenta no celular; nunca anúncio no painel, no processamento, no cronograma nem nas páginas jurídicas; só âncora e vinheta como formatos automáticos; nenhum refresh de anúncio; amarelo só no Baixar; PR que mexe em .github/workflows/ e major do Dependabot ficam para você; sem conta, sem upload, sem servidor; "sem anúncio para quem doa" continua fora.

## O que não é viável ou tem limite

- **Pegar todo bloqueador.** Não dá. Listas que escondem avisos anti-bloqueador (como as "Annoyances" do uBlock) podem sumir com a parede. Bloqueio por DNS (NextDNS, Pi-hole) que também barre o script de detecção do Google não é visto, porque usar só "o anúncio não carregou" pegaria também o Googlebot e quem está com internet ruim. A parede pega o caso comum, e o relatório do AdSense e o evento `adblock_wall` mostram quanto.
- **Bloqueio na UE, no Reino Unido e na Suíça.** Lá a tela vira aviso que dá para fechar. Detectar bloqueador pode exigir consentimento pela diretiva ePrivacy (art. 5(3)), e bloquear de verdade nesses países pede parecer de advogado.
- **Liberar a parede para quem doou.** Impossível sem conta, e o plano proíbe "sem anúncio para quem doa".
- **Mais anúncio tem preço.** O provável é menos páginas por visita e Core Web Vitals piores. O Lighthouse do CI mede sem anúncio, então o efeito real só aparece no GA4 e no Search Console: acompanhe por 2 semanas depois de ligar.
- **Repositório público é porta de mão única.** O histórico inteiro fica visível: as fotos de teste com GPS, o DECISOES, a estratégia de receita e o e-mail dos commits. Voltar atrás exige reescrever o histórico, e isso quebra testes que leem commits antigos (o `pos-deploy.test.ts` lê o `503b8c3`) e os links de todos os relatórios. Por isso a auditoria vem antes, e quem decide é você.
- **Antes da aprovação do AdSense, nada disso aparece.** Os anúncios novos e a parede ficam desligados até você ligar as variáveis.
- **"Mais único" é julgamento.** Por isso a F10 entrega protótipos, e você escolhe antes de qualquer código.

## Regras novas de toda run

Valem a partir da F9, que as escreve no CLAUDE.md. Somam-se às de "Execução por IA" do PLANO.

1. **PR em rascunho desde o começo** (o Workers Builds já gera a prévia). Commite tudo, relatório e screenshots inclusive, e só então rode o `gh pr ready`: é isso que dispara o CI completo, uma vez. Para conferir no Linux do CI no meio da run (o WebKit de lá difere do Windows), ponha o rótulo `ci` na PR e tire depois.
2. **Na máquina local:** rode o spec alvo enquanto corrige, e o `pnpm verificar` completo (em partes, `--partes`) uma vez, antes do `gh pr ready`.
3. **Revisão proporcional ao risco.** Run curta: uma lente e um cético. Fase de interface ou de texto: três lentes. Fase que mexe em motor, conta, dinheiro, saúde, privacidade, anúncio ou CI: de cinco a seis lentes. Cético próprio só para achado médio ou acima; os baixos de cada lente vão a um cético só, como hoje.
4. **Ler só o que a tarefa toca.** O índice do CLAUDE.md diz qual arquivo de docs/claude/ ler para cada assunto. O DECISOES.md se lê buscando o §, nunca inteiro.
5. **Custo no relatório.** O relatório traz o `pnpm ci:custo <id>` da última execução do CI: minutos de job, tempo de parede e número de jobs.
6. **Agentes em worktree:** o primeiro passo é `git merge --ff-only <branch da run>`, e todo merge leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`).

## Fichas para a prompt-ultracode

Uma ficha por run, no formato do apêndice do PLANO. Critério é sempre algo que um comando confere.

### F9 · CI e runs mais rápidos e baratos, e preparo do repositório público

| Campo | Conteúdo |
|---|---|
| Missão | Cortar o custo e o tempo de cada run, no CI e no agente, sem tirar nenhum teste, e deixar o repositório pronto para virar público com segurança. |
| Entradas | Este plano (regras novas, "Mudanças no contrato" e seção F); .github/workflows/ci.yml e pos-deploy.yml; scripts/verificar.ts e tests/unit/verificar.test.ts; playwright.config.ts; scripts/ci/pode-mesclar.ts e fixtures/merge-events/; CLAUDE.md; docs/OPERACAO.md; pendências do grupo 11 (§ 242 e § 283) e a F8 ensaio-3; os tempos da última execução verde (docs/relatorios/ajuste-idiomas.md, seção "O CI"). |
| Dentro | **1. Medir primeiro:** `scripts/ci/custo.ts` (`pnpm ci:custo <run-id>`, pelo gh) mostra, por job, o tempo, o minuto cobrado (arredondado para cima, como num repositório privado) e os passos que mais pesam (instalação, build, testes), com a soma e o tempo de parede. A linha de base é a última execução verde da main. **2. Build uma vez por execução:** um job `build` sobe o dist/ e o .cache/bundle-modules.json como artefato de 1 dia; as partes do Playwright e do Lighthouse baixam e não refazem o build. O verificar ganha um modo que usa o dist/ pronto, e só se o build.txt bater com o commit. O verificar.test prova que as partes juntas são o todo, com o build uma vez. **3. Preparo do job do Playwright em até 90 s:** navegador em cache pela versão do Playwright e as dependências do sistema sem o apt lento (a imagem oficial do Playwright com a tag lida do lockfile, ou cache). A escolha sai da medida, e as proteções da § 154 (core dump desligado e diagnóstico de disco) têm de continuar provadas no log. **4. Quando o CI roda:** PR em rascunho roda só um job leve (tipos, lint e Vitest, com o build só se o Vitest precisar); com o rótulo `ci`, roda tudo; `ready_for_review` e push em PR pronta rodam tudo. PR só de documentação (todo arquivo em docs/, menos docs/design/ e docs/oli/, ou um .md da raiz) roda os portões e pula o Playwright e o Lighthouse. A classificação é um script em scripts/ci/ lido da base, como o pode-mesclar, testado com eventos de exemplo. O pulo é por `if` de job, nunca por `paths` do workflow, que deixaria o check pendente para sempre. **5. `ci-ok`:** um job que espera todos e falha se algum falhou ou foi cancelado. O merge passa a esperar o `ci-ok`, e ele é o único check que o ruleset exige, então mudar as partes nunca mexe no ruleset. **6. Miúdos:** `fetch-depth: 0` só onde precisa (o lint:texto); o comentário do topo do ci.yml atualizado; `pnpm verificar --partes` (§ 242), que roda as partes do CI em sequência na máquina local, cada uma com 900 s, e mostra a soma; o teste lento sob carga (F8 ensaio-3) mais leve, nunca com mais tempo. **7. Agente:** o CLAUDE.md compactado para até 25 KB. Fica no arquivo o núcleo (projeto, fontes de verdade, Git, o que fica fora de toda run, testes, regras que nenhuma run quebra, como a run termina, idioma, comandos e as regras novas deste plano) e um índice do tipo "mexeu em X, leia docs/claude/X.md". As seções de fase e as pegadinhas vão, com o texto igual, para docs/claude/ (ci, imagem, pdf, calculadoras, idiomas, design-e-oli, service-worker, anuncios, playwright e windows-git-bash). As descrições de partes do CI que já foram substituídas saem, listadas num §. Um teste em tests/unit/ lê o CLAUDE.md da main de antes da F9 (git show) e reprova se alguma linha de regra sumir, menos as da lista de substituídas. **8. Preparo do público:** (a) Auditoria: o gitleaks (MIT, fixado por SHA-256 em scripts/lib/tools.ts) no histórico inteiro; uma varredura de dados pessoais em todo arquivo e em todo blob do histórico (GPS e Exif das imagens, e-mail, telefone, CPF, endereço, e-mails de autor dos commits); conferir se docs/lancamento/ tem contato pessoal de terceiros. O resultado vai para .cache/auditoria-publico.md, fora do Git, porque num repositório público a coordenada e o achado ficariam públicos. O relatório só diz quantos achados e de que tipo. (b) Proteção contra fork: o pode-mesclar só mescla PR cujo head é deste repositório e cujo autor é o dono ou o Dependabot; os jobs que escrevem (merge, alerta e pós-deploy) não rodam em PR de fork; nenhum `pull_request_target`. Tudo com teste no ci-workflows.test e no merge-events. (c) README.md (o que é, como rodar, licença), SECURITY.md (relato privado de falha) e a licença: todos os direitos reservados (o motor de imagem continua no repositório MIT separado). (d) Conferir na documentação do Workers Builds se PR de fork gera build, e registrar. (e) No docs/OPERACAO.md, a seção "Repositório público" com o passo a passo da seção F e o ruleset em JSON pronto para importar, em docs/ops/ruleset-main.json. **9. Fonte de verdade:** commitar o PLANO-MELHORIAS.md (já está na raiz, sem rastreio), uma linha no topo do PLANO-FILEORCA.md apontando para ele, e a ordem nova das fontes no CLAUDE.md. |
| Fora | Tirar, pular ou amostrar teste; mudar o limite de 900 s; tornar o repositório público ou mexer em configuração do GitHub ou do Cloudflare (é seu); reescrever o histórico; runner pago; ADR que troque host ou framework. |
| Critérios | `pnpm ci:custo` na última execução completa da PR: pelo menos 35% menos minutos de job que a linha de base, preparo de cada job do Playwright em até 90 s e nenhuma parte acima de 700 s. Uma execução em rascunho, sem o rótulo, não roda o Playwright (o próprio ci:custo prova). Uma PR de exemplo só de documentação é classificada como "portões" (teste). O `ci-ok` fica verde e o merge espera por ele. O teste do CLAUDE.md fica verde, com o arquivo em até 25 KB. O gitleaks roda no histórico inteiro, com a contagem no relatório. A proteção contra fork tem teste. O `pnpm verificar --partes` roda na máquina local, com a soma no relatório. pnpm verificar verde. |
| Válvula de estouro | A compactação do CLAUDE.md e o `--partes` podem ir para a F9b. Nunca cortar: ci:custo, build único, rascunho sem CI completo, PR de documentação leve, `ci-ok`, auditoria e proteção contra fork. |
| Destino | Branch fase-09, PR, relatório em docs/relatorios/fase-09.md. O merge é seu, porque a PR mexe em .github/workflows/. |

**Depois da F9, você:** segue a seção F (auditoria, merge, público, configurações) e gera o prompt da F9b.

### F9b · Ajuste do CI público (run curta)

| Campo | Conteúdo |
|---|---|
| Missão | Redividir as partes do CI para as máquinas de 4 vCPU e 16 GB que o GitHub dá a repositório público, e provar o tempo. |
| Entradas | O `pnpm ci:custo` da primeira execução depois do repositório público; ci.yml; playwright.config.ts (hoje com 2 workers no CI); o que a F9 tenha deixado pela válvula. |
| Dentro | Workers do Playwright no CI de 2 para 4, se ficar estável (três execuções sem falha nova); o número de partes de cada navegador pelo tempo medido, com o alvo de 700 s e o `design.spec.ts` e o `image-matrix.spec.ts` em partes diferentes (§ 142); verificar.test e docs/claude/ci.md atualizados; o que a F9 deixou pela válvula. |
| Fora | Tirar teste; mudar o limite; mexer no ruleset (o `ci-ok` cobre). |
| Critérios | Tempo de parede do CI em até 12 min no ci:custo; cada parte em até 700 s; pnpm verificar verde. |
| Válvula de estouro | Nenhuma: a run é curta. |
| Destino | Branch ajuste-ci-publico, PR, relatório em docs/relatorios/ajuste-ci-publico.md. O merge é seu. Se você desistir do repositório público depois da auditoria, esta run não acontece. |

### F10 · UX/UI: diagnóstico e proposta (sem mexer no site)

| Campo | Conteúdo |
|---|---|
| Missão | Achar onde o FileOrca perde a pessoa e onde ele parece genérico, e propor, com protótipo, a evolução da UX e da UI com a Oli no centro, incluindo o desenho das peças que a F11 e a F12 vão construir. Nada muda no site. |
| Entradas | O site no ar (fileorca.com, com os domínios do Google abortados, como manda o CLAUDE.md) e a prévia; docs/design/ (regras, tokens, componentes e a lista "Nunca"); as seções de design e da Oli do PLANO; as pendências dos grupos 5 e 6 e as decisões F3 d-02, F7 e-1, F4-F7 e-2, f-1 e f-2, ajuste-aviso-espaco, F7 f-10 e F4 ACE-7; as seções A a E deste plano; os dados que você exportar (opcional, em .cache/dados-f10/, fora do Git): os eventos do GA4 por página nos últimos 28 dias e as páginas e consultas do Search Console. Sem dados, a run segue só com heurística e registra. |
| Dentro | **Diagnóstico:** as seis tarefas principais (comprimir imagem, HEIC para JPG, juntar PDF, hipoteca, SAC × PRICE em pt e um guia) a 360×740 e a 1280×800, nos dois temas e nos idiomas em que existem. Cada atrito com evidência: screenshot, número ou heurística citada. Comparação com iLovePDF, Smallpdf, TinyPNG, Squoosh e uma calculadora da NerdWallet, só para achar padrão e lacuna, nunca para copiar. **Proposta,** em docs/propostas/ux-v2/: um README com os itens numerados (UX-01, UX-02…), cada um com problema, evidência, proposta, custo (P, M ou G), risco para orçamento, anúncio e acessibilidade e a página do protótipo; protótipos em HTML estático sobre o docs/design/tokens.css e o bundle.css, sem importar nada de src/; screenshots dos protótipos nos dois temas; e o ESCOLHAS.md, a lista para você marcar, com a recomendação de cada item. **Obrigatórios:** (1) cabeçalho com menu e botão de tema, em 2 alternativas; (2) hub de guias e os pontos de entrada dos guias; (3) home, em 2 alternativas; (4) página de ferramenta, do soltar ao resultado, em 2 alternativas; (5) card do café e página de apoio, com os textos da seção C; (6) parede do bloqueador com a Oli triste, nos dois modos, com os textos da seção A; (7) o mapa de anúncios de cada molde, com a densidade calculada a 360×740 (seção B); (8) a pose `sad` (e qualquer pose nova proposta) feita com as peças do sprite, em até 4 KB, numa folha como a docs/oli/folha.html; (9) o que fazer com cada pendência de design e acessibilidade das Entradas. **Para avaliar, sem obrigação de propor:** passar o resultado direto para a próxima ferramenta sem baixar (reusando a caixa do compartilhar da F8); "suas ferramentas recentes" e "a Oli já economizou X MB para você", guardados só no navegador; soltar o arquivo em qualquer lugar da página; uma cena de fundo do mar por categoria nos hubs, em SVG leve; "mar à noite" no tema escuro; microanimação da Oli por estado, com laço de até 5 s (fecha o d-02); cenário salvo nas calculadoras. Cada um entra no README como proposto ou descartado, com o porquê. |
| Fora | Qualquer mudança em src/, tests/, scripts/, .github/ ou nos arquivos de docs/design/ que o build lê; dependência nova; cor fora dos tokens sem o contraste calculado; tudo da lista "Nunca (cara de IA)". |
| Critérios | O `git diff --name-only origin/main` só mostra docs/propostas/ux-v2/, docs/relatorios/, docs/prompts/ e DECISOES.md (o CI classifica a PR como documentação). Todo item tem evidência, protótipo e custo. Cada protótipo abre sem erro no console nos dois navegadores e passa no axe (script em .cache, fora do Git). Todo par novo de cor tem o contraste calculado. A densidade do mapa de anúncios fica em até 30% em todo molde a 360×740. O ESCOLHAS.md tem todos os itens e a recomendação. pnpm verificar verde. |
| Válvula de estouro | As segundas alternativas da home e da página de ferramenta podem sair. Nunca cortar os obrigatórios 1, 2, 5, 6, 7 e 8. |
| Destino | Branch fase-10, PR (merge automático, só documentação), relatório em docs/relatorios/fase-10.md. |

**Depois da F10, você:** `git pull`, abre docs/propostas/ux-v2/index.html no navegador e marca o ESCOLHAS.md na sua máquina, sem commit: a lista marcada vai colada nas conversas da F11, da F12 e da F13. Na folha da pose `sad`, faz a busca reversa no Google Lens (15 min), como na F1b.

### F11 · Navegação, guias e tema claro e escuro

| Campo | Conteúdo |
|---|---|
| Missão | Deixar todo guia e toda categoria a um toque de qualquer página e dar à pessoa a escolha do tema, sem piorar nenhum orçamento. |
| Entradas | As seções D e E; as suas escolhas da F10 para o cabeçalho e o hub de guias (sem escolha, vale a alternativa recomendada); docs/design/; os registros de guias (src/tools/guides/registry.ts e os GUIDES de dinheiro) e o mapa de rotas. |
| Dentro | A seção E inteira (menu, hub de guias em en, pt e es e as entradas dos guias) e a seção D inteira (tema). Os ícones novos (menu, sol, lua e automático) em docs/design/assets/Icons/, com §. A Privacidade, nos três idiomas, citando a preferência de tema guardada no navegador. OG, sitemap, hreflang, schema e busca das páginas novas. |
| Fora | Anúncio (o hub de guias nasce sem AdSlot; a F12 põe pelo mapa); mudar componente fora do cabeçalho e do hub; dependência nova; arquivo JS novo por página. |
| Critérios | Um teste percorre todas as páginas de cada idioma e acha, pelo cabeçalho, o caminho até o hub de guias do idioma e até cada hub de categoria que existe nele. Tema: a primeira pintura já sai com o tema guardado, sem piscar; a escolha passa de página para página; "Sistema" segue o `prefers-color-scheme` emulado; contraste e axe nos dois temas. JS e requisições por página iguais aos de antes (budgets e i18n-budgets). CLS em até 0,05 no layout-shift, de 320 a 412 px, com o cabeçalho novo. Lighthouse ≥ 90. gate:seo, gate:links e gate:conteudo verdes com as páginas novas. pnpm verificar verde. |
| Válvula de estouro | A seção de guias na home pode ir para a F13. Nunca cortar o menu, o hub de guias nos três idiomas e o tema. |
| Destino | Branch fase-11, PR, relatório em docs/relatorios/fase-11.md. |

**Depois da F11, você:** confere no celular o menu, o tema e os guias, e pede no Search Console a indexação dos três hubs de guias.

### F12 · Monetização: mais anúncios, parede do bloqueador e café

| Campo | Conteúdo |
|---|---|
| Missão | Tirar o máximo de receita que as regras deixam: anúncio na home e no fim das páginas, a Oli triste para quem bloqueia e um pedido de café que convence, sem arriscar a conta. |
| Entradas | As seções A, B e C; as suas escolhas da F10 (parede, card do café, mapa e pose `sad`); src/ads/; os testes de anúncio (ads.spec.ts e o gate:prontidao); as pendências F3 c-04 e c-08. |
| Dentro | A seção B inteira: mapa, multiplex, área `geral`, unidades, trava de densidade, intervalo de 1,5 tela, espaço sem ID que não aparece e o PUBLIC_ADSENSE_SLOTS novo, validado no build. A seção A inteira: variável, detecção, modos, escape, páginas livres, região, acessibilidade, textos, eventos e Privacidade. A seção C: os textos novos do café nos três idiomas e o card que você escolheu. A pose `sad` no sprite e na lista fechada (sem escolha sua, a parede usa a `oops`). A c-04 resolvida pela saída A (nas regiões negadas por padrão, reaplicar só o `analytics_storage`). A c-08 fechada pela detecção nova, com a saída do gatilho antigo do café. No docs/OPERACAO.md, o modelo do PUBLIC_ADSENSE_SLOTS e o passo a passo da parede. O PENDENCIAS atualizado. |
| Fora | Posicionamento automático dentro da página; side rail automático; refresh de anúncio; qualquer texto que peça clique; café como forma de tirar a parede; script do Ko-fi; código de Worker; chamada à API do AdSense. |
| Critérios | Num build de teste com os IDs de teste e a parede em `bloqueio`: densidade em até 30% em toda página a 360×740; 150 px de cada anúncio até Baixar, campos, menus, painel, Oli, card do café e, no multiplex, a grade de cards; pelo menos 1.110 px entre anúncios do conteúdo; nada acima da ferramenta no celular; nenhum anúncio nas páginas livres. A parede aparece com o sinal do Google e com o sinal reserva, e não aparece offline, com o anúncio só falhando (o caso do Googlebot), com a variável desligada, no build padrão e nas páginas livres. O escape funciona uma vez por dia, por 30 minutos. Onde o GDPR se aplica, sai o aviso que fecha. Foco preso no diálogo, Esc só no aviso, axe verde. Nenhum texto da parede ou do café com "click", "clique" ou "clic" (lista no teste). O build padrão sai sem anúncio e sem caixa vazia. Lighthouse ≥ 90. pnpm verificar verde. |
| Válvula de estouro | A segunda unidade lateral e o multiplex podem ir para uma F12b. Nunca cortar a home, a trava de densidade, a parede e os textos do café. |
| Destino | Branch fase-12, PR, relatório em docs/relatorios/fase-12.md. |

**Depois da F12, com o AdSense aprovado, você:**

1. Cria as unidades da seção B no AdSense e atualiza o PUBLIC_ADSENSE_SLOTS pelo modelo do OPERACAO.md.
2. Em Privacy & messaging → Ad blocking recovery, cria a mensagem e a deixa em **Rascunho**: a detecção e o relatório funcionam sem publicar, e publicada a tela do Google apareceria por cima da nossa. Em "For Acceptable Ads users", escolhe não mostrar a mensagem.
3. Cria a variável PUBLIC_ADBLOCK_WALL = `bloqueio` no Workers Builds e usa Retry no último build da main.
4. Testa com o uBlock Origin no computador e com o Brave no Android: a parede aparece, o "usar só desta vez" funciona uma vez, e depois de liberar o site ela some ao recarregar. Com uma VPN da UE, confere que a tela fecha.
5. Se a parede só aparecer pelo sinal reserva (o do Google não chega com a mensagem em rascunho), publica a mensagem do Google com a inclusão apontando para um caminho que não existe (`/__sem-mensagem/`). Assim a tela do Google nunca aparece e o sinal passa a chegar.
6. Lê os textos em português e acompanha por 2 semanas, no GA4, as páginas por sessão e o `adblock_wall` e, no Search Console, os Core Web Vitals.

### F13 · UX/UI: implementação (runs 13a e 13b)

| Campo | Conteúdo |
|---|---|
| Missão | Construir o que você escolheu na F10, na ordem da sua lista, com a Oli no centro e sem piorar nenhum orçamento. |
| Entradas | O ESCOLHAS.md marcado (colado na conversa da skill); docs/propostas/ux-v2/; o que a F11 e a F12 já construíram. |
| Dentro | Os itens escolhidos, um commit e um teste por item. Item de comportamento leva teste que reprova sem ele; item visual leva screenshot de antes e depois no relatório e passa no gate:design. Componentes e tokens novos entram em docs/design/, com § e contraste calculado. As pendências de design e acessibilidade escolhidas saem do PENDENCIAS. Eventos novos do GA4 só com valores de lista fechada. |
| Fora | Item não escolhido; dependência nova sem licença da lista e sem escolha sua; mudança de arquitetura; mexer no que a F12 trava nos anúncios. |
| Critérios | Todo item escolhido entregue ou listado para a 13b; JS em até 80 KB e requisições em até 8 e 3; CLS em até 0,05; Lighthouse ≥ 90; axe e contraste nos dois temas; distância e densidade de anúncio verdes; pnpm verificar verde. |
| Válvula de estouro | Os itens do fim da sua lista vão para a 13b. Nunca cortar os três primeiros. |
| Destino | Branches fase-13a e fase-13b, uma PR cada, relatório de cada uma. |

**Depois da F13, você:** confere no celular e no computador e acompanha por 2 semanas, no GA4, a conclusão das ferramentas (tool_complete sobre tool_start) e as páginas por sessão.

## Especificações

### A. Parede do bloqueador (a Oli triste)

- **Liga por variável de build:** PUBLIC_ADBLOCK_WALL, com `desligado` (padrão), `aviso` ou `bloqueio`. Valor inválido para o build. Só vale com os anúncios ligados (as três variáveis de hoje) e só em fileorca.com.
- **Onde:** toda página com anúncio. Ficam livres: Privacidade, Termos, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com".
- **Detecção, nesta ordem:**
  1. **Sinal do Google:** a tag de recuperação de bloqueio do Privacy & messaging, gerada a partir do PUBLIC_ADSENSE_CLIENT, e o `googlefc.getAdBlockerStatus()` no `AD_BLOCK_DATA_READY`. Bloqueador de extensão ou de rede conta como bloqueador; "sem bloqueador" encerra.
  2. **Sinal reserva,** se o googlefc não responder em 4 s: o `adsbygoogle.js` deu `error` **e** um elemento-isca com classes de anúncio foi escondido. Os dois juntos, nunca um só: anúncio que só falha é rede ruim ou robô, e assim o Googlebot nunca vê a parede.
  3. Offline (`navigator.onLine` falso), nada é detectado.
- **Modos:**
  - `bloqueio`: diálogo modal (`<dialog>` com `showModal()`, o resto da página inerte), sem fechar, com três botões: "Já desativei, recarregar"; "Como desativar", que abre os passos para uBlock Origin, AdBlock e Adblock Plus, AdGuard, Brave, Safari e Firefox no modo estrito; e "Usar só desta vez".
  - `aviso`: o mesmo, com botão de fechar e Esc.
- **Escape:** "Usar só desta vez" libera o site por 30 minutos naquele navegador, uma vez por dia (a data fica no localStorage). Depois, a parede volta sem esse botão até o dia seguinte.
- **UE, Reino Unido e Suíça:** sempre `aviso`. A região vem do `__tcfapi` (gdprApplies); sem ele, do fuso horário do aparelho (Europe/\*, Atlantic/Azores, Atlantic/Madeira, Atlantic/Canary, Atlantic/Reykjavik e Atlantic/Faroe), lido só no aparelho.
- **Visual:** a pose `sad` (sem escolha, a `oops`) num card do design system. Nada amarelo, porque amarelo é do Baixar, e nada que imite anúncio. Respeita o movimento reduzido.
- **Medição:** evento `adblock_wall` com `action` (shown, reload, help ou escape) e `mode` (aviso ou bloqueio).
- **Privacidade, nos três idiomas:** o site verifica se há bloqueador para mostrar o aviso, guarda só a data do "usar só desta vez" no navegador, e nada sai do aparelho por isso.
- **Textos** (proposta: a F12 fecha com o glossário e o LanguageTool, e você lê o português):

| Peça | Inglês | Português | Espanhol |
|---|---|---|---|
| Título | Oli lives on ads | A Oli vive dos anúncios | Oli vive de los anuncios |
| Texto | FileOrca is free, with no sign-ups and no limits, because ads pay the bills. With your ad blocker on, Oli gets nothing. Please turn it off for fileorca.com and reload the page. | O FileOrca é grátis, sem cadastro e sem limite, porque os anúncios pagam as contas. Com o bloqueador ligado, a Oli fica sem nada. Desative o bloqueador para o fileorca.com e recarregue a página. | FileOrca es gratis, sin registros ni límites, porque los anuncios pagan las cuentas. Con el bloqueador activado, Oli se queda sin nada. Desactívalo para fileorca.com y vuelve a cargar la página. |
| Botão principal | I turned it off, reload | Já desativei, recarregar | Ya lo desactivé, recargar |
| Ajuda | How to turn it off | Como desativar | Cómo desactivarlo |
| Escape | Just this once | Usar só desta vez | Solo esta vez |

### B. Mapa de anúncios ("máximo dentro das regras")

| Molde | Onde entram os anúncios | Área |
|---|---|---|
| Home | O 1º depois da primeira seção de cards (nunca na primeira tela do celular); depois, um a cada 1,5 tela; multiplex no fim, antes do rodapé; coluna lateral com 2 unidades a partir de 1280 px (a home ganha a coluna) | geral |
| Hubs de categoria | Como hoje (depois da primeira grade, mais a lateral), mais um a cada 1,5 tela, multiplex no fim e 2ª unidade lateral | A da categoria |
| Hub de guias | Como os hubs de categoria | geral |
| Ferramenta (imagem, PDF e QR) | Como hoje (o 1º depois dos chips), mais um a cada 1,5 tela no conteúdo, multiplex no fim (a 150 px ou mais da grade de relacionadas) e 2ª unidade lateral | A da ferramenta |
| Calculadora | O 1º depois dos chips; nunca entre os campos nem dentro do cronograma; um a cada 1,5 tela em "Como funciona" e nas perguntas; multiplex no fim; 2ª unidade lateral | A da calculadora |
| Guia | Um a cada 1,5 tela no texto, nunca dentro da ferramenta embutida nem colado na tabela de medidas; multiplex no fim; 2ª unidade lateral | A do guia |
| Livres | Privacidade, Termos, Sobre, Contato, Licenças, Apoie, 404, offline e "Abrir com": nenhum anúncio | — |

- **Formatos:** unidade de conteúdo responsiva; lateral de 300×600 que não gruda ao rolar; multiplex (`data-ad-format="autorelaxed"`). Automáticos, só âncora e vinheta; side rail e posicionamento automático continuam desligados.
- **Travas, testadas no build de teste:** as de sempre, mais:
  - densidade em até 30%: a soma da altura das caixas de anúncio na coluna principal dividida pela altura do `<main>`, a 360×740;
  - pelo menos 1.110 px entre dois anúncios do conteúdo;
  - card do café a 150 px ou mais de qualquer anúncio;
  - multiplex a 150 px ou mais de qualquer grade de cards.
- **Unidades no AdSense:** cinco áreas (arquivos, dinheiro, casa-saude, utilidades e geral), cada uma com conteudo, lateral e multiplex: 15 unidades. A F12 confere na ajuda do AdSense se a mesma unidade pode aparecer várias vezes na página; se não puder, cria conteudo-2 e conteudo-3 e o modelo do JSON cresce. Formato: `{"arquivos":{"conteudo":"…","lateral":"…","multiplex":"…"}, …, "geral":{…}}`. Área sem ID: o espaço não aparece.

### C. Café "me ajude"

| Lugar | Inglês | Português | Espanhol |
|---|---|---|---|
| Card de resultado | FileOrca is made by one person, with no sign-ups and no limits. If Oli saved you some time, would you help me with a coffee? | O FileOrca é feito por uma pessoa só, sem cadastro e sem limite. Se a Oli te ajudou, me ajuda com um café? | FileOrca lo hace una sola persona, sin registros ni límites. Si Oli te ahorró tiempo, ¿me ayudas con un café? |
| Botão | Buy me a coffee | Me ajude com um café (Ko-fi) · Pagar um café no Pix | Ayúdame con un café |
| Rodapé | Help keep FileOrca free: buy me a coffee | Me ajude a manter o FileOrca grátis: paga um café? | Ayúdame a mantener FileOrca gratis: invítame un café |
| Menu do cabeçalho | Support Oli | Apoie a Oli | Apoya a Oli |
| Título da página de apoio | Help Oli keep swimming | Me ajude a manter a Oli nadando | Ayúdame a que Oli siga nadando |
| Texto da página de apoio | FileOrca is free, with no sign-ups and no limits, and it's made by one person in Curitiba, Brazil. Ads cover the costs; every coffee becomes the next tool. | O FileOrca é grátis, sem cadastro e sem limite, e é feito por uma pessoa só, em Curitiba. Os anúncios pagam os custos; cada café vira a próxima ferramenta. | FileOrca es gratis, sin registros ni límites, y lo hace una sola persona en Curitiba, Brasil. Los anuncios cubren los costos; cada café se convierte en la próxima herramienta. |

As regras de hoje continuam: o pedido aparece no 3º uso com sucesso e depois no máximo uma vez a cada 7 dias; a linha não repete o "Done!" da Oli; o card nunca fica colado num anúncio e não imita anúncio nem o Baixar; sem contagem regressiva, sem culpa e sem bloquear a tela; nenhum texto liga doação a anúncio. O `donate_click` ganha o lugar `menu`.

### D. Tema

- **Três estados:** Sistema (padrão), Claro e Escuro. Um botão no cabeçalho alterna nessa ordem, e o nome acessível diz o estado ("Tema: sistema").
- **Onde fica a escolha:** no localStorage, chave `fo-theme` (`light` ou `dark`; sem a chave, Sistema). É uma preferência funcional pedida pela pessoa: não depende do aviso de cookies, e a Privacidade cita.
- **Sem piscar:** um script inline no `<head>`, antes do CSS, põe o `data-theme` no `<html>`. O CSS já trata o `data-theme` e o `prefers-color-scheme` (F1b, item 7 do v1.1).
- **Sem arquivo JS novo:** a troca é um script inline pequeno, como o do menu de idioma.
- O app instalado e as páginas guardadas pelo service worker seguem a escolha.

### E. Guias e navegação

- **Hub de guias:** /guides/, /pt/guias/ e /es/guias/, com os guias do idioma por grupo (Imagem, PDF e Dinheiro); cartão de guia diferente do de ferramenta (fecha a F5b F-12); introdução própria (gate:conteudo); schema CollectionPage, breadcrumb, OG, sitemap e hreflang entre os três.
- **Breadcrumb de cada guia:** Início › Guias › o guia.
- **Menu do cabeçalho:** no celular, um botão Menu de 48 px que abre um popover sem JS, como o de idioma, com as categorias que existem no idioma, Guias e Apoie. No computador, conforme a sua escolha na F10.
- **Outras entradas:** link "Guias" no rodapé; seção de guias na home, com 3 ou 4 em destaque; em cada ferramenta e calculadora que tem guia, o link para ele no primeiro bloco de conteúdo depois do painel; a busca mostra a categoria "Guias".

### F. Repositório público: auditoria e o seu passo a passo

**A auditoria da F9** fica em .cache/auditoria-publico.md, na sua pasta do projeto, fora do Git. Leia antes de tudo e decida:

- **Segredo achado** (chave, token, senha): gire o segredo no serviço dele e não publique até resolver.
- **Dado pessoal de terceiro** (por exemplo, e-mail pessoal de um blogueiro em docs/lancamento/): tirar do arquivo atual numa run curta resolve o arquivo, mas não o histórico. Avalie se o dado já era público no site da pessoa.
- **GPS nas fotos de teste:** a auditoria lista cada foto com a coordenada. Elas foram tiradas em lugar público de propósito (passo 22 da F0), mas confira se nenhuma aponta para um lugar que você não quer mostrar.
- **E-mail dos commits:** fica público. É o mesmo do seu contato profissional.

Se algo não puder ficar público, pare aqui: reescrever o histórico não está no plano, porque quebra testes e links.

**Se estiver tudo certo, nesta ordem:**

1. Dê o merge da PR da F9 (squash), para a proteção contra fork já estar na main.
2. Settings → General → Danger Zone → Change visibility → Public.
3. Settings → Rules → Rulesets → Import a ruleset → docs/ops/ruleset-main.json (PR obrigatória, check `ci-ok`, sem force push e sem exclusão da main).
4. Settings → Actions → General, na parte de aprovação de workflows de PR de fork: "Require approval for all external contributors".
5. Settings → Code security: ligar Secret scanning, Push protection e Private vulnerability reporting.
6. Settings → General → Features: desligar Wiki, Projects e Discussions. Issues fica, porque os alertas dos workflows usam.
7. Gere o prompt da F9b. Na primeira PR depois disso, confira que o check `ci-ok` aparece e que o merge automático acontece.

## Calendário sugerido

| Quando | O quê |
|---|---|
| Ter 3/nov | (Opcional) apagar as worktrees antigas da pendência "Worktrees"; gerar o prompt da F9 |
| Qua 4/nov | F9 |
| Qui 5/nov | Você: seção F (de 30 a 45 min); F9b |
| Sex 6/nov | F10 |
| Fim de semana | Você: protótipos, ESCOLHAS e a busca reversa da pose `sad` |
| Seg 9/nov | F11 |
| Qua 11/nov | F12 |
| Sex 13/nov | F13a |
| Seg 16/nov | F13b, se precisar; depois, vaga de folga |

O ciclo do Dependabot em 1/dez e o gatilho de casa e saúde em 31/jan/2027 não mudam.

## Como gerar cada prompt

Abra uma conversa com a skill prompt-ultracode e cole, nesta ordem:

```text
Projeto: FileOrca, repositório vmatusita/fileorca, clone em C:\Users\vmatusita\projetos\fileorca (Windows, Git Bash).
Fonte de verdade: a ficha abaixo > PLANO-MELHORIAS.md (seção "Mudanças no contrato") > PLANO-FILEORCA.md > CLAUDE.md e docs/claude/ > DECISOES.md > código.
Regras de toda run: as de "Execução por IA" do PLANO-FILEORCA.md e as de "Regras novas de toda run" do PLANO-MELHORIAS.md.
Último commit da main: <sha>.
O que mudou desde o plano: <decisões novas, pendências da run anterior, a lista do ESCOLHAS marcada quando for F11, F12 ou F13>.

<a ficha da run, inteira>
```

Responda às perguntas da skill; o que você não souber, ela infere e lista como suposição.

## Pendências que este plano fecha

| Pendência (docs/PENDENCIAS.md) | Fase |
|---|---|
| § 242 (verificar local acima de 900 s), § 283 (partes do WebKit), F8 ensaio-3 (teste lento sob carga) | F9 |
| F5b F-12 (cartão de guia igual ao de ferramenta) | F11 |
| F3 c-04 (consentimento reaplicado antes da CMP) e F3 c-08 (falso positivo do detector) | F12 |
| F3 d-02 (laço da Oli e WCAG 2.2.2), F7 e-1, F4-F7 e-2, f-1 e f-2, ajuste-aviso-espaco, F7 f-10, F4 ACE-7 e os grupos 5 (acessibilidade) e 6 (layout) | F10 propõe; F13 faz o que você escolher |

## Fontes

- [GitHub: runners e hardware](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) (repositório público: 4 vCPU e 16 GB, grátis e sem limite; privado: 2 vCPU e 8 GB) e [aviso de 2024 sobre os runners de 4 vCPU](https://github.blog/2024-01-17-github-hosted-runners-double-the-power-for-open-source)
- [GitHub: mudança de preços do Actions em 2026](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/) (uso em repositório público continua grátis)
- [AdSense: mensagem de recuperação de bloqueio](https://support.google.com/adsense/answer/11576085) (modal que não fecha, inclusão e exclusão de páginas) e [tag de recuperação](https://support.google.com/adsense/answer/11575177) (detecção e relatório mesmo com a mensagem em rascunho)
- [Google: API do Privacy & messaging](https://developers.google.com/funding-choices/fc-api-docs) (`getAdBlockerStatus` e `AD_BLOCK_DATA_READY`)
- [Better Ads Standards: densidade de anúncio no celular acima de 30%](https://www.admonsters.com/ad-ops-decoder-what-are-better-ads-standards/)
