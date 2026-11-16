# Fase 19b: Guias novos com dado próprio

## Prompt (copie o bloco inteiro)

```text
ultracode

# Missão

Rode a F19b do FileOrca, "Guias novos", a segunda de duas runs que respondem à recusa do AdSense de 13/nov/2026 ("Conteúdo de baixo valor"). A F19a (Novidades, `lastmod`, Como funciona, Sobre, autoria e o corte da repetição) já está na main. Esta run põe no ar 8 guias novos, no molde dos 15 que existem: cada um embute uma ferramenta ou calculadora que está no ar, e todo número dele vem da medida feita com o motor do próprio site (`pnpm guias:medir`) ou do oráculo independente das calculadoras.

Os 8 guias:

| # | id | caminho em inglês | embute | idiomas |
| --- | --- | --- | --- | --- |
| 1 | `guides-compress-photo-for-online-form` | `/guides/compress-photo-for-online-form/` | Compress image, no modo "Up to a size" | en, pt, es |
| 2 | `guides-webp-vs-avif-vs-jpg` | `/guides/webp-vs-avif-vs-jpg/` | Convert to WebP | en, pt, es |
| 3 | `guides-sign-pdf-without-printing` | `/guides/sign-pdf-without-printing/` | Sign PDF | en, pt, es |
| 4 | `guides-what-a-pdf-password-protects` | `/guides/what-a-pdf-password-protects/` | Protect PDF | en, pt, es |
| 5 | `guides-qr-code-size` | `/guides/qr-code-size/` | QR code generator | en, pt, es |
| 6 | `guides-apr-vs-apy` | `/guides/apr-vs-apy/` | APR to APY calculator | en, es |
| 7 | `guides-credit-card-minimum-payment` | `/guides/credit-card-minimum-payment/` | Credit card payoff calculator | en, es |
| 8 | `guides-how-much-house-can-i-afford` | `/guides/how-much-house-can-i-afford/` | Home affordability calculator | en, es |

Ao terminar:

- a linha 16 está na tabela "Mudanças no contrato" do `PLANO-MELHORIAS.md` (decisão 1), e o § dela está no `DECISOES.md`;
- os 8 guias estão no ar nos idiomas da tabela (21 páginas), cada um no registro, nas rotas, nos textos, no hub de guias, na linha de guias da ferramenta que ele embute, nas relacionadas, na busca, no sitemap com `lastmod`, no hreflang, no OG, no schema, na Novidades e nas contagens do site e do kit de lançamento;
- as medidas dos guias de arquivo estão no `data/guides-measured.json`, num commit antes dos textos, e o `pnpm guias:medir --check` dá zero;
- os exemplos dos guias de dinheiro são casos do oráculo, gravados nas fixtures num commit antes dos textos;
- todo guia novo passa no `gate:conteudo` (800 a 1.500 palavras de texto próprio, sem frase de enchimento), no `guides-numbers.test.ts` (nenhum número à mão) e, os de dinheiro, no `gate:dinheiro-saude`;
- o relatório está em `docs/relatorios/fase-19b.md`, a revisão em `docs/relatorios/REVISAO-F19b.md`, e a PR da branch `fase-19b` sai pronta, com o CI completo verde, e o CI a mescla sozinho.

# Contexto

Você está na raiz do clone de `vmatusita/fileorca`, numa máquina Windows, com o Git Bash. A main está na F19a ou num commit mais novo. Confira com `git log --oneline -5` e guarde no plano o SHA da `origin/main` do começo da run: ele é o "ponto de partida".

No clone, sem commit: `docs/prompts/prompt-fase-19b.md` e `docs/prompts/prompt-fase-19b.txt` (este prompt) e a pasta `Claude outputs/`, que fica fora de tudo.

O que você precisa saber antes de planejar:

- **Por que esta run existe.** O AdSense pede "valor único substancial". Num site de ferramentas, o que nenhum clone tem é o dado próprio: o PLANO ("Conteúdo de apoio") já diz que o que torna um guia difícil de copiar é o teste real, medido por script nas fixtures e citado com a data. Os temas foram escolhidos pelo Victor: ferramentas que ainda não têm guia, com uma pergunta real que uma medida responde.
- **Os dois moldes que existem:**
  - **o guia de arquivo** (F5b): o registro `src/tools/guides/registry.ts` (`FILE_GUIDE_IDS`, `FILE_GUIDES`, o `toolSection`, as datas `GUIDE_REVIEWED_ON` e `GUIDE_PUBLISHED_ON`), a view `src/views/FileGuideView.astro`, as medidas em `scripts/guides/lib/plans.ts` e nos `BUILDERS` de `src/tools/guides/measured.ts`, gravadas pelo `pnpm guias:medir` em `data/guides-measured.json`, os textos em `src/i18n/{en,pt,es}/guide-<slug>.ts` (todo número é `{placeholder}` do JSON, fato oficial de `facts` com a fonte, ou nome técnico de `names`). O roteiro de cinco passos está no `docs/claude/idiomas.md`, seção F5b, "Como acrescentar um guia de arquivo";
  - **o guia de dinheiro** (F4): `GUIDE_IDS` em `src/tools/calc/registry.ts`, os números feitos pelas contas no build em `src/tools/calc/guides.ts` (nenhum resultado escrito à mão; o exemplo principal é o que a calculadora embutida mostra ao abrir, e é um caso do oráculo provado no `tests/unit/calc-guides.test.ts`), a view `src/views/GuideView.astro`, os textos em `src/i18n/{en,es}/guide-<slug>.ts` e as regras de confiança do PLANO ("Confiança em dinheiro e saúde": fórmula, premissas, exemplo, fonte oficial, autor, revisado em, aviso curto), conferidas pelo `gate:dinheiro-saude`.
- **O que a F19a deixou e esta run usa:** o `src/platform/changelog.ts` (a fonte da Novidades e do `lastmod`), o quadro do autor no fim de cada guia (`data-content="author"`, fora da contagem de palavras), o link do nome para o Sobre, e o portão de repetição (`scripts/lib/repeticao.ts`). Leia a seção F19a do `docs/claude/idiomas.md` e o relatório `docs/relatorios/fase-19a.md`.
- **O que cada ferramenta faz hoje** (leia a tabela `specs` de cada uma antes de escrever):
  - o Compress image tem o modo "Up to a size" (de 20 a 10.000 KB, 1 KB = 1.000 bytes; baixa a qualidade primeiro e a dimensão só se precisar; a transparência vira branco);
  - o Convert to WebP converte JPG e PNG para WebP ou AVIF, mantendo a transparência;
  - o Sign PDF desenha a assinatura na página como imagem: não é campo de formulário nem assinatura digital (a tabela dele já diz isso, e o texto da página não dá orientação jurídica);
  - o Protect PDF cifra com AES-256 (revisão 6) pelo qpdf no navegador, com a mesma senha para abrir e de dono, sem restrição; o Unlock PDF tem o modo só de restrições;
  - o QR code generator usa sempre a correção H e põe a Oli no meio;
  - a calculadora de cartão compara pagamentos fixos e avisa quando o pagamento não cobre os juros do primeiro mês; ela não calcula o mínimo que a fatura pede;
  - a calculadora de quanto de casa dá para pagar parte dos limites de 28 % e 36 % da renda, como regra de bolso.
- **O próximo § livre do `DECISOES.md`** é o seguinte ao maior que a F19a deixou; escreva os § na ordem. O grupo novo do `docs/PENDENCIAS.md` é o seguinte ao da F19a.
- **A linha de base:** meça no ponto de partida o número de testes do Vitest, o `--list` do Playwright por navegador, os JS de `dist/_astro/`, as URLs de cada sitemap e as contagens de guias que o site mostra (o hub, a home, o rodapé, o kit).
- **O repositório é público** (§ 338). **O CI roda por classe** (F9): a PR pronta roda tudo e, como esta run não mexe em `.github/`, é mesclada sozinha. **O rótulo `ci`** só existe se o Victor o criou.

Leia antes de planejar, nesta ordem de autoridade:

1. Este prompt. Ele é a ficha da run e vence o resto.
2. O `PLANO-MELHORIAS.md` (as regras de toda run e a tabela "Mudanças no contrato") e o `PLANO-FILEORCA.md` ("SEO agressivo dentro das regras", inteiro, com "Confiança em dinheiro e saúde" e "Conteúdo de apoio"; "Execução por IA").
3. O `CLAUDE.md`, inteiro.
4. De `docs/claude/`: o `idiomas.md` inteiro, o `calculadoras.md` (oráculos e guias de dinheiro), o `imagem.md` e o `pdf.md` (só o que as ferramentas embutidas e as medidas tocam), o `anuncios.md` (o mapa, a distância e a densidade nos guias), o `playwright.md` e o `windows-git-bash.md` (o `uv` fora do PATH nesta máquina está lá).
5. Do `DECISOES.md`, só buscando o §: § 68, § 121, § 184, § 185, § 186, § 188, § 190, de § 197 a § 208, § 223, § 394, § 396, § 557, § 558, § 562, § 733, os § da F19a, e o que eles citarem.
6. Do `docs/design/`: o README do GuideCard e o `README.md` (voz).
7. Do `docs/PENDENCIAS.md`: "Como ler", o Resumo e o grupo da F19a.
8. Do `docs/i18n/`: o glossário de pt e o de es.
9. Do `docs/lancamento/`: o `README.md` e as contagens que o `launch-kit.test.ts` confere.

# Escopo

Dentro: os 8 guias de ponta a ponta e o que eles pedem em volta (decisões 1 a 9), com estes arquivos:

- a linha 16 do `PLANO-MELHORIAS.md`;
- os registros de guia (o de arquivo e o de dinheiro) e os tipos que o guia 5 pede (decisão 4);
- os planos de medida, os `BUILDERS`, o `data/guides-measured.json` e o `data/README.md` se ele descrever o JSON;
- o oráculo das calculadoras e as fixtures, só para os casos novos dos guias 6 a 8 (decisão 5);
- as páginas em `src/pages/`, os textos em `src/i18n/`, os cartões dos `common.ts`, o hub de guias, a linha de guias das ferramentas, as relacionadas, a busca;
- o `changelog.ts` (a entrada desta run) e os textos dela;
- o kit de lançamento, só nas contagens que mudam;
- os testes e os documentos.

Fora (não toque):

- o motor, as ilhas e o comportamento das ferramentas e calculadoras. Um defeito que a medida achar vira uma linha no grupo novo do `PENDENCIAS.md` e uma frase verdadeira no guia, nunca uma correção nesta run;
- os 15 guias que existem, além do que a contagem, o hub e as relacionadas pedem;
- guia de casa ou de saúde;
- fixtures novas ou mudadas (as medidas usam as que existem; o `pnpm fixtures` não roda);
- o `lighthouserc.json`, o `.github/`, o `.githooks/` e o `.claude/settings.json`;
- chave nova no `localStorage`, no `sessionStorage` ou no IndexedDB; evento ou parâmetro novo no GA4; dependência nova;
- link para o repositório do FileOrca;
- o `PLANO-FILEORCA.md`, o `PLANO-UX-QV.md`, o `CLAUDE.md` e os § antigos; os itens do `PENDENCIAS.md` que esta ficha não cita.

# Decisões já tomadas (registre cada uma no DECISOES.md, a partir do próximo § livre)

0. **O primeiro passo: a F19a está na main?** Antes de qualquer branch ou commit, confira na `origin/main`: o `src/platform/changelog.ts`, a rota `how-it-works` em `src/i18n/routes.ts`, o `scripts/lib/repeticao.ts` e o `docs/relatorios/fase-19a.md`. Se faltar qualquer um, pare aqui: não crie branch, não commite e termine com uma resposta curta em português dizendo o que falta e que a F19b roda depois do merge da F19a. Isso não é pergunta: é a falta da entrada que esta ficha exige.

1. **A linha 16 do contrato.** Na tabela "Mudanças no contrato" do `PLANO-MELHORIAS.md`, depois da 15, com este texto:

   | 16 | Guias | "F5: 10 guias de como fazer com a ferramenta embutida (...) e depois da F5 não há guia novo planejado" (PLANO, "Conteúdo de apoio") | Guias novos entram por ficha de fase, no molde dos que existem: embutem uma ferramenta ou calculadora no ar, todo número vem da medida (`guias:medir`) ou do oráculo, e cada um passa no `gate:conteudo`. A F19b põe 8 (5 de arquivo em en, pt e es; 3 de dinheiro em en e es). Guias de casa e de saúde continuam fora. |

   Ajuste só a forma da tabela (as colunas e o escape do `|`), nunca o sentido. O § cita esta decisão.

2. **O guia de arquivo segue o roteiro da F5b** (`docs/claude/idiomas.md`), um por um: o id e a entrada no registro (a ferramenta embutida, o hub, até 6 relacionadas, o `toolSection`); o plano de medida e o `BUILDERS`; o `pnpm guias:medir` e o JSON num commit antes do texto; os textos de en, pt e es com os placeholders; a página com a ferramenta embutida pelo componente dela (§ 184); o caso no `CASES` do `tool-guides.spec.ts`. As datas: a revisão e a primeira publicação dos guias novos são o dia da medida, nunca antes dela (§ 207); os 10 guias que existem não mudam de data. Os caminhos em pt e es saem dos glossários, num §.

3. **O que cada guia de arquivo mede.** O plano segue a regra do caminho da pessoa (navegador onde o site escreve pelo canvas, Node onde é WASM, pdf-lib ou qpdf) e só usa as fixtures que existem. Toda frase diz a amostra, nada generaliza além dela (a lista `GENERAL`), e nenhum tempo é medido nem prometido.
   1. **Foto abaixo do limite de um formulário:** as fotos de celular das fixtures no "Up to a size" a 100, 200 e 500 KB: os bytes da saída, se a dimensão precisou cair e para quanto, a qualidade a que o motor chegou. O texto explica a conta de 1 KB do site (1.000 bytes, a leitura menor, que serve também a quem conta 1.024) e o que fazer com uma foto que precisa de uma dimensão exata (o Resize). Um limite de um formulário real só entra com a página oficial dele lida nesta run; sem ela, nenhum formulário é citado.
   2. **WebP, AVIF ou JPG:** as mesmas fotos e um PNG com transparência das fixtures (se não houver, a parte da transparência sai do guia): os bytes do JPG (Compress image, Recommended), do WebP e do AVIF (Convert to WebP), a relação com o original, a transparência mantida ou não. O suporte dos navegadores só com fonte oficial (MDN ou a documentação do navegador), com a data da leitura. Nada de "o melhor formato": a tabela mostra a amostra, e o texto diz quando cada um serve.
   3. **Assinar um PDF sem imprimir:** os PDFs das fixtures assinados nos três modos (desenhar, imagem, digitar): as páginas, os bytes antes e depois, o texto da página ainda extraível, a assinatura como imagem na página, nenhum campo de assinatura nem de formulário novo. O texto separa a assinatura desenhada (o que a ferramenta faz) da assinatura digital com certificado (o que ela não faz), e diz que a validade depende de quem recebe e da lei do lugar, com uma fonte oficial de legislação por idioma, lida nesta run. Sem orientação jurídica; sem fonte, a frase fica só no que a ferramenta faz.
   4. **O que a senha de um PDF protege:** as fixtures protegidas pelo Protect PDF: o dicionário de cifra (AES, 256 bits, revisão 6), abrir sem a senha falha e com ela abre, os bytes a mais; uma fixture só com restrições, que o Unlock PDF abre sem senha no modo de restrições (medido com a própria ferramenta; se não houver fixture assim, essa parte fica no que a tabela do Unlock PDF diz, sem número). O texto diz o que a senha de abrir protege, o que as restrições não protegem e que uma senha curta se adivinha, sem prometer o que não foi medido.
   5. **Tamanho do QR code:** textos de comprimentos crescentes (links curtos e longos, um texto com acento) no QR code generator, na correção H do site: a versão, os módulos por lado, o tamanho do PNG exportado e a leitura de volta com a Oli no meio (o jsQR, como o `qr-code.spec.ts`). A zona de silêncio e a correção H com fonte oficial (a Denso Wave, que criou o QR code), lida nesta run. O tamanho impresso entra só como conta (módulos × milímetros por módulo); uma recomendação de tamanho mínimo, só com fonte oficial.

4. **O guia 5 e o tipo.** O registro de guias de arquivo só aceita ferramenta de imagem ou de PDF (`FileGuideTool`, `FileGuideHub`). Estenda os tipos para o QR code generator, com o menor desvio possível: o QR code ganha um grupo novo no hub de guias e no rodapé (Utilidades, nos três idiomas, pelos glossários), e o breadcrumb do guia segue o do QR code. Registre num §. Se o desvio ficar grande, a válvula da decisão 9 se aplica a ele.

5. **O guia de dinheiro segue o molde da F4**, com o exemplo principal sendo um caso do oráculo:
   - os casos novos entram em `scripts/oracle/calc.py`, as fixtures são regeradas com o comando do `CLAUDE.md` (`uv run --no-project --python 3.13 --with numpy-financial==1.1.0 python scripts/oracle/calc.py`, com `--only <id>` onde servir) e vão num commit antes dos textos. O `calc-oracle.test.ts` confere o SHA-256 do script: o hash novo entra no mesmo commit, com §. Nunca gere um esperado rodando o motor do site;
   - cada guia tem a fórmula, as premissas, o exemplo resolvido, a tabela feita pelas mesmas contas, a fonte oficial (CFPB, Federal Reserve), o autor, o "Revisado em" e o aviso curto (ferramenta educativa, não é recomendação financeira). Nada de taxa do dia, previsão de juros ou indicação de banco ou produto;
   - **o guia 6 (APR e APY):** uma APR nos compostos que a calculadora oferece, e a diferença que cada um dá;
   - **o guia 7 (cartão):** a calculadora não calcula o mínimo da fatura, então o guia não finge que calcula. Ele compara o pagamento que mal cobre os juros com pagamentos fixos maiores (meses e juros totais), e explica com fonte do CFPB por que o mínimo da fatura demora tanto. O título promete só o que o guia mostra (num §, se mudar o da tabela);
   - **o guia 8 (casa):** os limites de 28 % e 36 % como regra de bolso, nunca como regra de lei (a frase da calculadora), com fonte do CFPB, e o exemplo do oráculo.

   Os de dinheiro existem em en e es, como os 5 de hoje: o espanhol mira o público hispânico dos EUA (US$, número no formato dos EUA).

6. **O que gira em volta.** Para cada guia: o cartão no hub de guias (o grupo certo), a linha de guias da ferramenta que ele embute (`guidesOfTool` e o equivalente das calculadoras), as relacionadas (até 6, só páginas que existem no idioma), a busca (termos que não colidam com as consultas dos testes, § 190), o sitemap com o `lastmod` da entrada desta run, o hreflang, o OG, o Article com o autor (o grafo que a F19a deixou), o quadro do autor com a frase de como os números foram obtidos, as contagens de guias do site (hub, home, rodapé, Sobre) e do kit de lançamento. A entrada desta run no `changelog.ts` (`pr: null`, a data do dia da run em Brasília) toca os 21 guias e as páginas cuja linha de guias mudou; o tipo dessas é decisão sua, num §.

7. **Os anúncios.** Os guias novos entram na área de anúncio do grupo deles, como os irmãos (arquivo nos guias de imagem e PDF, dinheiro nos de dinheiro; o do QR code na área do QR code). No build de teste com IDs, a distância de 150 px e a densidade de até 30 % passam em cada página nova, e o `fo-ad-map.spec.ts` conta as páginas novas.

8. **O portão de repetição da F19a** vale também para os 8 guias novos: nenhuma frase quase igual em duas partes do mesmo guia. Os fatos recorrentes das ferramentas (o envio, o aparelho) não se repetem no guia: o guia aponta para a Como funciona quando precisar.

9. **A válvula.** A ordem de construção é: os guias 1 a 4; depois os de dinheiro, 6 a 8; por último o 5 (que estende os tipos). Se a run estourar, o guia 5 e, depois dele, os de dinheiro vão para uma run `fase-19c`, com o §, o grupo novo do `PENDENCIAS.md` e a linha no relatório; a linha 16 continua dizendo "8" e o relatório diz quantos entraram. Nunca se corta: os guias 1 a 4 nos três idiomas, as medidas antes dos textos, os portões.

# Armadilhas conhecidas

- **O `pnpm guias:medir` grava o dia em UTC.** Depois das 21h em Brasília a medida já é do dia seguinte, e as datas de revisão e de publicação nunca ficam antes dela (§ 207). Ele fica fora do `verificar` e lê o `dist/`: rode o `pnpm build` antes.
- **Quando medir de novo:** mudou o motor, o script de medidas (o teste compara o SHA-256), uma fixture ou a versão do Playwright. Esta run não muda nenhum deles: as medidas dos 10 guias que existem não podem mudar, e o `--check` prova.
- **Nenhum algarismo à mão num texto de guia** (`guides-numbers.test.ts`): contagem por extenso também é número; use `{nome_word}` ou tire a contagem. A frase diz a amostra, um mínimo ou um máximo diz a direção, e a data da medida não vai para as fontes.
- **A ferramenta embutida usa o `<script>` do componente da própria ferramenta** (§ 184): um `<script>` que importe o mesmo `mount.ts` em outro componente faz o Rolldown criar um chunk comum, e a página da ferramenta passa a 3 arquivos. O QR code ainda não foi embutido em guia: confira o orçamento da página dele antes e depois.
- **Uma consulta da busca que traz um guia muda por construção** (§ 190): dê ao guia termos que não colidam com as consultas dos testes.
- **O `.text` do `node-html-parser` cola o texto de elementos vizinhos:** use `structuredText` para contar palavras.
- **O `uv` fica fora do PATH nesta máquina** (`docs/claude/windows-git-bash.md`).
- **O `lint:texto` tem uma pegadinha nos textos de dinheiro** (os placeholders, `docs/claude/calculadoras.md`).
- **O kit de lançamento:** toda frase técnica em inglês do kit contém uma frase provada (§ 205); esta run só muda contagens nele.
- **O `serve-dist` devolve o 404 mais próximo:** teste de página exige o status 200.
- **Dois Playwright no mesmo checkout** convivem com `--output=<pasta própria>` no segundo, e cada worktree usa o próprio `FO_PORT`. O Playwright do Windows pode não sair depois do último teste, e o `net::ERR_NO_BUFFER_SPACE` no meio do `verificar --partes` é dos soquetes do Windows: veja o `docs/claude/playwright.md`.
- **A guarda da worktree isolada recusa heredoc com `node` ou `git` no mesmo `&&`:** grave o arquivo com a ferramenta de escrita e rode cada comando sozinho.
- **O "antes":** monte o `dist/` da `origin/main` numa worktree à parte (`dist-base`).

# Critérios de aceitação (cada um com evidência no relatório)

1. A linha 16 e o § dela.
2. Os guias que entraram (8, ou os que a válvula deixou) estão no ar nos idiomas da tabela, com status 200, e passam no `gate:conteudo` (800 a 1.500 palavras de texto próprio, sem enchimento), no `guides-numbers.test.ts`, no `guide-page.test.ts`, no `guides-entries.test.ts`, no `guides-measured.test.ts` e no portão de repetição.
3. O `pnpm guias:medir --check` dá zero, com o JSON novo num commit antes dos textos; as medidas dos 10 guias antigos não mudaram.
4. Os exemplos dos guias de dinheiro são casos do oráculo, num commit antes dos textos, e o `calc-guides.test.ts`, o `calc-oracle.test.ts` e o `gate:dinheiro-saude` passam.
5. Cada fato oficial tem a fonte lida nesta run, com a data da leitura; nenhuma frase jurídica, médica ou de recomendação financeira; nenhum formulário real citado sem a página oficial.
6. Os guias estão no hub, na linha de guias da ferramenta, nas relacionadas, na busca, no sitemap com `lastmod`, no hreflang, no OG, no schema, na Novidades e nas contagens; o `gate:seo`, o `gate:links`, o `changelog.test.ts` e o `launch-kit.test.ts` passam.
7. No build de teste com IDs, a distância e a densidade passam em cada página nova; o orçamento de cada guia é o dos irmãos (o `budgets.spec.ts` e o `i18n-budgets.spec.ts`), e a página do QR code não ganhou arquivo JS.
8. Lighthouse ≥ 90 nas quatro categorias numa amostra de guias novos (um de cada molde e o do QR code), axe sem violação e CLS sem gesto 0.
9. Nada sai do aparelho, e nenhum evento, parâmetro ou chave nova aparece: os specs de privacidade, o `launch-claims.spec.ts` e o `events.spec.ts` passam com os guias novos no caminho.
10. O `lint:texto` dá 0 erro; o `english-leak.test.ts`, o `glossary.test.ts`, o `claude-md.test.ts` e o `pendencias.test.ts` passam.
11. Os testes antigos que mudaram estão num §, um por um; nenhum teste foi pulado, desligado ou afrouxado.
12. O `docs/claude/idiomas.md` ganhou a seção F19b (o que mudou no roteiro, o guia de QR code, o que a run aprendeu), e o `PENDENCIAS.md` o grupo novo.
13. O `pnpm verificar --partes` passou na máquina, com a saída real no relatório, e o CI completo está verde.
14. A revisão adversarial está em `docs/relatorios/REVISAO-F19b.md`, sem achado alto ou médio aberto.

# Verificação: rode de verdade

- **A linha de base, antes de mudar código,** no `dist-base`: o build, o número de testes do Vitest, o `--list` de cada navegador, os JS de `dist/_astro/`, os sitemaps, as contagens de guias, o `pnpm guias:medir --check` (tem de dar zero no ponto de partida) e o orçamento da página do QR code. Os controles negativos: as rotas novas dão 404.
- **Em cada fatia:** `pnpm tipos`, `pnpm lint`, `pnpm build`, o Vitest dos arquivos tocados e os specs que a fatia toca, nos dois projetos: `guide-page.spec.ts`, `tool-guides.spec.ts`, `guides-hub.spec.ts`, `guides-search.spec.ts`, `navigation.spec.ts`, `qr-code.spec.ts`, `a11y.spec.ts`, `layout-shift.spec.ts`, `budgets.spec.ts`, `i18n-budgets.spec.ts`, `launch-claims.spec.ts`, os de privacidade e o `events.spec.ts`; no build de teste com IDs, o `ads.spec.ts` e o `fo-ad-map.spec.ts`. E os portões: `pnpm gate:conteudo`, `gate:seo`, `gate:links`, `gate:dinheiro-saude` e o `gate:prontidao`.

  Leia a falha, corrija a causa e repita até passar.
- **As medidas antes dos textos:** o commit do JSON e o das fixtures do oráculo vêm antes do commit de cada texto que os usa; o relatório mostra os hashes.
- **Nunca afrouxe um limite** para um teste passar.
- **O Lighthouse** com uma configuração temporária em `.cache/`, sem mudar o `lighthouserc.json`.
- **O `pnpm verificar --partes` roda uma vez,** no último commit de código, com a máquina livre. Se uma parte falhar, rode a mesma parte no ponto de partida, numa worktree: falhando igual, a falha não é desta run (registre num § e siga); senão, ache o que esta run mudou e corrija.
- **No CI:** `gh pr checks <n> --watch`, `gh run view <id> --log`, e o `pnpm ci:custo <id>` da última execução no relatório (regra 5).

# Autonomia e decisões

Você está rodando sozinho, e ninguém vai responder. Não pare para perguntar nem espere confirmação, em hipótese nenhuma. A única parada prevista é a da decisão 0, antes de qualquer mudança.

Régua de decisão:

1. Este prompt.
2. O `PLANO-MELHORIAS.md` (com a linha 16), o `PLANO-FILEORCA.md`, o `CLAUDE.md`, o `docs/claude/` e o `docs/design/`.
3. O `DECISOES.md` e o código: os 15 guias que existem são o modelo de cada peça.
4. Na dúvida, a opção mais simples e mais reversível que não piore o orçamento, a acessibilidade, o anúncio nem o tempo do CI.

Toda decisão que não está escrita aqui vira um § no `DECISOES.md`, com as alternativas e o porquê. Exemplos: os caminhos em pt e es; o título final de cada guia; as fixtures de cada plano de medida; as fontes oficiais de cada fato; o `toolSection` de cada guia; as relacionadas; os termos da busca; o grupo e a área de anúncio do guia do QR code; os casos novos do oráculo; cada teste antigo que mudou.

Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca.

Bloqueio real não para a run: siga com o resto e registre a pendência, com o que falta para resolver. Exemplos: o rótulo `ci` não existe; uma página oficial não abre (a frase sai e a pendência vai para o grupo novo); uma medida mostra um defeito do motor (a frase verdadeira fica no guia e o defeito vai para o grupo novo); a main muda no meio da run (`git fetch` e `git merge origin/main`, nunca rebase, renumerando os § se colidirem).

# Git e segurança

- **Começo:**
  - `git switch main` e `git pull --ff-only`;
  - a decisão 0, antes de qualquer branch;
  - o `git status` pode mostrar, sem rastreio, os dois arquivos deste prompt e a pasta `Claude outputs/`. Qualquer outra coisa: não mexa, não commite e registre;
  - `git switch -c fase-19b`. O primeiro commit leva os dois arquivos deste prompt; se eles não estiverem lá, grave este prompt, exatamente como o recebeu, em `docs/prompts/prompt-fase-19b.txt`.
- **Commits** pequenos e frequentes, com mensagem em inglês no padrão da main. Adicione por caminho, nunca `git add -A`.
- **A PR em rascunho** abre logo depois do primeiro push, num comando separado do push: `gh pr create --draft --base main --head fase-19b`, com o título "F19b: guias novos com dado próprio". O título e a descrição vão em português, e a descrição diz que o merge é do CI.
- **Push nos marcos.** A prévia de cada push fica em `https://fase-19b-fileorca.vmatusita.workers.dev/`, no build padrão, sem anúncio.
- **Agentes em worktree** (regra 6 do `CLAUDE.md`): o primeiro passo de cada um é `git merge --ff-only fase-19b`, e todo merge de volta leva o trailer `Co-Authored-By` (`git merge --no-ff -F <arquivo>`). As worktrees são removidas no fim com `git worktree remove`.
- **No GitHub, a run só faz isto:** o push da branch; na PR dela, `gh pr create`, `gh pr ready`, `gh pr edit` (só a descrição e o rótulo `ci`) e o `gh pr ready --undo` depois de uma execução final vermelha; leitura (`git fetch`, `gh pr view`, `gh run`, `gh pr checks`, `gh label list` e `gh api` sem método); um `gh run rerun` por falha que pareça instável, registrado.
- **Na web, só leitura:** as páginas oficiais das fontes dos guias.
- **Nunca:** push na main, force push, `git reset --hard`, `--amend` ou `--no-verify`; mexer em `core.hooksPath` ou em `.githooks/`; `gh pr merge`, `gh label` (além do `list`), `gh api` com método de escrita, `gh secret`, `gh variable` ou `gh repo`; editar o `PLANO-FILEORCA.md`; postar, criar conta ou mexer no Search Console e no AdSense (são do Victor); `wrangler deploy` em qualquer forma. O `.claude/settings.json` nega boa parte disso. Não tente contornar.

