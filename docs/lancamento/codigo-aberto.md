# Código aberto: o motor de imagem em um repositório público

Passo a passo para o Victor. A run F5a **preparou** o pacote e **não criou nada**: nenhum repositório, nenhum push, nenhum `npm publish`, nenhuma conta (regra do CLAUDE.md, "Fora de toda run"). O repositório público é seu.

Escrito em 1/nov/2026, na run F5a. Tudo que o texto diz sobre o pacote foi conferido com `pnpm motor:exportar --conferir`.

## O que vai a público, e o que não vai

- **Vai:** o motor de imagem (`src/engine/image/`), sob a licença MIT em seu nome ("Copyright (c) 2026 Victor Yuki Matusita"). É o mesmo código que roda no site: o site passa ao motor o endereço de cada `.wasm` em tempo de execução, e o pacote faz o mesmo com o endereço que o usuário configurar. Não há um adaptador à parte que pudesse sair diferente do código do site.
- **Vai junto:** os testes unitários do motor, com as fixtures cuja licença permite redistribuir (6 arquivos: 4 desenhados pelo script e 2 de terceiros em MIT e BSD-3-Clause, com o texto das licenças), o `README.md` em inglês com o contrato e as decisões, o `THIRD-PARTY-NOTICES.md` e o `fixtures/SOURCES.md`.
- **Não vai:** o site, as ferramentas de PDF, as calculadoras, o design system, o ID do GA4, o Ko-fi, a chave Pix, o e-mail de contato. O endereço `fileorca.com` aparece uma vez só, no link de crédito do README. O `oss-image-engine.test.ts` falha se qualquer um deles entrar.
- **Atenção, libheif (LGPL-3.0):** o `.wasm` do libheif nunca fica dentro do repositório nem de outro arquivo. O motor o busca do endereço configurado, sem alteração, e o usuário pode trocá-lo por outra compilação. O `THIRD-PARTY-NOTICES.md` diz isso e traz os links do código-fonte. Não mude essa estrutura.
- **Fixtures:** só entra arquivo cuja licença no `fixtures/ORIGEM.md` cita redistribuição, e nunca um com GPS de verdade. As fotos de uso livre sem licença escrita (drewnoakes), as CC BY-SA e as duas com coordenadas reais ficam fora; os testes que dependem delas ficam só no site (a lista sai na saída do comando).

## Antes de começar (no repositório fileorca)

1. A F5a está mesclada na `main` e o CI está verde. O pacote exportado é o motor **como está na `main`**.
2. Atualize e instale:

   ```bash
   git switch main && git pull --ff-only
   pnpm install --frozen-lockfile
   ```

3. Rode a conferência. Ela usa a rede (o `npm install`) e leva cerca de 1 minuto:

   ```bash
   pnpm motor:exportar --conferir
   ```

   O resultado tem de terminar com `[conferir] zero: the package installs, compiles and passes its own tests outside the repository.` e código de saída 0. Ela copia o pacote para uma pasta temporária **fora do repositório** e roda ali, com o npm, o `npm install`, o `tsc --noEmit` e o `vitest run`. Na F5a: 12 arquivos de teste e 145 testes. Se não der zero, **não crie o repositório**: abra uma run de correção.
4. Leia, na pasta `.cache/oss/fileorca-image-engine/` (ou na que o passo seguinte gerar): `README.md`, `THIRD-PARTY-NOTICES.md` e `fixtures/SOURCES.md`. O README é o cartão de visita do projeto. Ele cita `github:vmatusita/fileorca-image-engine`; se escolher outro nome, troque no `scripts/oss/image-engine-template/README.md` (e peça uma run, ou edite e rode o teste).

## Criar o repositório (no GitHub, no navegador)

1. **New repository**, dono `vmatusita`.
2. **Nome sugerido:** `fileorca-image-engine` (o mesmo do pacote; em 1/nov/2026 o nome estava livre no npm).
3. **Visibilidade:** Public.
4. **Descrição sugerida (inglês):**

   > Browser image engine behind FileOrca: compress, resize, crop, rotate and convert JPG, PNG, WebP, AVIF and HEIC, with no metadata in the output. WebAssembly, on-device, no upload.

5. **Não marque** "Add a README", "Add .gitignore" nem "Choose a license": o pacote já traz `README.md`, `.gitignore` e `LICENSE`. Crie o repositório vazio.
6. **Tópicos (About, na engrenagem):** `image-processing`, `image-compression`, `heic`, `avif`, `webp`, `jpeg`, `png`, `wasm`, `webassembly`, `exif`, `privacy`, `typescript`, `web-worker`.
7. **Website** (About): opcional. Se quiser dar crédito ao site, é aqui e no README. O pacote em si não carrega o endereço em nenhum outro lugar.
8. Em Settings, deixe Issues ligado. Wiki e Projects podem ficar desligados. O `LICENSE` será reconhecido como MIT sozinho.

## O primeiro push

Exporte direto para uma pasta **ao lado** do fileorca (nunca dentro dele: o fileorca tem o próprio Git), e depois inicialize o Git ali:

