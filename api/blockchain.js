const { sendBoletoToBlockchain, isValidCodebar, getBoletoRecord, isValidStellarKey } = require("../lib/stellar");

function getAdminKey(req) {
  const h = req.headers["x-admin-key"];
  if (h) return h.trim();
  const auth = req.headers["authorization"] || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
  const COMPANY_SECRET = process.env.COMPANY_SECRET || "";

  if (!ADMIN_API_KEY) {
    return res.status(500).json({ success: false, error: "ADMIN_API_KEY não configurada no servidor." });
  }

  const key = getAdminKey(req);
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ success: false, error: "Não autorizado. Informe uma chave administrativa válida." });
  }

  const { codebar, nosso_numero = "", valor = "", vencimento = "" } = req.body || {};

  if (!codebar) {
    return res.status(400).json({ success: false, error: "Campo obrigatório: codebar" });
  }

  if (!isValidCodebar(codebar)) {
    return res.status(400).json({ success: false, error: "Código de barras inválido. Deve conter entre 44 e 47 dígitos numéricos." });
  }

  if (!COMPANY_SECRET) {
    return res.status(400).json({ success: false, error: "COMPANY_SECRET não configurada. Defina nas variáveis de ambiente do Vercel." });
  }

  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";
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

  try {
    const result = await sendBoletoToBlockchain(COMPANY_SECRET, {
      codebar,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: "pendente",
    });
    res.json({ success: true, data: result, message: "Boleto registrado na blockchain Stellar com sucesso" });
  } catch (error) {
    const horizonDetail = error.response && error.response.data
      ? JSON.stringify(error.response.data)
      : null;
    const msg = horizonDetail || error.message;
    const status = error.message.includes("inválido") ? 400 : 500;
    res.status(status).json({ success: false, error: msg });
  }
};
