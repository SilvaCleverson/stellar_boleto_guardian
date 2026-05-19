# Integrações — Boleto Guardian

Diretório das integrações com sistemas externos. Cada subpasta é um conector independente.

| Pasta | Sistema | Descrição |
|-------|---------|-----------|
| [**Protheus/**](Protheus/) | TOTVS Protheus (ADVPL) | Registro e consulta via Contas a Receber (`FI040ROT`, `Guardian.prw`) |
| [**ASAAS/**](ASAAS/) | Asaas (API + webhook) | Registro automático na Stellar ao emitir boleto (`PAYMENT_CREATED`) |

## Rotas HTTP (Vercel)

As APIs públicas permanecem em `api/` na raiz do repositório:

| Rota | Módulo |
|------|--------|
| `POST /api/blockchain` | Core (Protheus / ERP legado) |
| `POST /api/webhooks/asaas/{tenantId}` | `Integracao/ASAAS/handlers/webhook.js` |
| `GET/POST /api/admin/tenants` | `Integracao/ASAAS/handlers/admin-tenants.js` |

## Documentação

- Protheus: [Protheus/README.md](Protheus/README.md)
- Asaas: [ASAAS/README.md](ASAAS/README.md)
