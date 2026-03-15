const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sendHashToAccount } = require("./sendHashToAccount");
const { main: createAccount } = require("./createClientAccount");

const app = express();
const PORT = process.env.PORT || 3000;
const HORIZON_URL = process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function base64UrlEncode(str) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

app.get("/", (req, res) => {
  res.json({
    message: "API Stellar Boleto Authentication",
    version: "1.0.0",
    status: "running",
    horizon: HORIZON_URL,
  });
});

// Criar conta Stellar para cliente (retorna dados para ZXH)
app.post("/api/wallet", async (req, res) => {
  try {
    console.log("🔧 Criando nova conta Stellar...");
    const result = await createAccount();
    res.json({
      success: true,
      data: result,
      message: "Conta Stellar criada com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao criar conta:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Enviar hash para blockchain (Manage Data na conta do cliente)
app.post("/api/blockchain", async (req, res) => {
  try {
    const { hash, nosso_numero, valor, vencimento, account, secret } = req.body;
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
        error: "É necessário enviar 'secret' ou 'privateKey' da conta do cliente (ZXH_PRIVKEY)",
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

    console.log("📤 Enviando hash para Stellar...");
    const result = await sendHashToAccount(accountSecret, payload);

    res.json({
      success: true,
      data: result,
      message: "Hash registrado na Stellar com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao enviar para blockchain:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Listar data entries da conta (chaves)
app.get("/api/account/:accountId/data", async (req, res) => {
  try {
    const { accountId } = req.params;
    const response = await fetch(`${HORIZON_URL}/accounts/${accountId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: err.detail || err.error || "Conta não encontrada",
      });
    }
    const account = await response.json();
    const dataKeys = account.data ? Object.keys(account.data) : [];
    res.json({
      success: true,
      data: { keys: dataKeys, accountId },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados da conta:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Validar se um hash existe na conta (consultar data entry)
app.get("/api/validate/:accountId/:hash", async (req, res) => {
  try {
    const { accountId, hash } = req.params;
    const keyB64 = base64UrlEncode(hash);
    const url = `${HORIZON_URL}/accounts/${accountId}/data/${keyB64}`;
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
      const base64 = data.value.replace(/-/g, "+").replace(/_/g, "/");
      valueDecoded = Buffer.from(base64, "base64").toString("utf8");
    } catch (_) {}

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
      transactionId: data.last_modified_ledger ? `ledger:${data.last_modified_ledger}` : null,
    });
  } catch (error) {
    console.error("❌ Erro ao validar hash:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Stellar rodando na porta ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`   POST /api/wallet - Criar conta Stellar`);
  console.log(`   POST /api/blockchain - Registrar hash (Manage Data)`);
  console.log(`   GET /api/account/:accountId/data - Listar chaves da conta`);
  console.log(`   GET /api/validate/:accountId/:hash - Validar hash`);
});
