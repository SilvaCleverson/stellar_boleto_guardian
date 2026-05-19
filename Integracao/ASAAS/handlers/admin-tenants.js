const {
  validateTenantInput,
  listTenantsPublic,
  normalizeTenantId,
  envKeyForTenant,
} = require("../lib/tenants");

function getAdminKey(req) {
  const h = req.headers["x-admin-key"];
  if (h) return String(h).trim();
  const auth = req.headers["authorization"] || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return "";
}

function requireAdmin(req, res) {
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
  if (!ADMIN_API_KEY) {
    res.status(500).json({ success: false, error: "ADMIN_API_KEY not configured" });
    return false;
  }
  const key = getAdminKey(req);
  if (!key || key !== ADMIN_API_KEY) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return res.json({
      success: true,
      tenants: listTenantsPublic(),
      note: "Secrets are not returned. Configure via TENANTS_JSON or TENANT_{ID}_* env vars.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const input = req.body || {};
  const { tenant, errors } = validateTenantInput(input);

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const tenantId = normalizeTenantId(tenant.tenantId);
  const baseUrl = process.env.GUARDIAN_PUBLIC_URL || "https://www.boletoguardian.xyz";

  const envHints = {
    TENANTS_JSON_entry: {
      tenantId,
      name: input.name || tenantId,
      asaasEnv: tenant.asaasEnv,
      asaasApiKey: "<set in Vercel or use env override>",
      webhookAuthToken: "<set in Vercel or use env override>",
      companyAccount: tenant.companyAccount,
      companySecret: "<set in Vercel or use env override>",
      enabled: true,
    },
    env_overrides: {
      [envKeyForTenant(tenantId, "ASAAS_API_KEY")]: "optional override",
      [envKeyForTenant(tenantId, "WEBHOOK_TOKEN")]: "optional override",
      [envKeyForTenant(tenantId, "COMPANY_ACCOUNT")]: "optional override",
      [envKeyForTenant(tenantId, "COMPANY_SECRET")]: "optional override",
      [envKeyForTenant(tenantId, "ASAAS_ENV")]: "sandbox | production",
    },
  };

  return res.status(200).json({
    success: true,
    message:
      "Tenant validated. Add the entry to TENANTS_JSON in Vercel (or use env overrides), then configure the Asaas webhook.",
    tenant: {
      tenantId,
      name: tenant.name,
      asaasEnv: tenant.asaasEnv,
      companyAccount: tenant.companyAccount,
      webhookUrl: `${baseUrl}/api/webhooks/asaas/${tenantId}`,
      asaasWebhookEvents: ["PAYMENT_CREATED"],
    },
    setup: envHints,
    asaasDocs: "https://docs.asaas.com/docs/criar-novo-webhook-pela-api",
  });
};
