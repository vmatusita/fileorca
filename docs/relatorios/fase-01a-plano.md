# F1a · Plano da run (fundação técnica)

Gabarito da revisão adversarial. Fontes, nesta ordem: o prompt da run (`docs/prompts/prompt-fase-01a.md`), o `CLAUDE.md`, a ficha F1a do `PLANO-FILEORCA.md`, a ADR-001, `docs/design/` (v1.1), `docs/F0-SAIDA.md`, `data/keywords.csv` e `fixtures/ORIGEM.md`. Decisões novas ficam no `DECISOES.md`.

## Árvore do que nasce

```
.node-version                 26.13.0 (LTS "Lithium")
package.json                  packageManager pnpm@12.16.1; scripts de cada portão
pnpm-workspace.yaml           allowBuilds (esbuild, workerd)
astro.config.ts               static, trailingSlash always, build.format preserve, worker es
tsconfig.json                 astro/tsconfigs/strictest + jsx preact
eslint.config.ts              typescript-eslint + regra local fileorca/engine-self-contained
vitest.config.ts              getViteConfig do Astro (Container API nos testes)
playwright.config.ts          chromium + webkit, webServer scripts/serve-dist.ts
lighthouserc.json             build estático, celular, Chromium do Playwright, upload filesystem
wrangler.jsonc                Worker "fileorca" só com assets (ADR-001)
DECISOES.md                   § 1 ADR-001, § 2 design system v1.1, § 3 Ko-fi, § 4 em diante
.github/workflows/ci.yml      verificar → merge (pode-mesclar) → pos-deploy (workflow_call)
.github/workflows/pos-deploy.yml  push main, workflow_call, workflow_dispatch
public/robots.txt             fixo, libera tudo, aponta /sitemap-index.xml
public/<chave>.txt            chave do IndexNow
scripts/verificar.ts          orquestrador do pnpm verificar (tempo por portão, limite 900 s)
scripts/serve-dist.ts         servidor do dist com a semântica do Cloudflare
scripts/ci/pode-mesclar.ts    decisão do merge (testada no Vitest)
scripts/ci/urls-alteradas.ts  URLs alteradas pelo mapa de rotas (testada no Vitest)
scripts/ci/pos-deploy.ts      conferência de produção e IndexNow
scripts/gates/*.ts            cabecalhos, worker, seo, links, licencas, dinheiro-saude,
                              actionlint, lighthouse, lint-texto
scripts/lib/*.ts              dist, jsonc, seo-checks, ymyl, tools (binários fixados por SHA-256)
src/platform/                 site.ts (LAUNCHED), headers.ts, build-files.ts, licenses.ts
src/i18n/                     routes.ts (mapa com equivalência), types.ts, texts.ts, format.ts,
                              en|pt|es/*.ts
src/analytics/                consent.ts (Consent Mode v2, bootstrap), events.ts (lista fechada)
src/ads/                      config.ts (PUBLIC_*), AdSlot.astro, AdsenseHead.astro
src/engine/image/             recompress.ts + worker.ts (motor provisório, autocontido)
src/tools/compress-image/     CompressImagePage.astro, ToolPanel.tsx (ilha), engine-client.ts,
                              i18n/en|pt|es.ts
src/components/               Header, Breadcrumb, PrivacySeal, Footer, CookieNotice, Faq,
                              ToolCard, SearchBox, SearchDialog, RichText
src/search/                   search.ts (combobox) + entry.ts (carregado no primeiro uso)
src/seo/                      meta.ts (canonical, hreflang, JSON-LD), sitemap.ts, images.ts
src/views/                    Home, Legal, About, Contact, Licenses, Support, NotFound
src/pages/                    27 páginas finas + endpoints (sitemaps, ads.txt, og, ícones,
                              manifests, search-index.json)
tests/unit/                   Vitest
tests/e2e/                    Playwright
docs/relatorios/              este plano e o relatório final
```

## Módulos e interfaces

