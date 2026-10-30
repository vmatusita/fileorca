# Origem das fixtures

Arquivos reais de teste usados pelas runs (F2 para imagem, F5 para PDF). Uma linha por arquivo na tabela abaixo.

Regras:

- Nada de pessoas, documentos ou dados pessoais. Fotos em lugar público.
- Imagens em `fixtures/images/`, PDFs em `fixtures/pdf/`.
- Nomes sem espaço e sem acento (ex.: `heic-retrato-01.heic`).
- Nenhum arquivo acima de 50 MB.

## O que a F0 precisa trazer

- 10 fotos HEIC originais de iPhone (retrato, paisagem e uma Live Photo), em lugar público.
- 3 JPG do celular com localização ligada, em lugar público: uma em pé e duas deitadas.
- 2 PDFs escaneados pelo celular, de páginas impressas sem dado pessoal.
- 1 PDF com formulário preenchível, de um formulário público de governo.
- 1 PDF grande, com fontes embutidas, de um relatório público.

Exemplo de linha:

```
| images/heic-retrato-01.heic | HEIC original de iPhone, retrato | iCloud.com, "Original não modificado" | 2026-10-30 | praça, sem pessoas |
```

## Arquivos

| Arquivo | O que é | De onde veio | Data | Observação |
| --- | --- | --- | --- | --- |

## Gerados por script

As runs acrescentam aqui o que gerarem a partir dos arquivos acima (variantes de orientação EXIF, PNG transparente, WebP, AVIF, arquivo corrompido, PDF protegido e afins), com o script que gerou cada um.

| Arquivo | Gerado de | Script | Run |
| --- | --- | --- | --- |
