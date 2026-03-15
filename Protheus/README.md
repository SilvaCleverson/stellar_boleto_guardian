# Fontes ADVPL – Stellar Boleto Guardian

Fontes Protheus para autenticação de boletos via blockchain Stellar.

## Estrutura

### ZXH.prw
- **Função:** criação da tabela ZXH (cadastro de contas Stellar por cliente).
- **Campos:**
  - ZXH_FILIAL: Filial (C, 2)
  - ZXH_CODCLI: Código do cliente (C, 6)
  - ZXH_WALLET: Stellar Account ID (C, 60)
  - ZXH_TOPIC: Reservado (C, 20)
  - ZXH_PRIVKEY: Chave privada Stellar (C, 300)
  - ZXH_DTGER: Data da criação (D, 8)

### BoletoHashStellar.prw
- **Função:** geração de hash do boleto e registro na Stellar via API Node.
- **Funções principais:**
  - `U_BoletoHashStellar()`: Gera hash, envia para API e gera QR.
  - `U_ValidaBoletoStellar()`: Valida hash na conta Stellar.
  - `U_CriaWalletStellar()`: Cria conta Stellar e grava na ZXH.
  - `U_TestaIntegracaoStellar()`: Testa conexão com a API.

## Como usar

```advpl
// 1. Criar tabela ZXH (uma vez)
U_ZXH()

// 2. Testar integração com a API
U_TestaIntegracaoStellar()

// 3. Criar conta Stellar para o cliente
U_CriaWalletStellar("000001")

// 4. Gerar hash ao emitir boleto
cHash := U_BoletoHashStellar("123456789012", 1235.40, CToD("2025-08-05"), "000001")

// 5. Validar boleto (Account ID = ZXH_WALLET do cliente)
lValido := U_ValidaBoletoStellar(cAccountId, cHash)
```

## Integração

- Os fontes chamam a API Node.js na pasta `Stellar/`.
- Parâmetros no Protheus: **MV_XURLST** (URL da API, ex.: `http://localhost:3000`) e **MV_XURLVL** (URL da página de validação).

## URLs

- Horizon testnet: https://horizon-testnet.stellar.org  
- Stellar: https://stellar.org
