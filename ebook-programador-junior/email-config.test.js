import assert from "node:assert/strict";
import test from "node:test";
import { createEmailSender, getEmailConfiguration } from "./email-config.js";

test("uses SendGrid HTTPS API when an API key is configured", () => {
  assert.deepEqual(
    getEmailConfiguration({
      SENDGRID_API_KEY: "test-key",
      EMAIL_REMETENTE: "E-BOOK <sender@example.com>"
    }),
    {
      sendGridApiKey: "test-key",
      from: "E-BOOK <sender@example.com>"
    }
  );
});

test("retains generic SMTP configuration when SendGrid is not configured", () => {
  assert.deepEqual(
    getEmailConfiguration({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "465",
      SMTP_SECURE: "true",
      SMTP_USER: "user@example.com",
      SMTP_PASS: "smtp-password",
      FROM_EMAIL: "sender@example.com"
    }),
    {
      transport: {
        host: "smtp.example.com",
        port: 465,
        secure: true,
        auth: { user: "user@example.com", pass: "smtp-password" }
      },
      from: "sender@example.com"
    }
  );
});

test("sends a message through the SendGrid API with a parsed sender", async () => {
  let request;
  const sendEmail = createEmailSender(
    { sendGridApiKey: "test-key" },
    async (...args) => {
      request = args;
      return { ok: true, status: 202 };
    }
  );

  await sendEmail({
    from: "E-BOOK <sender@example.com>",
    to: "customer@example.com",
    subject: "Seu e-book",
    text: "Link de download"
  });

  assert.equal(request[0], "https://api.sendgrid.com/v3/mail/send");
  assert.equal(request[1].method, "POST");
  assert.equal(request[1].headers.Authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(request[1].body), {
    personalizations: [{ to: [{ email: "customer@example.com" }] }],
    from: { email: "sender@example.com", name: "E-BOOK" },
    subject: "Seu e-book",
    content: [{ type: "text/plain", value: "Link de download" }]
  });
});

test("reports SendGrid API failures without exposing credentials", async () => {
  const sendEmail = createEmailSender(
    { sendGridApiKey: "secret-test-key" },
    async () => ({ ok: false, status: 401 })
  );

  await assert.rejects(
    sendEmail({
      from: "sender@example.com",
      to: "customer@example.com",
      subject: "Seu e-book",
      text: "Link de download"
    }),
    error => {
      assert.equal(error.message, "SendGrid API returned HTTP 401");
      assert.equal(error.message.includes("secret-test-key"), false);
      return true;
    }
  );
});

test("uses the configured SMTP transporter when SendGrid is not configured", async () => {
  let sentMessage;
  const sendEmail = createEmailSender({
    transporter: {
      async sendMail(message) {
        sentMessage = message;
      }
    }
  });
  const message = {
    from: "sender@example.com",
    to: "customer@example.com",
    subject: "Seu e-book",
    text: "Link de download"
  };

  await sendEmail(message);

  assert.equal(sentMessage, message);
});

test("defaults the sender to SMTP_USER when no sender address is set", () => {
  assert.equal(
    getEmailConfiguration({ SMTP_USER: "sender@example.com" }).from,
    "sender@example.com"
  );
});
