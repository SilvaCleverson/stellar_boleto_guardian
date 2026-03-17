/**
 * Cria conta Stellar para cliente e retorna dados para ZXH.
 * Testnet: usa Friendbot para financiar. Produção: usar SOURCE_ACCOUNT_SECRET.
 */
const { Keypair, Horizon } = require("@stellar/stellar-sdk");
require("dotenv").config();

const HORIZON_URL =
  process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

async function main() {
  console.log("[STELLAR] Criando nova conta Stellar para cliente...");

  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
  const response = await fetch(friendbotUrl);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Friendbot falhou: ${response.status} ${text}`);
  }

  const server = new Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(publicKey);

  console.log("[STELLAR] Conta criada e financiada:", publicKey);
  console.log("[STELLAR] Saldo:", account.balances[0]?.balance || "N/A", "XLM");
  console.log("[STELLAR] Dados para ZXH:");
  console.log("  ZXH_WALLET:", publicKey);
  console.log("  ZXH_PRVKEY: (salvo automaticamente via API)");
  console.log("  ZXH_DTGER:", new Date().toISOString().split("T")[0]);

  return {
    accountId: publicKey,
    wallet: publicKey,
    privateKey: secretKey,
    dateCreated: new Date().toISOString().split("T")[0],
  };
}

if (require.main === module) {
  main()
    .then((result) => {
      console.log("\n[STELLAR] Processo concluído. Account ID:", result.accountId);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[STELLAR] Erro fatal:", err.message);
      process.exit(1);
    });
}

module.exports = { main };
