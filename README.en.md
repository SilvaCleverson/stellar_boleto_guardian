<div align="center">

# Stellar Boleto Guardian

### Blockchain-powered bank slip authentication

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[Espanol](README.es.md)**

</div>

---

## Understand the project

> **Every bank slip becomes an immutable record on the Stellar blockchain.**

Consider this scenario: a slip is issued, and someone along the way changes the barcode or the amount. The payer pays, but the money goes elsewhere. Classic fraud.

**Stellar Boleto Guardian solves this in 3 steps:**

```
                        +------------------+
                        |   1. PROTHEUS    |
                        |                  |
                        |  Issues the slip |
                        |  Generates SHA1  |
                        |  hash            |
                        +--------+---------+
                                 |
                                 | POST hash + account + secret
                                 v
                        +------------------+
                        |   2. NODE API    |
                        |                  |
                        |  Signs a Stellar |
                        |  transaction     |
                        |  (Manage Data)   |
                        +--------+---------+
                                 |
                                 | Submit to Horizon
                                 v
                        +------------------+
                        |   3. STELLAR     |
                        |                  |
                        |  Stores the hash |
                        |  on the client   |
                        |  account         |
                        |  PERMANENTLY     |
                        +--------+---------+
                                 |
                                 v
            +--------------------------------------------+
            |          PUBLIC VALIDATION                  |
            |                                            |
            |  Anyone enters Account ID + Hash and       |
            |  instantly sees if the slip is authentic    |
            +--------------------------------------------+
```

### Why does this matter?

| Problem | Without Guardian | With Guardian |
|---------|-----------------|---------------|
| **Tampered slip** | Nobody notices until money disappears | Hash changes = fraud detected |
| **Who validates?** | Only the bank or ERP | Anyone, via blockchain |
| **Traceability** | Internal logs that can be altered | Immutable Stellar transaction |
| **Cost** | Expensive anti-fraud systems | ~0.00001 XLM per slip |

---

## What the project does

- **Generates a unique hash** for each slip in Protheus (SHA1)
- **Records on Stellar** using the Manage Data operation
- **Enables public validation** via web page (Account ID + hash)
- **Generates QR Code** on the slip pointing to validation

---

## Architecture

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     NODE.JS API    |        |      STELLAR       |
|    (ADVPL)       |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| BoletoHash       | POST   | /api/blockchain    | Horizon| Manage Data        |
| Stellar.prw      |------->| Signs tx with      |------->| name = hash        |
|                  |        | client secret      |        | value = payload    |
|                  |        |                    |        |                    |
| ZXH.prw          | POST   | /api/wallet        | Friend | Creates account    |
| (accounts table) |------->| Keypair.random()   |--bot-->| Funds 10k XLM     |
|                  |        |                    |        |                    |
|                  | GET    | /api/validate/     | Horizon| GET account data   |
|                  |------->| :accountId/:hash   |------->| Hash exists?       |
+------------------+        +--------------------+        +--------------------+
```

---

## Project structure

```
stellar_boleto_guardian/
|
|-- Protheus/                        # ADVPL sources
|   |-- ZXH.prw                      # ZXH table creation
|   |-- BoletoHashStellar.prw        # Hash + submit + validate + QR
|   +-- README.md
|
|-- Stellar/                         # Node.js API
|   |-- server.js                    # Express (4 endpoints)
|   |-- createClientAccount.js       # Keypair + Friendbot
|   |-- sendHashToAccount.js         # Manage Data transaction
|   |-- env.example                  # Environment variables
|   |-- package.json
|   |-- README.md
|   +-- public/
|       +-- validation.html          # Public validation page
|
|-- README.md                        # Index
|-- README.pt-BR.md                  # Portuguese docs
|-- README.en.md                     # English docs (this file)
|-- README.es.md                     # Spanish docs
+-- .gitignore
```

---

## Step-by-step setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| ADVPL functions | `SHA1()`, `HTTPRequest()` |

### 1. Create ZXH table in Protheus

Compile `ZXH.prw` and run **once:**

```advpl
U_ZXH()
```

### 2. Start the Stellar API

```bash
cd Stellar
npm install
cp env.example .env      # Adjust PORT if needed
npm start                # Runs on http://localhost:3000
```

### 3. Configure Protheus parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **MV_XURLST** | `http://localhost:3000` | Stellar API URL |
| **MV_XURLVL** | `http://localhost:3000` | Validation page URL |

### 4. Create a Stellar account for a client

```advpl
U_CriaWalletStellar("000001")
// Automatically saves to ZXH: Account ID + secret key
```

### 5. Issue a slip with hash

```advpl
cHash := U_BoletoHashStellar("123456789012", 1235.40, CToD("05/08/2025"), "000001")
// Hash is recorded on Stellar and QR Code is generated
```

### 6. Validate a slip

Open `http://localhost:3000/validation.html` and enter:
- **Account ID** (from ZXH table)
- **Hash** (printed on the slip / QR Code)

---

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/` | API status |
| `POST` | `/api/wallet` | Create Stellar account (Friendbot) |
| `POST` | `/api/blockchain` | Record hash on account (Manage Data) |
| `GET` | `/api/account/:id/data` | List account hashes |
| `GET` | `/api/validate/:id/:hash` | Validate hash exists |

### Example POST /api/blockchain

```json
{
  "hash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  "nosso_numero": "123456789012",
  "valor": "1235.40",
  "vencimento": "2025-08-05",
  "secret": "S..."
}
```

---

## ZXH Table (Protheus)

| Field | Type | Size | Description |
|-------|------|------|-------------|
| `ZXH_FILIAL` | C | 2 | Branch |
| `ZXH_CODCLI` | C | 6 | Client code |
| `ZXH_WALLET` | C | 60 | Stellar Account ID (public key) |
| `ZXH_TOPIC` | C | 20 | Reserved |
| `ZXH_PRIVKEY` | C | 300 | Stellar secret key |
| `ZXH_DTGER` | D | 8 | Creation date |

---

## ADVPL Functions

| Function | Purpose |
|----------|---------|
| `U_ZXH()` | Creates ZXH table |
| `U_BoletoHashStellar(cNossoNum, nValor, dVenc, cCodCli)` | Generates hash, records on Stellar, generates QR |
| `U_ValidaBoletoStellar(cAccount, cHash)` | Validates hash on Stellar account |
| `U_CriaWalletStellar(cCodCli)` | Creates Stellar account and saves to ZXH |
| `U_TestaIntegracaoStellar()` | Tests API connectivity |

---

## Security

| Aspect | Detail |
|--------|--------|
| **Hash** | SHA1 over slip_number + amount + due_date + client_code |
| **Immutability** | Manage Data on Stellar: once written, cannot be altered without a new transaction |
| **Private keys** | Never log them; encrypt in ZXH for production |
| **Transport** | HTTPS mandatory in production |

## Costs

| Environment | Cost |
|-------------|------|
| **Testnet** | Free (Friendbot) |
| **Mainnet** | ~0.00001 XLM per operation (~$0.000001) |

---

## Tech stack

<div align="center">

| | Technology | Role |
|-|------------|------|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Immutable hash storage |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Node.js + Express | API bridge between Protheus and Stellar |
| ![ADVPL](https://img.shields.io/badge/-ADVPL-00529B) | TOTVS Protheus | ERP that issues and validates slips |

</div>

---

## License

MIT - use, modify and distribute freely.

---

<div align="center">

**Built by [Cleverson Silva](https://github.com/SilvaCleverson)**

Powered by [Stellar](https://stellar.org/)

</div>
