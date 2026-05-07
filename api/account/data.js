const { Horizon } = require("@stellar/stellar-sdk");
const { HORIZON_URL, isValidStellarKey } = require("../../lib/stellar");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || "";
  const accountId = req.query.account || COMPANY_ACCOUNT;

  if (!accountId || !isValidStellarKey(accountId)) {
    return res.status(400).json({ success: false, error: "Conta da empresa não configurada. Defina COMPANY_ACCOUNT no Vercel." });
  }

  try {
    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(accountId);
    const dataEntries = account.data_attr || {};

    const boletos = Object.entries(dataEntries).map(([key, valueB64]) => {
      let valueDecoded = "";
      try { valueDecoded = Buffer.from(valueB64, "base64").toString("utf8"); } catch (_) {}
      const [nosso_numero, valor, vencimento, status] = valueDecoded.split("|");
      return { codebar: key, nosso_numero: nosso_numero || "", valor: valor || "", vencimento: vencimento || "", status: status || "" };
    });

    res.json({ success: true, data: { accountId, total: boletos.length, boletos } });
  } catch (error) {
    const status = error.message.includes("Not Found") ? 404 : 500;
    res.status(status).json({ success: false, error: error.message || "Conta não encontrada" });
  }
};