| Módulo | Interface |
| --- | --- |
| `src/i18n/routes.ts` | `ROUTES: RouteDef[]` (`id`, `paths` por idioma, `indexable`, `view`, `texts`, `adArea`), `pathFor`, `pageFileFor`, `languagesOf`, `textFilesFor` |
| `src/i18n/texts.ts` | `TEXTS[lang]` com `common`, `home`, `privacy`, `terms`, `about`, `contact`, `licenses`, `support`, `not-found`, `compress-image`, tipados por `types.ts` |
| `src/platform/site.ts` | `LAUNCHED`, `SITE_ORIGIN`, `GA4_MEASUREMENT_ID`, `KOFI_URL`, `CONTACT_EMAIL`, `AUTHOR`, `INDEXNOW_KEY`, `parseLaunched(source)` |
| `src/platform/headers.ts` | `headerRules({ launched })`, `redirectRules()`, `toHeadersFile`, `toRedirectsFile`, `WORKERS_DEV_PATTERN` |
| `src/platform/build-files.ts` | integração `platformFiles()` (grava `_headers`, `_redirects`, `build.txt`), `buildCommit(env)` |
| `src/analytics/consent.ts` | `DENIED_BY_DEFAULT_REGIONS`, `consentBootstrap()`, `defaultConsentFor(region)` |
| `src/analytics/events.ts` | `EVENT_PARAMS`, `track(name, params)`, `cleanParams`, `browserLabel` |
| `src/ads/config.ts` | `adsConfigFrom(env)`, `buildAdsConfig()`, `adsTxt(client)`, `unitFor(config, area, unit)` |
| `src/engine/image/recompress.ts` | `recompress(blob, level, onProgress)`, `EngineError`, `isSupportedType`, `workerCanEncode` |
| `scripts/ci/pode-mesclar.ts` | `decide(pr): Decision`, `fromGhJson`, CLI que grava `merge`, `comment`, `reason` no `GITHUB_OUTPUT` |
| `scripts/ci/urls-alteradas.ts` | `changedUrls(files)`, `filesChangedBy(commit)` |
| `scripts/ci/pos-deploy.ts` | `waitForDeploy`, `checkProduction`, `hasCommit`, `injectedScripts`, `robotsHeaderProblem`, `indexNowBody` |

## Critério → teste ou comando

| # | Critério do prompt | Onde se prova |
| --- | --- | --- |
| 1 | `pnpm verificar` verde em até 15 min, local e CI | `scripts/verificar.ts` (falha acima de 900 s); saída no relatório; execução do CI na PR |
| 2 | Portões ativos | passos do `verificar`: tipos, lint, build, vitest, cabeçalhos, worker, seo, links, licenças, dinheiro-saúde, actionlint, playwright (axe, anúncios, orçamentos), lighthouse, lint:texto |
| 3 | Lighthouse ≥ 90 no celular na página-modelo em inglês | `pnpm lhci` (`lighthouserc.json`, `categories:performance` minScore 0.9) |
| 4 | hreflang, sitemaps, robots | `pnpm gate:seo` + `tests/unit/seo-checks.test.ts` |
| 5 | `_headers` gerado | `tests/unit/platform.test.ts` + `pnpm gate:cabecalhos` + `tests/e2e/navigation.spec.ts` (cabeçalhos servidos) |
| 6 | Worker sem código | `tests/unit/platform.test.ts` + `pnpm gate:worker` |
| 7 | `pode-mesclar.ts` e `urls-alteradas.ts` | `tests/unit/pode-mesclar.test.ts`, `tests/unit/urls-alteradas.test.ts` |
| 8 | actionlint | `pnpm gate:actionlint` (binário 1.7.12 fixado por SHA-256) |
| 9 | Jurídicas e institucionais nos três idiomas, sem AdSlot | `pnpm gate:links` (existem e são linkadas) + `tests/e2e/ads.spec.ts` (nenhum `.fo-ad`) |
| 10 | Consentimento | `tests/e2e/consent.spec.ts` + `tests/unit/consent.test.ts` |
| 11 | AdSlot nos três estados | `tests/unit/ads.test.ts` (Container API) + `tests/e2e/ads.spec.ts` (altura e rótulo por idioma) |
| 12 | Prévia e job de merge | conferência manual com `curl` e `gh pr view --comments`, registrada no relatório |

Outros testes: `tests/e2e/tool.spec.ts` (motor, GPS, erro, eventos, opções), `tests/e2e/a11y.spec.ts` (axe a 360 e 1280 em todas as páginas), `tests/e2e/budgets.spec.ts` (JS ≤ 80 KB gzip, requisições ≤ 8 e ≤ 3), `tests/e2e/navigation.spec.ts` (404 mais próximo, idioma, busca), `tests/unit/routes.test.ts` (mapa de rotas, páginas e textos), `tests/unit/ymyl.test.ts` (checador de dinheiro e saúde), `tests/unit/lint-engine.test.ts` (regra do motor autocontido), `tests/unit/tokens.test.ts` (nenhuma cor fora dos tokens).

## Fora desta run

Tudo da seção "Fora de toda run" do `CLAUDE.md`; identidade visual final, fontes, sprite e arte da Oli, logo final e onda do rodapé (F1b); ferramenta de verdade (jSquash, libheif, ZIP, BeforeAfter, lote) e hubs de categoria (F2); Pix (F6); SupportCard estilizado e a linha do café no ResultCard (F1b); `LAUNCHED = true` (F2).

## Ordem de execução

1. Esqueleto, `pnpm verificar` mínimo e plataforma.
2. CI, pode-mesclar, urls-alteradas, pós-deploy e actionlint.
3. PR em rascunho.
4. i18n, páginas e SEO técnico.
5. Molde da página-modelo, componentes e motor provisório.
6. AdSlot e teste de distância.
7. Consentimento, GA4 e eventos.
8. Páginas jurídicas e institucionais nos três idiomas.
9. Imagem de OG, manifest e ícones provisórios.
10. Orçamentos, Lighthouse e lint:texto, fechando o verificar.
11. Revisão adversarial em três lentes, correções, relatório.
