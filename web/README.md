# Site Boleto Guardian (Vercel)

Landing page e página de validação para deploy no [Vercel](https://vercel.com).

## Deploy no Vercel

1. Crie um novo projeto no [Vercel](https://vercel.com) e importe este repositório.
2. Em **Root Directory**, defina: `web`.
3. Deixe **Framework Preset** em "Other" (ou detecte como estático).
4. Faça o deploy. O Vercel vai servir os arquivos estáticos da pasta `web/`.

## Domínio

Após o deploy, adicione o domínio **boletoguardian.xyz** nas configurações do projeto (Settings → Domains).

## API da validação

A página **validation.html** chama a API em `GET /api/validate/:codebar`. Por padrão usa o mesmo domínio (`window.location.origin`). Se a API estiver em outro endereço (ex.: `https://api.boletoguardian.xyz`):

- Edite **validation.html** e no `<head>` altere a meta tag:
  ```html
  <meta name="api-base" content="https://api.boletoguardian.xyz">
  ```
- Ou configure a variável de ambiente no Vercel e use um script que leia essa env (ex.: substituição em build, se usar um gerador de estático).

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Landing page |
| `validation.html` | Validador de boleto (47 dígitos) |
| `vercel.json` | Configuração mínima para o Vercel |
