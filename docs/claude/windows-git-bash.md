# Windows, Git Bash, worktrees e agentes

O que as runs aprenderam sobre o Windows, o Git Bash, o Git, o uv, as worktrees, os agentes e a revisão adversarial, com o texto igual ao do CLAUDE.md até a F9 e sob o cabeçalho de origem; as runs acrescentam no fim, numa seção nova.

## F1a: comandos e pegadinhas

Pegadinhas que a F1a achou:

- No Git Bash do Claude Code, heredoc pode engolir `\\` e falhar com aspas; escreva arquivos com a ferramenta de edição.
- `git push` e `gh pr create --base main` na mesma linha casam com a regra de negação de push na main do `.claude/settings.json`: rode em comandos separados.

## F1b: design system e Oli

Pegadinhas que a F1b achou:

- No Git Bash, `cat >> arquivo <<'EOF'` com texto longo em português falhou com "unexpected EOF": escreva com a ferramenta de edição.

## F3: revisão e prontidão

Método da revisão adversarial (DECISOES § 92 a § 94):

- Seis lentes Sonnet em contexto limpo: corretude, privacidade, anúncio, acessibilidade, desempenho e SEO, e design system.
- Elas rodam sobre um commit fixo, numa worktree só de leitura (`git worktree add --detach .claude/worktrees/revisao-f3 <commit>`, com o próprio `pnpm install --frozen-lockfile` e `pnpm build`).
- Cada lente tem o próprio `FO_PORT` (4174…4179) e a própria `--output`, e escreve só em `.cache/lente-<x>/` da worktree.
- Cada achado crítico, alto ou médio tem um cético próprio que tenta refutar. Os baixos de cada lente vão a um cético só.
- As correções ficam num agente só. Depois, uma segunda passada revisa o diff.
- Remova a worktree no fim com `git worktree remove`.

Pegadinhas que a F3 achou:

- No Git Bash, `node -e "…"` com crases no texto JS executa as crases como comando do shell e estraga o texto (aconteceu com um § do DECISOES). Texto com crase vai para um arquivo, pela ferramenta de escrita, e o script Node o lê.

## F4: calculadoras

Pegadinhas que a F4 achou:

- O uv desta máquina foi instalado pelo `winget` e não está no PATH do PowerShell nem do Git Bash: chame pelo caminho completo (`…\WinGet\Packages\astral-sh.uv_…\uv.exe`). Não há `python` no PATH; o `uv run … python -I script.py` serve para script de apoio também.
- No Git Bash, heredoc com apóstrofo (`cat <<'EOF'` com "mortgage pages'") quebra o comando: escreva o arquivo com a ferramenta de escrita. Script Python que grava texto no Windows troca LF por CRLF; o Git normaliza no commit.
- No Git Bash, um `node -e "…"` com acento grave dentro de aspas duplas executa o trecho como comando (o texto some sem erro). Script com Markdown ou template literal vai para um arquivo, pela ferramenta de escrita.
- Para provar que um teste falha sem a correção, nunca use `git checkout <commit> -- arquivo` com mudança não commitada no mesmo arquivo: o `checkout HEAD` de volta apaga a mudança. Rode o teste contra o `dist/` antigo (antes do build) ou injete a regra antiga no teste.

## F5a: ferramentas de PDF

Pegadinhas que a F5a achou:

- **Agentes em worktree (Workflow com `isolation: 'worktree'`) nasceram da `main`**, não da branch da run. Cada um teve de avançar a própria branch (`git merge --ff-only fase-05a`) antes de trabalhar.
  - No briefing de um agente em worktree, peça isso como primeiro passo.
- **Três agentes de workflow eram Sonnet** e assinaram os commits como "Claude Sonnet 5.5": foram 15 de 76 commits da run. O histórico ficou com o nome verdadeiro de cada modelo, e nada foi reescrito (`--amend` é proibido).
  - Para código, passe `model: 'opus'` ao agente.

## F5b: guias de arquivo e kit do Product Hunt

Pegadinhas que a F5b achou:

- **No Git Bash, heredoc troca `\\` por `\` mesmo com `<<'EOF'`**: um script `node` que escreve `"\\b"` numa string JS para gravar `\b` grava o caractere de backspace (0x08), invisível no `grep`. Código com barra invertida vai pela ferramenta de escrita. Para achar o estrago: `grep -rln $'\x08' --include=*.ts src scripts tests`.
- **O `node -e` e o heredoc do Git Bash** seguem as regras da F3 e da F4: texto com crase ou barra invertida vai para um arquivo.

## F6: português e espanhol

Pegadinhas que a F6 achou:

- **No Node, `String.replace(a, b)` interpreta `$'`, `$&` e `$$` em `b`.** Um script que troca texto com "R$ " no meio duplicou metade de um arquivo de teste. Use `s.replace(a, () => b)` ou `split(a).join(b)`.
- **No Git Bash, argumento que começa com "/" vira caminho do Windows** ("/pt/apoie/" virou "C:/Program Files/Git/pt/apoie/"). Para passar caminhos de URL a um script, use `MSYS_NO_PATHCONV=1`.

