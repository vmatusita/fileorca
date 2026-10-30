# CLAUDE.md · FileOrca

Regras para toda run do Claude Code neste repositório. Valem junto com a ficha da run e o PLANO-FILEORCA.md. As runs só acrescentam a este arquivo (seção nova no fim); nunca apagam nem afrouxam uma regra.

## O projeto em cinco linhas

- fileorca.com: ferramentas de imagem e PDF e calculadoras, em inglês, português e espanhol, tudo no navegador, sem conta, sem upload e sem servidor.
- Astro 7 com saída estática e ilhas Preact 11, hospedado no Cloudflare Workers (plano Free), num Worker `fileorca` só com assets (ADR-001).
- Receita de anúncio (AdSense, depois Journey e Mediavine) e doação (Ko-fi e Pix).
- Dono único: Victor Yuki Matusita. O código sai de runs autônomas com merge automático quando o CI passa.
- Um comando confere tudo: `pnpm verificar`.

## Fonte de verdade

1. A ficha da run (vence o resto).
2. PLANO-FILEORCA.md (as "Decisões fechadas" são contrato: nenhuma run muda).
3. DECISOES.md (§ numerados), docs/adr/, docs/design/ (design system), docs/F0-SAIDA.md e data/keywords.csv.
4. O código existente.

Na dúvida, a opção mais simples e reversível, registrada no DECISOES.md.

## Arquitetura é fixa

Host, framework, estrutura do repositório e pipeline não mudam numa run. Se a run achar que precisa mudar, escreve uma ADR nova com status "Proposta" em docs/adr/, deixa a mudança de fora e registra a pendência no relatório.

## Git (a main não tem proteção no GitHub Free: estas regras são a proteção)

- Trabalhe numa branch `fase-NN` (ou `fase-NNa`, `fase-NNb`, `fase-01c`) ou `ajuste-{assunto}` nas runs curtas. Commits pequenos, mensagem em inglês.
- No fim, abra a PR com `gh pr create`. O merge é do CI: **nunca** rode `gh pr merge`.
- **Nunca**: push na main, force push, `git reset --hard`, `--amend` em commit alheio, `--no-verify`, mexer em `core.hooksPath` ou no `.githooks/`.
- A trava tem três camadas: o hook `.githooks/pre-push`, as regras de negação do `.claude/settings.json` e este arquivo. Não contorne nenhuma.

## Fora de toda run

DNS, configuração da zona, Worker e variáveis do Workers Builds no Cloudflare; deploy direto com wrangler; configurações do repositório no GitHub; criar contas; enviar e-mail, post ou pedido a qualquer serviço; publicar repositório; código de Worker (o Worker é só assets); formulário que colete cartão de crédito; dependência com licença fora da lista (MIT, Apache-2.0, BSD, ISC, 0BSD, MPL-2.0, OFL-1.1 para fontes e LGPL-3.0 só em arquivo separado; nunca AGPL nem licença não comercial).

## Testes

- `pnpm verificar` roda tudo (tipos, lint, Vitest, Playwright em Chromium e WebKit, axe, Lighthouse CI, licenças, hreflang, links, órfãs, orçamentos de JS e de requisições, distância dos anúncios, cabeçalhos, Worker sem código, conteúdo de dinheiro e saúde, lint:texto).
- Rode até passar, corrigindo a causa. Desligar, pular ou afrouxar teste é proibido.
- Calculadora: os valores esperados vêm de oráculo independente (numpy-financial e exemplos oficiais), gravados em fixtures/calc/ num commit antes do motor. Nunca gere o esperado rodando o próprio motor.

## Regras que nenhuma run quebra

- Nenhum arquivo do usuário sai do aparelho. Nenhum número digitado vai para `?` na URL nem para evento do GA4.
- Anúncio: nada a menos de 150 px (`ad-clearance`) do Baixar, dos campos, do painel ou da Oli; nada acima da ferramenta no celular, dentro do painel, no processamento, no cronograma ou nas páginas jurídicas. Só âncora e vinheta como formatos automáticos.
- Design: docs/design/ manda. Nenhuma cor fora dos tokens; amarelo (`sun`) só no Baixar; a Oli tem nove poses fechadas e é `aria-hidden`.
- Nenhuma página recebe COOP/COEP; nenhuma ferramenta usa SharedArrayBuffer.

## Como a run termina

- Válvula de estouro: o que a ficha permite cortar vira pendência no relatório e vai para uma run "b". O que a ficha diz que nunca se corta, não se corta.
- Anti-loop: depois de três tentativas com a mesma falha, mude de abordagem e registre a troca. Bloqueio real (ID faltando, serviço fora do ar) não para a run: siga com placeholder e registre a pendência.
- Grave o próprio prompt em docs/prompts/ (`prompt-fase-NN.md` ou `prompt-ajuste-{assunto}.md`) na PR da run.
- Relatório em docs/relatorios/fase-NN.md (ou ajuste-{assunto}.md), em português: saída real do `pnpm verificar`, link da prévia, decisões novas e a lista do que sobrou para o Victor fazer.
- Subagentes Sonnet para exploração e revisão; a revisão adversarial final roda em contexto limpo, contra a ficha.

## Idioma

Narrativa, relatórios e docs em português. Código, nomes de arquivo e commits em inglês. Textos do site nos arquivos de tradução de cada idioma.
