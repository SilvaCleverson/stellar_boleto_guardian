const { validateAnchorJwt } = require('../../lib/sep10');
const { sendBoletoToBlockchain, isValidCodebar, getBoletoRecord, isValidStellarKey } = require('../../lib/stellar');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Login via Stellar Anchor (SEP-10) at /login.html',
    });
  }

  const token = auth.slice(7).trim();
  let jwtPayload;
  try {
    jwtPayload = validateAnchorJwt(token);
  } catch (err) {
    return res.status(401).json({ success: false, error: `SEP-10 token invalid: ${err.message}` });
  }

  const COMPANY_SECRET = process.env.COMPANY_SECRET || '';
  if (!COMPANY_SECRET) {
    return res.status(500).json({ success: false, error: 'Server misconfigured: COMPANY_SECRET not set' });
  }

  const { codebar, nosso_numero = '', valor = '', vencimento = '' } = req.body || {};

  if (!codebar) {
    return res.status(400).json({ success: false, error: 'Required field: codebar' });
  }
  if (!isValidCodebar(codebar)) {
    return res.status(400).json({ success: false, error: 'Invalid barcode: must be between 44 and 48 numeric digits' });
  }

  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || '';
  if (COMPANY_ACCOUNT && isValidStellarKey(COMPANY_ACCOUNT)) {
    try {
      const existing = await getBoletoRecord(COMPANY_ACCOUNT, codebar);
      if (existing.found) {
        return res.status(409).json({ success: false, error: 'Boleto already registered on blockchain' });
      }
    } catch (_) {}
  }

  try {
    const result = await sendBoletoToBlockchain(COMPANY_SECRET, {
      codebar,
      nosso_numero,
      valor: String(valor),
      vencimento: String(vencimento),
      status: 'pendente',
    });

    res.json({
      success: true,
      data: result,
      auth: {
        method: 'SEP-10',
        anchor: 'testanchor.stellar.org',
        wallet: jwtPayload.sub,
      },
      message: 'Boleto registrado na blockchain Stellar via autenticação com Anchor (SEP-10)',
    });
  } catch (error) {
    const horizonDetail = error.response?.data ? JSON.stringify(error.response.data) : null;
    const msg = horizonDetail || error.message;
    res.status(error.message.includes('inválido') ? 400 : 500).json({ success: false, error: msg });
  }
};
