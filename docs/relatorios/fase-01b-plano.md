# F1b · Plano da run (design system e Oli)

Gabarito da revisão adversarial. Fontes, nesta ordem: o prompt da run (`docs/prompts/prompt-fase-01b.txt`), o `CLAUDE.md`, a ficha F1b e a lista "Correções do design system v1.1" do `PLANO-FILEORCA.md`, o `DECISOES.md` (§ 1 a § 38), `docs/design/` e o código da F1a. Decisões novas ficam no `DECISOES.md`, a partir do § 39.

## Contrato que não muda (decisão 1 do prompt)

- `[data-oli]` com as caixas do § 19: 88 px no DropZone do celular (`top:-86px; right:0`), 112 px a partir de 768 px (`top:-76px; right: space-4`), 72 px no WaterLevel, 72 ou 96 px no ResultCard.
- Alturas do § 20: `.fo-slot` 380/340 px, `.fo-ad--content` 300 px, `.fo-ad--rail` 644 px; trilho com `column-gap: var(--ad-clearance)`; `.fo-frame` e `--page-max`, `--tool-max`, `--rail` intocados (a 1280 px a folga é 0).
- Classes que os testes leem sem modificador novo: `class="fo-ad fo-ad--content"`, `class="fo-ad fo-ad--rail"`, `#fo-cookie button` só com `fo-btn`, `.fo-btn--download`, `.fo-result` com um único `[data-oli]`, `nav.fo-next a.fo-chip`, botões "Choose image", "Choose another file", "Start over", busca com nome "Search tools".
- Aviso de cookies acima da âncora (§ 35) e sem cobrir o foco (§ 36); `pointer-events: none` nas camadas decorativas.
- Orçamentos: JS inicial ≤ 80 KB gzip; ≤ 8 requisições na primeira página e ≤ 3 novas na seguinte (o par `/` → `/compress-image/` já está em 3: as fontes precisam estar na home e o sprite, o logo e os ícones vão inline).
- Um CSS por página; nada de arquivo novo para sprite, logo, ícone ou favicon.

## Árvore do que nasce ou muda

```
src/styles/global.css        entrada: camadas, preflight, tokens, tema, fontes, base e layout
src/styles/theme.css         gerado do tokens.json: @theme reference inline, sem o tema padrão
src/styles/fonts.css         @font-face próprio (Fredoka e Figtree latinas) e fallbacks com métrica
src/styles/components.css    os componentes fo-* a partir do bundle.css (movimento só por transform/opacity)
src/oli/poses.ts             lista fechada das nove poses (segura para o cliente)
src/oli/sprite.ts            montador do sprite (build): peças compartilhadas, oli-clip uma vez, logo
src/components/OliSprite.astro  o sprite da página, só com as poses usadas (peek sempre)
src/components/Oli.astro     a caixa [data-oli] com <svg><use href="#oli-pose"/></svg>
src/components/Logo.astro    o logo inline (Oli por <use> das peças, "File" em ink e "Orca" em brand)
src/icons/icons.ts           ícones de docs/design/assets/Icons (glob, só no servidor)
src/icons/svg.ts             miolo do ícone a partir do SVG cru (seguro para o cliente)
src/icons/Icon.tsx           ícone inline no Preact (mesma marcação no servidor e na hidratação)
src/components/Icon.astro    ícone inline nas páginas Astro
src/components/SupportCard.astro  card da página de apoio (título = H1, Oli coffee, Ko-fi)
src/components/FileCard.tsx  FileCard pronto para a F2, sem uso em página
src/tools/compress-image/coffee.ts  regra da linha do café (3º uso, 7 dias, não mostrar de novo, consentimento)
src/seo/images.ts            OG com o logo escuro, a Oli wave e o ícone da ferramenta; ícone do app do app-icon.svg
src/pages/icon-[size].png.ts 180 (apple-touch-icon, opaco), 192 e 512
scripts/lib/theme.ts         renderTheme(tokens) (puro)
scripts/lib/folha.ts         renderFolha(sprite) (puro)
scripts/lib/design-checks.ts validadores puros do CSS e do HTML do build
scripts/gates/design.ts      portão pós-build (gate:design)
scripts/design/gerar.ts      grava src/styles/theme.css e docs/oli/folha.html (pnpm design:gerar)
scripts/screenshots.ts       pnpm screenshots: PNG por componente e tema em docs/relatorios/fase-01b/
docs/oli/folha.html          folha da Oli (gerada; abre por file://)
tests/unit/sprite.test.ts, theme.test.ts, contrast.test.ts, folha.test.ts, design-checks.test.ts,
tests/unit/coffee.test.ts, icons.test.ts      testes novos (quality.test.ts lê todo o CSS)
tests/e2e/design.spec.ts     fontes, caixas da Oli, movimento reduzido, LCP
tests/e2e/coffee.spec.ts     linha do café e página de apoio
tests/e2e/ads.spec.ts        mais estados (arquivo em cima, processando, erro, café) e busca aberta sem resultado
tests/e2e/a11y.spec.ts       resultado, café e busca aberta também no escuro, a 360 e a 1280 px
```