# Como trabalhar

0. **A decisão 0,** sozinho, antes de tudo.
1. **Explorar,** com subagentes Sonnet em paralelo, cada um voltando só com um resumo:
   - (a) este prompt num checklist "requisito → onde vai ficar → que teste ou comando prova";
   - (b) um guia de arquivo de ponta a ponta (o `guides-jpg-vs-png` e o `guides-photos-to-one-pdf`): registro, plano, `BUILDERS`, JSON, textos, página, testes;
   - (c) um guia de dinheiro de ponta a ponta (o `guides-extra-mortgage-payments`): registro, `guides.ts`, oráculo e fixtures, textos, página, `gate:dinheiro-saude`;
   - (d) as cinco ferramentas e as três calculadoras embutidas: a tabela `specs`, o que o motor faz e as fixtures que cada uma aceita;
   - (e) quem lê os registros de guia (hub, home, rodapé, Sobre, busca, linha de guias, relacionadas, OG, kit) e os testes que fixam contagens e listas;
   - (f) o QR code: o componente, a ilha, o orçamento, o `qr-code.spec.ts` e o que embuti-lo num guia pede;
   - (g) as fontes oficiais de cada guia (a lista, lida e com a data).
2. **A linha de base** (seção "Verificação").
3. **Planejar.** Escreva `docs/relatorios/fase-19b-plano.md`, autossuficiente. Ele é o gabarito da revisão final e traz: o ponto de partida e a linha de base; os § reservados; por guia, o plano de medida ou os casos do oráculo, as fixtures, as fontes, o esqueleto das seções e o `toolSection`; a interface que as frentes dividem (os ids, os caminhos, as chaves dos textos novos, os registros) e o dono de cada arquivo que mais de uma frente toca (o `registry.ts` dos guias, o `calc/registry.ts`, os `common.ts`, o `routes.ts`, o `plans.ts`, o `measured.ts`, o `calc.py`); quem faz o quê e a ordem das fatias (decisão 9); cada critério ligado a um teste ou comando.
4. **Implementar** em fatias, cada uma com as verificações verdes antes da próxima:
   1. **O agente principal:** o primeiro commit, o push e a PR em rascunho; a linha 16; os ids nos registros, as rotas dos idiomas e os tipos; as páginas mínimas em inglês; os § reservados. Com o `pnpm tipos` e o `pnpm build` verdes, commit e push.
   2. **As frentes ao mesmo tempo,** cada uma num agente `opus` na sua worktree, a partir desse commit:
      - **M (medidas):** os planos de medida dos guias 1 a 5, o `BUILDERS`, o `pnpm guias:medir` e o commit do JSON, primeiro dos guias 1 a 4 e depois o do 5;
      - **O (oráculo):** os casos dos guias 6 a 8 no `calc.py`, as fixtures, o hash, o `guides.ts` e o `calc-guides.test.ts`;
      - **E (textos em inglês):** os 8 textos em en, cada um depois do commit das medidas ou dos casos dele, com as fontes;
      - **T (pt e es):** os textos em pt e es dos guias de arquivo e em es dos de dinheiro, depois do en de cada um, com os glossários e o `lint:texto`;
      - **S (o site):** o hub, a linha de guias, as relacionadas, a busca, o OG, o schema, o quadro do autor, a entrada no `changelog.ts`, as contagens, o kit, o guia 5 nos tipos e no hub, e os testes que leem tudo isso.

      O agente principal faz, ao mesmo tempo, o que não colide com elas: o `docs/claude/`, o `PENDENCIAS.md` e os §.
   3. **O agente principal junta as frentes,** resolve os conflitos, deixa o `pnpm tipos` verde, roda os specs das frentes nos dois navegadores e os de anúncio no build de teste, e faz a conferência no Linux com o rótulo `ci`, se ele existir.
   4. **O agente principal fecha:** o orçamento contra o `dist-base`, o Lighthouse da amostra, as imagens do relatório (um guia de cada molde e o do QR code, a 360 e a 1280 px, claro e escuro).
