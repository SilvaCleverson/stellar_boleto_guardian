const { isValidCodebar, isValidStellarKey, getBoletoRecord } = require("../../lib/stellar");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  const { codebar } = req.query;
  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";

  if (!isValidCodebar(codebar)) {
    return res.status(400).json({ success: false, error: "Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos." });
  }

  const accountId = req.query.account || COMPANY_ACCOUNT;
  if (!accountId || !isValidStellarKey(accountId)) {
    return res.status(400).json({ success: false, error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no Vercel." });
  }

  try {
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
    res.status(500).json({ success: false, error: error.message });
  }
};
