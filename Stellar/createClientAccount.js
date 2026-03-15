/**
 * Cria conta Stellar para cliente e retorna dados para ZXH.
 * Testnet: usa Friendbot para financiar. Produção: usar SOURCE_ACCOUNT_SECRET.
 */
const { Keypair } = require("@stellar/stellar-sdk");
require("dotenv").config();

const HORIZON_URL = process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

async function main() {
  try {
    console.log("🔧 Criando nova conta Stellar para cliente...");

    const keypair = Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    // Testnet: financiar via Friendbot
    const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(friendbotUrl);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Friendbot falhou: ${response.status} ${text}`);
    }

    console.log("✅ Conta criada e financiada:", publicKey);
    console.log("🔐 Chave secreta (guardar em ZXH_PRIVKEY):", secretKey);
    console.log("\n📋 Dados para inserir na tabela ZXH:");
    console.log("ZXH_ACCOUNT (ou ZXH_WALLET):", publicKey);
    console.log("ZXH_PRIVKEY:", secretKey);
    console.log("ZXH_DTGER:", new Date().toISOString().split("T")[0]);

    return {
      accountId: publicKey,
      wallet: publicKey,
      privateKey: secretKey,
      dateCreated: new Date().toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("❌ Erro ao criar conta:", error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then((result) => {
      console.log("\n🎉 Processo concluído:", result);
      process.exit(0);
    })
    .catch((err) => {
      console.error("💥 Erro fatal:", err);
      process.exit(1);
    });
}

module.exports = { main };
