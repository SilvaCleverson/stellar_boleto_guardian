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
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

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

function getAdminKeyFromRequest(req) {
  const headerKey = req.header("x-admin-key");
  if (headerKey) return headerKey.trim();

  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return "";
  return authHeader.slice(7).trim();
}

function requireAdmin(req, res, next) {
  if (!ADMIN_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "ADMIN_API_KEY n\u00e3o configurada no servidor.",
    });
  }

  const providedKey = getAdminKeyFromRequest(req);
  if (!providedKey || providedKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: "N\u00e3o autorizado. Informe uma chave administrativa v\u00e1lida.",
    });
  }

  next();
}

async function getBoletoRecord(accountId, codebar) {
  const normalized = normalizeCodebar(codebar);
  const url = `${HORIZON_URL}/accounts/${accountId}/data/${encodeURIComponent(normalized)}`;
  const response = await fetch(url);

  if (response.status === 404) {
    return { found: false };
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Erro ao consultar Horizon");
  }

  const payload = await response.json();
  const decodedValue = Buffer.from(payload.value || "", "base64").toString("utf8");
  const [nosso_numero, valor, vencimento, status] = decodedValue.split("|");

  return {
    found: true,
    record: {
      codebar: normalized,
      nosso_numero: nosso_numero || "",
      valor: valor || "",
      vencimento: vencimento || "",
      status: status || "",
    },
  };
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

app.post("/api/blockchain", requireAdmin, async (req, res) => {
  try {
    const { codebar, nosso_numero = "", valor = "", vencimento = "" } = req.body;
    // Chave apenas do ambiente do servidor (env ou vault). Nunca aceitar do body por segurança.
    const companySecret = COMPANY_SECRET;

    if (!codebar) {
      return res.status(400).json({
        success: false,
        error: "Campo obrigatório: codebar",
      });
    }

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error:
          "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
      });
    }

    if (!companySecret) {
      return res.status(400).json({
        success: false,
        error:
          "Chave secreta da empresa não configurada. " +
          "Defina COMPANY_SECRET no .env (ou use Secret Manager) no servidor da API. " +
          "A chave nunca deve ser enviada pelo cliente.",
      });
    }

    if (COMPANY_ACCOUNT && isValidStellarKey(COMPANY_ACCOUNT)) {
      try {
        const existing = await getBoletoRecord(COMPANY_ACCOUNT, codebar);
        if (existing.found) {
          return res.status(409).json({ success: false, error: "Código de barras já registrado na blockchain." });
        }
      } catch (_) {
        // se falhar a consulta, segue o registro normalmente
      }
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
          "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
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

    const lookup = await getBoletoRecord(accountId, codebar);
    if (!lookup.found) {
      return res.json({
        success: true,
        found: false,
        message:
          "Código de barras NÃO encontrado na blockchain. " +
          "Este boleto pode ser fraudulento.",
      });
    }

    // Retorna apenas se o boleto foi emitido pela empresa — nenhum dado financeiro
    res.json({
      success: true,
      found: true,
      message: "Boleto emitido pela empresa.",
    });
  } catch (error) {
    console.error(
      "[BOLETO GUARDIAN] Erro ao validar boleto:",
      error.message
    );
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/admin/boletos/:codebar", requireAdmin, async (req, res) => {
  try {
    const { codebar } = req.params;

    if (!isValidCodebar(codebar)) {
      return res.status(400).json({
        success: false,
        error:
          "C\u00f3digo de barras inv\u00e1lido. Deve conter entre 44 e 48 d\u00edgitos num\u00e9ricos.",
      });
    }

    const accountId = req.query.account || COMPANY_ACCOUNT;
    if (!accountId || !isValidStellarKey(accountId)) {
      return res.status(400).json({
        success: false,
        error:
          "Conta da empresa n\u00e3o configurada. " +
          "Defina COMPANY_ACCOUNT no .env ou envie via query param ?account=G...",
      });
    }

    const lookup = await getBoletoRecord(accountId, codebar);
    if (!lookup.found) {
      return res.json({
        success: true,
        found: false,
        message: "Boleto n\u00e3o encontrado nos registros da empresa.",
      });
    }

    res.json({
      success: true,
      found: true,
      data: lookup.record,
      message: "Boleto encontrado no registro da empresa.",
    });
  } catch (error) {
    console.error("[BOLETO GUARDIAN] Erro ao buscar boleto admin:", error.message);
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

// x402 — pay-per-validation endpoint
const X402_AMOUNT = "0.1000000";

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
      payment: {
        txHash: xPayment,
        amount: paymentOp.amount,
        from: paymentOp.from,
      },
      validation: {
        found: lookup.found,
        codebar: normalizeCodebar(codebar),
        message: lookup.found
          ? "Boleto emitido pela empresa — autêntico."
          : "Boleto NÃO encontrado na blockchain. Pode ser fraudulento.",
      },
    });
  } catch (error) {
    console.error("[x402] Erro ao verificar pagamento:", error.message);
    return res.status(402).json({
      error: "Payment verification failed",
      detail: error.message,
    });
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
  console.log(`  POST /api/blockchain          - Registrar boleto (admin)`);
  console.log(`  GET  /api/validate/:codebar    - Validar boleto pelo código de barras`);
  console.log(`  GET  /api/admin/boletos/:codebar - Buscar boleto registrado (admin)`);
  console.log(`  GET  /api/account/data         - Listar boletos registrados`);
});
