/**
 * Testes unitarios da integracao Asaas (sem credenciais reais).
 * Executar: npm run test:asaas
 */

const assert = require("assert");
const { Keypair } = require("@stellar/stellar-sdk");
const {
  isBoletoBillingType,
  buildBoletoPayload,
  getBaseUrl,
} = require("../lib/client");
const {
  normalizeTenantId,
  validateTenantInput,
  mergeTenantRecord,
} = require("../lib/tenants");

function test(name, fn) {
  try {
    fn();
    console.log(`  ok ${name}`);
  } catch (e) {
    console.error(`  FAIL ${name}:`, e.message);
    process.exitCode = 1;
  }
}

console.log("asaas/lib/client.js");
test("isBoletoBillingType BOLETO", () => {
  assert.strictEqual(isBoletoBillingType("BOLETO"), true);
});
test("isBoletoBillingType PIX false", () => {
  assert.strictEqual(isBoletoBillingType("PIX"), false);
});
test("getBaseUrl sandbox", () => {
  assert.ok(getBaseUrl("sandbox").includes("sandbox"));
});
test("buildBoletoPayload normalizes barCode", () => {
  const payload = buildBoletoPayload(
    { id: "pay_1", value: 100, dueDate: "2026-05-20" },
    {
      barCode: "00191878900000050000000002759288002193297817",
      nossoNumero: "6543",
    }
  );
  assert.strictEqual(payload.codebar.length, 44);
  assert.strictEqual(payload.nosso_numero, "6543");
  assert.strictEqual(payload.valor, "100");
});

console.log("asaas/lib/tenants.js");
test("normalizeTenantId", () => {
  assert.strictEqual(normalizeTenantId("Loja-A"), "loja-a");
});
test("validateTenantInput rejects short webhook token", () => {
  const kp = Keypair.random();
  const { errors } = validateTenantInput({
    tenantId: "t1",
    asaasApiKey: "key",
    webhookAuthToken: "short",
    companyAccount: kp.publicKey(),
    companySecret: kp.secret(),
  });
  assert.ok(errors.some((e) => e.includes("webhookAuthToken")));
});
test("mergeTenantRecord structure", () => {
  const kp = Keypair.random();
  const t = mergeTenantRecord({
    tenantId: "demo",
    asaasApiKey: "k",
    webhookAuthToken: "x".repeat(32),
    companyAccount: kp.publicKey(),
    companySecret: kp.secret(),
  });
  assert.strictEqual(t.tenantId, "demo");
  assert.strictEqual(t.asaasEnv, "sandbox");
});

if (process.exitCode) {
  console.log("\nSome tests failed.");
  process.exit(1);
}
console.log("\nAll tests passed.");
