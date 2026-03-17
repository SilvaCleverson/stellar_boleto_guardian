/**
 * Cria conta Stellar da empresa para o Boleto Guardian.
 * Testnet: usa Friendbot para financiar.
 * Produção: financiar manualmente ou via SOURCE_ACCOUNT_SECRET.
 *
 * Cada empresa possui UMA única conta Stellar onde todos os boletos são registrados.
 */
const { Keypair, Horizon } = require("@stellar/stellar-sdk");
require("dotenv").config();

const HORIZON_URL =
  process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";

async function createCompanyAccount() {
  console.log("[BOLETO GUARDIAN] Criando conta Stellar da empresa...");

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

  console.log("[BOLETO GUARDIAN] Conta da empresa criada com sucesso!");
  console.log(`  Account ID (COMPANY_ACCOUNT): ${publicKey}`);
  console.log(`  Secret Key (COMPANY_SECRET):  ${secretKey}`);
  console.log(`  Saldo: ${account.balances[0]?.balance || "N/A"} XLM`);
  console.log("");
  console.log("Adicione ao seu .env:");
  console.log(`  COMPANY_ACCOUNT=${publicKey}`);
  console.log(`  COMPANY_SECRET=${secretKey}`);

  return {
    accountId: publicKey,
    secretKey,
    dateCreated: new Date().toISOString().split("T")[0],
  };
}

if (require.main === module) {
  createCompanyAccount()
    .then((result) => {
      console.log(
        "\n[BOLETO GUARDIAN] Processo concluído. Account ID:",
        result.accountId
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("[BOLETO GUARDIAN] Erro fatal:", err.message);
      process.exit(1);
    });
}

module.exports = { createCompanyAccount };