Mudam também: `BaseLayout.astro` (preload, sprite, favicon, apple-touch-icon), `Header`, `Footer`, `Breadcrumb`, `Faq`, `ToolCard`, `PrivacySeal`, `SearchBox`, `CookieNotice`, `ToolPanel.tsx`, as views (home com a `wave`, 404 com a `lost`, apoio com o SupportCard, Sobre vestido), os textos dos três idiomas (linha do café, frase da privacidade, "to" das setas), `src/search/search.ts` e `search-index.json.ts` (ícone da ferramenta no índice), `src/platform/licenses.ts` (nada muda no código; a lista do teste ganha as fontes), `lighthouserc.json` (CLS ≤ 0,05), `scripts/verificar.ts` (portão `design`) e o `package.json`.

## Módulos e interfaces

| Módulo | Interface |
| --- | --- |
| `src/oli/poses.ts` | `POSES` (as nove, nessa ordem), `type Pose`, `isPose(x)` |
| `src/oli/sprite.ts` | `buildSprite(sources?)` → `{ clip, parts, symbols, logo }`; `poseBytes(sprite, pose)`; `spriteMarkup(sprite, poses)`; `logoMarkup(sprite)`; `loadSprite()` (lê `docs/design/assets`, memoizado) |
| `src/icons/svg.ts` | `ICON_ATTRS`, `iconInner(raw)`; `src/icons/icons.ts`: `ICONS: Record<IconName, string>` |
| `src/tools/compress-image/coffee.ts` | `readCoffee(storage)`, `decideCoffee(state, { now, consent, adsBlocked })` → `{ show, next }`, `COFFEE_KEY = 'fo-coffee'`, `WEEK_MS` |
| `scripts/lib/theme.ts` | `renderTheme(tokens)` → texto do `theme.css` |
| `scripts/lib/folha.ts` | `renderFolha(sprite, tokens, appIcon)` → HTML |
| `scripts/lib/design-checks.ts` | `checkThemeVars(css, tokens)`, `checkTextColors(css)`, `checkMotion(css)`, `checkFonts(html, css)`, `checkSprite(html)`, `checkArrows(html)` → listas de problemas |

## Critério → teste ou comando

