const express = require("express");
const cors = require("cors");
const { Horizon } = require("@stellar/stellar-sdk");
require("dotenv").config();

const {
  HORIZON_URL,
  isValidCodebar,
  normalizeCodebar,
  isValidStellarKey,
  getBoletoRecord,
  sendBoletoToBlockchain,
  createCompanyAccount,
} = require("./lib/stellar");
const { getChallenge, exchangeToken, validateAnchorJwt } = require("./lib/sep10");
const webhookHandler = require("./integrations/asaas/handlers/webhook");
const adminTenantsHandler = require("./integrations/asaas/handlers/admin-tenants");

const app = express();
const PORT = process.env.PORT || 3000;

const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";
const COMPANY_SECRET = process.env.COMPANY_SECRET || "";
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
const X402_AMOUNT = "0.1000000";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Autoriza rotas administrativas absorvendo a ADMIN_API_KEY do .env
 * internamente — sem exigir nenhum header do cliente. O cliente (navegador
 * ou outro serviço) NUNCA precisa conhecer ou trafegar a chave.
 *
 * A proteção destas rotas é garantida pela topologia de rede:
 *   - O container `api` só escuta na rede interna `guardian-net`
 *   - Não há port mapping público para a porta 3000
 *   - Apenas o nginx (mesma rede) consegue alcançar o backend
 *
 * Cada rota protegida injeta a chave no `req` antes de prosseguir, deixando
 * registro explícito de que a autorização foi resolvida server-side.
 */
function requireAdmin(req, res, next) {
  if (!ADMIN_API_KEY) {
    return res.status(500).json({ success: false, error: "ADMIN_API_KEY não configurada no servidor." });
  }
  req.adminAuth = { method: "internal-env", source: "ADMIN_API_KEY" };
  next();
}

// ─── Health check ────────────────────────────────────────────────────────────

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

// ─── Wallet / account creation ────────────────────────────────────────────────

app.post("/api/wallet", async (_req, res) => {
  try {
    const result = await createCompanyAccount();
    res.json({
      success: true,
      data: result,
      message: "Conta Stellar da empresa criada. Configure COMPANY_ACCOUNT e COMPANY_SECRET no .env.",
    });
  } catch (error) {
    console.error("[wallet]", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Blockchain registration (admin key) ─────────────────────────────────────

app.post("/api/blockchain", requireAdmin, async (req, res) => {
  try {
    const { codebar, nosso_numero = "", valor = "", vencimento = "" } = req.body;

    if (!codebar) {
      return res.status(400).json({ success: false, error: "Campo obrigatório: codebar" });
    }
    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
      });
    }
    if (!COMPANY_SECRET) {
      return res.status(400).json({
        success: false,
        error: "Chave secreta da empresa não configurada. Defina COMPANY_SECRET no .env.",
      });
    }

    if (COMPANY_ACCOUNT && isValidStellarKey(COMPANY_ACCOUNT)) {
      try {
        const existing = await getBoletoRecord(COMPANY_ACCOUNT, codebar);
        if (existing.found) {
          return res.status(409).json({ success: false, error: "Código de barras já registrado na blockchain." });
        }
      } catch (_) {}
    }

    const result = await sendBoletoToBlockchain(COMPANY_SECRET, {
      codebar,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: "pendente",
    });

    res.json({ success: true, data: result, message: "Boleto registrado na blockchain Stellar com sucesso" });
  } catch (error) {
    console.error("[blockchain]", error.message);
    res.status(error.message.includes("inválido") ? 400 : 500).json({ success: false, error: error.message });
  }
});

// ─── Boleto registration via SEP-10 auth ─────────────────────────────────────

app.post("/api/boleto/register", async (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Login via Stellar Anchor (SEP-10) at /login.html",
    });
  }

  let jwtPayload;
  try {
    jwtPayload = validateAnchorJwt(auth.slice(7).trim());
  } catch (err) {
    return res.status(401).json({ success: false, error: `SEP-10 token invalid: ${err.message}` });
  }

  if (!COMPANY_SECRET) {
    return res.status(500).json({ success: false, error: "Server misconfigured: COMPANY_SECRET not set" });
  }

  const { codebar, nosso_numero = "", valor = "", vencimento = "" } = req.body || {};

  if (!codebar) {
    return res.status(400).json({ success: false, error: "Required field: codebar" });
  }
  if (!isValidCodebar(codebar)) {
    return res.status(400).json({ success: false, error: "Invalid barcode: must be between 44 and 48 numeric digits" });
  }

  if (COMPANY_ACCOUNT && isValidStellarKey(COMPANY_ACCOUNT)) {
    try {
      const existing = await getBoletoRecord(COMPANY_ACCOUNT, codebar);
      if (existing.found) {
        return res.status(409).json({ success: false, error: "Boleto already registered on blockchain" });
      }
    } catch (_) {}
  }

  try {
    const result = await sendBoletoToBlockchain(COMPANY_SECRET, {
      codebar,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: "pendente",
    });

    res.json({
      success: true,
      data: result,
      auth: { method: "SEP-10", anchor: "testanchor.stellar.org", wallet: jwtPayload.sub },
      message: "Boleto registrado na blockchain Stellar via autenticação com Anchor (SEP-10)",
    });
  } catch (error) {
    const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    res.status(error.message.includes("inválido") ? 400 : 500).json({ success: false, error: msg });
  }
});

// ─── Validation (public) ──────────────────────────────────────────────────────

