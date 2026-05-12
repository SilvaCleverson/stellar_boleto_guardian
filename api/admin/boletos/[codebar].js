const { isValidCodebar, isValidStellarKey, getBoletoRecord } = require("../../../lib/stellar");

function getAdminKey(req) {
  const h = req.headers["x-admin-key"];
  if (h) return h.trim();
  const auth = req.headers["authorization"] || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "x-admin-key, Authorization");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";

  if (!ADMIN_API_KEY) {
    return res.status(500).json({ success: false, error: "ADMIN_API_KEY não configurada no servidor." });
  }

  const key = getAdminKey(req);
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ success: false, error: "Não autorizado. Informe uma chave administrativa válida." });
  }

  const { codebar } = req.query;

  if (!isValidCodebar(codebar)) {
    return res.status(400).json({
      success: false,
      error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.",
    });
  }

  const accountId = req.query.account || COMPANY_ACCOUNT;
  if (!accountId || !isValidStellarKey(accountId)) {
    return res.status(400).json({ success: false, error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no Vercel." });
  }

  try {
    const lookup = await getBoletoRecord(accountId, codebar);
    if (!lookup.found) {
      return res.json({ success: true, found: false, message: "Boleto não encontrado nos registros da empresa." });
    }
    res.json({ success: true, found: true, data: lookup.record, message: "Boleto encontrado no registro da empresa." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
