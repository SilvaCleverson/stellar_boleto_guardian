/**
 * Modulo de integracao Asaas -> Boleto Guardian.
 * Entradas HTTP (Vercel): api/webhooks/asaas/[tenantId].js e api/admin/tenants.js
 * Local: Integracao/ASAAS/
 */
const client = require("./lib/client");
const tenants = require("./lib/tenants");
const webhookHandler = require("./handlers/webhook");
const adminTenantsHandler = require("./handlers/admin-tenants");

module.exports = {
  client,
  tenants,
  webhookHandler,
  adminTenantsHandler,
};