```bash
# no repositório fileorca
pnpm motor:exportar --out ../fileorca-image-engine

cd ../fileorca-image-engine
git init -b main
git add .
git status                      # confira: package.json, src/, tests/, fixtures/, README.md, LICENSE, THIRD-PARTY-NOTICES.md
git commit -m "feat: first import of the FileOrca image engine (0.1.0)"
git remote add origin https://github.com/vmatusita/fileorca-image-engine.git
git push -u origin main
git tag v0.1.0
git push origin v0.1.0
```

Depois do push:

- [ ] Abra o repositório no GitHub e confira que a coluna da direita mostra "MIT license".
- [ ] Confira que o README aparece inteiro, com as tabelas, e que `THIRD-PARTY-NOTICES.md` e `fixtures/SOURCES.md` abrem.
- [ ] Rode, no clone, `npm install` e depois `npm run typecheck` e `npm test` uma vez mais. O `npm install` cria o `package-lock.json`: faça um commit só com ele (`chore: add the lockfile`) e `git push`.
- [ ] Opcional: crie o release `v0.1.0` na página de Releases, com uma linha ("First public cut of the engine that runs FileOrca's image tools").
- [ ] Opcional: um workflow de CI no repositório, com `actions/checkout` e `actions/setup-node` fixados por SHA como no fileorca, Node 24, `npm ci`, `npm run typecheck` e `npm test`. Não é obrigatório para o primeiro push.

## Como atualizar depois

A **fonte da verdade é o fileorca**. O repositório público é uma cópia que o script reescreve, então não edite arquivos nele: a próxima exportação os apaga. Uma contribuição que chegar por pull request entra à mão em `src/engine/image/` do fileorca, com os testes, e sai na exportação seguinte.

Quando o motor mudar no fileorca:

1. Se o código mudou de verdade, suba a versão em `PACKAGE_VERSION`, no `scripts/oss/image-engine.ts` (por exemplo 0.1.1 para correção, 0.2.0 para API nova) e mescle na `main` como qualquer outra mudança.
2. No repositório fileorca, exporte para o clone. O comando apaga o que saiu do motor, mas **guarda** o `.git`, o `node_modules` e o `package-lock.json` do clone, e **se recusa** a escrever numa pasta que não seja uma exportação anterior (nem o fileorca, nem uma pasta acima dele):

   ```bash
   pnpm motor:exportar --out ../fileorca-image-engine --conferir
   ```

   A conferência roda numa cópia temporária (sem o `.git` nem o `node_modules` do clone), então o clone fica como está.
3. No clone:

   ```bash
   cd ../fileorca-image-engine
   git status
   git diff --stat
   npm install                  # atualiza o package-lock.json, se as dependências mudaram
   git add -A
   git commit -m "feat: sync with FileOrca (describe what changed)"
   git push
   git tag v0.1.1 && git push origin v0.1.1   # a versão nova
   ```

4. Se o motor passou a importar um pacote novo, o `package.json` exportado já o traz (a lista sai do que o código importa, nas versões do site) e o `THIRD-PARTY-NOTICES.md` ganha o texto da licença dele. Se a licença não for MIT, Apache-2.0, BSD, ISC, 0BSD, MPL-2.0 ou LGPL como arquivo separado, o `gate:licencas` do fileorca já reprovou antes.

## npm: não publique agora

O pacote é código-fonte TypeScript sem etapa de build (`exports` aponta para `src/index.ts` e `src/worker.ts`). Quem usa precisa de um empacotador (Vite, esbuild, webpack 5), e o README diz isso. Publicar no npm exigiria um build para JavaScript com os `.d.ts`, e o `exports` e o `files` apontando para ele. É uma decisão e uma run para depois. O `npm publish` é ação sua; a F5a não o rodou e o script não o conhece.

## Perguntas que vão aparecer

- **"É código aberto?"** (a checklist do `README.md` desta pasta pede uma resposta antes do Show HN). Uma resposta honesta, em inglês: "The image engine is open source (MIT): github.com/vmatusita/fileorca-image-engine. The site around it is not." No AlternativeTo, o campo de licença do FileOrca continua **Proprietary**; o motor aberto cabe na descrição, se quiser.
- **"Por que o libheif não está no repositório?"** Porque ele é LGPL-3.0 e fica como arquivo `.wasm` separado, sem alteração e trocável. O `THIRD-PARTY-NOTICES.md` explica e dá os links.
- **"Por que o exemplo não funciona sem configurar?"** O motor não tem endereço padrão para os `.wasm`: o usuário passa os nove com `configureWasm`. O README mostra o exemplo com o Vite.
- **"Cadê o resto das fixtures?"** Só entram arquivos cuja licença permite redistribuir. A explicação está no `fixtures/SOURCES.md`.

## O que a F5a deixou pronto

- O script `pnpm motor:exportar` (`scripts/oss/image-engine.ts`) e o seu modelo de arquivos (`scripts/oss/image-engine-template/`).
- O `tests/unit/oss-image-engine.test.ts`, dentro do `pnpm verificar`: confere a estrutura, as licenças, que nenhum import sai do pacote, que nada do site entrou e que duas exportações seguidas são idênticas.
- O `pnpm motor:exportar --conferir`, fora do `verificar` porque usa a rede.
- Esta ordem, no `docs/lancamento/README.md`: depois do merge da F5a.
