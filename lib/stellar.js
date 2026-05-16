const {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} = require("@stellar/stellar-sdk");

const HORIZON_URL =
  process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";
const STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";

function getNetworkPassphrase() {
  return STELLAR_NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET;
}

function isValidCodebar(codebar) {
  if (!codebar || typeof codebar !== "string") return false;
  const digits = codebar.replace(/[.\s-]/g, "");
  return /^\d{44,48}$/.test(digits);
}

function normalizeCodebar(codebar) {
  return codebar.replace(/[.\s-]/g, "");
}

function isValidStellarKey(key) {
  if (!key || typeof key !== "string" || key.length !== 56) return false;
  try {
    Keypair.fromPublicKey(key);
    return true;
  } catch {
    return false;
  }
}

async function getBoletoRecord(accountId, codebar) {
  const normalized = normalizeCodebar(codebar);
  const url = `${HORIZON_URL}/accounts/${accountId}/data/${encodeURIComponent(normalized)}`;
  const response = await fetch(url);

  if (response.status === 404) return { found: false };
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Erro ao consultar Horizon");
  }

  const payload = await response.json();
  const decodedValue = Buffer.from(payload.value || "", "base64").toString("utf8");
  const [nosso_numero, valor, vencimento, status] = decodedValue.split("|");

  return {
    found: true,
    record: {
      codebar: normalized,
      nosso_numero: nosso_numero || "",
      valor: valor || "",
      vencimento: vencimento || "",
      status: status || "",
    },
  };
}

async function sendBoletoToBlockchain(companySecret, payload) {
  const server = new Horizon.Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(companySecret);
  const { codebar, nosso_numero, valor, vencimento, status = "pendente" } = payload;

  const normalizedCodebar = normalizeCodebar(codebar);
  if (!isValidCodebar(normalizedCodebar)) {
    throw new Error("Código de barras inválido. Deve conter entre 44 e 48 dígitos numéricos.");
  }

  const valueStr = [
    nosso_numero,
    String(valor),
    String(vencimento).replace(/[-/]/g, ""),
    status,
  ].join("|");

  const valueBytes = Buffer.from(valueStr, "utf8");
  if (valueBytes.length > 64) {
    throw new Error(`Payload excede 64 bytes (atual: ${valueBytes.length}). Reduza nosso_numero, valor ou vencimento.`);
  }

  const sourceAccount = await server.loadAccount(keypair.publicKey());
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(Operation.manageData({ name: normalizedCodebar, value: valueBytes }))
    .setTimeout(300)
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

async function createCompanyAccount() {
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

  return {
    accountId: publicKey,
    secretKey,
    balance: account.balances[0]?.balance || "N/A",
    dateCreated: new Date().toISOString().split("T")[0],
  };
}

module.exports = {
  HORIZON_URL,
  isValidCodebar,
  normalizeCodebar,
  isValidStellarKey,
  getBoletoRecord,
  sendBoletoToBlockchain,
  createCompanyAccount,
};
