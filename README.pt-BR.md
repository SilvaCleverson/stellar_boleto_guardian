<div align="center">

# Stellar Boleto Guardian

### Autenticacao imutavel de boletos via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[English](README.en.md)** | **[Espanol](README.es.md)**

**Site:** [boletoguardian.xyz](https://www.boletoguardian.xyz)

</div>

---

> **Parte do ecossistema Guardian Labs**
>
> A Guardian Labs constrói infraestrutura pública de autenticidade para as chaves que movem dinheiro no Brasil. O Boleto Guardian é o primeiro produto desse ecossistema. Outros instrumentos de pagamento brasileiros estão no roadmap futuro.

---

## Entenda o projeto

> **O usuario so tem o boleto. E so o que ele precisa.**

Boleto adulterado e uma fraude classica no Brasil: o codigo de barras e alterado e o dinheiro vai para o lugar errado. O pagador perde. A empresa perde o cliente.

**O Boleto Guardian resolve isso de forma simples:**

1. A empresa registra o codigo de barras (47 digitos) na blockchain Stellar ao emitir o boleto
2. O pagador digita os mesmos 47 numeros em qualquer navegador
3. O sistema consulta a Stellar e responde na hora: autentico ou nao encontrado

Nenhum app. Nenhum cadastro. So os numeros do boleto.

### Por que isso importa?

| Problema | Sem o Guardian | Com o Guardian |
|----------|---------------|----------------|
| Boleto adulterado | Ninguem percebe ate o dinheiro sumir | Codebar nao existe na chain = fraude |
| Quem valida? | So o banco ou o ERP | Qualquer pessoa, com os numeros do boleto |
| O que o usuario precisa? | Hash, Account ID, dados tecnicos | **So os numeros do boleto** |
| Rastreabilidade | Logs internos que podem ser alterados | Blockchain imutavel |
| Custo | Sistemas antifraude caros | ~0,00001 XLM por boleto |

---

## Arquitetura

```
 EMPRESA (registro.html ou ERP)    API SERVERLESS (Vercel)      STELLAR (Blockchain)
 +-----------------------------+   +----------------------+     +--------------------+
 | Digita codebar (47 digitos) |   | POST /api/blockchain |     | Manage Data        |
 | Informa ADMIN_API_KEY       |-->| Valida chave admin   |---->| key  = codebar     |
 |                             |   | Assina transacao     |     | value = payload    |
 +-----------------------------+   +----------------------+     +--------------------+
                                                                        |
 PAGADOR (validation.html)                                              v
 +-----------------------------+   +----------------------+     +--------------------+
 | Digita codebar do boleto    |-->| GET /api/validate/   |---->| Codebar existe?    |
 |                             |   | :codebar             |     | Retorna resultado  |
 +-----------------------------+   +----------------------+     +--------------------+
```

**Conta Stellar da empresa (Testnet):**
`GDBLQVIDPXKSLTZUQWKBHO5J2PKLPRBXK7LKKR3JK4HRSO244FSYYBQ6`

---

## Estrutura do projeto

```
stellar_boleto_guardian/
|
|-- api/                         # Serverless functions (Vercel)
|   |-- blockchain.js            # POST /api/blockchain (registrar boleto)
|   |-- wallet.js                # POST /api/wallet (criar conta Stellar)
|   |-- validate/
|   |   +-- [codebar].js         # GET /api/validate/:codebar
|   |-- account/
|   |   +-- data.js              # GET /api/account/data
|   +-- admin/
|       +-- boletos/
|           +-- [codebar].js     # GET /api/admin/boletos/:codebar
|
|-- lib/
|   +-- stellar.js               # Logica Stellar compartilhada
|
|-- web/                         # Frontend estatico (servido pelo Vercel)
|   |-- index.html               # Landing page
|   |-- validation.html          # Validacao publica (pagador)
|   |-- registro.html            # Registro interno (empresa)
|   +-- vercel.json
|
|-- Stellar/                     # API Express (uso local / legado)
|   |-- server.js
|   |-- createCompanyAccount.js
|   |-- sendBoletoToBlockchain.js
|   +-- env.example
|
|-- Protheus/                    # Fontes ADVPL (integracao futura)
|   +-- BoletoHashStellar.prw
|
|-- vercel.json                  # Config deploy Vercel (raiz)
|-- package.json                 # Dependencias das serverless functions
+-- .gitignore
```

---

## Como rodar localmente

### Pre-requisitos

- Node.js 18+
- Vercel CLI (`npm i -g vercel`)

### 1. Instalar dependencias

```bash
npm install
cd Stellar && npm install && cd ..
```

### 2. Configurar variaveis de ambiente

Crie `.env` na raiz com:

```env
HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=testnet
COMPANY_ACCOUNT=G...
COMPANY_SECRET=S...
ADMIN_API_KEY=sua-chave-admin
```

Para gerar uma nova conta Stellar:

```bash
cd Stellar && node createCompanyAccount.js
```

### 3. Iniciar servidor local

```bash
vercel dev
```

Acesse `http://localhost:3000`.

---

## Deploy no Vercel

### 1. Variaveis de ambiente no dashboard

Settings -> Environment Variables:

| Variavel | Descricao |
|----------|-----------|
| `COMPANY_ACCOUNT` | Chave publica da conta Stellar da empresa |
| `COMPANY_SECRET` | Chave privada (nunca exposta ao cliente) |
| `ADMIN_API_KEY` | Chave para endpoints administrativos |
| `STELLAR_NETWORK` | `testnet` ou `public` |
| `HORIZON_URL` | URL do Horizon |

### 2. Root Directory

Em Settings -> General -> Root Directory: deixar **vazio** (raiz do repositorio).

O `vercel.json` ja configura `outputDirectory: "web"` para servir os arquivos estaticos.

---

## Endpoints da API

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| `POST` | `/api/blockchain` | ADMIN_API_KEY | Registra boleto na Stellar |
| `GET` | `/api/validate/:codebar` | Publica | Valida boleto pelo codebar |
| `GET` | `/api/account/data` | Publica | Lista boletos registrados |
| `GET` | `/api/admin/boletos/:codebar` | ADMIN_API_KEY | Busca boleto com dados completos |
| `POST` | `/api/wallet` | Publica | Cria nova conta Stellar |

### Registrar boleto

```http
POST /api/blockchain
x-admin-key: sua-chave-admin
Content-Type: application/json

{ "codebar": "23793381286000000000300000004001184340000012050" }
```

Resposta:
```json
{
  "success": true,
  "data": {
    "transactionHash": "abc123...",
    "ledger": 12345,
    "accountId": "GDBLQ...",
    "codebar": "23793381286000000000300000004001184340000012050"
  }
}
```

---

## Manage Data na Stellar

| Campo | Conteudo | Limite |
|-------|----------|--------|
| **key** | Codigo de barras (47 digitos) | 64 bytes |
| **value** | `nosso_num\|valor\|vencto\|status` | 64 bytes |

---

## Seguranca

| Aspecto | Detalhe |
|---------|---------|
| `COMPANY_SECRET` | Nunca sai do servidor; nunca vai ao cliente |
| `ADMIN_API_KEY` | Protege endpoints de escrita |
| Validacao publica | Qualquer um pode validar; ninguem pode registrar sem a chave |
| Imutabilidade | Manage Data na Stellar: registro permanente |

---

## Custos

| Ambiente | Custo |
|----------|-------|
| Testnet | Gratuito (Friendbot) |
| Mainnet | ~0,00001 XLM por operacao |
| Reserva | 1 XLM base + 0,5 XLM por boleto (subentry) |

---

<div align="center">

**Feito por Equipe Guardian** · **Site:** [boletoguardian.xyz](https://www.boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/) · Hospedado no [Vercel](https://vercel.com/)

</div>
