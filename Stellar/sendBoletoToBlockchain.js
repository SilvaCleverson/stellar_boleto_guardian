/**
 * Registra boleto na conta Stellar da empresa via Manage Data.
 * Chave = código de barras (47 dígitos), Valor = payload (até 64 bytes).
 */
const {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} = require("@stellar/stellar-sdk");
require("dotenv").config();

const HORIZON_URL =
  process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";

function getNetworkPassphrase() {
  return STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET;
}

function isValidCodebar(codebar) {
  if (!codebar || typeof codebar !== "string") return false;
  const digits = codebar.replace(/[.\s-]/g, "");
  return /^\d{47}$/.test(digits);
}

function normalizeCodebar(codebar) {
  return codebar.replace(/[.\s-]/g, "");
}

/**
 * @param {string} companySecret - Chave secreta da conta da empresa
 * @param {object} payload - { codebar, nosso_numero, valor, vencimento, status? }
 * @returns {Promise<object>}
 */
async function sendBoletoToBlockchain(companySecret, payload) {
  const server = new Horizon.Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(companySecret);
  const {
    codebar,
    nosso_numero,
    valor,
    vencimento,
    status = "pendente",
  } = payload;

  const normalizedCodebar = normalizeCodebar(codebar);
  if (!isValidCodebar(normalizedCodebar)) {
    throw new Error(
      "Código de barras inválido. Deve conter exatamente 47 dígitos numéricos."
    );
  }

  const valueStr = [
    nosso_numero,
    String(valor),
    String(vencimento).replace(/[-/]/g, ""),
    status,
  ].join("|");

  const valueBytes = Buffer.from(valueStr, "utf8");
  if (valueBytes.length > 64) {
    throw new Error(
      `Payload do boleto excede 64 bytes (atual: ${valueBytes.length}). ` +
        "Reduza o tamanho dos campos nosso_numero, valor ou vencimento."
    );
  }

  const sourceAccount = await server.loadAccount(keypair.publicKey());

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      Operation.manageData({
        name: normalizedCodebar,
        value: valueBytes,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(keypair);

  const result = await server.submitTransaction(transaction);

  return {
    success: true,
    codebar: normalizedCodebar,
    transactionHash: result.hash,
    ledger: result.ledger,
    accountId: keypair.publicKey(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  sendBoletoToBlockchain,
  getNetworkPassphrase,
  isValidCodebar,
  normalizeCodebar,
  HORIZON_URL,
};
