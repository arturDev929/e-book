import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import { createEmailSender, getEmailConfiguration } from "./email-config.js";
import { validateMukutuReceipt } from "./receipt-validation.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

const port = Number(process.env.PORT || 3000);
const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const deliverySecret = process.env.DELIVERY_SECRET;
const pdfPath = path.resolve(process.env.PDF_PATH || "./ebook.pdf");
const expiryHours = Number(process.env.DELIVERY_EXPIRY_HOURS || 72);
const paymentPhone = process.env.PAYMENT_PHONE || "";
const ebookPrice = Number(process.env.EBOOK_PRICE_AOA || 2500);
const mukutuApiUrl =
  process.env.MUKUTU_API_URL ||
  "https://ocr-api-sdte.onrender.com/receipt-validation/v1/validate";

if (!deliverySecret || !publicBaseUrl || !paymentPhone) {
  console.error("Configure PUBLIC_BASE_URL, DELIVERY_SECRET and PAYMENT_PHONE.");
  process.exit(1);
}

if (!Number.isFinite(ebookPrice) || ebookPrice <= 0) {
  console.error("EBOOK_PRICE_AOA must be a positive number.");
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const emailConfiguration = getEmailConfiguration();
const transporter = emailConfiguration.sendGridApiKey
  ? undefined
  : nodemailer.createTransport(emailConfiguration.transport);
const sendEmail = createEmailSender({
  sendGridApiKey: emailConfiguration.sendGridApiKey,
  transporter
});

const processedPayments = new Set();
const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
}).single("comprovativo");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderPage(title, content) {
  return `<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Guia do Programador Júnior</title>
  <style>
    :root { color-scheme: light; font-family: Arial, sans-serif; color: #172b4d; background: #f3f6fa; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(760px, calc(100% - 32px)); margin: 36px auto; }
    .card { background: white; border-radius: 16px; padding: clamp(24px, 6vw, 48px); box-shadow: 0 12px 36px #172b4d12; }
    .eyebrow { color: #9a5b00; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h1 { font-size: clamp(30px, 6vw, 48px); line-height: 1.08; margin: 12px 0; }
    h2 { margin-top: 30px; }
    p, li { line-height: 1.6; }
    .price { color: #087443; font-size: 30px; font-weight: 700; margin: 18px 0; }
    .steps { background: #f3f6fa; border-radius: 12px; padding: 18px 24px; }
    label { display: block; font-weight: 700; margin: 18px 0 7px; }
    input { width: 100%; padding: 12px; border: 1px solid #b8c5d6; border-radius: 8px; font: inherit; }
    button { width: 100%; margin-top: 22px; border: 0; border-radius: 9px; padding: 15px; color: white; background: #087443; font-size: 16px; font-weight: 700; cursor: pointer; }
    button:hover { background: #065d36; }
    .muted { color: #526579; font-size: 13px; }
    .notice { border-left: 4px solid #e6a23c; padding: 10px 14px; background: #fff8eb; }
    a { color: #087443; }
  </style>
</head>
<body><main><article class="card">${content}</article></main></body>
</html>`;
}

function renderStorefront() {
  const formattedPrice = new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0
  }).format(ebookPrice);
  const safePhone = escapeHtml(paymentPhone);

  return renderPage("Como conseguir o primeiro emprego ou freela", `
    <div class="eyebrow">Guia prático para Angola</div>
    <h1>Transforme o que já sabe em oportunidades de programação</h1>
    <p>Um guia direto para montar um portfólio, encontrar vagas e clientes, apresentar os seus serviços e cobrar pelo trabalho como programador júnior.</p>
    <div class="price">${formattedPrice}</div>
    <ul>
      <li>Plano prático de 90 dias e projetos para o portfólio.</li>
      <li>Estratégias de candidatura, prospecção e abordagem DAV.</li>
      <li>Orientações para propostas, preços e recebimentos em Angola.</li>
    </ul>
    <div class="steps">
      <strong>Como comprar pelo Multicaixa Express</strong>
      <ol>
        <li>Envie exatamente <strong>${formattedPrice}</strong> para o número <strong>${safePhone}</strong>.</li>
        <li>Guarde o comprovativo bancário em PDF.</li>
        <li>Preencha o formulário abaixo. Após a validação, enviaremos um link de download para o seu e-mail.</li>
      </ol>
    </div>
    <form action="/comprar" method="post" enctype="multipart/form-data">
      <label for="email">E-mail para receber o e-book</label>
      <input id="email" name="email" type="email" autocomplete="email" required maxlength="254">
      <label for="comprovativo">Comprovativo de pagamento (PDF, até 5 MB)</label>
      <input id="comprovativo" name="comprovativo" type="file" accept="application/pdf,.pdf" required>
      <p class="muted">O comprovativo será enviado à Mukutu para validação do pagamento e não será guardado por esta loja.</p>
      <button type="submit">Validar pagamento e receber o e-book</button>
    </form>
    <p class="notice muted">Este guia é educativo e não garante emprego, clientes ou um rendimento específico.</p>
  `);
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

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.expiresAt || data.expiresAt < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function validateEmail(email) {
  return typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.type("html").send(renderStorefront());
});

