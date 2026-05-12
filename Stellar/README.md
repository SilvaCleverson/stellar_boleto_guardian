# Stellar/ — API Express (uso local)

Esta pasta contem o servidor Express usado para desenvolvimento local sem o Vercel CLI.
Em producao, os mesmos endpoints sao servidos pelas **serverless functions** em `../api/`.

## Quando usar

| Cenario | Usar |
|---------|------|
| Desenvolvimento local rapido | `node server.js` nesta pasta |
| Testar identico ao Vercel | `vercel dev` na raiz do projeto |
| Producao | Vercel (deploy automatico via GitHub) |

## Instalacao

```bash
npm install
cp env.example .env
# Preencher COMPANY_ACCOUNT, COMPANY_SECRET, ADMIN_API_KEY
```

## Gerar conta Stellar da empresa (uma unica vez)

```bash
node createCompanyAccount.js
```

Saida:
```
Account ID (COMPANY_ACCOUNT): GDBLQ...
Secret Key (COMPANY_SECRET):  SXXXXX...
Saldo: 10000.0000000 XLM
```

Copie os valores para o `.env`.

## Iniciar a API local

```bash
npm start        # producao
npm run dev      # com nodemon (hot reload)
```

Acesse `http://localhost:3000`.

## Variaveis de ambiente (.env)

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `HORIZON_URL` | Horizon endpoint | https://horizon-testnet.stellar.org |
| `STELLAR_NETWORK` | `testnet` ou `public` | testnet |
| `COMPANY_ACCOUNT` | Chave publica da conta da empresa | - |
| `COMPANY_SECRET` | Chave privada (nunca expor) | - |
| `ADMIN_API_KEY` | Chave para endpoints administrativos | - |
| `PORT` | Porta do servidor | 3000 |

## Endpoints

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| `GET` | `/` | - | Status da API |
| `POST` | `/api/wallet` | - | Cria conta Stellar da empresa |
| `POST` | `/api/blockchain` | ADMIN_API_KEY | Registra boleto (key=codebar) |
| `GET` | `/api/validate/:codebar` | - | Valida boleto (publico) |
| `GET` | `/api/account/data` | - | Lista boletos registrados |
| `GET` | `/api/admin/boletos/:codebar` | ADMIN_API_KEY | Busca boleto com dados completos |

## Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `server.js` | Servidor Express com todas as rotas |
| `sendBoletoToBlockchain.js` | Registra boleto na Stellar via Manage Data |
| `createCompanyAccount.js` | Cria conta Stellar (Friendbot em testnet) |
| `env.example` | Modelo de variaveis de ambiente |
| `public/validation.html` | Pagina de validacao publica |

## Manage Data na Stellar

| Campo | Conteudo | Limite |
|-------|----------|--------|
| **key** | Codigo de barras (44 a 48 digitos) | 64 bytes |
| **value** | `nosso_num\|valor\|vencto\|status` | 64 bytes |

Exemplo: `000000040|120.50|20250805|pendente` (35 bytes)

## Custos

| Ambiente | Custo |
|----------|-------|
| Testnet | Gratuito (Friendbot) |
| Mainnet | ~0,00001 XLM por operacao |
| Reserva | 1 XLM base + 0,5 XLM por boleto (subentry) |

## Referencias

- [Stellar Developers](https://developers.stellar.org)
- [Horizon API](https://developers.stellar.org/docs/data/apis/horizon)
- [Manage Data](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/operations/object/manage-data)
- [Stellar Expert Explorer](https://stellar.expert)
