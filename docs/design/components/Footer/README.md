# Footer

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O rodapé é o fundo do mar: `deep`, com uma onda em SVG na borda de cima. Nenhuma imagem de fundo.

- As bordas são as do cabeçalho (Header, DECISOES § 409): 24px da janela e, a partir de 1288px, os 1240px da página (`page-max`), no centro. Abaixo de 360px, 16px.

- Colunas de links por categoria e a coluna FileOrca (About, Privacy, Terms, Licenses, Contact). Embaixo de Utilities, na mesma coluna, o bloco Guides (F11, DECISOES § 396): "All guides" e os grupos do hub que têm guia no idioma; no hub, "All guides" leva `aria-current="page"`. Títulos em `caption` `on-deep-muted`, links em `on-deep`. Os títulos são `<h2>` (pular de H1 ou H2 para H4 reprova no `heading-order`).
- Base com o link de apoio ("Like these tools? Support them with a coffee" / "Curtiu? Me paga um café") e a assinatura "Made by Victor Yuki Matusita in Curitiba".
- A âncora do AdSense cobre a base do rodapé no celular: deixe 96px de respiro embaixo quando os anúncios estiverem ligados.
- Nunca há anúncio dentro do rodapé.
