function normalizeAngolanPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("244") && digits.length === 12
    ? digits.slice(3)
    : digits;
}

export function validateMukutuReceipt(response, { price, paymentPhone }) {
  const data = response?.data;
  if (
    response?.valid !== true ||
    Number(response.status) !== 200 ||
    !data ||
    Number(data.amount) !== price ||
    String(data.currency || "").toUpperCase() !== "AOA" ||
    normalizeAngolanPhone(data.recipient_phone) !== normalizeAngolanPhone(paymentPhone)
  ) {
    return { valid: false };
  }

  const paymentId = String(data.transaction || "").trim();
  if (!paymentId) return { valid: false };

  return { valid: true, paymentId };
}
