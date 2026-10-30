# Design system: o que mudou do v1 para o v1.1

**Este pacote já entra no v1.1** (montado em 30/out/2026 a partir dos docs do projeto File Orca): README, tokens.json, tokens.css, bundle.css e os guias e previews dos componentes já trazem as correções abaixo. A F1b, que no plano aplicaria estas correções em docs/design/, só confere que estão aqui, registra no DECISOES.md e segue para a implementação. Os previews ao vivo do artifact (https://claude.ai/artifact/ECjKLGYoW4JL72TKSNWDgT) ainda mostram o v1.

As correções foram achadas numa revisão com axe-core 4.14 sobre a marcação de referência (temas claro e escuro, 360 e 1280px), contrastes recalculados pela fórmula da WCAG, as fontes abertas com fontTools e o cronograma de exemplo recalculado em centavos.

1. **DropZone não é botão.** Tinha `role="button"` com o botão Escolher arquivos dentro (`nested-interactive`, sério). Agora a zona é um contêiner clicável e o teclado usa o botão.
2. **WaterLevel e `fo-bar` com nome** (`aria-label`), que faltava (`aria-progressbar-name`).
3. **Header:** o logo inline leva `role="img"` e `aria-label="FileOrca"` (o link ficava sem nome); o idioma deixa o "EN" visível no nome acessível (`label-content-name-mismatch`); logo, busca e idioma passam a 48px (estavam em 40 e 44px).
4. **ToolSearch no padrão combobox**, com a lista nomeada (`aria-input-field-name`) e o campo ocupando a altura da caixa.
5. **Títulos:** colunas do rodapé em H2 (eram H4) e o título do SupportCard segue a página (`heading-order`).
6. **AdSlot com o rótulo que o AdSense aceita:** "Advertisements" / "Publicidade" / "Anuncios". "Advertisement" e "Publicidad" não estão na lista do Google. O rótulo passa de 11 para 12px, como o `caption`.
7. **Tema escuro pelo sistema só com CSS:** o tokens.css e o bundle.css só trocavam com `data-theme="dark"`; agora seguem `prefers-color-scheme` e o `data-theme` força claro ou escuro.
8. **Token novo `brand-on-deep` (#5AA2FF):** a barra do principal no ResultHero, em `brand` do claro, ficava em 2,7:1 contra o fundo do mar; agora fica em 5,3:1.
9. **Exemplos de financiamento corrigidos** (US$ 300 mil, 6,5%, 30 anos, regra de centavos do plano): parcela $1,896.20 (era $1,842 no ResultHero), juros totais $382,637, saldo de mar/2027 $299,181.98 (era .99) e saldos de fim de ano $296,646.88, $293,069.20 e $289,251.91 (os três estavam errados). O cenário B de 15 anos passa à mesma taxa: $2,613 e $170,398 de juros.
10. **Sem limite inventado no lote:** "up to 50 at once" e "Safari handles about 50" saem dos exemplos, porque o site promete lote sem limite.
11. **Fala da Oli no OliMessage em 20px** (o estilo `oli`; o CSS usava 18px). WaterLevel com 340px de altura mínima no computador, como a DropZone. Linha do ano do AmortTable com 48px.
12. **Setas fora da fonte:** o subconjunto latino da Fredoka e da Figtree não tem → nem ↔. A seta do "antes → depois" vira o ícone `arrow-right` inline.
13. **Notas corrigidas:** `ink` no escuro fica em 9,7:1 sobre `water` (a nota dizia 13:1 nos dois temas); o contorno da Oli é preto-orca fixo, não o token `stroke`; a Oli também usa a Água clara #D6E6FF no vidro da máscara da `lost`; o clipPath `ic` sem uso da `peek` não entra no sprite; o molde usa o texto fixo do PrivacySeal e a Oli de 88px.

## Conferência deste pacote (30/out/2026)

Os 28 previews (27 componentes e o ToolPage), nos temas claro e escuro, a 360 e a 1280px, com axe-core 4.14 (WCAG 2.2 AA e boas práticas): nenhuma violação WCAG, nenhuma imagem quebrada. Sobra só o aviso de boas práticas `landmark-unique` nos previews que mostram duas variantes lado a lado na mesma página (dois Header, dois Breadcrumb, as duas telas do ToolPage), que não acontece numa página real do site.

## Origem dos arquivos

- README, tokens, bundle.css e guias dos componentes: docs do projeto File Orca (design-system/, v1.1).
- SVGs da Oli, do logo, do ícone do app e dos 35 ícones: OLI-1.md, OLI-2.md, LOGO.md e ICONES.md do projeto (v1, sem mudança no v1.1).
- Fontes: @fontsource-variable/fredoka e /figtree 5.3.0 (subconjunto latino) com as licenças OFL.
- `assets/photo.jpg`, `assets/photo-after.jpg` e `assets/pix-qr.svg`: imagens de exemplo dos previews (uma cena de mar desenhada e o QR do BR Code de exemplo do manual do Banco Central).
