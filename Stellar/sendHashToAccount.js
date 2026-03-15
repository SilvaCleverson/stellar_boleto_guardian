/**
 * Envia hash do boleto para a conta Stellar via operação Manage Data.
 * Chave = hash (até 64 bytes), Valor = payload resumido (até 64 bytes).
 */
const {
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Networks,
} = require("@stellar/stellar-sdk");
require("dotenv").config();

const HORIZON_URL = process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

/**
 * @param {string} accountSecret - Chave secreta da conta do cliente (ZXH_PRIVKEY)
 * @param {object} payload - { hash, nosso_numero, valor, vencimento, status?, timestamp? }
 * @returns {Promise<object>} - { success, transactionId, timestamp }
 */
async function sendHashToAccount(accountSecret, payload) {
  const server = new Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(accountSecret);
  const { hash, nosso_numero, valor, vencimento, status = "pendente", timestamp } = payload;

  if (!hash || hash.length > 64) {
    throw new Error("Hash obrigatório e máximo 64 caracteres");
  }

  // Valor no Manage Data: máx 64 bytes. Usar payload curto para caber.
  const valueStr = [nosso_numero, String(valor), String(vencimento), status].join("|");
  const valueBytes = Buffer.from(valueStr, "utf8");
  if (valueBytes.length > 64) {
    throw new Error("Payload do boleto excede 64 bytes");
  }

  const sourceAccount = await server.loadAccount(keypair.publicKey());

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: HORIZON_URL.includes("testnet") ? Networks.TESTNET : Networks.PUBLIC,
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
    timestamp: timestamp || new Date().toISOString(),
  };
}

// Stellar Manage Data name is max 64 bytes; value is optional (remove = delete). We use name = hash (40 chars hex). Value = 64 bytes max.
// So we need to truncate name to 64 and value to 64. Hash is 40 chars, OK. Value "nosso|valor|venc|status" fits.
// Actually in Stellar SDK manageData({ name, value }) - name can be string. So we pass hash as name. Value as Buffer. But 64 bytes for value - our string might be longer. "123456789012|1235.40|2025-08-05|pendente" = 35 bytes. OK.
</think>
Corrigindo: a chave do Manage Data deve ter no máximo 64 bytes; o hash SHA1 tem 40 caracteres. Ajustando o script.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace