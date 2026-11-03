# FileOrca

O código do [fileorca.com](https://fileorca.com): ferramentas de imagem e de PDF e calculadoras, em inglês, português e espanhol. Tudo roda no navegador, sem conta, sem upload e sem servidor: nenhum arquivo do usuário sai do aparelho.

- **O site:** Astro 7 com saída estática e ilhas Preact 11, publicado no Cloudflare Workers num Worker só com assets (`docs/adr/ADR-001-plataforma-de-entrega.md`).
- **Como ele é feito:** por runs do Claude Code, cada uma numa PR com relatório em `docs/relatorios/`. As regras das runs estão no `CLAUDE.md`, as decisões no `DECISOES.md` e a operação do dia a dia no `docs/OPERACAO.md`.
- **Dono:** Victor Yuki Matusita.

## Como rodar

Requisitos: o Node 24 LTS (a versão exata está em `.node-version`) e o pnpm 10 (a versão exata está no campo `packageManager` do `package.json`; com o Corepack, `corepack enable` instala a certa).

```bash
pnpm install
pnpm exec playwright install chromium webkit   # só na primeira vez; no Ubuntu, com --with-deps
pnpm dev                                       # servidor de desenvolvimento do Astro
```

Para conferir tudo, como o CI:

```bash
pnpm verificar            # tipos, lint, build, Vitest, os portões, Playwright (Chromium e WebKit), Lighthouse e o lint:texto
pnpm verificar --partes   # as mesmas partes do CI, uma depois da outra, cada uma com o limite de 900 s
```

O `pnpm verificar` para na primeira falha e mostra o tempo de cada passo. Cada passo também roda sozinho (`pnpm tipos`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm e2e` e os `pnpm gate:*`): a tabela completa está no `CLAUDE.md`. O `lint:texto` usa o LanguageTool local e, no Windows sem Java, baixa um JRE fixado para `.cache/`.

## Licença

**Todos os direitos reservados** (veja o `LICENSE`). O repositório é público para leitura, mas nenhuma licença é concedida: copiar, modificar ou redistribuir o código pede autorização por escrito.

O motor de imagem (`src/engine/image/`) é a exceção: ele é distribuído à parte, sob a licença MIT, no repositório separado `fileorca-image-engine`. O `pnpm motor:exportar` gera esse pacote a partir deste repositório, e o passo a passo da publicação está em `docs/lancamento/codigo-aberto.md`.

Os arquivos de terceiros mantêm as próprias licenças: as dependências (a lista está na página `/licenses` do site), as fontes e as fixtures de teste (`fixtures/ORIGEM.md`).

## Segurança

Achou uma falha? Não abra issue: siga o `SECURITY.md`.
