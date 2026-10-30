# SupportCard

Monetização · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O pedido de café: transparente, sem culpa. Card na página de apoio e linha no ResultCard.

- **Card:** Oli `coffee`, título em Fredoka, uma frase sobre quem faz e o que o café paga, e os valores como botões secundários (US$ 3, 5, 10 no Ko-fi, só com link, sem widget). O nível do título segue a página: na página de apoio ele é o H1; em outro lugar, o nível seguinte ao da seção.
- **Pix (pt):** QR estático em SVG gerado no build, valores em OptionGroup (Qualquer, R$ 5, R$ 10, R$ 20), "copia e cola" com o botão Copiar e o nome do recebedor para a pessoa conferir.
- **Linha no ResultCard:** só depois do arquivo pronto, no 3º uso com sucesso naquele navegador (ou já no 1º, para quem bloqueia anúncio, com os anúncios ligados) e depois no máximo a cada 7 dias, com "não mostrar de novo".
- Botões neutros, nunca `sun` (amarelo é do Baixar) e nunca com cara de anúncio. Fica a `ad-clearance` de qualquer AdSlot.
- Nada de contagem regressiva, janela que bloqueia a tela ou "você já usou 10 vezes".
