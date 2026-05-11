const ANCHOR_DOMAIN = 'testanchor.stellar.org';
const WEB_AUTH_ENDPOINT = `https://${ANCHOR_DOMAIN}/auth`;

async function getChallenge(account) {
  const url = `${WEB_AUTH_ENDPOINT}?account=${encodeURIComponent(account)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Anchor challenge error: ${res.status}`);
  }
  return res.json(); // { transaction, network_passphrase }
}

async function exchangeToken(signedXdr) {
  const res = await fetch(WEB_AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: signedXdr }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Anchor token exchange error: ${res.status}`);
  }
  return res.json(); // { token }
}

function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function validateAnchorJwt(token) {
  const payload = decodeJwt(token);
  if (payload.iss !== ANCHOR_DOMAIN) {
    throw new Error(`JWT issuer mismatch: expected ${ANCHOR_DOMAIN}, got ${payload.iss}`);
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT has expired');
  }
  if (!payload.sub || payload.sub.length !== 56 || !payload.sub.startsWith('G')) {
    throw new Error('JWT subject is not a valid Stellar account');
  }
  return payload; // { sub, iss, iat, exp }
}

module.exports = { ANCHOR_DOMAIN, WEB_AUTH_ENDPOINT, getChallenge, exchangeToken, decodeJwt, validateAnchorJwt };