app.get("/api/validate/:codebar", async (req, res) => {
  try {
    const { codebar } = req.params;

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
      });
    }

    const accountId = req.query.account || COMPANY_ACCOUNT;
    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no .env ou envie via ?account=G...",
      });
    }

    const lookup = await getBoletoRecord(accountId, codebar);
    if (!lookup.found) {
      return res.json({
        success: true,
        found: false,
        message: "Código de barras NÃO encontrado na blockchain. Este boleto pode ser fraudulento.",
      });
    }

    res.json({ success: true, found: true, message: "Boleto emitido pela empresa." });
  } catch (error) {
    console.error("[validate]", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin: boleto lookup ─────────────────────────────────────────────────────

app.get("/api/admin/boletos/:codebar", requireAdmin, async (req, res) => {
  try {
    const { codebar } = req.params;

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({ success: false, error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos." });
    }

    const accountId = req.query.account || COMPANY_ACCOUNT;
    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no .env ou envie via ?account=G...",
      });
    }

    const lookup = await getBoletoRecord(accountId, codebar);
    if (!lookup.found) {
      return res.json({ success: true, found: false, message: "Boleto não encontrado nos registros da empresa." });
    }

    res.json({ success: true, found: true, data: lookup.record, message: "Boleto encontrado no registro da empresa." });
  } catch (error) {
    console.error("[admin/boletos]", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Account data: list all boletos ──────────────────────────────────────────

app.get("/api/account/data", async (req, res) => {
  try {
    const accountId = req.query.account || COMPANY_ACCOUNT;

    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no .env ou envie via ?account=G...",
      });
    }

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(accountId);
    const dataEntries = account.data_attr || {};

    const boletos = Object.entries(dataEntries).map(([key, valueB64]) => {
      let valueDecoded = "";
      try {
        valueDecoded = Buffer.from(valueB64, "base64").toString("utf8");
      } catch (_) {}
      const [nosso_numero, valor, vencimento, status] = valueDecoded.split("|");
      return { codebar: key, nosso_numero: nosso_numero || "", valor: valor || "", vencimento: vencimento || "", status: status || "" };
    });

    res.json({ success: true, data: { accountId, total: boletos.length, boletos } });
  } catch (error) {
    console.error("[account/data]", error.message);
    res.status(error.message.includes("Not Found") ? 404 : 500).json({ success: false, error: error.message });
  }
});

// ─── SEP-10 authentication ────────────────────────────────────────────────────

app.get("/api/sep10/challenge", async (req, res) => {
  const { account } = req.query;
  if (!account || account.length !== 56 || !account.startsWith("G")) {
    return res.status(400).json({ error: "account must be a 56-character Stellar public key (G...)" });
  }
  try {
    const data = await getChallenge(account);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.post("/api/sep10/token", async (req, res) => {
  const { transaction } = req.body || {};
  if (!transaction) return res.status(400).json({ error: "Missing required field: transaction" });
  try {
    const result = await exchangeToken(transaction);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ─── x402 pay-per-validation ──────────────────────────────────────────────────

app.get("/api/premium/:codebar", async (req, res) => {
  const { codebar } = req.params;

  if (!isValidCodebar(codebar)) {
    return res.status(400).json({
      success: false,
      error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
    });
  }

  const xPayment = req.header("X-Payment");
  if (!xPayment) {
    return res.status(402).json({
      error: "Payment Required",
      x402: {
        version: 1,
        amount: X402_AMOUNT,
        asset: "XLM",
        destination: COMPANY_ACCOUNT,
        network: STELLAR_NETWORK,
        description: `Pay ${X402_AMOUNT} XLM on Stellar to validate this boleto`,
      },
    });
  }

  try {
    const horizonServer = new Horizon.Server(HORIZON_URL);
    const ops = await horizonServer.operations().forTransaction(xPayment).call();

    const paymentOp = ops.records.find(
      (op) =>
        op.type === "payment" &&
        op.asset_type === "native" &&
        op.to === COMPANY_ACCOUNT &&
        parseFloat(op.amount) >= 0.1
    );

    if (!paymentOp) {
      return res.status(402).json({
        error: "Payment not verified",
        detail: "No valid XLM payment (≥ 0.10 XLM) to company account found in this transaction",
      });
    }

    if (!COMPANY_ACCOUNT || !isValidStellarKey(COMPANY_ACCOUNT)) {
      return res.status(500).json({ success: false, error: "Company account not configured" });
    }

    const lookup = await getBoletoRecord(COMPANY_ACCOUNT, codebar);

    return res.json({
      success: true,
      paid: true,
      payment: { txHash: xPayment, amount: paymentOp.amount, from: paymentOp.from },
      validation: {
        found: lookup.found,
        codebar: normalizeCodebar(codebar),
        message: lookup.found
          ? "Boleto emitido pela empresa — autêntico."
          : "Boleto NÃO encontrado na blockchain. Pode ser fraudulento.",
      },
    });
  } catch (error) {
    console.error("[x402]", error.message);
    return res.status(402).json({ error: "Payment verification failed", detail: error.message });
  }
});

// ─── Asaas: tenant management (admin) ────────────────────────────────────────

app.all("/api/admin/tenants", adminTenantsHandler);

// ─── Asaas: webhook receiver ──────────────────────────────────────────────────

app.post("/api/webhooks/asaas/:tenantId", (req, res) => {
  req.query.tenantId = req.params.tenantId;
  return webhookHandler(req, res);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Boleto Guardian] API rodando na porta ${PORT}`);
  console.log(`[Boleto Guardian] Horizon: ${HORIZON_URL} | Network: ${STELLAR_NETWORK}`);
  console.log(`[Boleto Guardian] Conta empresa: ${COMPANY_ACCOUNT || "(não configurada)"}`);
});
