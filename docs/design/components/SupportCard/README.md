# SupportCard

Monetização · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O pedido de café: transparente, sem culpa. Card na página de apoio e linha no ResultCard.

- **Card:** uma coluna. Na cabeça, o título em Fredoka e a Oli `coffee` à direita dele, olhando para o texto (96px; 128px a partir de 768px); o vapor da caneca sobe duas vezes e assenta, parado e visível, em 4,8s. Depois, a frase sobre quem faz e o que o café paga e um botão neutro para o Ko-fi, só com link, sem widget, com os valores sugeridos em texto (US$ 3, 5 ou 10). O título e a frase são os da seção C do PLANO-MELHORIAS ("Help Oli keep swimming"), e a trilha da página diz "Support Oli", o nome do item do Menu (F12, DECISOES § F12-C4 e § F12-C5). O nível do título segue a página: na página de apoio ele é o H1; em outro lugar, o nível seguinte ao da seção.
- **Pix (pt):** QR estático em SVG gerado no build, valores em OptionGroup (Qualquer valor, R$ 5, R$ 10, R$ 20), "copia e cola" com o rótulo visível "Pix copia e cola", o botão "Copiar código" (`fo-btn` comum, 52px, nunca o `--sm`) e o nome do recebedor para a pessoa conferir. No celular, o código e o botão vêm antes do QR; a partir de 768px, o QR vem primeiro, com 160px (F12, DECISOES § F12-C6). O Ko-fi fica depois do Pix, na mesma página.
- **Linha no ResultCard:** só depois do arquivo pronto, no 3º uso com sucesso naquele navegador e depois no máximo a cada 7 dias, com "não mostrar de novo", que deixa no lugar uma frase de confirmação (`role="status"`). A contagem só existe com o Aceitar do aviso de cookies. Quem bloqueia anúncio segue a mesma regra: o café nunca é a saída da parede do bloqueador (F12, Mudança 11; DECISOES § F12-C1).
- Botões neutros, nunca `sun` (amarelo é do Baixar) e nunca com cara de anúncio. Fica a `ad-clearance` de qualquer AdSlot.
- Nada de contagem regressiva, janela que bloqueia a tela ou "você já usou 10 vezes". Nenhum texto do café tem exclamação, prazo, contagem de usos ou "click", "clique" e "clic", e nenhum texto do card ou do rodapé fala de anúncio (`tests/unit/coffee-texts.test.ts`).