## F7: casa, saúde e QR code

Pegadinhas que a F7 achou:

- **No Node, `String.replace(a, b)` interpreta `$'` no texto novo** (de novo, como na F6): um teste com `'R$ ' : '$'}` virou meio arquivo. Em script de remendo, use sempre `t.replace(a, () => b)`.

## F8: piloto automático

Pegadinhas que a F8 achou:

- **No Git Bash, ` ` e crases num `sed` ou num `node -e` somem.** Texto com barra invertida, crase ou apóstrofo vai num arquivo escrito pela ferramenta de escrita (como nas fases anteriores).

## Ajuste: idiomas

Pegadinhas que o ajuste achou:

- **A ferramenta de escrita interpreta `\u00A0` como o caractere**, e o heredoc do Git Bash engole a barra invertida. Para gravar o escape num arquivo, monte-o num script com `String.fromCharCode(0x5c)`; para procurar o caractere, `grep -n $'\xc2\xa0'`.
- **Commit de merge não leva o `Co-Authored-By` sozinho.** Nesta run, os 21 merges saíram sem ele: 10 do agente principal, ao trazer a branch de cada agente, e 11 dos agentes em worktree, ao trazer a branch da run. Nada foi reescrito. Escreva a mensagem do merge com o trailer (`git merge --no-ff -F <arquivo>`), e no briefing de um agente peça o `--ff-only` ou a mesma mensagem.
- **O `git worktree remove` no Windows deixa uma pasta com `node_modules`** (uns 1,5 MB) de cada worktree removida: é o resto da pendência "Worktrees".

## F9: CI e repositório público

Pegadinhas que a F9 achou:

- **O `git log -p` de um espelho (`git clone --mirror`, um repositório bare) no Windows usa o textconv de PDF do Git for Windows** (o `diff.astextplain` do gitattributes do sistema), porque um repositório bare não lê o `.gitattributes` do projeto. Na F9, o textconv falhou numa fixture, o `git log` parou no meio e o gitleaks disse 225 de 566 commits com o código 7, como se tivesse lido tudo (DECISOES § 332). Passe `--no-textconv --no-ext-diff` e confira quantos commits a ferramenta leu.
- **Dois agentes que acrescentam um script no fim do `package.json`** dão conflito na mesma linha no merge: junte as duas linhas, com a vírgula, e confira com `JSON.parse` antes do commit.

## F10: agentes em worktree

Pegadinhas que a F10 achou:

- **Um agente de workflow em worktree (`isolation: 'worktree'`) não consegue escrever no checkout principal:** o harness bloqueia. Ele lê o `.cache/` do principal pelo caminho absoluto, mas grava os scripts e as notas no `.cache/` da própria worktree, e o agente principal copia o que precisa antes do `git worktree remove`.
- **Dois agentes que acrescentam tokens no fim do mesmo CSS** (a seção 9 do `proto.css`) dão um merge automático se um mexe dentro dos blocos vazios e o outro acrescenta um trio novo depois. Confira com o script de contraste depois do merge.
- **Uma § citada antes de ser escrita** (por exemplo, "o destino está na § 365") prende a numeração. Reserve os números no plano e escreva as §§ na ordem, ou cite a decisão pelo assunto.

## F11: navegação, guias e tema

Pegadinhas que a F11 achou (no cabeçalho com o Menu, no tema claro e escuro, no hub de guias e nas entradas dele, e no merge das três fatias).

- **No Git Bash, um argumento que começa com `//` vira `/`** (a conversão do MSYS): o marcador `// F11` passado a um script de emenda perdeu uma barra, e o texto saiu deslocado um caractere (`/// F11` e `/ F4`). Use `MSYS_NO_PATHCONV=1` ou ponha o marcador num arquivo.
- **O `lint:texto` numa worktree sem baixar nada:** copie `.cache/jre-21.0.13+9` e `.cache/languagetool-6.6` do checkout principal para o `.cache/` da worktree. O `ensureTool` acha o arquivo de entrada e não baixa.
- **Numa worktree isolada, o harness recusa o comando que não consegue ler:** um `for` com variável passada ao `node`, um `sed` com programa grande, um `powershell`. Rode um comando simples por vez, ponha a lógica num script do `.cache/` escrito com a ferramenta de escrita e passe `MSYS_NO_PATHCONV=1` quando um argumento começar por `/`.
- O `-g` do Playwright com um padrão que começa por "/" (por exemplo `-g "/guides/$|/pt/guias/$"`) vira caminho do Windows no Git Bash e casa menos testes, sem erro: rodaram 2 dos 3 hubs. Use `MSYS_NO_PATHCONV=1` antes do comando e confira o número de testes que rodaram (F11).
- Um agente em worktree isolada não roda um `for` com variável em volta do `pnpm` (`for g in seo links; do pnpm gate:$g; done`): o harness recusa, porque não consegue provar que o comando não é git. Rode cada portão num comando separado (F11).
