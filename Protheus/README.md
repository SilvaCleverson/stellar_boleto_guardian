# Fontes ADVPL -- Stellar Boleto Guardian

Fontes Protheus para autenticacao imutavel de boletos via blockchain Stellar.

## Nova arquitetura: codebar como chave

Na nova arquitetura, o **codigo de barras** (linha digitavel, 47 digitos) e usado como chave do Manage Data na Stellar. Isso permite que o usuario final valide o boleto digitando apenas os numeros impressos no documento.

```
Protheus (DS2U)                     Stellar (Blockchain)
+------------------+                +--------------------+
| Emite boleto     |   FWRest POST  | Manage Data        |
| Envia codebar    | -------------> | key = codebar      |
| como chave       |                | value = payload    |
+------------------+                | (conta da empresa) |
                                    +--------------------+
```

> **Nota:** o codigo sera refatorado para implementar esta arquitetura. Atualmente usa hash SHA1 como chave.

## Estrutura

### ZXH.prw

Tabela ZXH para cadastro de contas Stellar. Na nova arquitetura, armazena a **conta unica da empresa**.

| Campo | Tipo | Tam | Descricao |
|-------|------|-----|-----------|
| ZXH_FILIAL | C | 2 | Filial |
| ZXH_CODCLI | C | 6 | Codigo do cliente (ou empresa) |
| ZXH_WALLET | C | 60 | Stellar Account ID |
| ZXH_TOPIC | C | 20 | Reservado |
| ZXH_PRVKEY | C | 300 | Chave privada Stellar |
| ZXH_DTGER | D | 8 | Data da criacao |

**Indices:**
- 1: `ZXH_FILIAL+ZXH_WALLET` (Filial+Wallet)
- 2: `ZXH_FILIAL+ZXH_CODCLI` (Filial+Cliente)

### BoletoHashStellar.prw

Registro de boletos na Stellar e validacao.

| Funcao | Tipo | Chars | O que faz |
|--------|------|-------|-----------|
| `U_BolStlr()` | User | 7 | Registra boleto na Stellar (codebar como chave) |
| `U_VldBolSt()` | User | 8 | Valida boleto pelo codebar |
| `U_CriWltSt()` | User | 8 | Cria conta Stellar da empresa |
| `U_TstStlr()` | User | 7 | Testa conexao com a API |

## Fluxo planejado (nova arquitetura)

```advpl
// 1. Criar tabela ZXH (uma vez)
U_ZXH()

// 2. Criar conta Stellar da empresa (uma vez)
U_CriWltSt()

// 3. Testar integracao
U_TstStlr()

// 4. Ao emitir cada boleto, registrar na Stellar
U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)
// codebar = linha digitavel (47 digitos)
// Grava na Stellar: key = codebar, value = nossonum|valor|vencto|status

// 5. Validar boleto (usuario digita os 47 numeros)
lValido := U_VldBolSt(cCodebar)
// Consulta a API: GET /api/validate/{codebar}
// Nao precisa de Account ID -- a conta da empresa e fixa
```

## Boas praticas Protheus aplicadas

| Pratica | Detalhe |
|---------|---------|
| **FWRest** | HTTP via classe TOTVS padrao |
| **ErrorBlock + Begin Sequence** | Tratamento de excecao nas chamadas HTTP |
| **Default** | Parametros com valor padrao |
| **RecLock check** | Verificacao de retorno do RecLock |
| **Logging [STELLAR]** | Prefixo padrao no ConOut |
| **EncodeUTF8/DecodeUTF8** | Conversao CP1252 <-> UTF-8 |

## Regras de nomenclatura Protheus

| Tipo | Max. chars | Exemplo |
|------|------------|---------|
| User Function | 8 | `BolStlr` (7) |
| Static Function | 10 | `ExtCmpJSON` (10) |
| Nome de campo | 10 | `ZXH_PRVKEY` (10) |

## Parametros Protheus

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| **MV_XURLST** | `http://localhost:3000` | URL da API Stellar |
| **MV_XURLVL** | `http://localhost:3000` | URL da pagina de validacao |
