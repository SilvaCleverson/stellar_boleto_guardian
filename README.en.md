<div align="center">

# Stellar Boleto Guardian

### Immutable bank slip authentication via Stellar blockchain

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[Espanol](README.es.md)**

</div>

---

> **Part of the Guardian Labs ecosystem**

> **Guardian Labs** builds **public authenticity infrastructure** for the keys that move money in Brazil — immutable, auditable proof that a payment instrument is legitimate, without relying only on the issuer or the bank. **Boleto Guardian** is the **first product** of Guardian Labs (bank slip authenticity on Stellar; validation via 44 to 48 barcode digits). Other Brazilian payment instruments are on the roadmap.

## What is Guardian Labs

**Guardian Labs** is the **project brand** (parent brand) developing public trust layers over payment identifiers in Brazil. It is not a bank, payment fintech, or Stellar Anchor — it is the **authenticity layer** issuers and payers use via API, integrated with any ERP.

| Guardian Labs | Boleto Guardian |
|---------------|-----------------|
| Brand and long-term thesis | First product in production (MVP) |
| Infrastructure for multiple instruments | Bank slips on Stellar today |
| Pitch: company + roadmap | Experience: register and validate slips |

## Guardian Labs team

| Role | Name |
|------|------|
| **CEO** | Cleverson Silva |
| **CTO** | Sergio Artero |
| **CMO** | Demetrio De Los Rios |

---

## Understand the project

> **The user only has the bank slip. That's all they need.**

Meet **DS2U**, a company that uses Protheus ERP and issues hundreds of bank slips daily. One day, a slip is intercepted and its barcode is tampered with. The payer pays, but the money goes elsewhere. Classic fraud.

**Stellar Boleto Guardian solves this simply:**

1. When issuing the slip, Protheus sends the **barcode** (44 to 48 digits) to the API
2. The API records those numbers on the Stellar blockchain -- immutable, public, permanent
3. The payer types the digits in any browser and sees instantly: authentic or fraud

### Why does this matter?

| Problem | Without Guardian | With Guardian |
|---------|-----------------|---------------|
| **Tampered slip** | Nobody notices until money disappears | Barcode not on chain = fraud |
| **Who validates?** | Only the bank or ERP | Anyone, with just the slip numbers |
| **What does the user need?** | Hash, Account ID, technical data | **Just the barcode numbers** |
| **Traceability** | Internal logs that can be altered | Immutable blockchain |
| **Cost** | Expensive anti-fraud systems | ~0.00001 XLM per slip |

---

## Why use the barcode as key?

Stellar allows storing data on-chain using the **Manage Data** operation: a key (up to 64 bytes) and a value (up to 64 bytes).

A Brazilian bank slip barcode has **44 to 48 digits** -- fits perfectly in 64 bytes.

| Approach | Key | What the user needs | Experience |
|----------|-----|---------------------|------------|
| Old (hash) | SHA1 of slip | Account ID + Hash | Poor -- technical data |
| **New (barcode)** | **Barcode digits** | **Just the slip numbers** | **Excellent** |

The barcode is:
- **Unique** per slip
- **Printed** on the physical document
- **Readable** by scanner or manual entry
- **44 to 48 digits** -- fits in 64 bytes of Manage Data

---

