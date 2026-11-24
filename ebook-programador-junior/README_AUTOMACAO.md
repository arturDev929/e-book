# Automacao de venda do e-book

## Importante

Este servidor recebe um webhook autenticado do seu processador de pagamento. Ele nao gera referências de pagamento nem valida Multicaixa sozinho. Escolha um processador com webhook e HMAC configuravel. O exemplo suporta os campos comuns: `status`, `payment_status`, `customer_email`, `email_cliente`, `payment_id`, `transaction_id`, `reference` e `id`.

## Configuracao local

1. Copie `.env.example` para `.env` e configure todos os valores.
2. Coloque o PDF em `ebook.pdf` ou altere `PDF_PATH`.
3. Instale as dependencias:

   `npm install`

4. Execute:

   `npm start`

## Variaveis

- `PUBLIC_BASE_URL`: URL publica do serviço no Render.
- `WEBHOOK_SECRET`: segredo usado para validar o HMAC do gateway.
- `DELIVERY_SECRET`: segredo usado para assinar links de download.
- `PDF_PATH`: caminho do PDF no servidor.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`: configuração SMTP.
- `SMTP_USER`, `SMTP_PASS`: credenciais SMTP. Use senha de aplicativo.
- `FROM_EMAIL`: remetente visível no e-mail.
- `DELIVERY_EXPIRY_HOURS`: validade do link.

Não coloque senha real no repositório.

## Webhook

Configure no seu gateway:

- URL: `https://SEU-SERVICO.onrender.com/webhook-pagamento`
- Método: `POST`
- Cabeçalhos suportados pelo servidor: `x-webhook-signature`, `x-signature` ou `kubeta-signature`.
- Assinatura: HMAC SHA-256 hexadecimal ou com prefixo `sha256=`.
- Chave: o valor de `WEBHOOK_SECRET`.

O gateway deve enviar o segredo como HMAC sobre o corpo bruto da requisição. Se a plataforma usar outro formato de assinatura, adapte `verifyWebhookSignature`.

Exemplo mínimo de corpo:

```json
{
  "status": "pago",
  "email_cliente": "cliente@exemplo.com",
  "payment_id": "pagamento-123",
  "produto_id": "ebook-programador-junior"
}
```

## Deploy no Render

1. Envie o projeto para GitHub.
2. No Render, escolha **New > Blueprint** e importe `render.yaml`.
3. Configure `PUBLIC_BASE_URL`, `SMTP_USER`, `SMTP_PASS` e `FROM_EMAIL`.
4. Adicione o PDF ao repositório privado ou monte-o por um volume persistente.
5. O arquivo PDF não deve ficar num endpoint público.
6. Configure o webhook da plataforma de pagamentos para a URL acima.

## Segurança

- O download é permitido apenas por token assinado e temporário.
- O webhook exige assinatura válida.
- O servidor reduz reenvios usando o identificador do pagamento em memória.
- Em produção com várias instâncias, substitua o conjunto em memória por PostgreSQL ou Redis.
*** End Patch
