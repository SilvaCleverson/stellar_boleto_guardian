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

> **Guardian Labs** builds **public authenticity infrastructure** for the keys that move money — immutable, auditable proof that a payment instrument is legitimate, without relying only on the issuer or the bank. **Boleto Guardian** is the **first product** of Guardian Labs (bank slip authenticity on Stellar; validation via 44 to 48 barcode digits). Under the hood it uses **Guardian Seal** — the trust-seal engine that signs, registers on-chain proof, and exposes public verification. Other payment instruments are on the roadmap.

## What is Guardian Labs

**Guardian Labs** is the **project brand** (parent brand) developing public trust layers over payment identifiers. It is not a bank, payment fintech, or Stellar Anchor — it is the **authenticity layer** issuers and payers use via API, integrated with any ERP.

| Guardian Labs | Boleto Guardian | Guardian Seal |
|---------------|-----------------|---------------|
| Brand and long-term thesis | Product: bank slip authenticity | Tool used by Boleto Guardian |
| Infrastructure for multiple instruments | Experience: register and validate slips | Creates the seal, signs (Ed25519), posts proof on Stellar (Soroban), public verify / QR |
| Pitch: company + roadmap | First product in production | Platform behind the product (private repo) |

In practice, Boleto Guardian and Guardian Seal ship as one experience for the end user. In the docs, **Seal** is the trust-seal tool; **Boleto Guardian** is the product built on top of it.

## Guardian Seal

**Guardian Seal** is the SaaS trust-seal platform from Guardian Labs. For Boleto Guardian it:

1. Builds a canonical digital record of the boleto
2. Signs it with the tenant Ed25519 key
3. Anchors an integrity proof on Stellar (Soroban smart contract)
4. Exposes a public Guardian Seal (link + QR Code) anyone can verify

Implementation lives in the private Guardian Seal codebase (local copy under `guardian-seal-main/`).

## Guardian Labs team

| Role | Name |
|------|------|
| **CEO** | Cleverson Silva |
| **CTO** | Sergio Artero |
| **CMO** | Demetrio De Los Rios |

---

## How it works

```
 ISSUER (Integracao/)            BOLETO GUARDIAN + GUARDIAN SEAL     STELLAR (Blockchain)
 +---------------------------+   +-------------------------------+   +--------------------+
 | Protheus / Asaas / portal |-->| Seal: hash + Ed25519 sign     |-->| Soroban registry   |
 | Issues boleto             |   | Persist record + public seal  |   | Integrity proof    |
 +---------------------------+   +-------------------------------+   +--------------------+
 PAYER / ANYONE                                                          |
 +---------------------------+   +-------------------------------+       v
 | Barcode, link or QR Code  |-->| Public verify (Seal)          |-->| Authentic?         |
 +---------------------------+   +-------------------------------+   +--------------------+
```

**Integrations:** [Integracao/README.md](Integracao/README.md) - `Protheus/` (ERP) and `ASAAS/` (payment gateway webhook).  
**Seal platform:** local copy under `guardian-seal-main/`.

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

## Guardian Labs landing deployment

The VPS deployment runs the static site as a single Nginx container named
`guardian-labs-landing`. It joins the existing `proxy` network and is routed by
the shared Traefik instance at [guardian-labs.xyz](https://guardian-labs.xyz).
It does not start another Traefik, Portainer, API, or database container.

See [docs/VPS-DEPLOYMENT.md](docs/VPS-DEPLOYMENT.md) for the deployment
workflow, required secrets, and verification commands.

## Project structure

```
stellar_boleto_guardian/
|-- api/                    # Vercel serverless functions
|   |-- blockchain.js       # POST /api/blockchain
|   |-- wallet.js           # POST /api/wallet
|   |-- validate/[codebar].js
|   |-- account/data.js
|   `-- admin/boletos/[codebar].js
|-- lib/
|   `-- stellar.js          # Shared Stellar SDK logic
|-- web/                    # Static frontend (Vercel outputDirectory)
|   |-- index.html
|   |-- validation.html     # Public boleto validation
|   `-- registro.html       # Internal registration (admin only)
|-- Stellar/                # Express server (local / legacy)
|-- Integracao/
|   |-- Protheus/           # ADVPL (TOTVS)
|   `-- ASAAS/              # Asaas webhook
|-- docker/
|   |-- nginx/              # Single landing-page container
|   `-- traefik/            # Route snippet for the shared VPS proxy
|-- docker-compose.landing.prod.yml # One-service VPS deployment
|-- vercel.json             # Vercel config
`-- package.json            # Serverless function dependencies
```

## Full docs

| Language | Link |
|----------|------|
| Portugues (pt-BR) | **[README.pt-BR.md](README.pt-BR.md)** |
| English | **[README.en.md](README.en.md)** |
| Espanol | **[README.es.md](README.es.md)** |

---

<div align="center">

**Guardian Labs** — Cleverson Silva (CEO) · Sergio Artero (CTO) · Demetrio De Los Rios (CMO) · **Site:** [boletoguardian.xyz](https://www.boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/) · Hosted on [Vercel](https://vercel.com/)

</div>
