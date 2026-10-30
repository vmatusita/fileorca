# OliMessage

Feedback · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

A Oli falando: uma pose ao lado de um balão com uma frase curta. É o único jeito de dar notícia na FileOrca: não há toast, não há alerta do navegador.

| Variante | Pose | Papel ARIA | Fundo do balão |
|---|---|---|---|
| trabalhando | `swim` | `status` | `surface` |
| pronto | `cheer` | `status` | `surface` |
| erro (`fo-says--error`) | `oops` | `alert` | `danger-soft`, traço `danger` |
| aviso (`fo-says--info`) | `wave` | `note` | `brand-soft` |
| offline | `buoy` | `status` | `surface` |

- Frase principal em `oli` (Fredoka 500), uma linha no celular. Segunda linha opcional em `small`: o que fazer ou o detalhe.
- O texto carrega o estado inteiro. A Oli é decorativa (`aria-hidden`).
- Erro diz o que houve e o que fazer: "Oops, Oli couldn't read this file. Try a JPG or PNG." Nunca culpa a pessoa, nunca código de erro solto.
- Aviso nunca é amarelo: amarelo é do Baixar.
- Falas fixas por idioma estão no README do sistema (Voz).
