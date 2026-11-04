# Footer

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O rodapé é o fundo do mar: `deep`, com uma onda em SVG na borda de cima. Nenhuma imagem de fundo.

- As bordas são as do cabeçalho (Header, DECISOES § 409): 24px da janela e, a partir de 1288px, os 1240px da página (`page-max`), no centro. Abaixo de 340px, 16px.
- Colunas de links por categoria e a coluna FileOrca (About, Privacy, Terms, Licenses, Contact). Embaixo de Utilities, na mesma coluna, o bloco Guides (F11, DECISOES § 396): "All guides" e os grupos do hub que têm guia no idioma; no hub, "All guides" leva `aria-current="page"`. Títulos em `caption` `on-deep-muted`, links em `on-deep`. Os títulos são `<h2>` (pular de H1 ou H2 para H4 reprova no `heading-order`).
- No topo, a linha do café (`fo-footer__coffee-row`, F12, DECISOES § 437): o link de apoio ("Help keep FileOrca free: buy me a coffee" / "Me ajude a manter o FileOrca grátis: paga um café?" / "Ayúdame a mantener FileOrca gratis: invítame un café"), o primeiro link do rodapé, com o ícone `coffee` de 24px e alvo de 48px, nas bordas das colunas e com um fio `on-deep-muted` a 30% embaixo. Fica a 150px (`ad-clearance`) ou mais da âncora do AdSense: entre as duas ficam as colunas. Ela leva à página de apoio do idioma, com `donate_click` e o lugar `footer`.
- Base com a assinatura "Made by Victor Yuki Matusita in Curitiba".
- A âncora do AdSense cobre a base do rodapé no celular: deixe 96px de respiro embaixo quando os anúncios estiverem ligados.
- Nunca há anúncio dentro do rodapé.
