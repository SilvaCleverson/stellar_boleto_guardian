# API Stellar -- Autenticacao de Boletos

API Node.js que registra boletos na blockchain [Stellar](https://stellar.org/) usando a operacao **Manage Data**.

## Nova arquitetura: codebar como chave

Na nova arquitetura, o **codigo de barras** (linha digitavel, 47 digitos) e usado diretamente como chave do Manage Data. O usuario final valida o boleto digitando apenas os numeros impressos no documento.

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

**Ponto-chave:** a conta Stellar e da **empresa** (ex: DS2U), nao de cada cliente. O Account ID e fixo e configurado via variavel de ambiente. O usuario final nunca precisa saber dele.

> **Nota:** o codigo sera refatorado para implementar esta arquitetura. Atualmente usa hash SHA1 como chave.

## Boas praticas Stellar aplicadas

| Pratica | Detalhe |
|---------|---------|
| **Horizon.Server** | Classe atualizada do SDK v13 |
| **BASE_FEE** | Constante do SDK em vez de fee hardcoded |
| **Network explicita** | Env `STELLAR_NETWORK` define passphrase |
| **Validacao de Account ID** | `Keypair.fromPublicKey()` valida chave |
| **express.json()** | Nativo do Express 4.16+ (sem body-parser) |
| **Stellar Explorer** | Link para stellar.expert na resposta |

## Pre-requisitos

- Node.js 18+
- `@stellar/stellar-sdk` v13+

## Instalacao

```bash
cd Stellar
npm install
cp env.example .env
npm start
```

## Variaveis de ambiente (.env)

| Variavel | Descricao | Default |
|----------|-----------|---------|
| HORIZON_URL | Horizon (testnet ou mainnet) | https://horizon-testnet.stellar.org |
| STELLAR_NETWORK | Rede: `testnet` ou `public` | testnet |
| COMPANY_ACCOUNT | Account ID da empresa (preenchido apos U_CriWltSt) | - |
| PORT | Porta da API | 3000 |

## Endpoints (nova arquitetura planejada)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | / | Status da API (network, horizon, account) |
| POST | /api/wallet | Cria conta Stellar da empresa |
| POST | /api/blockchain | Registra boleto (key=codebar, value=payload) |
| GET | /api/validate/:codebar | Valida boleto pelo codigo de barras |
| GET | /api/account/:id/data | Lista todos os boletos registrados |

## Payload POST /api/blockchain

```json
{
  "codebar": "23793381286000000000300000004001184340000012050",
  "nosso_numero": "000000040",
  "valor": "120.50",
  "vencimento": "2025-08-05",
  "secret": "S..."
}
```

O `codebar` (47 digitos) sera a chave do Manage Data. O `secret` e a chave privada da conta da empresa (ZXH_PRVKEY).

## Resposta GET /api/validate/:codebar

```json
{
  "success": true,
  "found": true,
  "data": {
    "codebar": "23793381286000000000300000004001184340000012050",
    "nosso_numero": "000000040",
    "valor": "120.50",
    "vencimento": "2025-08-05",
    "status": "pendente"
  },
  "stellarExplorer": "https://stellar.expert/explorer/testnet/account/GABCDE..."
}
```

O endpoint de validacao nao exige Account ID -- a conta da empresa e fixa e configurada na API.

## Manage Data na Stellar

| Campo | Conteudo | Limite |
|-------|----------|--------|
| **key** | Codigo de barras (47 digitos) | 64 bytes |
| **value** | `nosso_num\|valor\|vencto\|status` | 64 bytes |

Exemplo de value: `000000040|120.50|20250805|pendente` (35 bytes -- dentro do limite)

## Custos

| Ambiente | Custo |
|----------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacao |
| **Reserva** | 1 XLM base + 0,5 XLM por boleto (subentry) |

## Referencias

- [Stellar Developers](https://developers.stellar.org)
- [Horizon API](https://developers.stellar.org/docs/data/apis/horizon)
- [Manage Data](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/operations/object/manage-data)
- [Stellar Expert Explorer](https://stellar.expert)