5. **A revisão adversarial final,** no método da F3 (`docs/claude/windows-git-bash.md`): sobre um commit fixo da branch, numa worktree só de leitura, com o próprio `pnpm install --frozen-lockfile`, o próprio build e o próprio build de teste; contra este prompt e o plano; cada lente com o próprio `FO_PORT`, escrevendo só no `.cache/lente-<x>/`. Há guias de dinheiro, então são cinco lentes Sonnet em contexto limpo (regra 3), apontando só lacunas de correção ou de requisito, nunca preferência de estilo:
   - (a) **as medidas e os números:** os planos contra a regra do caminho, o JSON, os placeholders, a amostra dita, nada generalizado, as medidas antigas iguais;
   - (b) **os textos em en, pt e es:** a voz, os glossários, o enchimento, a repetição, as frases jurídicas e de segurança do guia de assinatura e do de senha, as fontes;
   - (c) **dinheiro:** o oráculo e as fixtures, as fontes do CFPB e do Fed, o aviso, nenhuma recomendação, o `gate:dinheiro-saude`, o título do guia 7;
   - (d) **o SEO e o site:** as rotas, o hreflang, o sitemap e o `lastmod`, a Novidades, o hub, a linha de guias, a busca, o OG, o schema, as contagens, o kit, o guia 5 nos tipos;
   - (e) **o anúncio, o orçamento, a acessibilidade e o CI:** a distância e a densidade, os JS (a página do QR code inclusive), o axe, o Lighthouse, o CLS e as partes.

   Cada achado médio ou acima tem um cético próprio, que tenta refutá-lo ("na dúvida, refutado"); os baixos de cada lente vão a um cético só. As correções ficam num agente só (`opus`), e uma segunda passada das lentes dos achados corrigidos revisa o diff delas. Os baixos que sobrarem vão para o grupo novo do `docs/PENDENCIAS.md`. Tudo fica em `docs/relatorios/REVISAO-F19b.md`.
