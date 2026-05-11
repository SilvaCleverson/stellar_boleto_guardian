const { getChallenge } = require('../../lib/sep10');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { account } = req.query;
  if (!account || account.length !== 56 || !account.startsWith('G')) {
    return res.status(400).json({ error: 'account must be a 56-character Stellar public key (G...)' });
  }

  try {
    const data = await getChallenge(account);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
