const express = require("express");
const cors = require("cors");
const { Horizon, Keypair } = require("@stellar/stellar-sdk");
const {
  sendBoletoToBlockchain,
  isValidCodebar,
  normalizeCodebar,
  HORIZON_URL,
} = require("./sendBoletoToBlockchain");
const { createCompanyAccount } = require("./createCompanyAccount");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";
const COMPANY_SECRET = process.env.COMPANY_SECRET || "";
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

function isValidStellarKey(key) {
  if (!key || typeof key !== "string" || key.length !== 56) return false;
  try {
    Keypair.fromPublicKey(key);
    return true;
  } catch {
    return false;
  }
}

function getExplorerUrl(accountId) {
  const net = STELLAR_NETWORK === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/account/${accountId}`;
}

app.get("/", (_req, res) => {
  res.json({
    name: "Boleto Guardian API",
    version: "3.0.0",
    status: "running",
    horizon: HORIZON_URL,
    network: STELLAR_NETWORK,
    companyAccount: COMPANY_ACCOUNT || "(não configurado)",
  });
});

app.post("/api/wallet", async (_req, res) => {
  try {
    console.log("[BOLETO GUARDIAN] Criando conta Stellar da empresa...");
    const result = await createCompanyAccount();
    res.json({
      success: true,
      data: result,
      message:
        "Conta Stellar da empresa criada. Configure COMPANY_ACCOUNT e COMPANY_SECRET no .env.",
    });
  } catch (error) {
    console.error("[BOLETO GUARDIAN] Erro ao criar conta:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/blockchain", async (req, res) => {
  try {
    const { codebar, nosso_numero, valor, vencimento, secret } = req.body;
    const companySecret = secret || COMPANY_SECRET;

    if (!codebar || !nosso_numero || !valor || !vencimento) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios: codebar, nosso_numero, valor, vencimento",
      });
    }

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error:
          "Código de barras inválido. Deve conter exatamente 47 dígitos numéricos.",
      });
    }

    if (!companySecret) {
      return res.status(400).json({
        success: false,
        error:
          "Chave secreta da empresa não configurada. " +
          "Defina COMPANY_SECRET no .env ou envie no campo 'secret'.",
      });
    }

    const payload = {
      codebar,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: "pendente",
    };

    console.log(
      "[BOLETO GUARDIAN] Registrando boleto:",
      normalizeCodebar(codebar)
    );
    const result = await sendBoletoToBlockchain(companySecret, payload);

    res.json({
      success: true,
      data: result,
      message: "Boleto registrado na blockchain Stellar com sucesso",
    });
  } catch (error) {
    console.error(
      "[BOLETO GUARDIAN] Erro ao registrar boleto:",
      error.message
    );
    const status = error.message.includes("inválido") ? 400 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

app.get("/api/validate/:codebar", async (req, res) => {
  try {
    const { codebar } = req.params;

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error:
          "Código de barras inválido. Deve conter exatamente 47 dígitos numéricos.",
      });
    }

    const accountId = req.query.account || COMPANY_ACCOUNT;
    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error:
          "Conta da empresa não configurada. " +
          "Defina COMPANY_ACCOUNT no .env ou envie via query param ?account=G...",
      });
    }

    const normalized = normalizeCodebar(codebar);
    const url = `${HORIZON_URL}/accounts/${accountId}/data/${encodeURIComponent(normalized)}`;
    const response = await fetch(url);

    if (response.status === 404) {
      return res.json({
        success: true,
        found: false,
        message:
          "Código de barras NÃO encontrado na blockchain. " +
          "Este boleto pode ser fraudulento.",
      });
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: err.detail || err.error || "Erro ao consultar Horizon",
      });
    }

    const data = await response.json();
    let valueDecoded = "";
    try {
      valueDecoded = Buffer.from(data.value, "base64").toString("utf8");
    } catch (_) {
      /* valor vazio */
    }

    const [nosso_numero, valor, vencimento, status] = valueDecoded.split("|");

    res.json({
      success: true,
      found: true,
      data: {
        codebar: normalized,
        nosso_numero: nosso_numero || "",
        valor: valor || "",
        vencimento: vencimento || "",
        status: status || "pendente",
      },
      ledger: data.last_modified_ledger || null,
      stellarExplorer: getExplorerUrl(accountId),
    });
  } catch (error) {
    console.error(
      "[BOLETO GUARDIAN] Erro ao validar boleto:",
      error.message
    );
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/account/data", async (req, res) => {
  try {
    const accountId = req.query.account || COMPANY_ACCOUNT;

    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error:
          "Conta da empresa não configurada. " +
          "Defina COMPANY_ACCOUNT no .env ou envie via query param ?account=G...",
      });
    }

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(accountId);
    const dataEntries = account.data_attr || {};

    const boletos = Object.entries(dataEntries).map(([key, valueB64]) => {
      let valueDecoded = "";
      try {
        valueDecoded = Buffer.from(valueB64, "base64").toString("utf8");
      } catch (_) {
        /* ignore */
      }
      const [nosso_numero, valor, vencimento, status] =
        valueDecoded.split("|");
      return {
        codebar: key,
        nosso_numero: nosso_numero || "",
        valor: valor || "",
        vencimento: vencimento || "",
        status: status || "",
      };
    });

    res.json({
      success: true,
      data: {
        accountId,
        total: boletos.length,
        boletos,
      },
    });
  } catch (error) {
    console.error(
      "[BOLETO GUARDIAN] Erro ao listar boletos:",
      error.message
    );
    const status = error.message.includes("Not Found") ? 404 : 500;
    res
      .status(status)
      .json({ success: false, error: error.message || "Conta não encontrada" });
  }
});

app.listen(PORT, () => {
  console.log(`[BOLETO GUARDIAN] Servidor rodando na porta ${PORT}`);
  console.log(`[BOLETO GUARDIAN] Horizon: ${HORIZON_URL}`);
  console.log(`[BOLETO GUARDIAN] Network: ${STELLAR_NETWORK}`);
  console.log(
    `[BOLETO GUARDIAN] Conta empresa: ${COMPANY_ACCOUNT || "(não configurada)"}`
  );
  console.log(`[BOLETO GUARDIAN] Endpoints:`);
  console.log(`  POST /api/wallet              - Criar conta Stellar da empresa`);
  console.log(`  POST /api/blockchain           - Registrar boleto (codebar)`);
  console.log(`  GET  /api/validate/:codebar    - Validar boleto pelo código de barras`);
  console.log(`  GET  /api/account/data         - Listar boletos registrados`);
});
