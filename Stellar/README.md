# API Stellar – Autenticação de Boletos

API Node.js que registra hash de boletos na blockchain [Stellar](https://stellar.org/) usando a operação **Manage Data** (dados anexados à conta do cliente).

## Arquitetura

- **Protheus** gera o hash SHA1 do boleto e chama esta API.
- **API** assina uma transação Stellar (Manage Data) com a chave do cliente e envia ao Horizon.
- **Stellar**: cada cliente tem uma conta; cada hash fica em uma entrada de dados (chave = hash, valor = nosso_numero|valor|vencimento|status).
- **Validação**: página web ou `GET /api/validate/:accountId/:hash` consulta o Horizon e confirma se o hash existe na conta.

## Pré-requisitos

- Node.js 18+
- Conta não é necessária para testnet (Friendbot financia novas contas).

## Instalação

```bash
cd Stellar
npm install
cp env.example .env
# Ajustar PORT ou HORIZON_URL se necessário
npm start
```

## Variáveis de ambiente (.env)

| Variável | Descrição | Default |
|----------|-----------|---------|
| HORIZON_URL | Horizon (testnet ou mainnet) | https://horizon-testnet.stellar.org |
| PORT | Porta da API | 3000 |
| VALIDATION_URL | URL base da página de validação | - |

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | / | Status da API |
| POST | /api/wallet | Cria conta Stellar (Friendbot), retorna accountId e privateKey para ZXH |
| POST | /api/blockchain | Registra hash (body: hash, nosso_numero, valor, vencimento, secret ou privateKey; account opcional) |
| GET | /api/account/:accountId/data | Lista chaves de dados da conta |
| GET | /api/validate/:accountId/:hash | Valida se o hash existe na conta |

## Payload POST /api/blockchain

```json
{
  "hash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  "nosso_numero": "123456789012",
  "valor": "1235.40",
  "vencimento": "2025-08-05",
  "secret": "S..."
}
```

A conta é identificada pela chave que assina; não é obrigatório enviar `account`.

## Validação

- Abra `http://localhost:3000/validation.html`.
- Informe o **Account ID** (conta Stellar do cliente) e o **Hash** do boleto.

## Tabela ZXH (Protheus)

Para Stellar use os mesmos campos:

- **ZXH_WALLET**: Account ID (chave pública Stellar, ex.: G...).
- **ZXH_TOPIC**: deixar em branco (Stellar não usa tópico).
- **ZXH_PRIVKEY**: chave secreta da conta (para a API assinar Manage Data).

## Custos (Stellar)

- Testnet: Friendbot financia; operações sem custo real.
- Mainnet: ~0,00001 XLM por operação; saldo mínimo por conta ~1 XLM.

## Referências

- [Stellar – Onde blockchain encontra o mundo real](https://stellar.org/)
- [Horizon API](https://developers.stellar.org/api)
- [Manage Data](https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/operations/object/manage-data)
