# Segurança

## Como relatar uma falha

Relate em particular. **Não abra issue, PR nem discussão pública** sobre uma falha de segurança: tudo o que fica num repositório público é lido por qualquer pessoa antes da correção.

1. **Pelo relato privado do GitHub:** na aba **Security** deste repositório, **Report a vulnerability**. Só o dono do repositório lê o relato.
2. **Por e-mail, se o botão não aparecer:** `contato@fileorca.com`, o contato público do site, com "Segurança" no assunto.

## O que mandar

- A página do site ou o arquivo do repositório afetado.
- Os passos para reproduzir, o navegador e o sistema.
- O que um atacante consegue fazer com a falha.

Não mande dados pessoais nem arquivos de terceiros. Para mostrar o problema, use um arquivo de teste seu.

## O que está no escopo

- O site [fileorca.com](https://fileorca.com) e as prévias publicadas a partir deste repositório.
- O código deste repositório, inclusive os workflows do GitHub Actions em `.github/workflows/`.

Fora do escopo: falhas dos serviços de terceiros que o site usa (Google AdSense, Google Analytics, Cloudflare, Ko-fi). Relate a eles.

## O que esperar

O FileOrca é mantido por uma pessoa. O relato é lido e respondido assim que possível, e a correção sai numa PR deste repositório. Só a versão no ar, a da branch `main`, recebe correção.
