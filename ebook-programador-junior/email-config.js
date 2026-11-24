export function getEmailConfiguration(env = process.env) {
  const sendgridApiKey = env.SENDGRID_API_KEY;

  const configuration = {
    from: env.EMAIL_REMETENTE || env.FROM_EMAIL || env.SMTP_USER
  };

  if (sendgridApiKey) {
    configuration.sendGridApiKey = sendgridApiKey;
  } else {
    configuration.transport = {
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 465),
      secure: env.SMTP_SECURE !== "false",
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    };
  }

  return configuration;
}

function parseSender(from) {
  const match = /^\s*(.*?)\s*<([^<>]+)>\s*$/.exec(from);
  if (!match) return { email: from };

  const name = match[1].trim();
  return {
    email: match[2].trim(),
    ...(name ? { name } : {})
  };
}

export function createEmailSender(
  { sendGridApiKey, transporter },
  fetchImplementation = fetch
) {
  return async message => {
    if (!sendGridApiKey) {
      return transporter.sendMail(message);
    }

    const response = await fetchImplementation("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: message.to }] }],
        from: parseSender(message.from),
        subject: message.subject,
        content: [{ type: "text/plain", value: message.text }]
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`SendGrid API returned HTTP ${response.status}`);
    }
  };
}
