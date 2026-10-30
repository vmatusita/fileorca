# Saída da F0

Preenchido por Victor no passo 23 da F0. As runs leem este arquivo (a F1a pega o ID do GA4, o Ko-fi e o nome do Worker; a F6 pega a chave Pix). Campo que faltar vira placeholder e pendência no relatório da run.

Data em que a F0 terminou: 

## Contas

| Item | Valor |
| --- | --- |
| Gmail da marca | |
| GitHub | vmatusita/fileorca (privado) |
| Cloudflare (login) | Gmail da marca, com 2FA |

## Domínio

| Item | Valor |
| --- | --- |
| Domínio | fileorca.com |
| Registrador atual | GoDaddy (renovação automática, trava de transferência e 2FA ligados; DNSSEC desligado) |
| Data de compra | |
| Data-limite para transferir ao Cloudflare Registrar (compra + 60 dias) | |
| Nameservers do Cloudflare | |
| Zona Active desde | |

## Cloudflare

| Item | Valor |
| --- | --- |
| Nome do Worker | fileorca |
| Domínio próprio no Worker | fileorca.com |
| www | AAAA `100::` com proxy e redirecionamento 301 para a raiz |
| Build | ligado a vmatusita/fileorca, main em produção, `pnpm build`, prévias ligadas |
| Variáveis de build | PUBLIC_ADS_ENABLED = false |
| E-mail | contato@fileorca.com → Gmail da marca (Email Routing; DMARC `p=reject`) |
| Robôs de IA | Search, Agent e Training em Allow; Bot Preference Sync e robots.txt gerenciado desligados |
| Injeções desligadas | Email Address Obfuscation, Rocket Loader, Web Analytics automático, Bot Fight Mode |

## Google e Bing

| Item | Valor |
| --- | --- |
| GA4, ID de medição (G-…) | G-T4BBJN7S11 |
| Search Console (propriedade de domínio) verificado | sim / não |
| Bing Webmaster importado do Search Console | sim / não |

## Doação

| Item | Valor |
| --- | --- |
| Ko-fi | https://ko-fi.com/victormatusita |
| PayPal ligado ao Ko-fi | sim / não |
| Chave Pix aleatória (só do site) | 1647afcb-3eb8-4fee-8dfe-d5ef477fb13c |
| Nome que aparece no Pix | VICTOR YUKI MATUSITA |

## Redes reservadas

| Rede | @ |
| --- | --- |
| Instagram | |
| X | |
| TikTok | |
| YouTube | |

## Marca

| Base | Resultado da busca por "FileOrca" |
| --- | --- |
| INPI (classe 42) | |
| USPTO | |

## Keywords e fixtures

- data/keywords.csv preenchido em: 
- Fixtures em fixtures/images/ e fixtures/pdf/, com origem em fixtures/ORIGEM.md: sim / não

## Pendências e observações

- 
