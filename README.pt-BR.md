<div align="center">

# Stellar Boleto Guardian

### Autenticacao de boletos bancarios via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[English](README.en.md)** | **[Espanol](README.es.md)**

</div>

---

## Entenda o projeto

> **Cada boleto vira um registro imutavel na Stellar.**

Imagine o seguinte problema: um boleto e gerado, e alguem no meio do caminho altera o codigo de barras ou o valor. O pagador paga, mas o dinheiro vai para outro lugar. Fraude classica.

**O Stellar Boleto Guardian resolve isso em 3 passos:**

```
                        +------------------+
                        |   1. PROTHEUS    |
                        |                  |
                        |  Emite o boleto  |
                        |  Gera hash SHA1  |
                        |  do boleto       |
                        +--------+---------+
                                 |
                                 | POST hash + account + secret
                                 v
                        +------------------+
                        |   2. API NODE    |
                        |                  |
                        |  Assina uma      |
                        |  transacao       |
                        |  Stellar         |
                        |  (Manage Data)   |
                        +--------+---------+
                                 |
                                 | Envia ao Horizon
                                 v
                        +------------------+
                        |   3. STELLAR     |
                        |                  |
                        |  Grava o hash    |
                        |  na conta do     |
                        |  cliente         |
                        |  PARA SEMPRE     |
                        +--------+---------+
                                 |
                                 v
            +--------------------------------------------+
            |          VALIDACAO PUBLICA                  |
            |                                            |
            |  Qualquer pessoa informa Account ID +      |
            |  Hash e ve na hora se o boleto e autentico |
            +--------------------------------------------+
```

### Por que isso importa?

| Problema | Sem o Guardian | Com o Guardian |
|----------|---------------|----------------|
| **Boleto adulterado** | Ninguem percebe ate o dinheiro sumir | Hash muda = fraude detectada |
| **Quem valida?** | So o banco ou o ERP | Qualquer pessoa, pela blockchain |
| **Rastreabilidade** | Logs internos que podem ser alterados | Transacao Stellar imutavel |
| **Custo** | Sistemas antifraude caros | ~0,00001 XLM por boleto |

---

## O que o projeto faz

- **Gera hash unico** de cada boleto no Protheus (SHA1)
- **Registra na Stellar** usando a operacao Manage Data
- **Valida publicamente** via pagina web (Account ID + hash)
- **Gera QR Code** no boleto apontando para a validacao

---

## Arquitetura

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     API NODE.JS    |        |      STELLAR       |
|    (ADVPL)       |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| BoletoHash       | POST   | /api/blockchain    | Horizon| Manage Data        |
| Stellar.prw      |------->| Assina tx com      |------->| name = hash        |
|                  |        | secret do cliente  |        | value = payload    |
| ZXH.prw          |        |                    |        |                    |
| (tabela contas)  | POST   | /api/wallet        | Friend | Cria conta         |
|                  |------->| Keypair.random()   |--bot-->| Financia 10k XLM   |
|                  |        |                    |        |                    |
|                  | GET    | /api/validate/     | Horizon| GET account data   |
|                  |------->| :accountId/:hash   |------->| Hash existe?       |
+------------------+        +--------------------+        +--------------------+
```

---

## Estrutura do projeto

```
stellar_boleto_guardian/
|
|-- Protheus/                        # Fontes ADVPL
|   |-- ZXH.prw                      # Criacao da tabela ZXH
|   |-- BoletoHashStellar.prw        # Hash + envio + validacao + QR
|   +-- README.md
|
|-- Stellar/                         # API Node.js
|   |-- server.js                    # Express (4 endpoints)
|   |-- createClientAccount.js       # Keypair + Friendbot
|   |-- sendHashToAccount.js         # Manage Data transaction
|   |-- env.example                  # Variaveis de ambiente
|   |-- package.json
|   |-- README.md
|   +-- public/
|       +-- validation.html          # Pagina de validacao publica
|
|-- README.md                        # Indice (este arquivo e o principal)
|-- README.pt-BR.md                  # Documentacao em portugues
|-- README.en.md                     # Documentacao em ingles
|-- README.es.md                     # Documentacao em espanhol
+-- .gitignore
```

---

## Instalacao passo a passo

### Pre-requisitos

| Requisito | Versao |
|-----------|--------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| Funcoes ADVPL | `SHA1()`, `HTTPRequest()` |

### 1. Criar tabela ZXH no Protheus

Compilar `ZXH.prw` e executar **uma unica vez:**

```advpl
U_ZXH()
```

### 2. Subir a API Stellar

```bash
cd Stellar
npm install
cp env.example .env      # Ajustar PORT se necessario
npm start                # Sobe em http://localhost:3000
```

### 3. Configurar parametros no Protheus

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| **MV_XURLST** | `http://localhost:3000` | URL da API Stellar |
| **MV_XURLVL** | `http://localhost:3000` | URL da pagina de validacao |

