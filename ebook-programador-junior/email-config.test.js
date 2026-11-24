import assert from "node:assert/strict";
import test from "node:test";
import { getEmailConfiguration } from "./email-config.js";

test("uses SendGrid SMTP when an API key is configured", () => {
  assert.deepEqual(
    getEmailConfiguration({
      SENDGRID_API_KEY: "test-key",
      EMAIL_REMETENTE: "E-BOOK <sender@example.com>"
    }),
    {
      transport: {
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: { user: "apikey", pass: "test-key" }
      },
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

test("defaults the sender to SMTP_USER when no sender address is set", () => {
  assert.equal(
    getEmailConfiguration({ SMTP_USER: "sender@example.com" }).from,
    "sender@example.com"
  );
});
