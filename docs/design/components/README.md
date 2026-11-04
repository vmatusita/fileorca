# FileOrca · componentes

v1.1 · 29/out/2026 · 27 componentes e o molde da página de ferramenta (ToolPage). Cada pasta tem o guia de uso (README.md) e a marcação de referência (preview.html). Estilos em `bundle.css`, valores em `../tokens.css`. Para ver todos os previews juntos, abra `../index.html`. A F11 acrescentou o GuideCard, o 28º componente (DECISOES § 395); o `../index.html` e a conferência abaixo são de antes dele. A F12 acrescentou o AdblockWall, a parede do bloqueador (DECISOES § 433), que o site confere no Playwright (axe nos dois temas, alvos de 48 px), e o pôs no `../index.html`, em Monetização (DECISOES § 454).

**Como ler a marcação:** nos previews, os ícones já estão inline (SVG com `class="fo-icon"`, `aria-hidden="true"` e `stroke="currentColor"`, os desenhos de `../assets/Icons/`), a Oli também (as poses de `../assets/Oli/`, sempre `aria-hidden`), e o logo do Header é inline, com "File" em `var(--ink)` e "Orca" em `var(--brand)`, `role="img"` e `aria-label="FileOrca"`. O `clipPath` `oli-clip` é declarado uma vez por página, como no sprite do site. Os textos estão em inglês, o idioma de lançamento; português e espanhol seguem as falas do README do sistema.

**Conferência:** a marcação de referência dos 28 blocos passa sem nenhuma violação no axe-core 4.14 (WCAG 2.2 AA e boas práticas), nos temas claro e escuro, a 360px e a 1280px, e todo alvo de toque a 360px tem 48px ou mais, menos as exceções do token `tap-min` (Breadcrumb, links do rodapé e link dentro de texto, todos acima dos 24px da WCAG 2.2) (29/out/2026).

| Categoria | Componente | Guia | Marcação |
| --- | --- | --- | --- |
| Ações | Button | [README](Button/README.md) | [preview](Button/preview.html) |
| Ações | PrivacySeal | [README](PrivacySeal/README.md) | [preview](PrivacySeal/preview.html) |
| Ações | NextStepChips | [README](NextStepChips/README.md) | [preview](NextStepChips/preview.html) |
| Arquivos | DropZone | [README](DropZone/README.md) | [preview](DropZone/preview.html) |
| Arquivos | WaterLevel | [README](WaterLevel/README.md) | [preview](WaterLevel/preview.html) |
| Arquivos | FileCard | [README](FileCard/README.md) | [preview](FileCard/preview.html) |
| Arquivos | ResultCard | [README](ResultCard/README.md) | [preview](ResultCard/preview.html) |
| Arquivos | Placard | [README](Placard/README.md) | [preview](Placard/preview.html) |
| Arquivos | BeforeAfter | [README](BeforeAfter/README.md) | [preview](BeforeAfter/preview.html) |
| Entradas | OptionGroup | [README](OptionGroup/README.md) | [preview](OptionGroup/preview.html) |
| Entradas | NumberField | [README](NumberField/README.md) | [preview](NumberField/preview.html) |
| Calculadoras | ResultHero | [README](ResultHero/README.md) | [preview](ResultHero/preview.html) |
| Calculadoras | SplitChart | [README](SplitChart/README.md) | [preview](SplitChart/preview.html) |
| Calculadoras | ScenarioCompare | [README](ScenarioCompare/README.md) | [preview](ScenarioCompare/preview.html) |
| Calculadoras | AmortTable | [README](AmortTable/README.md) | [preview](AmortTable/preview.html) |
| Calculadoras | ExportBar | [README](ExportBar/README.md) | [preview](ExportBar/preview.html) |
| Feedback | OliMessage | [README](OliMessage/README.md) | [preview](OliMessage/preview.html) |
| Feedback | CookieNotice | [README](CookieNotice/README.md) | [preview](CookieNotice/preview.html) |
| Marca | Oli | [README](Oli/README.md) | [preview](Oli/preview.html) |
| Navegação | Header | [README](Header/README.md) | [preview](Header/preview.html) |
| Navegação | Breadcrumb | [README](Breadcrumb/README.md) | [preview](Breadcrumb/preview.html) |
| Navegação | ToolSearch | [README](ToolSearch/README.md) | [preview](ToolSearch/preview.html) |
| Navegação | ToolCard | [README](ToolCard/README.md) | [preview](ToolCard/preview.html) |
| Navegação | GuideCard | [README](GuideCard/README.md) | [preview](GuideCard/preview.html) |
| Navegação | Footer | [README](Footer/README.md) | [preview](Footer/preview.html) |
| Conteúdo | Faq | [README](Faq/README.md) | [preview](Faq/preview.html) |
| Monetização | AdblockWall | [README](AdblockWall/README.md) | [preview](AdblockWall/preview.html) |
| Monetização | AdSlot | [README](AdSlot/README.md) | [preview](AdSlot/preview.html) |
| Monetização | SupportCard | [README](SupportCard/README.md) | [preview](SupportCard/preview.html) |
| Moldes | ToolPage | [README](ToolPage/README.md) | [preview](ToolPage/preview.html) |
