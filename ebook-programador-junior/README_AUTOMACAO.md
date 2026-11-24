# Venda do e-book

## Como funciona

1. O cliente paga o valor indicado pelo Multicaixa Express para o número configurado.
2. O cliente envia o e-mail e o comprovativo bancário em PDF pelo formulário.
3. O servidor envia o PDF à API Mukutu para validação.
4. O e-book só é enviado se a API confirmar o pagamento, o valor exato, a moeda AOA, o número destinatário e um identificador de transação.

A API Mukutu valida comprovativos; não inicia nem recebe pagamentos. O comprovativo é enviado à Mukutu para análise e não é guardado pela aplicação. A API documentada aceita PDF; outros formatos são recusados.

## Preço

O preço configurado é **24.000 Kz**. O faturamento depende das vendas e não é garantido; esse valor não desconta taxas ou outros custos. Ajuste `EBOOK_PRICE_AOA` no Render para alterar o preço.

## Configuração local

1. Copie `.env.example` para `.env`.
2. Preencha `PAYMENT_PHONE`, `SENDGRID_API_KEY`, `EMAIL_REMETENTE` e os segredos.
3. Coloque o PDF em `ebook.pdf` ou ajuste `PDF_PATH`.
4. Instale e execute:

   ```sh
   npm install
   npm start
   ```

## Variáveis de ambiente

- `PUBLIC_BASE_URL`: URL pública do serviço.
- `DELIVERY_SECRET`: segredo forte usado para assinar links temporários de download.
- `PDF_PATH`: caminho do PDF do e-book.
- `PAYMENT_PHONE`: número que receberá o pagamento Express.
- `EBOOK_PRICE_AOA`: preço exato em AOA/Kz (padrão: `24000`).
- `MUKUTU_API_URL`: endpoint de validação da Mukutu.
- `SENDGRID_API_KEY`: chave de API do SendGrid. Guarde-a apenas em variáveis de ambiente, nunca no repositório ou no chat; quando definida, o app usa a API HTTPS do SendGrid.
- `EMAIL_REMETENTE`: remetente verificado no SendGrid, por exemplo `E-BOOK <sender@example.com>`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: configuração SMTP alternativa, usada quando `SENDGRID_API_KEY` não está definida.

Nunca coloque credenciais reais no repositório ou no formulário de compra.

## Configuração no Render

No serviço existente, confirme `PAYMENT_PHONE`, `EBOOK_PRICE_AOA=24000`, `PDF_PATH=./ebook.pdf`, `PUBLIC_BASE_URL` e `DELIVERY_SECRET`. Para SendGrid, adicione a chave nova em `SENDGRID_API_KEY` e o remetente verificado em `EMAIL_REMETENTE`. Não reutilize uma chave que tenha sido exposta.

A especificação OpenAPI publicada pela Mukutu declara Basic Auth, mas o endpoint de produção respondeu sem autenticação com uma resposta de validação do comprovativo. A aplicação não envia credenciais. Se a Mukutu passar a exigir autenticação, o endpoint responderá com erro e será necessário atualizar a integração.

Depois de guardar as variáveis, faça um novo deploy. Teste a página inicial e `/health`. Faça primeiro um teste real com um pagamento de baixo valor antes de divulgar a loja.

## Limitações importantes

- O processamento de comprovativos duplicados usa memória do processo; um reinício do serviço limpa essa lista. Para vendas em escala, use um banco persistente para registar transações.
- A entrega depende da disponibilidade da API Mukutu e do SendGrid (ou do servidor SMTP alternativo).
- O guia é educativo e não garante emprego, clientes ou um rendimento específico.
