# Capítulo 2: O Portfólio Perfeito

## 2.1 O que um recrutador procura

Um portfólio eficaz não precisa de dezenas de projectos. Dois projectos completos demonstram mais maturidade do que dez mini-jogos sem integração, sem documentação e sem utilizador real.

Recrutadores procuram sinais de:

- Capacidade de explicar o problema.
- Organização do código.
- Uso adequado de Git e GitHub.
- Compreensão de APIs e bases de dados.
- Interface utilizável.
- Tratamento de erros e estados vazios.
- Hospedagem funcional.
- Testes ou verificações importantes.
- Responsabilidade sobre segredos e dados.

Cada projecto deve ter uma URL activa, um repositório público, um README claro e uma lista das funcionalidades. Um link que mostra um erro em produção prejudica mais do que não ter portfólio.

## 2.2 Projeto 1: Sistema de pedidos para restaurante

Construa uma aplicação para um restaurante fictício ou real com pedidos no browser e painel administrativo.

### Funcionalidades

- Catálogo de pratos com nome, descrição, preço e fotografia.
- Carrinho de compras.
- Criação de pedido.
- Alteração do estado: recebido, em preparação, pronto e entregue.
- Histórico de pedidos.
- Autenticação simples para administradores.
- Painel para adicionar ou desactivar pratos.
- Regras para validar pedidos no servidor.

### Arquitetura sugerida

Use Node.js com Express no back-end. Crie rotas REST, por exemplo:

- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`

Use uma base de dados PostgreSQL quando houver possibilidade, ou MongoDB Atlas para começar. Nunca use dados de clientes reais em exemplos públicos. Guarde a senha com uma biblioteca de hashing e variáveis de ambiente para segredo, ligação da base de dados e configuração do ambiente.

Separe responsabilidades em pastas como `routes`, `controllers`, `services` e `models`. Mesmo como projecto pequeno, esta separação facilita manutenção.

### Interface

Crie uma experiência mobile-first. O cliente angolano pode abrir o sistema no celular com internet limitada. Comprima imagens, evite bibliotecas pesadas e informe quando o pedido foi recebido. Adicione estados claros e mensagens de erro.

Use dados típicos de Angola apenas em ambiente de demonstração: Luanda, Talatona, Benfica, Maculusso ou outras zonas conhecidas. Inclua referência ao IVA, entrega ou pagamento apenas se a regra do projecto tiver sido definida. Não invente taxas legais sem confirmar.

### Historias que devem aparecer no README

- Como o cliente faz o pedido.
- Como o administrador muda o estado.
- Como a aplicação válida um pedido.
- Como executar localmente.
- Como configurar a base de dados.
- Como fazer deploy.
- Quais são as limitações conhecidas.

## 2.3 Projeto 2: Dashboard financeiro ou de gestão

O segundo projecto deve resolver uma dor de gestão.

Escolha um tema: controlo de vendas de uma loja, gestão de obras, clientes de oficina, receitas de restaurante ou acompanhamento de candidatos.

### Exemplo de dashboard

Construa uma API com dados fictícios de vendas e uma interface que apresenta:

- Total vendido no período.
- Número de pedidos.
- Ticket medio.
- Produtos mais vendidos.
- Método de pagamento.
- Filtro por data.
- Exportação CSV.
- Estados de carregamento, erro e vazio.

Use dados seguros e claramente fictícios. O dashboard não precisa de pagamentos reais, mas pode simular valores em Kwanzas e mostrar conversões apenas como valores demonstrativos.

## 2.4 Qualidade técnica mínima

Antes de publicar, responda a estas perguntas:

- Todos os campos obrigatórios são validados?
- A API válida dados no servidor?
- Senhas são armazenadas com hash?
- As variáveis secretas não aparecem no repositório?
- Erros não mostram detalhes internos ao utilizador?
- Existe página para erro 404?
- O sistema funciona no celular?
- Os filtros e paginação não quebram?
- O README explica como testar o projecto?
- Os testes principais podem ser executados por outro desenvolvedor?

Adicione testes para regras de negocio: criação de pedido, validação de campos, cálculo de total e mudança de estado. Testes não precisam cobrir tudo no início, mas devem provar a lógica central.

## 2.5 GitHub profissional

Organize o perfil de forma simples:

- Nome real e fotografia profissional.
- Cidade em Angola ou disponibilidade para remoto.
- Biografia curta com tecnologia principal.
- Links para LinkedIn e portfólio.
- Dois repositórios fixados.
- Nomes de repositório claros.
- Mensagens de commit objetivas.
- README com imagens ou vídeo curto.

Exemplo de estrutura de README:

1. Nome e descrição.
2. Problema resolvido.
3. Tecnologias usadas.
4. Principais funcionalidades.
5. Capturas de ecra.
6. Demo publicada.
7. Como executar localmente.
8. Melhorias futuras.
9. Autor e contacto.

Não envie código minificado sem explicação. GitHub não deve parecer uma pasta de trabalhos da faculdade. Deve parecer um produto que foi concebido, construído e entregue.

## 2.6 Publicação no Render e Vercel

Use Vercel para front-ends React, Next.js ou aplicações compatíveis. Use Render para APIs Node.js e bases de dados geridas. Os planos gratuitos podem pausar ou limitar recursos; confirme a política atual antes de entregar ao cliente.

### Passos para publicar no Render

1. Envie o código para GitHub.
2. Crie um novo Web Service no Render.
3. Escolha o repositório.
4. Configure o comando de instalação e arranque.
5. Adicione as variáveis de ambiente.
6. Execute um deploy.
7. Teste os endpoints em produção.
8. Verifique a política de inatividade do plano.

### Passos para publicar no Vercel

1. Importe o repositório.
2. Escolha a pasta correta, caso exista monorepo.
3. Configure variáveis públicas e privadas.
4. Use a rede de deploy do Vercel.
5. Teste o site no celular.
6. Não coloque chaves secretas em código executado pelo navegador.

Se tiver apenas um repositório Node.js completo com Express e interface pública, pode hospedar a interface no Vercel e a API no Render. Documente o endereço da API e configure CORS explicitamente.

## 2.7 Preparação para entrevistas

Prepare uma explicação de dois minutos para cada projecto:

- Qual era o problema.
- Porque escolheu cada tecnologia.
- Qual foi a maior dificuldade.
- Como depurou o problema.
- Que melhoria faria agora.
- Que resultado o utilizador obtinha.

Nunca afirme que uma empresa o contratou se o projecto foi apenas demonstrativo. Use palavras honestas: "protótipo", "prova de conceito" ou "projecto demonstrativo". Esta honestidade gera confiança.