| # | Critério do prompt | Onde se prova |
| --- | --- | --- |
| 1 | `pnpm verificar` verde local e no CI, ≤ 15 min | `pnpm verificar` (saída no relatório); `gh pr checks` |
| 2 | 14 portões da F1a com o mesmo alcance | `scripts/verificar.ts` (só ganha o `gate:design`); nenhum `skip`/`retries`; `playwright.config.ts` com `retries: 0` |
| 3 | Lighthouse ≥ 90, CLS ≤ 0,05, LCP sem a Oli | `pnpm lhci` (`lighthouserc.json` com `cumulative-layout-shift` ≤ 0,05) e o elemento LCP lido do relatório (`scripts/gates/lighthouse.ts`); `design.spec.ts` confere o LCP no Chromium |
| 4 | JS ≤ 80 KB, requisições ≤ 8 e ≤ 3 | `budgets.spec.ts` (inalterado) |
| 5 | Sprite: 9 símbolos, ≤ 4096 B por pose, ids únicos, `oli-clip` uma vez, sem `ic` | `sprite.test.ts` (tabela de bytes) e `gate:design` (`checkSprite` em toda página) |
| 6 | `[data-oli]` com pose, `aria-hidden`, ≥ 32 px, ≥ 150 px dos AdSlots | `gate:design` (estático), `design.spec.ts` (tamanho na tela) e `ads.spec.ts` (repouso, arquivo em cima, processando, erro, resultado com café e busca aberta sem resultado, 360×740 e 1280×800) |
| 7 | Contraste e `color:` só com tokens de texto; axe nos dois temas | `contrast.test.ts` (tabela de pares), `checkTextColors` no `gate:design`, `a11y.spec.ts` |
| 8 | Movimento só em transform/opacity; reduzido sem animação | `checkMotion` no `gate:design`; `design.spec.ts` com `reducedMotion: 'reduce'` em repouso, arquivo em cima, processando, resultado, apoio e 404 |
| 9 | Só os dois woff2 latinos, uma vez cada, preload só da Fredoka; licenças | `checkFonts` no `gate:design`, `design.spec.ts` (rede), `gate:licencas` e `quality.test.ts` |
| 10 | Hex e amarelo lendo todo o CSS; tema; sem → nem ↔ | `quality.test.ts`, `theme.test.ts`, `checkThemeVars` e `checkArrows` no `gate:design` |
| 11 | Folha atualizada, sem rede, 32/64/512 e ícone 16/32, dois fundos | `folha.test.ts` |
| 12 | Linha do café e página de apoio | `coffee.test.ts` (regra) e `coffee.spec.ts` (Playwright com o relógio) |
| 13 | Screenshots por componente e tema | `pnpm screenshots` → `docs/relatorios/fase-01b/` |
| 14 | Prévia da PR | `gh pr view --comments`, `curl` e Playwright na URL da prévia |

## Fora desta run

Pix (F6); BeforeAfter, lote, fila de FileCards, ZIP e motor de verdade (F2); NumberField, ResultHero, SplitChart, ScenarioCompare, AmortTable e ExportBar (F4); service worker e tela offline (F8, a `buoy` só no sprite e na folha); animação em JavaScript; redesenho da Oli (1c); rotas, slugs, SEO técnico, cabeçalhos, consentimento e a lógica do AdSlot; `.github/` e `scripts/ci/`; `LAUNCHED` continua `false`.

## Ordem de execução

1. Conferência do v1.1 (§ 39), sem mudança em `docs/design/`.
2. Em paralelo (arquivos separados): montador do sprite e folha; gerador do tema, contraste e validadores do portão `design`; OG e ícone do app; testes de Playwright dos critérios 6, 8, 9 e 12.
3. Tokens no `@theme`, fontes e base; PR em rascunho.
4. Sprite e Oli nas caixas; logo, favicon, ícones e Header.
5. Painel: Button, DropZone, WaterLevel, ResultCard com a Placard, OptionGroup, OliMessage, PrivacySeal, NextStepChips, AdSlot.
6. Navegação e conteúdo: Breadcrumb, ToolCard, FileCard, ToolSearch com a `peek`, Faq, Footer com a onda, CookieNotice; home, 404 e Sobre.
7. SupportCard, página de apoio e linha do café.
8. OG.
9. `pnpm verificar` limpo, `pnpm screenshots`, revisão adversarial em três lentes, relatório, `gh pr ready`.