6. **Fechar:** o `pnpm verificar --partes`, o relatório e o fim pela regra 1 do `CLAUDE.md`.

# Relatório final

Escreva `docs/relatorios/fase-19b.md` em português, no formato do `fase-18.md`, commitado na branch antes do `gh pr ready`. Ele traz:

- o resumo: os guias que entraram e o que cada um responde, em até cinco linhas;
- o que entrou, por decisão, com os arquivos e os §;
- a evidência de cada critério, com a saída real dos comandos e dos specs, e os controles negativos com a mensagem de erro;
- as tabelas: por guia, as palavras de texto próprio, as medidas ou os casos do oráculo, as fontes com a data da leitura e o caminho em cada idioma; as contagens de guias antes e depois (site e kit); o orçamento de cada guia novo e da irmã; a distância e a densidade; o Lighthouse da amostra;
- os hashes do commit do JSON das medidas e do commit das fixtures do oráculo, antes dos textos;
- o número de testes do Vitest e do `--list` de cada navegador, antes e depois, e os testes antigos que mudaram, com o § de cada um;
- a saída real do `pnpm verificar --partes`, com o tempo de cada parte e a soma;
- o custo (regra 5);
- o resumo da revisão, apontando para o `REVISAO-F19b.md`;
- as imagens de `docs/relatorios/fase-19b/`;
- o link da prévia;
- as decisões novas, apontando os §, e o que a válvula cortou, se cortou;
- **a lista do que é do Victor, em passos:**
  1. `git pull` e, na prévia ou no fileorca.com depois do deploy, ler um guia de cada molde no celular e no computador, usando a ferramenta embutida.
  2. No Search Console, pedir a indexação de cada guia novo (a lista vai aqui, com os caminhos).
  3. Acompanhar no Search Console, por algumas semanas, as impressões e os cliques do site. Pedir a nova revisão do AdSense quando os cliques orgânicos estiverem subindo: no AdSense, em Sites, abrir o fileorca.com e pedir a revisão.
  4. Se ainda não postou, usar os textos de `docs/lancamento/` (Show HN, diretórios, Product Hunt): tráfego de gente de verdade é o "interesse do usuário" que a recusa pediu.
  5. Se a válvula cortou guias, gerar o prompt da `fase-19c` com esta skill, a partir do grupo novo do `PENDENCIAS.md`.

