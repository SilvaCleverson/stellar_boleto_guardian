<div align="center">

# Stellar Boleto Guardian

### Immutable boleto authentication via Stellar blockchain

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[English](README.en.md)** | **[Espanol](README.es.md)**

**Site:** [boletoguardian.xyz](https://www.boletoguardian.xyz)

---

<br>

> *"O usuario so tem o boleto. E so o que ele precisa."*

<br>

</div>

> **Part of the Guardian Labs ecosystem**
>
> Guardian Labs builds public authenticity infrastructure for the keys that move money in Brazil. Boleto Guardian is the first product in this ecosystem. Other Brazilian payment instruments are on the future roadmap.

---

## How it works

```
 COMPANY (registro.html)         SERVERLESS API (Vercel)       STELLAR (Blockchain)
 +---------------------------+   +----------------------+      +--------------------+
 | Enter codebar (44 to 47 digits) |   | POST /api/blockchain |      | Manage Data        |
 | Provide ADMIN_API_KEY     |-->| Verify admin key     |----> | key  = codebar     |
 |                           |   | Sign transaction     |      | value = payload    |
 +---------------------------+   +----------------------+      +--------------------+
                                                                       |
 PAYER (validation.html)                                               v
 +---------------------------+   +----------------------+      +--------------------+
 | Type barcode from boleto  |-->| GET /api/validate/   |----> | Codebar exists?    |
 |                           |   | :codebar             |      | Return result      |
 +---------------------------+   +----------------------+      +--------------------+
```

## Quick start (local)

```bash
# 1. Install dependencies
npm install
cd Stellar && npm install && cd ..

# 2. Configure environment
cp Stellar/env.example Stellar/.env
# Fill in COMPANY_ACCOUNT, COMPANY_SECRET, ADMIN_API_KEY

# 3. Run locally (mirrors production)
vercel dev
```

Open `http://localhost:3000`.

## Project structure

```
stellar_boleto_guardian/
├── api/                    # Vercel serverless functions
│   ├── blockchain.js       # POST /api/blockchain
│   ├── wallet.js           # POST /api/wallet
│   ├── validate/[codebar].js
│   ├── account/data.js
│   └── admin/boletos/[codebar].js
├── lib/
│   └── stellar.js          # Shared Stellar SDK logic
├── web/                    # Static frontend (Vercel outputDirectory)
│   ├── index.html
│   ├── validation.html     # Public boleto validation
│   └── registro.html       # Internal registration (admin only)
├── Stellar/                # Express server (local / legacy)
├── Protheus/               # ADVPL sources (future integration)
├── vercel.json             # Vercel config
└── package.json            # Serverless function dependencies
```

## Full docs

| Language | Link |
|----------|------|
| Portugues (pt-BR) | **[README.pt-BR.md](README.pt-BR.md)** |
| English | **[README.en.md](README.en.md)** |
| Espanol | **[README.es.md](README.es.md)** |

---

<div align="center">

**Built by Equipe Guardian** · **Site:** [boletoguardian.xyz](https://www.boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/) · Hosted on [Vercel](https://vercel.com/)

</div>
