import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import nodemailer from "nodemailer";

const app = express();

app.use("/webhook-pagamento", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));

const port = Number(process.env.PORT || 3000);
const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const webhookSecret = process.env.WEBHOOK_SECRET;
const deliverySecret = process.env.DELIVERY_SECRET;
const pdfPath = path.resolve(process.env.PDF_PATH || "./ebook.pdf");
const expiryHours = Number(process.env.DELIVERY_EXPIRY_HOURS || 72);

if (!webhookSecret || !deliverySecret || !publicBaseUrl) {
  console.error("Configure PUBLIC_BASE_URL, WEBHOOK_SECRET and DELIVERY_SECRET.");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const processedPayments = new Set();

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");

  return leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyWebhookSignature(rawBody, signature) {
  if (!signature) return false;

  const supplied = signature.replace(/^sha256=/, "");
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return safeCompare(supplied, expected);
}

function createDeliveryToken(email, paymentId) {
  const expiresAt = Date.now() + expiryHours * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ email, paymentId, expiresAt })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", deliverySecret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyDeliveryToken(token) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = crypto
    .createHmac("sha256", deliverySecret)
    .update(payload)
    .digest("base64url");

  if (!safeCompare(signature, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.expiresAt || data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function isPaid(payload) {
  const status = String(
    payload.status || payload.payment_status || payload.state || ""
  ).toLowerCase();

  return ["paid", "pago", "success", "succeeded", "completed", "confirmed", "confirmed_payment"]
    .includes(status);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/webhook-pagamento", async (req, res) => {
  const signature =
    req.get("x-webhook-signature") ||
    req.get("x-signature") ||
    req.get("kubeta-signature");

  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: "Assinatura invalida." });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "JSON invalido." });
  }

  if (!isPaid(payload)) {
    return res.status(202).json({ message: "Pagamento ainda nao confirmado." });
  }

  const email =
    payload.email_cliente ||
    payload.customer_email ||
    payload.customer?.email ||
    payload.buyer?.email ||
    payload.email;

  const paymentId =
    payload.payment_id ||
    payload.transaction_id ||
    payload.reference ||
    payload.id;

  if (!email || !paymentId) {
    return res.status(400).json({ error: "Faltam email_cliente e identificador do pagamento." });
  }

  if (processedPayments.has(String(paymentId))) {
    return res.status(200).json({ message: "Pagamento ja processado." });
  }
  processedPayments.add(String(paymentId));

  try {
    const token = createDeliveryToken(email, String(paymentId));
    const downloadUrl = `${publicBaseUrl}/download?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Seu E-book chegou: Programador Junior em Angola",
      text: [
        "Obrigado pela sua compra!",
        "",
        `Descarregue o e-book pelo link abaixo. O link expira em ${expiryHours} horas:`,
        downloadUrl,
        "",
        "Se nao realizou esta compra, ignore esta mensagem."
      ].join("\n")
    });

    return res.status(200).json({ message: "E-book enviado com sucesso." });
  } catch (error) {
    processedPayments.delete(String(paymentId));
    console.error("Falha no envio:", error);
    return res.status(500).json({ error: "Falha ao enviar o e-book." });
  }
});

app.get("/download", (req, res) => {
  const token = String(req.query.token || "");
  const data = verifyDeliveryToken(token);

  if (!data) {
    return res.status(403).send("O link expirou ou não é válido.");
  }

  res.download(pdfPath, "guia-programador-junior-angola.pdf");
});

app.listen(port, () => {
  console.log(`Servidor de vendas iniciado na porta ${port}`);
});
