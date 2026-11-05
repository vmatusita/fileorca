# CookieNotice

Feedback · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O aviso próprio de cookies, com Aceitar e Recusar do mesmo tamanho e do mesmo peso.

- Card flutuante `surface` com `shadow-pop`, no canto de baixo à esquerda no computador e ocupando a largura no celular. Não bloqueia a página.
- Dois botões neutros iguais, Recusar primeiro. Nenhum dos dois é `brand` ou `sun`: consentimento não tem botão favorito.
- Texto de duas linhas a 360px que diz para que servem os cookies e repete o selo da página (arquivo, números ou texto), no estilo `small` (14/20). Link para a Privacidade. O card tem 128px de altura (148px com três linhas, o pt e o es a 320px) e 360px de largura a partir de 768px (F13a, DECISOES § 458; antes, "Texto curto que diz o que é cada coisa e lembra que o arquivo não sai do aparelho").
- O foco do teclado nunca fica embaixo do aviso, nem quando o painel troca de estado sem o foco sair do botão (o `keep()`, WCAG 2.4.11).
- Aberto na rolagem 0, ele fica a 150px ou mais do 1º anúncio de conteúdo; onde faltaria, o anúncio desce, nunca o aviso (F13a, DECISOES § 459).
- Some onde o `__tcfapi` diz que o GDPR se aplica (a CMP do Google assume) e nunca reaparece depois da escolha.
- Com a âncora do AdSense na tela, o aviso fica acima dela: nunca a cobre nem fica coberto por ela.

## Contraste sobre o mar (F13a, DECISOES § 458)

Quando o aviso flutua sobre o ResultCard ou o rodapé, que são `deep`, o limite do card fica à vista nos dois temas (1.4.11, 3:1): no claro, o card inteiro; no escuro, a borda. Nenhum token novo.

| Par | Claro | Escuro |
| --- | ---: | ---: |
| `surface` (o card) sobre `deep` | 13,79:1 | 1,16:1 |
| `stroke` (a borda) sobre `deep` | 1,25:1 | 3,52:1 |
