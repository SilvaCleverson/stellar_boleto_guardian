<div align="center">

# Stellar Boleto Guardian

### Blockchain-powered bank slip authentication

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[English](README.en.md)** | **[Espanol](README.es.md)**

---

<br>

> *"Cada boleto vira uma prova imutavel na Stellar.  
> Ninguem altera. Qualquer um valida."*

<br>

</div>

## How it works

```
 PROTHEUS (ERP)              NODE.JS (API)                 STELLAR (Blockchain)
 +-----------------+         +-----------------+           +-------------------+
 | Emite boleto    |         | Assina transacao|           | Conta do cliente  |
 | Gera SHA1 hash  | ------> | Manage Data     | --------> | guarda o hash     |
 | Busca ZXH       |  POST   | (key = hash)    |  Horizon  | para sempre       |
 +-----------------+         +-----------------+           +-------------------+
                                                                    |
                                                                    v
                                                  +----------------------------------+
                                                  |  VALIDACAO PUBLICA               |
                                                  |  Account ID + Hash = autentico?  |
                                                  +----------------------------------+
```

## Quick start

```bash
# 1. Start the Stellar API
cd Stellar && npm install && cp env.example .env && npm start

# 2. In Protheus (once)
# U_ZXH()                          --> create ZXH table
# U_CriaWalletStellar("000001")    --> create Stellar account for client

# 3. On every slip
# cHash := U_BoletoHashStellar(cNossoNum, nValor, dVencimento, cCodCli)

# 4. Validate
# Open http://localhost:3000/validation.html
```

## Full docs

| Language | Link |
|----------|------|
| Portugues (pt-BR) | **[README.pt-BR.md](README.pt-BR.md)** |
| English | **[README.en.md](README.en.md)** |
| Espanol | **[README.es.md](README.es.md)** |

---

<div align="center">

**Built by [Cleverson Silva](https://github.com/SilvaCleverson)**

Powered by [Stellar](https://stellar.org/)

</div>
