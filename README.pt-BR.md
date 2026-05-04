<div align="center">

# Stellar Boleto Guardian

### Autenticacao imutavel de boletos via blockchain Stellar

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue?logo=stellar&logoColor=white)](https://stellar.org/)
[![Node.js](https://img.shields.io/badge/API-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Protheus](https://img.shields.io/badge/ERP-TOTVS%20Protheus-00529B)](https://www.totvs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[English](README.en.md)** | **[Espanol](README.es.md)**

</div>

---

## Entenda o projeto

> **O usuario so tem o boleto. E so o que ele precisa.**

Imagine a empresa **DS2U**. Ela usa Protheus, emite centenas de boletos por dia para seus clientes. Um dia, um boleto e interceptado e o codigo de barras e adulterado. O pagador paga, mas o dinheiro vai para outro lugar. Fraude classica.

**O Stellar Boleto Guardian resolve isso de forma simples:**

1. Ao emitir o boleto, o Protheus envia o **codigo de barras** (47 digitos) para a API
2. A API grava esses numeros na blockchain Stellar -- imutavel, publico, permanente
3. O pagador digita os numeros em qualquer navegador e ve na hora: autentico ou fraude

### Por que isso importa?

| Problema | Sem o Guardian | Com o Guardian |
|----------|---------------|----------------|
| **Boleto adulterado** | Ninguem percebe ate o dinheiro sumir | Codebar nao existe na chain = fraude |
| **Quem valida?** | So o banco ou o ERP | Qualquer pessoa, com os numeros do boleto |
| **O que o usuario precisa?** | Hash, Account ID, dados tecnicos | **So os numeros do boleto** |
| **Rastreabilidade** | Logs internos que podem ser alterados | Blockchain imutavel |
| **Custo** | Sistemas antifraude caros | ~0,00001 XLM por boleto |

---

## Por que o codigo de barras como chave?

A Stellar permite gravar dados na blockchain usando a operacao **Manage Data**: uma chave (ate 64 bytes) e um valor (ate 64 bytes).

A linha digitavel de um boleto bancario tem **47 digitos** -- cabe perfeitamente nos 64 bytes.

| Abordagem | Chave | O que o usuario precisa | Experiencia |
|-----------|-------|------------------------|-------------|
| Antiga (hash) | SHA1 do boleto | Account ID + Hash | Ruim -- dados tecnicos |
| **Nova (codebar)** | **Linha digitavel** | **So os numeros do boleto** | **Excelente** |

O codigo de barras e:
- **Unico** por boleto
- **Impresso** no documento fisico
- **Legivel** por scanner ou digitacao
- **47 digitos** -- cabe nos 64 bytes do Manage Data

---

## Arquitetura

```
+------------------+        +--------------------+        +--------------------+
|    PROTHEUS      |        |     API NODE.JS    |        |      STELLAR       |
|    (DS2U)        |        |     (Express)      |        |    (Blockchain)    |
+------------------+        +--------------------+        +--------------------+
|                  |        |                    |        |                    |
| Emite boleto     | POST   | /api/blockchain    | Horizon| Manage Data        |
| codebar como     |------->| key = codebar      |------->| na CONTA DA DS2U   |
| chave            |        | value = payload    |        | (conta unica)      |
|                  |        |                    |        |                    |
| Setup inicial    | POST   | /api/wallet        | Friend | Cria conta         |
| (uma vez)        |------->| Keypair.random()   |--bot-->| Financia           |
|                  |        |                    |        |                    |
|                  |        | /api/validate/     | Horizon| GET account data   |
| Usuario valida   |------->| :codebar           |------->| Codebar existe?    |
+------------------+        +--------------------+        +--------------------+
```

**Ponto-chave:** a conta Stellar e da **empresa** (DS2U), nao de cada cliente. Todos os boletos ficam na mesma conta. O Account ID da DS2U e fixo e ja vem configurado na API -- o usuario final nunca precisa saber dele.

---

## Estrutura do projeto

```
stellar_boleto_guardian/
|
|-- Protheus/                        # Fontes ADVPL
|   |-- ZXH.prw                      # Criacao da tabela ZXH
|   |-- BoletoHashStellar.prw        # Registro + validacao + QR
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
|-- README.md                        # Indice
|-- README.pt-BR.md                  # Documentacao em portugues (este)
|-- README.en.md                     # Documentacao em ingles
|-- README.es.md                     # Documentacao em espanhol
+-- .gitignore
```

---

## Cenario DS2U -- passo a passo

### Pre-requisitos

| Requisito | Versao |
|-----------|--------|
| TOTVS Protheus | 12.1.33+ |
| Node.js | 18+ |
| Funcoes ADVPL | `SHA1()`, `FWRest` |

### 1. Subir a API Stellar

```bash
cd Stellar
npm install
cp env.example .env      # Ajustar PORT se necessario
npm start                # Sobe em http://localhost:3000
```

### 2. Criar conta Stellar da empresa (uma unica vez)

```advpl
U_ZXH()            // Cria tabela ZXH
U_CriWltSt()       // Cria conta Stellar da DS2U e grava na ZXH
```

A DS2U agora tem uma conta Stellar. O Account ID e gravado na ZXH e configurado na API.

### 3. Configurar parametros no Protheus

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| **MV_XURLST** | `http://localhost:3000` | URL da API Stellar |
| **MV_XURLVL** | `http://localhost:3000` | URL da pagina de validacao |

### 4. Emitir boleto com registro na Stellar

```advpl
// Ao emitir um boleto para o cliente 000001:
U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)
// O codebar e gravado na Stellar como chave do Manage Data
```

### 5. Validar boleto (experiencia do usuario final)

O cliente da DS2U recebe o boleto e quer saber se e autentico:

1. Abre `http://ds2u.com/validar` (ou escaneia o QR Code do boleto)
2. Digita os **47 numeros** do codigo de barras
3. O sistema consulta a Stellar e mostra:
   - Valor original
   - Vencimento
   - Nosso numero
   - Status

**Se os dados batem com o boleto impresso, e autentico. Se nao existe na chain, e fraude.**

---

## API -- Endpoints

| Metodo | Rota | O que faz |
|--------|------|-----------|
| `GET` | `/` | Status da API |
| `POST` | `/api/wallet` | Cria conta Stellar da empresa |
| `POST` | `/api/blockchain` | Registra boleto (key=codebar, value=payload) |
| `GET` | `/api/validate/:codebar` | Valida boleto pelo codigo de barras |
| `GET` | `/api/account/:id/data` | Lista todos os boletos registrados |

### Exemplo POST /api/blockchain

```json
{
  "codebar": "23793381286000000000300000004001184340000012050",
  "nosso_numero": "000000040",
  "valor": "120.50",
  "vencimento": "2025-08-05"
}
```

### Exemplo GET /api/validate/:codebar

```
GET /api/validate/23793381286000000000300000004001184340000012050
```

Resposta:
```json
{
  "success": true,
  "found": true,
  "data": {
    "codebar": "23793381286000000000300000004001184340000012050",
    "nosso_numero": "000000040",
    "valor": "120.50",
    "vencimento": "2025-08-05",
    "status": "pendente"
  }
}
```

---

## Manage Data na Stellar

| Campo | Conteudo | Limite | Exemplo |
|-------|----------|--------|---------|
| **key** | Codigo de barras (linha digitavel) | 64 bytes | `2379338128600000000030000000400118434...` (47 digitos) |
| **value** | `nosso_num\|valor\|vencto\|status` | 64 bytes | `000000040\|120.50\|20250805\|pendente` |

---

## Seguranca

| Aspecto | Detalhe |
|---------|---------|
| **Imutabilidade** | Manage Data na Stellar: uma vez gravado, nao pode ser alterado sem nova transacao |
| **Chave da empresa** | A chave privada da conta Stellar fica na ZXH (criptografar em producao) |
| **Transporte** | HTTPS obrigatorio em producao |
| **Conta unica** | Account ID da empresa e publico; chave privada nunca e exposta |

## Custos

| Ambiente | Custo |
|----------|-------|
| **Testnet** | Gratuito (Friendbot) |
| **Mainnet** | ~0,00001 XLM por operacao (~US$ 0,000001) |
| **Reserva** | 1 XLM base + 0,5 XLM por boleto registrado (subentry) |

---

## Tecnologias

<div align="center">

| | Tecnologia | Papel |
|-|------------|-------|
| ![Stellar](https://img.shields.io/badge/-Stellar-7C3AED?logo=stellar&logoColor=white) | Stellar Blockchain | Registro imutavel dos boletos |
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | Node.js + Express | API ponte entre Protheus e Stellar |
| ![ADVPL](https://img.shields.io/badge/-ADVPL-00529B) | TOTVS Protheus | ERP que gera e valida boletos |

</div>

---

## Licenca

MIT - use, modifique e distribua livremente.

---

<div align="center">

**Feito por [Cleverson Silva](https://github.com/SilvaCleverson)** · **Site:** [boletoguardian.xyz](https://boletoguardian.xyz)

Powered by [Stellar](https://stellar.org/)

</div>