Termine a resposta final com um resumo de cinco linhas em português, o link da PR, o estado do CI (mesclada ou esperando, e por quê) e os passos do Victor.

# Idioma

Em português: a narrativa, o plano, a revisão, o relatório, o `DECISOES.md`, o `docs/PENDENCIAS.md`, o `docs/claude/`, o `PLANO-MELHORIAS.md` (a linha 16) e a descrição da PR. O site fala inglês, português e espanhol, nos arquivos de tradução de cada idioma; o kit de lançamento, na língua de cada texto pronto.

Em inglês: o código, os nomes de arquivo, os identificadores, as classes do CSS e os commits.
```

## Como executar

Rode só depois que a PR da F19a for mesclada. Se você colar antes, a run para no primeiro passo sem mudar nada.

### 1. Pré-voo (uns 10 min)

No PowerShell:

```powershell
cd C:\Users\vmatusita\projetos\fileorca
git switch main
git pull --ff-only
git log -1 --oneline        # a F19a ou mais novo
Test-Path src\platform\changelog.ts   # True: a F19a está na main
git status                  # sem rastreio: os 2 arquivos de prompt da F19b e "Claude outputs\"
git config core.hooksPath   # .githooks
gh auth status
claude --version            # 2.1.83 ou mais
uv --version                # o oráculo dos guias de dinheiro usa o uv
```

Se o `uv --version` falhar no PowerShell, tudo bem: a run sabe achar o `uv` fora do PATH (está no `docs/claude/windows-git-bash.md`). Ele só precisa estar instalado.

Depois:

1. **O rótulo `ci`,** se ainda não criou (Issues → Labels → New label `ci`).
2. **A energia:** `powercfg /change standby-timeout-ac 0`. Volte ao normal depois da run.
3. **O disco:** até sete worktrees (a base, cinco frentes e a revisão) e o `guias:medir` com o navegador. Deixe uns 25 GB livres.

### 2. Rodar

```powershell
claude --model opus --permission-mode auto -n fase-19b
```

Cole o conteúdo inteiro de `docs\prompts\prompt-fase-19b.txt` e deixe rodar.

Opcional, logo depois de colar:

```text
/goal os guias da F19b no ar nos idiomas da tabela, o pnpm guias:medir --check com zero, o gate:conteudo e o gate:dinheiro-saude verdes, o pnpm verificar --partes verde, docs/relatorios/REVISAO-F19b.md sem achado alto ou médio aberto e a PR da fase-19b pronta, com o ci-ok verde
```

Se cair ou o limite acabar: `claude --resume fase-19b` e "continue de onde parou: leia docs/relatorios/fase-19b-plano.md, o git log da branch fase-19b e o estado da PR, e siga".

Headless:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new()
Get-Content -Raw -Encoding utf8 docs\prompts\prompt-fase-19b.txt |
  claude -p --model opus --permission-mode auto --output-format json > $HOME\run-fase-19b.json
(Get-Content $HOME\run-fase-19b.json | ConvertFrom-Json).session_id
```

