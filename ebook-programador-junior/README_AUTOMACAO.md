# Venda do e-book

## Como funciona

1. O cliente paga o valor indicado pelo Multicaixa Express para o número configurado.
2. O cliente envia o e-mail e o comprovativo bancário em PDF pelo formulário.
3. O servidor envia o PDF à API Mukutu para validação.
4. O e-book só é enviado se a API confirmar o pagamento, o valor exato, a moeda AOA, o número destinatário e um identificador de transação.

A API Mukutu valida comprovativos; não inicia nem recebe pagamentos. O comprovativo é enviado à Mukutu para análise e não é guardado pela aplicação. A API documentada aceita PDF; outros formatos são recusados.

## Preço

O preço inicial configurado é **2.500 Kz**. A meta de 20.000 Kz em vendas brutas por dia corresponde a oito vendas nesse preço; isso não é garantido e não desconta taxas ou outros custos. Ajuste `EBOOK_PRICE_AOA` no Render para alterar o valor.

## Configuração local

1. Copie `.env.example` para `.env`.
2. Preencha `PAYMENT_PHONE`, as credenciais Mukutu, as variáveis SMTP e os segredos.
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
- `EBOOK_PRICE_AOA`: preço exato em AOA/Kz (padrão: `2500`).
- `MUKUTU_API_URL`: endpoint de validação da Mukutu.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: configuração para envio do e-book por e-mail. Use senha de aplicativo quando o provedor exigir.

Nunca coloque credenciais reais no repositório ou no formulário de compra.

## Configuração no Render

No serviço existente, adicione `PAYMENT_PHONE` em **Environment**. Confirme também `EBOOK_PRICE_AOA=2500`, `PDF_PATH=./ebook.pdf`, `PUBLIC_BASE_URL`, `DELIVERY_SECRET` e as variáveis SMTP.

A especificação OpenAPI publicada pela Mukutu declara Basic Auth, mas o endpoint de produção respondeu sem autenticação com uma resposta de validação do comprovativo. A aplicação não envia credenciais. Se a Mukutu passar a exigir autenticação, o endpoint responderá com erro e será necessário atualizar a integração.

Depois de guardar as variáveis, faça um novo deploy. Teste a página inicial e `/health`. Faça primeiro um teste real com um pagamento de baixo valor antes de divulgar a loja.

## Limitações importantes

- O processamento de comprovativos duplicados usa memória do processo; um reinício do serviço limpa essa lista. Para vendas em escala, use um banco persistente para registar transações.
- A entrega depende da disponibilidade da API Mukutu e do SMTP.
- O guia é educativo e não garante emprego, clientes ou um rendimento específico.