## Architecture

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     NODE.JS API    |        |      STELLAR       |
|    (DS2U)        |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| Issues slip      | POST   | /api/blockchain    | Horizon| Manage Data        |
| barcode as       |------->| key = barcode      |------->| on DS2U ACCOUNT    |
| key              |        | value = payload    |        | (single account)   |
|                  |        |                    |        |                    |
| Initial setup    | POST   | /api/wallet        | Friend | Creates account    |
| (once)           |------->| Keypair.random()   |--bot-->| Funds it           |
|                  |        |                    |        |                    |
|                  |        | /api/validate/     | Horizon| GET account data   |
| User validates   |------->| :barcode           |------->| Barcode exists?    |
+------------------+        +--------------------+        +--------------------+
```

**Key point:** each **issuer** has its own Stellar account (one account per company). The payer only needs the barcode digits to validate.

---

## Project structure

```
stellar_boleto_guardian/
|-- api/                    # Vercel serverless (public HTTP)
|-- Integracao/
|   |-- Protheus/           # ADVPL sources (FI040ROT, Guardian.prw)
|   `-- ASAAS/              # Asaas webhook + multi-tenant
|-- lib/stellar.js          # Shared Stellar logic
|-- web/                    # Static frontend
`-- Stellar/                # Local Express server (legacy)
```

Index: **[Integracao/README.md](Integracao/README.md)**

---

## External integrations

| Channel | Location | How it registers |
|---------|----------|------------------|
| **Protheus** | `Integracao/Protheus/` | `POST /api/blockchain` with `x-admin-key` (server-side in ERP) |
| **Asaas** | `Integracao/ASAAS/` | Webhook `PAYMENT_CREATED` -> `POST /api/webhooks/asaas/{tenantId}` |
| **Web panel** | `web/dashboard.html` | SEP-10 login -> `POST /api/boleto/register` |

Asaas setup: [Integracao/ASAAS/README.md](Integracao/ASAAS/README.md) · `npm run test:asaas`

---

## DS2U Scenario -- step by step

### Prerequisites

| Requirement | Version |
|-------------|---------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| ADVPL functions | `SHA1()`, `FWRest` |

### 1. Start the Stellar API

```bash
cd Stellar
npm install
cp env.example .env
npm start
```

### 2. Create the company Stellar account (once)

```advpl
U_ZXH()            // Create ZXH table
U_CriWltSt()       // Create DS2U Stellar account, saved to ZXH
```

### 3. Configure Protheus parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **MV_XURLST** | `http://localhost:3000` | Stellar API URL |
| **MV_XURLVL** | `http://localhost:3000` | Validation page URL |

### 4. Issue a slip with blockchain registration

```advpl
U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)
// The barcode is recorded on Stellar as the Manage Data key
```

### 5. Validate a slip (end user experience)

1. Open `http://ds2u.com/validate` (or scan the QR Code)
2. Type the **44 to 48 barcode digits**
3. The system queries Stellar and shows: original amount, due date, status
4. **If data matches the printed slip, it's authentic. If not on chain, it's fraud.**

---

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/` | API status |
| `POST` | `/api/wallet` | Create company Stellar account |
| `POST` | `/api/blockchain` | Register slip (key=barcode, value=payload) |
| `GET` | `/api/validate/:barcode` | Validate slip by barcode (public) |
| `GET` | `/api/admin/boletos/:codebar` | Admin lookup (`x-admin-key`) |
| `POST` | `/api/webhooks/asaas/:tenantId` | Asaas webhook (`Integracao/ASAAS`) |
| `GET` / `POST` | `/api/admin/tenants` | Asaas tenant setup (admin) |
| `POST` | `/api/boleto/register` | Register via SEP-10 web panel |
| `GET` | `/api/account/:id/data` | List registered slips |

### Example POST /api/blockchain

```json
{
  "codebar": "23793381286000000000300000004001184340000012050",
  "nosso_numero": "000000040",
  "valor": "120.50",
  "vencimento": "2025-08-05"
}
```

---

## Security

| Aspect | Detail |
|--------|--------|
| **Immutability** | Manage Data on Stellar: once written, cannot be altered without a new transaction |
| **Company key** | Private key stored in ZXH (encrypt in production) |
| **Transport** | HTTPS mandatory in production |
| **Single account** | Company Account ID is public; private key is never exposed |

## Costs

| Environment | Cost |
|-------------|------|
| **Testnet** | Free (Friendbot) |
| **Mainnet** | ~0.00001 XLM per operation (~$0.000001) |
| **Reserve** | 1 XLM base + 0.5 XLM per registered slip (subentry) |

---

## Tech stack

<div align="center">

| | Technology | Role |
|-|------------|------|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Immutable slip storage |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Node.js + Express | API bridge between Protheus and Stellar |
| ![ADVPL](https://img.shields.io/badge/-ADVPL-00529B) | TOTVS Protheus | ERP that issues and validates slips |

</div>

---

## License

MIT - use, modify and distribute freely.

---

<div align="center">

**Guardian Labs** — Cleverson Silva (CEO) · Sergio Artero (CTO) · Demetrio De Los Rios (CMO) · **Website:** [boletoguardian.xyz](https://boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/)

</div>
