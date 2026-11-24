import assert from "node:assert/strict";
import test from "node:test";
import { validateMukutuReceipt } from "./receipt-validation.js";

const expected = {
  price: 2500,
  paymentPhone: "929277045"
};

const validResponse = {
  valid: true,
  status: 200,
  data: {
    amount: 2500,
    currency: "AOA",
    transaction: "tx-123",
    recipient_phone: "+244 929 277 045"
  }
};

test("accepts a valid receipt for the configured price and recipient", () => {
  assert.deepEqual(validateMukutuReceipt(validResponse, expected), {
    valid: true,
    paymentId: "tx-123"
  });
});

test("rejects receipts with a different amount", () => {
  const response = {
    ...validResponse,
    data: { ...validResponse.data, amount: 2000 }
  };
  assert.deepEqual(validateMukutuReceipt(response, expected), { valid: false });
});

test("rejects receipts sent to a different recipient or currency", () => {
  const wrongPhone = {
    ...validResponse,
    data: { ...validResponse.data, recipient_phone: "923000000" }
  };
  const wrongCurrency = {
    ...validResponse,
    data: { ...validResponse.data, currency: "USD" }
  };
  assert.deepEqual(validateMukutuReceipt(wrongPhone, expected), { valid: false });
  assert.deepEqual(validateMukutuReceipt(wrongCurrency, expected), { valid: false });
});

test("rejects invalid responses and receipts without a transaction identifier", () => {
  assert.deepEqual(
    validateMukutuReceipt({ ...validResponse, valid: false }, expected),
    { valid: false }
  );
  assert.deepEqual(
    validateMukutuReceipt({ ...validResponse, status: 400 }, expected),
    { valid: false }
  );
  assert.deepEqual(
    validateMukutuReceipt({
      ...validResponse,
      data: { ...validResponse.data, transaction: "" }
    }, expected),
    { valid: false }
  );
});
