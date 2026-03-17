const express = require("express");
const cors = require("cors");
const { Horizon, Keypair } = require("@stellar/stellar-sdk");
const { sendHashToAccount, HORIZON_URL } = require("./sendHashToAccount");
const { main: createAccount } = require("./createClientAccount");

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get("/", (_req, res) => {
  res.json({
    message: "API Stellar Boleto Authentication",
    version: "2.0.0",
    status: "running",
    horizon: HORIZON_URL,
    network: process.env.STELLAR_NETWORK || "testnet",
  });
});

app.post("/api/wallet", async (_req, res) => {
  try {
    console.log("[STELLAR] Criando nova conta Stellar...");
    const result = await createAccount();
    res.json({
      success: true,
      data: result,
      message: "Conta Stellar criada com sucesso",
    });
  } catch (error) {
    console.error("[STELLAR] Erro ao criar conta:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/blockchain", async (req, res) => {
  try {
    const { hash, nosso_numero, valor, vencimento, secret } = req.body;
    const accountSecret = secret || req.body.privateKey;

    if (!hash || !nosso_numero || !valor || !vencimento) {
      return res.status(400).json({
        success: false,
        error: "Campos obrigatórios: hash, nosso_numero, valor, vencimento",
      });
    }
    if (!accountSecret) {
      return res.status(400).json({
        success: false,
        error: "Campo 'secret' ou 'privateKey' é obrigatório (ZXH_PRVKEY)",
      });
    }

    const payload = {
      hash,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: "pendente",
      timestamp: new Date().toISOString(),
    };

    console.log("[STELLAR] Enviando hash para blockchain:", hash);
    const result = await sendHashToAccount(accountSecret, payload);

    res.json({
      success: true,
      data: result,
      message: "Hash registrado na Stellar com sucesso",
    });
  } catch (error) {
    console.error("[STELLAR] Erro ao enviar para blockchain:", error.message);
    const status = error.message.includes("obrigatório") ? 400 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

app.get("/api/account/:accountId/data", async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!isValidStellarKey(accountId)) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID Stellar inválido" });
    }

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(accountId);
    const dataKeys = account.data_attr ? Object.keys(account.data_attr) : [];

    res.json({
      success: true,
      data: { keys: dataKeys, accountId },
    });
  } catch (error) {
    console.error("[STELLAR] Erro ao buscar dados da conta:", error.message);
    const status = error.message.includes("Not Found") ? 404 : 500;
    res
      .status(status)
      .json({ success: false, error: error.message || "Conta não encontrada" });
  }
});

app.get("/api/validate/:accountId/:hash", async (req, res) => {
  try {
    const { accountId, hash } = req.params;

    if (!isValidStellarKey(accountId)) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID Stellar inválido" });
    }

    const url = `${HORIZON_URL}/accounts/${accountId}/data/${encodeURIComponent(hash)}`;
    const response = await fetch(url);

    if (response.status === 404) {
      return res.json({
        success: true,
        found: false,
        message: "Hash não encontrado no blockchain",
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
      /* valor pode estar vazio */
    }

    const [nosso_numero, valor, vencimento, status] = valueDecoded.split("|");

    res.json({
      success: true,
      found: true,
      data: {
        hash,
        nosso_numero: nosso_numero || "",
        valor: valor || "",
        vencimento: vencimento || "",
        status: status || "pendente",
      },
      ledger: data.last_modified_ledger || null,
      stellarExplorer: `https://stellar.expert/explorer/${
        (process.env.STELLAR_NETWORK || "testnet") === "public"
          ? "public"
          : "testnet"
      }/account/${accountId}`,
    });
  } catch (error) {
    console.error("[STELLAR] Erro ao validar hash:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[STELLAR] Servidor rodando na porta ${PORT}`);
  console.log(`[STELLAR] Horizon: ${HORIZON_URL}`);
  console.log(`[STELLAR] Network: ${process.env.STELLAR_NETWORK || "testnet"}`);
  console.log(`[STELLAR] Endpoints:`);
  console.log(`  POST /api/wallet            - Criar conta Stellar`);
  console.log(`  POST /api/blockchain         - Registrar hash (Manage Data)`);
  console.log(`  GET  /api/account/:id/data   - Listar chaves da conta`);
  console.log(`  GET  /api/validate/:id/:hash - Validar hash`);
});
