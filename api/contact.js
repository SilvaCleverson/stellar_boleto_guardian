const nodemailer = require("nodemailer");

const DEFAULT_TO = "cleverson-silva@uol.com.br,guardianlabsw3@gmail.com";

function parseBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Metodo nao permitido." });
  }

  const smtpUser = process.env.CONTACT_SMTP_USER || "";
  const smtpPass = process.env.CONTACT_SMTP_PASS || "";
  if (!smtpUser || !smtpPass) {
    return res.status(503).json({
      success: false,
      error: "Envio de e-mail nao configurado no servidor.",
    });
  }

  const body = parseBody(req);
  if (body._honey) {
    return res.status(200).json({ success: true });
  }

  const nome = String(body.nome || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const mensagem = String(body.mensagem || "").trim().slice(0, 5000);

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ success: false, error: "Preencha nome, e-mail e mensagem." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "E-mail invalido." });
  }

  const toList = (process.env.CONTACT_TO || DEFAULT_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.CONTACT_SMTP_PORT || 587),
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: `"Boleto Guardian" <${smtpUser}>`,
      to: toList,
      replyTo: email,
      subject: `Contato Boleto Guardian - ${nome}`,
      text: `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[contact]", err.message);
    return res.status(500).json({ success: false, error: "Falha ao enviar e-mail. Tente mais tarde." });
  }
};
