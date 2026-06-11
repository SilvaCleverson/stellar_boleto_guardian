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

function getRecipients() {
  return (process.env.CONTACT_TO || DEFAULT_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildMessage({ nome, email, mensagem }) {
  return {
    subject: `Contato Boleto Guardian - ${nome}`,
    text: `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`,
    replyTo: email,
  };
}

async function sendViaResend({ nome, email, mensagem, toList }) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) return false;

  const from = process.env.CONTACT_FROM || "Boleto Guardian <onboarding@resend.dev>";
  const { subject, text, replyTo } = buildMessage({ nome, email, mensagem });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toList,
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Resend request failed");
  }

  return true;
}

async function sendViaSmtp({ nome, email, mensagem, toList }) {
  const smtpUser = process.env.CONTACT_SMTP_USER || "";
  const smtpPass = process.env.CONTACT_SMTP_PASS || "";
  if (!smtpUser || !smtpPass) return false;

  const { subject, text, replyTo } = buildMessage({ nome, email, mensagem });
  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.CONTACT_SMTP_PORT || 587),
    secure: process.env.CONTACT_SMTP_PORT === "465",
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: process.env.CONTACT_FROM || `"Boleto Guardian" <${smtpUser}>`,
    to: toList,
    replyTo,
    subject,
    text,
  });

  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Metodo nao permitido." });
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(process.env.CONTACT_SMTP_USER && process.env.CONTACT_SMTP_PASS);
  if (!hasResend && !hasSmtp) {
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

  const toList = getRecipients();

  try {
    if (hasResend) {
      await sendViaResend({ nome, email, mensagem, toList });
    } else {
      await sendViaSmtp({ nome, email, mensagem, toList });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[contact]", err.message);
    return res.status(500).json({ success: false, error: "Falha ao enviar e-mail. Tente mais tarde." });
  }
};
