const { isValidCodebar, isValidStellarKey, getBoletoRecord } = require('../../lib/stellar');
const { Horizon } = require('@stellar/stellar-sdk');

const PAYMENT_AMOUNT = '0.10';
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const { codebar } = req.query;
  const COMPANY_ACCOUNT = process.env.COMPANY_ACCOUNT || '';

  if (!isValidCodebar(codebar)) {
    return res.status(400).json({ success: false, error: 'Invalid barcode: must be between 44 and 48 numeric digits.' });
  }

  if (!COMPANY_ACCOUNT || !isValidStellarKey(COMPANY_ACCOUNT)) {
    return res.status(500).json({ success: false, error: 'Server misconfigured: COMPANY_ACCOUNT not set.' });
  }

  const paymentHeader = req.headers['x-payment'];

  if (!paymentHeader) {
    const paymentDetails = {
      x402Version: 1,
      network: 'stellar-testnet',
      amount: PAYMENT_AMOUNT,
      asset: 'XLM (native)',
      payTo: COMPANY_ACCOUNT,
      memo: `x402:${codebar.slice(0, 10)}`,
      description: `Boleto Guardian — premium validation for barcode ${codebar.slice(0, 8)}...`,
    };
    res.setHeader('X-Payment-Required', JSON.stringify(paymentDetails));
    return res.status(402).json({
      x402Version: 1,
      error: 'Payment required',
      accepts: [{
        scheme: 'exact',
        network: 'stellar-testnet',
        maxAmountRequired: PAYMENT_AMOUNT,
        asset: 'native',
        payTo: COMPANY_ACCOUNT,
        memo: `x402:${codebar.slice(0, 10)}`,
      }],
    });
  }

  try {
    await verifyPayment(paymentHeader, COMPANY_ACCOUNT);
  } catch (err) {
    return res.status(402).json({ success: false, error: `Payment verification failed: ${err.message}` });
  }

  try {
    const lookup = await getBoletoRecord(COMPANY_ACCOUNT, codebar);
    res.json({
      success: true,
      found: lookup.found,
      data: lookup.found ? lookup.record : null,
      payment: { verified: true, txHash: paymentHeader },
      message: lookup.found
        ? 'Authentic boleto — verified via x402 micropayment on Stellar Testnet.'
        : 'Boleto NOT found on Stellar blockchain. May be fraudulent.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

async function verifyPayment(txHash, destination) {
  const server = new Horizon.Server(HORIZON_URL);
  const ops = await server.operations().forTransaction(txHash).call();
  const payment = ops.records.find(op =>
    op.type === 'payment' &&
    op.to === destination &&
    op.asset_type === 'native' &&
    parseFloat(op.amount) >= parseFloat(PAYMENT_AMOUNT)
  );
  if (!payment) {
    throw new Error(`No payment of >= ${PAYMENT_AMOUNT} XLM to ${destination.slice(0, 8)}... found in transaction.`);
  }
}
