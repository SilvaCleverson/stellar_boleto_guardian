const { validateAnchorJwt, ANCHOR_DOMAIN } = require('../../lib/sep10');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : (req.body || {}).token;

  if (!token) return res.status(401).json({ error: 'Missing token. Send Authorization: Bearer <jwt>' });

  try {
    const payload = validateAnchorJwt(token);
    res.json({ valid: true, account: payload.sub, anchor: ANCHOR_DOMAIN, exp: payload.exp });
  } catch (err) {
    res.status(401).json({ valid: false, error: err.message });
  }
};
