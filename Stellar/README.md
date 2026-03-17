# API Stellar -- Boleto Guardian

API Node.js que registra e valida boletos na blockchain [Stellar](https://stellar.org/) usando a operacao nativa **Manage Data**.

## Arquitetura: codigo de barras como chave

O **codigo de barras** (linha digitavel, 47 digitos) e usado diretamente como chave do Manage Data. O usuario final valida o boleto digitando apenas os numeros impressos no documento -- sem necessidade de hashes, Account IDs ou qualquer conhecimento tecnico.

```
POST /api/blockchain              Stellar Manage Data
+------------------------+       +------------------------+
| codebar: "47 digitos"  | ----> | key = codebar          |
| nosso_numero, valor,   |       | value = payload        |
| vencimento             |       | (conta unica da empresa)|
+------------------------+       +------------------------+

GET /api/validate/:codebar
+------------------------+       +------------------------+
| Usuario digita codebar | ----> | Busca na conta empresa |
+------------------------+       | Retorna dados do boleto|
                                 +------------------------+
```

**Ponto-chave:** a conta Stellar e da **empresa**, nao de cada cliente. O Account ID e fixo e configurado via variavel de ambiente (`COMPANY_ACCOUNT`). O usuario final nunca precisa saber dele.

## Pre-requisitos

- Node.js 18+
- `@stellar/stellar-sdk` v13+

## Instalacao

```bash
cd Stellar
npm install
cp env.example .env
```

## Setup: criar conta da empresa

```bash
npm run create-account
```

Copie o `COMPANY_ACCOUNT` e `COMPANY_SECRET` gerados para o `.env`.

## Iniciar a API

```bash
npm start
```

## Variaveis de ambiente (.env)

| Variavel | Descricao | Default |
|----------|-----------|---------|
| HORIZON_URL | Horizon (testnet ou mainnet) | https://horizon-testnet.stellar.org |
| STELLAR_NETWORK | Rede: `testnet` ou `public` | testnet |
| COMPANY_ACCOUNT | Account ID da empresa | - |
| COMPANY_SECRET | Chave secreta da empresa | - |
| PORT | Porta da API | 3000 |

## Endpoints

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | / | Status da API (network, horizon, conta) |
| POST | /api/wallet | Cria conta Stellar da empresa |
| POST | /api/blockchain | Registra boleto (key=codebar, value=payload) |
| GET | /api/validate/:codebar | Valida boleto pelo codigo de barras |
| GET | /api/account/data | Lista todos os boletos registrados |

## Payload POST /api/blockchain

```json
{
  "codebar": "23793381286000000000300000004001184340000012050",
  "nosso_numero": "000000040",
  "valor": "120.50",
  "vencimento": "2025-08-05"
}
```

O `codebar` (47 digitos) e a chave do Manage Data. A chave secreta da empresa vem do `.env` (`COMPANY_SECRET`). Opcionalmente, pode ser enviada no campo `secret` do body.

## Resposta GET /api/validate/:codebar

```json
{
  "success": true,
  "found": true,
  "data": {
    "codebar": "23793381286000000000300000004001184340000012050",
    "nosso_numero": "000000040",
    "valor": "120.50",
    "vencimento": "20250805",
    "status": "pendente"
  },
  "ledger": 12345,
  "stellarExplorer": "https://stellar.expert/explorer/testnet/account/GABCDE..."
}
```

O endpoint de validacao **nao exige Account ID** -- a conta da empresa e fixa e configurada na API.

## Pagina de validacao

Acesse `http://localhost:3000/validation.html` para a pagina de validacao publica. O usuario digita os 47 numeros e recebe o resultado instantaneamente.

## Manage Data na Stellar

| Campo | Conteudo | Limite |
|-------|----------|--------|
| **key** | Codigo de barras (47 digitos) | 64 bytes |
| **value** | `nosso_num\|valor\|vencto\|status` | 64 bytes |

Exemplo de value: `000000040|120.50|20250805|pendente` (35 bytes)

## Custos

| Ambiente | Custo |
|----------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacao |
| **Reserva** | 1 XLM base + 0,5 XLM por boleto (subentry) |

## Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `server.js` | Servidor Express com todas as rotas da API |
| `sendBoletoToBlockchain.js` | Registra boleto na Stellar via Manage Data |
| `createCompanyAccount.js` | Cria conta Stellar da empresa (Friendbot em testnet) |
| `public/validation.html` | Pagina publica de validacao de boletos |

## Referencias

- [Stellar Developers](https://developers.stellar.org)
- [Horizon API](https://developers.stellar.org/docs/data/apis/horizon)
- [Manage Data](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/operations/object/manage-data)
- [Stellar Expert Explorer](https://stellar.expert)
