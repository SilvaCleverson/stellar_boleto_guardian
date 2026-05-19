# Integração Asaas ? Boleto Guardian

Módulo em **`Integracao/ASAAS/`** — registro automático na Stellar ao criar cobrança **BOLETO** no Asaas (`PAYMENT_CREATED`).

Índice das integrações: [../README.md](../README.md)

## Estrutura

```
Integracao/ASAAS/
??? README.md
??? index.js
??? config/tenants.example.json
??? lib/client.js
??? lib/tenants.js
??? handlers/webhook.js
??? handlers/admin-tenants.js
??? tests/integration.test.js
```

Proxies Vercel em `api/`:

| Proxy | Handler |
|-------|---------|
| `api/webhooks/asaas/[tenantId].js` | `Integracao/ASAAS/handlers/webhook.js` |
| `api/admin/tenants.js` | `Integracao/ASAAS/handlers/admin-tenants.js` |

## Pré-requisitos

- Conta [Asaas Sandbox](https://www.asaas.com/desenvolvedores) ou produção
- API Key Asaas (menu **Minha Conta ? Integração ? Gerar API Key**)
- Conta Stellar do emissor (`POST /api/wallet` ou `node Stellar/createCompanyAccount.js`)

## 1. Cadastrar tenant

Copie [`config/tenants.example.json`](config/tenants.example.json) e configure **`TENANTS_JSON`** no Vercel ou overrides `TENANT_{ID}_*`.

```bash
curl -X POST https://www.boletoguardian.xyz/api/admin/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: SUA_ADMIN_API_KEY" \
  -d '{"tenantId":"loja_a","asaasEnv":"sandbox",...}'
```

## 2. Webhook no Asaas

- **URL:** `https://www.boletoguardian.xyz/api/webhooks/asaas/{tenantId}`
- **Eventos:** `PAYMENT_CREATED`
- **authToken:** igual a `webhookAuthToken` do tenant

[Documentação webhooks Asaas](https://docs.asaas.com/docs/criar-novo-webhook-pela-api)

## 3. Testes

```bash
npm run test:asaas
```

## Segurança

- API Key Asaas **somente no servidor** ([orientação Asaas](https://www.asaas.com/desenvolvedores)).
- Header `asaas-access-token` = `webhookAuthToken`.
- Uma conta Stellar por emissor.
