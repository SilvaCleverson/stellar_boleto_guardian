# Stellar Boleto Guardian

Bank slip authentication using the Stellar blockchain, integrated with TOTVS Protheus.

---

## 🎯 Understand the project

> **Every slip becomes an immutable record on Stellar.**  
> Protheus generates a unique hash of the slip, the API writes that hash to the client’s Stellar account (Manage Data), and anyone can verify authenticity on the network — without touching the ERP.

**Flow in 3 steps:**

```
  PROTHEUS                    NODE API                       STELLAR
  (issues slip)       →     (signs transaction)       →     (on-chain record)
       │                            │                            │
       │  SHA1 hash +                │  Manage Data                │  Client account
       │  Account/Secret             │  (key=hash,                 │  stores the hash
       │  from ZXH                   │   value=payload)            │  permanently
       └────────────────────────────┴────────────────────────────┘
                                              │
                                              ▼
  PUBLIC VALIDATION   ←  Anyone opens the page, enters Account ID + hash,
                         and sees instantly: slip authentic or not.
```

| Why it matters | What you get |
|----------------|--------------|
| **Fraud** | Hash on-chain = slip cannot be tampered with without breaking the proof |
| **Trust** | Public validation: payer or third party confirms without calling the ERP |
| **Traceability** | Every slip is tied to a Stellar transaction (Horizon) |

---

## Overview

This project:

- **Generates a unique hash** for each slip in Protheus (SHA1)
- **Records on Stellar** (Manage Data) for immutability
- **Allows public validation** via QR Code and web page
- **Helps prevent fraud** with on-chain verification

## Architecture

Protheus generates the hash and calls the Node.js API; the API signs a Stellar transaction (Manage Data) on the client’s account and submits it to Horizon. Each client has a Stellar account; validation reads that account’s data.

## Project structure

```
Boleto/
├── Protheus/           # ADVPL sources
│   ├── ZXH.prw         # ZXH table (Stellar account per client)
│   ├── BoletoHashStellar.prw
│   └── README.md
├── Stellar/            # Node.js API
│   ├── server.js, createClientAccount.js, sendHashToAccount.js
│   ├── public/validation.html
│   └── README.md
└── README.md
```

## Quick setup

### 1. Protheus
```advpl
U_ZXH()  // Create ZXH table (once)
```

### 2. Stellar API
```bash
cd Stellar
npm install
cp env.example .env
npm start
```

### 3. Protheus
Set **MV_XURLST** and **MV_XURLVL** (e.g. `http://localhost:3000`).  
Create account: `U_CriaWalletStellar("000001")`.  
Generate hash: `cHash := U_BoletoHashStellar(cNossoNum, nValor, dVencimento, cCodCli)`.

### 4. Validation
Open `http://localhost:3000/validation.html` and enter Account ID and hash.

## ZXH table

| Field      | Type | Description           |
|-----------|------|-----------------------|
| ZXH_FILIAL | C  2 | Branch                |
| ZXH_CODCLI | C  6 | Client code           |
| ZXH_WALLET | C 60 | Stellar Account ID    |
| ZXH_TOPIC  | C 20 | Reserved              |
| ZXH_PRIVKEY| C 300| Stellar private key   |
| ZXH_DTGER  | D  8 | Creation date         |

## Security

- SHA1 hash for integrity; Stellar for immutability.
- Do not log private keys; consider encrypting ZXH in production.
- Use HTTPS in production.

## Stellar costs

- Testnet: Friendbot funds accounts; negligible cost.
- Mainnet: ~0.00001 XLM per operation.

## License

MIT.

---

**Author:** Cleverson Silva
