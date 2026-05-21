const { normalizeCodebar, isValidCodebar } = require("../../../lib/stellar");

const ASAAS_BASE_URLS = {
  sandbox: "https://api-sandbox.asaas.com",
  production: "https://api.asaas.com",
};

const BOLETO_BILLING_TYPES = new Set(["BOLETO", "UNDEFINED"]);

function getBaseUrl(asaasEnv) {
  const env = String(asaasEnv || "sandbox").toLowerCase();
  return ASAAS_BASE_URLS[env] || ASAAS_BASE_URLS.sandbox;
}

function isBoletoBillingType(billingType) {
  return BOLETO_BILLING_TYPES.has(String(billingType || "").toUpperCase());
}

async function asaasRequest(path, apiKey, asaasEnv, options = {}) {
  const baseUrl = getBaseUrl(asaasEnv);
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      "User-Agent": "BoletoGuardian/1.0",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errMsg =
      data.errors?.[0]?.description ||
      data.error ||
      data.message ||
      `Asaas API error: ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    err.asaas = data;
    throw err;
  }

  return data;
}

async function getIdentificationField(paymentId, apiKey, asaasEnv) {
  if (!paymentId) throw new Error("paymentId is required");
  return asaasRequest(
    `/v3/payments/${encodeURIComponent(paymentId)}/identificationField`,
    apiKey,
    asaasEnv
  );
}

function buildBoletoPayload(payment, identification) {
  const barCode =
    identification?.barCode ||
    identification?.identificationField ||
    payment?.barCode ||
    "";

  const codebar = normalizeCodebar(barCode);
  if (!isValidCodebar(codebar)) {
    throw new Error(
      `Invalid barCode from Asaas (payment ${payment?.id || "?"}): expected 44-48 digits`
    );
  }

  const nosso_numero =
    identification?.nossoNumero ||
    payment?.nossoNumero ||
    payment?.invoiceNumber ||
    "";

  const valor = payment?.value != null ? String(payment.value) : "";
  const vencimento = payment?.dueDate
    ? String(payment.dueDate).replace(/-/g, "")
    : "";

  return {
    codebar,
    nosso_numero: String(nosso_numero).slice(0, 20),
    valor,
    vencimento,
    status: "pendente",
    asaasPaymentId: payment?.id || "",
  };
}

async function getBoletoPayloadFromPayment(payment, apiKey, asaasEnv) {
  if (!payment?.id) throw new Error("payment.id is required");
  const identification = await getIdentificationField(payment.id, apiKey, asaasEnv);
  return buildBoletoPayload(payment, identification);
}

module.exports = {
  ASAAS_BASE_URLS,
  getBaseUrl,
  isBoletoBillingType,
  asaasRequest,
  getIdentificationField,
  buildBoletoPayload,
  getBoletoPayloadFromPayment,
};