O modo `auto` cobre o que a run faz (pacotes, `uv`, builds, Playwright, PR, `gh` de leitura, WebFetch das fontes). O que é proibido já está negado no `.claude/settings.json`, e o prompt não pede nada disso. `$env:CLAUDE_CODE_SUBAGENT_MODEL = "sonnet"` barateia os subagentes.

### 3. Acompanhar

- O plano em `docs\relatorios\fase-19b-plano.md` mostra, por guia, o que vai ser medido e as fontes: confira se os temas batem com o que você quer.
- A prévia fica em `https://fase-19b-fileorca.vmatusita.workers.dev/`.

### 4. Ao voltar

1. Leia o `docs\relatorios\fase-19b.md` e confira os hashes: as medidas e o oráculo vieram antes dos textos.
2. Leia um guia de arquivo inteiro e um de dinheiro: os números têm de ter a amostra e a data, e nenhuma frase pode prometer o que não foi medido.
3. Siga a lista do que é seu, no fim do relatório. A nova revisão do AdSense é o último passo, não o primeiro.

## Suposições que fiz

- A F19b só roda com a F19a na main: ela usa o `changelog.ts`, o quadro do autor e o portão de repetição que a F19a cria.
- Os guias novos pedem a linha 16 do contrato, porque o PLANO diz que não há guia novo depois da F5. O texto da linha está na decisão 1; rodar o prompt é a sua aprovação dela.
- Os caminhos em inglês estão na tabela da Missão; os de pt e es saem dos glossários, decididos pela run.
- O guia de cartão não promete calcular o mínimo da fatura, porque a calculadora não faz essa conta; ele compara pagamentos fixos e explica o mínimo com fonte do CFPB.
- Os guias de dinheiro saem em en e es (sem pt), como os 5 de hoje; os de arquivo nos três idiomas.
- Nenhuma fixture nova: as medidas usam as fotos, os PNG e os PDFs que já estão em `fixtures/`.
- Se o guia do QR code pedir mudança grande nos tipos, ele é o primeiro a ir para uma `fase-19c`.
