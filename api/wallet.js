const { createCompanyAccount } = require("../lib/stellar");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  try {
    const result = await createCompanyAccount();
    res.json({
      success: true,
      data: result,
      message: "Conta Stellar criada. Configure COMPANY_ACCOUNT e COMPANY_SECRET nas variáveis de ambiente do Vercel.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