app.post("/comprar", (req, res, next) => {
  receiptUpload(req, res, error => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "O comprovativo excede o limite de 5 MB."
        : "Envie apenas um comprovativo PDF de até 5 MB.";
      return res.status(400).type("html").send(renderPage("Não foi possível enviar", `
        <h1>Não foi possível enviar o comprovativo</h1><p>${message}</p><p><a href="/">Voltar à loja</a></p>
      `));
    }
    return next(error);
  });
}, async (req, res) => {
  const email = String(req.body.email || "").trim();
  const file = req.file;

  if (!validateEmail(email) || !file) {
    return res.status(400).type("html").send(renderPage("Dados em falta", `
      <h1>Confira os dados</h1><p>Informe um e-mail válido e anexe o comprovativo em PDF.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }

  if (
    !file.originalname.toLowerCase().endsWith(".pdf") ||
    file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    return res.status(400).type("html").send(renderPage("Comprovativo inválido", `
      <h1>O ficheiro não parece ser um PDF válido</h1><p>Exporte o comprovativo como PDF e tente novamente.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }

  const mukutuForm = new FormData();
  mukutuForm.append(
    "comprovativo",
    new Blob([file.buffer], { type: "application/pdf" }),
    path.basename(file.originalname)
  );

  let mukutuResponse;
  try {
    mukutuResponse = await fetch(mukutuApiUrl, {
      method: "POST",
      body: mukutuForm,
      signal: AbortSignal.timeout(60000)
    });
  } catch (error) {
    console.error("Mukutu validation request failed:", error.message);
    return res.status(502).type("html").send(renderPage("Validação indisponível", `
      <h1>Não foi possível validar agora</h1><p>A validação demorou ou ficou indisponível. O comprovativo não foi guardado e nenhum e-mail foi enviado. Tente novamente mais tarde com o mesmo comprovativo; não faça outro pagamento.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }

  if (mukutuResponse.status === 400) {
    return res.status(422).type("html").send(renderPage("Pagamento não confirmado", `
      <h1>Não conseguimos confirmar o pagamento</h1>
      <p>Verifique se pagou o valor exato para o número indicado e envie um comprovativo PDF legível.</p>
      <p>Se o valor já foi debitado, contacte o suporte antes de fazer outro pagamento.</p>
      <p><a href="/">Voltar à loja</a></p>
    `));
  }

  if (!mukutuResponse.ok) {
    console.error("Mukutu validation returned HTTP status:", mukutuResponse.status);
    return res.status(502).type("html").send(renderPage("Validação indisponível", `
      <h1>Não foi possível validar agora</h1><p>O comprovativo não foi guardado e nenhum e-mail foi enviado. Tente novamente mais tarde com o mesmo comprovativo; não faça outro pagamento.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }

  let validation;
  try {
    validation = await mukutuResponse.json();
  } catch {
    console.error("Mukutu validation returned invalid JSON.");
    return res.status(502).type("html").send(renderPage("Validação indisponível", `
      <h1>Resposta de validação inválida</h1><p>Tente novamente mais tarde. O comprovativo não foi guardado.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }

  const receipt = validateMukutuReceipt(validation, {
    price: ebookPrice,
    paymentPhone
  });

  if (!receipt.valid) {
    return res.status(422).type("html").send(renderPage("Pagamento não confirmado", `
      <h1>Não conseguimos confirmar o pagamento</h1>
      <p>Verifique se pagou o valor exato para o número indicado e envie um comprovativo PDF legível.</p>
      <p>Se o valor já foi debitado, contacte o suporte antes de fazer outro pagamento.</p>
      <p><a href="/">Voltar à loja</a></p>
    `));
  }

  if (processedPayments.has(receipt.paymentId)) {
    return res.status(409).type("html").send(renderPage("Comprovativo já utilizado", `
      <h1>Este comprovativo já foi utilizado</h1><p>Se acredita que isto é um erro, contacte o suporte.</p><p><a href="/">Voltar à loja</a></p>
    `));
  }
  processedPayments.add(receipt.paymentId);

  try {
    const token = createDeliveryToken(email, receipt.paymentId);
    const downloadUrl = `${publicBaseUrl}/download?token=${encodeURIComponent(token)}`;

    await sendEmail({
      from: emailConfiguration.from,
      to: email,
      subject: "Seu e-book: Programador Júnior em Angola",
      text: [
        "Pagamento validado. Obrigado pela sua compra!",
        "",
        `Descarregue o e-book pelo link abaixo. O link expira em ${expiryHours} horas:`,
        downloadUrl
      ].join("\n")
    });

    return res.status(200).type("html").send(renderPage("Pagamento confirmado", `
      <h1>Pagamento confirmado!</h1><p>Enviámos para o seu e-mail o link temporário para descarregar o e-book.</p><p>Se não encontrar a mensagem, verifique a pasta de spam.</p>
    `));
  } catch (error) {
    processedPayments.delete(receipt.paymentId);
    console.error("Falha no envio do e-book:", error);
    return res.status(500).type("html").send(renderPage("Falha no envio", `
      <h1>Pagamento validado, mas o e-mail não foi enviado</h1><p>Não faça outro pagamento. Contacte o suporte para receber o e-book.</p>
    `));
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
