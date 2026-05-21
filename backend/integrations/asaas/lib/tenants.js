const { isValidStellarKey } = require("../../../lib/stellar");

const TENANT_ID_RE = /^[a-z0-9][a-z0-9_-]{1,62}$/;

function normalizeTenantId(tenantId) {
  return String(tenantId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
}

function envKeyForTenant(tenantId, suffix) {
  const slug = normalizeTenantId(tenantId).toUpperCase().replace(/-/g, "_");
  return `TENANT_${slug}_${suffix}`;
}

function readEnvOverride(tenantId, suffix) {
  const key = envKeyForTenant(tenantId, suffix);
  return process.env[key] || "";
}

function parseTenantsJson() {
  const raw = process.env.TENANTS_JSON || "[]";
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new Error("TENANTS_JSON is invalid JSON");
  }
}

function mergeTenantRecord(record) {
  const tenantId = normalizeTenantId(record.tenantId);
  if (!tenantId || !TENANT_ID_RE.test(tenantId)) {
    throw new Error(`Invalid tenantId: ${record.tenantId}`);
  }

  const asaasApiKey =
    readEnvOverride(tenantId, "ASAAS_API_KEY") || record.asaasApiKey || "";
  const webhookAuthToken =
    readEnvOverride(tenantId, "WEBHOOK_TOKEN") || record.webhookAuthToken || "";
  const companyAccount =
    readEnvOverride(tenantId, "COMPANY_ACCOUNT") || record.companyAccount || "";
  const companySecret =
    readEnvOverride(tenantId, "COMPANY_SECRET") || record.companySecret || "";
  const asaasEnv =
    readEnvOverride(tenantId, "ASAAS_ENV") || record.asaasEnv || "sandbox";

  return {
    tenantId,
    asaasEnv: String(asaasEnv).toLowerCase() === "production" ? "production" : "sandbox",
    asaasApiKey: asaasApiKey.trim(),
    webhookAuthToken: webhookAuthToken.trim(),
    companyAccount: companyAccount.trim(),
    companySecret: companySecret.trim(),
    name: record.name || tenantId,
    enabled: record.enabled !== false,
  };
}

function validateTenant(tenant) {
  const errors = [];
  if (!tenant.asaasApiKey) errors.push("asaasApiKey is required");
  if (!tenant.webhookAuthToken) errors.push("webhookAuthToken is required");
  if (!tenant.companyAccount || !isValidStellarKey(tenant.companyAccount)) {
    errors.push("companyAccount must be a valid Stellar public key (G...)");
  }
  if (!tenant.companySecret || !tenant.companySecret.startsWith("S")) {
    errors.push("companySecret must be a valid Stellar secret key (S...)");
  }
  if (tenant.webhookAuthToken.length < 32) {
    errors.push("webhookAuthToken must be at least 32 characters");
  }
  return errors;
}

let tenantsCache = null;
let tenantsCacheKey = null;

function loadAllTenants() {
  const cacheKey = process.env.TENANTS_JSON || "";
  if (tenantsCache && tenantsCacheKey === cacheKey) return tenantsCache;

  const records = parseTenantsJson();
  const map = new Map();

  for (const record of records) {
    if (!record?.tenantId) continue;
    const tenant = mergeTenantRecord(record);
    map.set(tenant.tenantId, tenant);
  }

  tenantsCache = map;
  tenantsCacheKey = cacheKey;
  return map;
}

function getTenant(tenantId) {
  const id = normalizeTenantId(tenantId);
  if (!id) return null;
  const tenant = loadAllTenants().get(id);
  if (!tenant || !tenant.enabled) return null;
  return tenant;
}

function listTenantsPublic() {
  return Array.from(loadAllTenants().values()).map((t) => ({
    tenantId: t.tenantId,
    name: t.name,
    asaasEnv: t.asaasEnv,
    companyAccount: t.companyAccount,
    enabled: t.enabled,
    webhookUrl: `/api/webhooks/asaas/${t.tenantId}`,
  }));
}

function validateTenantInput(input) {
  const tenant = mergeTenantRecord(input);
  const errors = validateTenant(tenant);
  return { tenant, errors };
}

function getWebhookAuthToken(req) {
  return (
    req.headers["asaas-access-token"] ||
    req.headers["x-asaas-access-token"] ||
    ""
  ).trim();
}

module.exports = {
  TENANT_ID_RE,
  normalizeTenantId,
  parseTenantsJson,
  mergeTenantRecord,
  validateTenant,
  loadAllTenants,
  getTenant,
  listTenantsPublic,
  validateTenantInput,
  getWebhookAuthToken,
  envKeyForTenant,
};
