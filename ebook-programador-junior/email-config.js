export function getEmailConfiguration(env = process.env) {
  const sendgridApiKey = env.SENDGRID_API_KEY;
  const useSendGrid = Boolean(sendgridApiKey);

  return {
    transport: {
      host: useSendGrid ? "smtp.sendgrid.net" : env.SMTP_HOST,
      port: Number(useSendGrid ? 587 : env.SMTP_PORT || 465),
      secure: useSendGrid ? false : env.SMTP_SECURE !== "false",
      auth: {
        user: useSendGrid ? "apikey" : env.SMTP_USER,
        pass: sendgridApiKey || env.SMTP_PASS
      }
    },
    from: env.EMAIL_REMETENTE || env.FROM_EMAIL || env.SMTP_USER
  };
}
