# Stellar Boleto Guardian

**Autenticação de boletos via blockchain Stellar + TOTVS Protheus**

---

## Idiomas / Languages / Idiomas

- **[Português (pt-BR)](README.pt-BR.md)**
- **[English](README.en.md)**
- **[Español](README.es.md)**

---

## Quick start

1. **Protheus:** executar `U_ZXH()` uma vez para criar a tabela ZXH.
2. **API Stellar:** `cd Stellar && npm install && cp env.example .env && npm start`
3. **Protheus:** configurar `MV_XURLST` = `http://localhost:3000`, depois `U_CriaWalletStellar("000001")` e `U_BoletoHashStellar(...)`.

Documentação completa: [README.pt-BR.md](README.pt-BR.md) | [README.en.md](README.en.md) | [README.es.md](README.es.md).
