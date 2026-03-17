/**
 * Envia hash do boleto para a conta Stellar via operação Manage Data.
 * Chave = hash (até 64 bytes), Valor = payload resumido (até 64 bytes).
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

/**
 * @param {string} accountSecret - Chave secreta da conta do cliente (ZXH_PRVKEY)
 * @param {object} payload - { hash, nosso_numero, valor, vencimento, status?, timestamp? }
 * @returns {Promise<object>} - { success, transactionId, transactionHash, timestamp }
 */
async function sendHashToAccount(accountSecret, payload) {
  const server = new Horizon.Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(accountSecret);
  const {
    hash,
    nosso_numero,
    valor,
    vencimento,
    status = "pendente",
    timestamp,
  } = payload;

  if (!hash || hash.length > 64) {
    throw new Error("Hash obrigatório e máximo 64 caracteres");
  }

  const valueStr = [nosso_numero, String(valor), String(vencimento), status].join("|");
  const valueBytes = Buffer.from(valueStr, "utf8");
  if (valueBytes.length > 64) {
    throw new Error(
      `Payload do boleto excede 64 bytes (atual: ${valueBytes.length})`
    );
  }

  const sourceAccount = await server.loadAccount(keypair.publicKey());

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      Operation.manageData({
        name: hash.substring(0, 64),
        value: valueBytes,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(keypair);

  const result = await server.submitTransaction(transaction);

  return {
    success: true,
    transactionId: result.id,
    transactionHash: result.hash,
    ledger: result.ledger,
    timestamp: timestamp || new Date().toISOString(),
  };
}

module.exports = { sendHashToAccount, getNetworkPassphrase, HORIZON_URL };
