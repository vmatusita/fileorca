# Logo e ícone do app

| Arquivo | Uso |
| --- | --- |
| `logo-light.svg` | Oli espelhada (olhando para a palavra) + "FileOrca" em Fredoka 600 convertida em curvas. "File" em Orca `#0F1B2D`, "Orca" em Oceano `#0B63F6`. Fundo claro (`bg`, `surface`). |
| `logo-dark.svg` | O mesmo para fundo escuro: "File" em Espuma `#F7FAFD`, "Orca" em Oceano-claro `#5AA2FF`. |
| `wordmark-light.svg` / `wordmark-dark.svg` | Só a palavra (os dois paths de texto do logo, deslocados 134px para a esquerda), para quando a Oli já está na tela. |
| `app-icon.svg` | O rosto da Oli de frente sobre Oceano, cantos de 28/128. Favicon, ícone do app instalado e avatar das redes. Lê bem de 16 a 512px. |

No cabeçalho do site o logo é inline, com "File" em `var(--ink)` e "Orca" em `var(--brand)`, `role="img"` e `aria-label="FileOrca"`, então troca de tema sozinho. A barbatana sozinha nunca vira ícone: lembra tubarão.
