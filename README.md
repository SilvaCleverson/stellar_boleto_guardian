<div align="center">

# Stellar Boleto Guardian

### Autenticacao imutavel de boletos via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Portugues](README.pt-BR.md)** | **[English](README.en.md)** | **[Espanol](README.es.md)**

---

<br>

> *"O usuario so tem o boleto. E so o que ele precisa."*

<br>

</div>

## How it works

```
 PROTHEUS (ERP)              NODE.JS (API)                 STELLAR (Blockchain)
 +-----------------+         +-----------------+           +-------------------+
 | Emite boleto    |         | Assina transacao|           | Conta da EMPRESA  |
 | Envia codebar   | ------> | Manage Data     | --------> | key = codebar     |
 | (47 digitos)    |  JSON   | key = codebar   |  Horizon  | value = payload   |
 +-----------------+         +-----------------+           +-------------------+
                                                                    |
                                                                    v
                                                  +----------------------------------+
                                                  |  VALIDACAO PUBLICA               |
                                                  |  Usuario digita codebar do       |
                                                  |  boleto e valida na hora         |
                                                  +----------------------------------+
```

## Quick start

```bash
# 1. Start the Stellar API
cd Stellar && npm install && cp env.example .env && npm start

# 2. In Protheus (once)
# U_ZXH()                 --> create ZXH table
# U_CriWltSt()            --> create company Stellar account

# 3. On every slip
# U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)

# 4. Validate -- user only needs the barcode numbers
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

**Built by [Cleverson Silva](https://github.com/SilvaCleverson)** · **Site:** [boletoguardian.xyz](https://boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/)

</div>
