const { isBoletoBillingType, getBoletoPayloadFromPayment } = require("../lib/client");
const { getTenant, getWebhookAuthToken, normalizeTenantId } = require("../lib/tenants");
const { getBoletoRecord, sendBoletoToBlockchain } = require("../../../lib/stellar");

const HANDLED_EVENTS = new Set(["PAYMENT_CREATED", "PAYMENT_UPDATED"]);

function getPaymentFromBody(body) {
  if (!body || typeof body !== "object") return null;
  return body.payment || body.data?.payment || body;
}

function getEventName(body) {
  return String(body?.event || body?.type || "").toUpperCase();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const tenantId = normalizeTenantId(req.query.tenantId);
  const tenant = getTenant(tenantId);

  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found or disabled" });
  }

  const token = getWebhookAuthToken(req);
  if (!token || token !== tenant.webhookAuthToken) {
    return res.status(401).json({ success: false, error: "Invalid webhook auth token" });
  }

  const body = req.body || {};
  const event = getEventName(body);
  const payment = getPaymentFromBody(body);

  if (!HANDLED_EVENTS.has(event)) {
    return res.status(200).json({ success: true, ignored: true, reason: `event ${event || "unknown"}` });
  }

  if (!payment?.id) {
    return res.status(400).json({ success: false, error: "Missing payment.id in webhook payload" });
  }

  if (!isBoletoBillingType(payment.billingType)) {
    return res.status(200).json({
      success: true,
      ignored: true,
      reason: `billingType ${payment.billingType} is not boleto`,
    });
  }

  try {
    const boletoPayload = await getBoletoPayloadFromPayment(
      payment,
      tenant.asaasApiKey,
      tenant.asaasEnv
    );

    const existing = await getBoletoRecord(tenant.companyAccount, boletoPayload.codebar);
    if (existing.found) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        tenantId: tenant.tenantId,
        codebar: boletoPayload.codebar,
        asaasPaymentId: payment.id,
      });
    }

    const result = await sendBoletoToBlockchain(tenant.companySecret, {
      codebar: boletoPayload.codebar,
      nosso_numero: boletoPayload.nosso_numero,
      valor: boletoPayload.valor,
      vencimento: boletoPayload.vencimento,
      status: boletoPayload.status,
    });

    return res.status(200).json({
      success: true,
      registered: true,
      tenantId: tenant.tenantId,
      event,
      asaasPaymentId: payment.id,
      data: result,
    });
  } catch (error) {
    console.error("[asaas-webhook]", tenantId, payment.id, error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      tenantId: tenant.tenantId,
      asaasPaymentId: payment.id,
    });
  }
};