### 4. Criar conta Stellar para um cliente

```advpl
U_CriaWalletStellar("000001")
// Grava automaticamente na ZXH: Account ID + chave secreta
```

### 5. Gerar boleto com hash

```advpl
cHash := U_BoletoHashStellar("123456789012", 1235.40, CToD("05/08/2025"), "000001")
// Hash e registrado na Stellar e QR Code e gerado
```

### 6. Validar boleto

Abrir `http://localhost:3000/validation.html` e informar:
- **Account ID** (da tabela ZXH)
- **Hash** (impresso no boleto / QR Code)

---

## API - Endpoints

| Metodo | Rota | O que faz |
|--------|------|-----------|
| `GET` | `/` | Status da API |
| `POST` | `/api/wallet` | Cria conta Stellar (Friendbot) |
| `POST` | `/api/blockchain` | Registra hash na conta (Manage Data) |
| `GET` | `/api/account/:id/data` | Lista hashes da conta |
| `GET` | `/api/validate/:id/:hash` | Valida se hash existe |

### Exemplo POST /api/blockchain

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

## Tabela ZXH (Protheus)

| Campo | Tipo | Tam | Descricao |
|-------|------|-----|-----------|
| `ZXH_FILIAL` | C | 2 | Filial |
| `ZXH_CODCLI` | C | 6 | Codigo do cliente |
| `ZXH_WALLET` | C | 60 | Stellar Account ID (chave publica) |
| `ZXH_TOPIC` | C | 20 | Reservado |
| `ZXH_PRIVKEY` | C | 300 | Chave secreta Stellar |
| `ZXH_DTGER` | D | 8 | Data de criacao |

---

## Funcoes ADVPL

| Funcao | O que faz |
|--------|-----------|
| `U_ZXH()` | Cria a tabela ZXH |
| `U_BoletoHashStellar(cNossoNum, nValor, dVenc, cCodCli)` | Gera hash, registra na Stellar, gera QR |
| `U_ValidaBoletoStellar(cAccount, cHash)` | Valida hash na conta Stellar |
| `U_CriaWalletStellar(cCodCli)` | Cria conta Stellar e grava na ZXH |
| `U_TestaIntegracaoStellar()` | Testa conexao com a API |

---

## Seguranca

| Aspecto | Detalhe |
|---------|---------|
| **Hash** | SHA1 sobre nosso_numero + valor + vencimento + cod_cliente |
| **Imutabilidade** | Manage Data na Stellar: uma vez gravado, nao pode ser alterado sem nova transacao |
| **Chaves privadas** | Nunca logar; em producao, criptografar na ZXH |
| **Transporte** | HTTPS obrigatorio em producao |

## Custos

| Ambiente | Custo |
|----------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacao (~US$ 0,000001) |

---

## Tecnologias

<div align="center">

| | Tecnologia | Papel |
|-|------------|-------|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Registro imutavel dos hashes |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Node.js + Express | API ponte entre Protheus e Stellar |
| ![ADVPL](https://img.shields.io/badge/-ADVPL-00529B) | TOTVS Protheus | ERP que gera e valida boletos |

</div>

---

## Licenca

MIT - use, modifique e distribua livremente.

---

<div align="center">

**Feito por [Cleverson Silva](https://github.com/SilvaCleverson)**

Powered by [Stellar](https://stellar.org/)

</div>
