# Stellar Boleto Guardian

Solução para autenticação de boletos bancários usando blockchain Stellar, integrada ao TOTVS Protheus.

---

## 🎯 Entenda o projeto

> **Cada boleto vira um registro imutável na Stellar.**  
> O Protheus gera um hash único do boleto, a API grava esse hash na conta Stellar do cliente (Manage Data) e qualquer pessoa pode validar a autenticidade pela rede — sem depender do ERP.

**Fluxo em 3 atos:**

```
  PROTHEUS                    API NODE                      STELLAR
  (emite boleto)     →     (assina transação)      →     (registro on-chain)
       │                            │                            │
       │  Hash SHA1 +                │  Manage Data               │  Conta do cliente
       │  Account/Secret             │  (chave=hash,               │  guarda o hash
       │  da ZXH                     │   valor=dados)              │  para sempre
       └────────────────────────────┴────────────────────────────┘
                                              │
                                              ▼
  VALIDAÇÃO PÚBLICA  ←  Qualquer um acessa a página, informa Account ID + hash
                        e vê na hora: boleto autêntico ou não.
```

| Por que importa | O que você ganha |
|-----------------|------------------|
| **Fraude** | Hash na blockchain = boleto não pode ser alterado sem quebrar a prova |
| **Confiança** | Validação pública: pagador ou terceiro confirma sem falar com o ERP |
| **Rastreabilidade** | Cada boleto fica atado a uma transação Stellar (Horizon) |

---

## Visão geral

Este projeto:

- **Gera hash único** de cada boleto no Protheus (SHA1)
- **Registra na Stellar** (Manage Data) para imutabilidade
- **Valida publicamente** via QR Code e página web
- **Previne fraudes** com verificação on-chain

## Arquitetura

Protheus gera o hash e chama a API Node.js; a API assina uma transação Stellar (Manage Data) na conta do cliente e envia ao Horizon. Cada cliente tem uma conta Stellar; a validação consulta os dados dessa conta.

## Estrutura do projeto

```
Boleto/
├── Protheus/           # Fontes ADVPL
│   ├── ZXH.prw         # Tabela ZXH (conta Stellar por cliente)
│   ├── BoletoHashStellar.prw
│   └── README.md
├── Stellar/            # API Node.js
│   ├── server.js, createClientAccount.js, sendHashToAccount.js
│   ├── public/validation.html
│   └── README.md
└── README.md
```

## Instalação rápida

### 1. Protheus
```advpl
U_ZXH()  // Criar tabela ZXH (uma vez)
```

### 2. API Stellar
```bash
cd Stellar
npm install
cp env.example .env
npm start
```

### 3. Protheus
Configurar **MV_XURLST** e **MV_XURLVL** (ex.: `http://localhost:3000`).  
Criar conta: `U_CriaWalletStellar("000001")`.  
Gerar hash: `cHash := U_BoletoHashStellar(cNossoNum, nValor, dVencimento, cCodCli)`.

### 4. Validação
Abrir `http://localhost:3000/validation.html` e informar Account ID e hash.

## Tabela ZXH

| Campo     | Tipo | Descrição              |
|----------|------|------------------------|
| ZXH_FILIAL | C  2 | Filial                 |
| ZXH_CODCLI | C  6 | Código do cliente      |
| ZXH_WALLET | C 60 | Stellar Account ID     |
| ZXH_TOPIC  | C 20 | Reservado              |
| ZXH_PRIVKEY| C 300| Chave privada Stellar  |
| ZXH_DTGER  | D  8 | Data da criação        |

## Segurança

- Hash SHA1 para integridade; Stellar para imutabilidade.
- Chaves privadas não devem ser logadas; em produção, considerar criptografia na ZXH.
- Usar HTTPS em produção.

## Custos Stellar

- Testnet: Friendbot financia; custo desprezível.
- Mainnet: ~0,00001 XLM por operação.

## Licença

MIT.

---

**Autor:** Cleverson Silva
