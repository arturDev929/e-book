# Capitulo 2: O Portfolio Perfeito

## 2.1 O que um recrutador procura

Um portfolio eficaz nao precisa de dezenas de projectos. Dois projectos completos demonstram mais maturidade do que dez mini-jogos sem integracao, sem documentacao e sem utilizador real.

Recrutadores procuram sinais de:

- Capacidade de explicar o problema.
- Organizacao do codigo.
- Uso adequado de Git e GitHub.
- Compreensao de APIs e bases de dados.
- Interface utilizavel.
- Tratamento de erros e estados vazios.
- Hospedagem funcional.
- Testes ou verificacoes importantes.
- Responsabilidade sobre segredos e dados.

Cada projecto deve ter uma URL activa, um repositorio publico, um README claro e uma lista das funcionalidades. Um link que mostra um erro em producao prejudica mais do que nao ter portfolio.

## 2.2 Projeto 1: Sistema de pedidos para restaurante

Construa uma aplicacao para um restaurante ficticio ou real com pedidos no browser e painel administrativo.

### Funcionalidades

- Catalogo de pratos com nome, descricao, preco e fotografia.
- Carrinho de compras.
- Criacao de pedido.
- Alteracao do estado: recebido, em preparacao, pronto e entregue.
- Historico de pedidos.
- Autenticacao simples para administradores.
- Painel para adicionar ou desactivar pratos.
- Regras para validar pedidos no servidor.

### Arquitetura sugerida

Use Node.js com Express no back-end. Crie rotas REST, por exemplo:

- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`

Use uma base de dados PostgreSQL quando houver possibilidade, ou MongoDB Atlas para comecar. Nunca use dados de clientes reais em exemplos publicos. Guarde a senha com uma biblioteca de hashing e variaveis de ambiente para segredo, ligacao da base de dados e configuracao do ambiente.

Separe responsabilidades em pastas como `routes`, `controllers`, `services` e `models`. Mesmo como projecto pequeno, esta separacao facilita manutencao.

### Interface

Crie uma experiencia mobile-first. O cliente angolano pode abrir o sistema no celular com internet limitada. Comprima imagens, evite bibliotecas pesadas e informe quando o pedido foi recebido. Adicione estados claros e mensagens de erro.

Use dados tipicos de Angola apenas em ambiente de demonstracao: Luanda, Talatona, Benfica, Maculusso ou outras zonas conhecidas. Inclua referencia ao IVA, entrega ou pagamento apenas se a regra do projecto tiver sido definida. Nao invente taxas legais sem confirmar.

### Historias que devem aparecer no README

- Como o cliente faz o pedido.
- Como o administrador muda o estado.
- Como a aplicacao valida um pedido.
- Como executar localmente.
- Como configurar a base de dados.
- Como fazer deploy.
- Quais sao as limitacoes conhecidas.

## 2.3 Projeto 2: Dashboard financeiro ou de gestao

O segundo projecto deve resolver uma dor de gestao.

Escolha um tema: controlo de vendas de uma loja, gestao de obras, clientes de oficina, receitas de restaurante ou acompanhamento de candidatos.

### Exemplo de dashboard

Construa uma API com dados ficticios de vendas e uma interface que apresenta:

- Total vendido no periodo.
- Numero de pedidos.
- Ticket medio.
- Produtos mais vendidos.
- Metodo de pagamento.
- Filtro por data.
- Exportacao CSV.
- Estados de carregamento, erro e vazio.

Use dados seguros e claramente ficticios. O dashboard nao precisa de pagamentos reais, mas pode simular valores em Kwanzas e mostrar conversoes apenas como valores demonstrativos.

## 2.4 Qualidade tecnica minima

Antes de publicar, responda a estas perguntas:

- Todos os campos obrigatorios sao validados?
- A API valida dados no servidor?
- Senhas sao armazenadas com hash?
- As variaveis secretas nao aparecem no repositorio?
- Erros nao mostram detalhes internos ao utilizador?
- Existe pagina para erro 404?
- O sistema funciona no celular?
- Os filtros e paginacao nao quebram?
- O README explica como testar o projecto?
- Os testes principais podem ser executados por outro desenvolvedor?

Adicione testes para regras de negocio: criacao de pedido, validacao de campos, calculo de total e mudanca de estado. Testes nao precisam cobrir tudo no inicio, mas devem provar a logica central.

## 2.5 GitHub profissional

Organize o perfil de forma simples:

- Nome real e fotografia profissional.
- Cidade em Angola ou disponibilidade para remoto.
- Biografia curta com tecnologia principal.
- Links para LinkedIn e portfolio.
- Dois repositorios fixados.
- Nomes de repositorio claros.
- Mensagens de commit objetivas.
- README com imagens ou video curto.

Exemplo de estrutura de README:

1. Nome e descricao.
2. Problema resolvido.
3. Tecnologias usadas.
4. Principais funcionalidades.
5. Capturas de ecra.
6. Demo publicada.
7. Como executar localmente.
8. Melhorias futuras.
9. Autor e contacto.

Nao envie codigo minificado sem explicacao. GitHub nao deve parecer uma pasta de trabalhos da faculdade. Deve parecer um produto que foi concebido, construído e entregue.

## 2.6 Publicacao no Render e Vercel

Use Vercel para front-ends React, Next.js ou aplicacoes compativeis. Use Render para APIs Node.js e bases de dados geridas. Os planos gratuitos podem pausar ou limitar recursos; confirme a politica atual antes de entregar ao cliente.

### Passos para publicar no Render

1. Envie o codigo para GitHub.
2. Crie um novo Web Service no Render.
3. Escolha o repositorio.
4. Configure o comando de instalacao e arranque.
5. Adicione as variaveis de ambiente.
6. Execute um deploy.
7. Teste os endpoints em producao.
8. Verifique a politica de inatividade do plano.

### Passos para publicar no Vercel

1. Importe o repositorio.
2. Escolha a pasta correta, caso exista monorepo.
3. Configure variaveis publicas e privadas.
4. Use a rede de deploy do Vercel.
5. Teste o site no celular.
6. Nao coloque chaves secretas em codigo executado pelo navegador.

Se tiver apenas um repositorio Node.js completo com Express e interface publica, pode hospedar a interface no Vercel e a API no Render. Documente o endereco da API e configure CORS explicitamente.

## 2.7 Preparacao para entrevistas

Prepare uma explicacao de dois minutos para cada projecto:

- Qual era o problema.
- Porque escolheu cada tecnologia.
- Qual foi a maior dificuldade.
- Como depurou o problema.
- Que melhoria faria agora.
- Que resultado o utilizador obtinha.

Nunca afirme que uma empresa o contratou se o projecto foi apenas demonstrativo. Use palavras honestas: "prototipo", "prova de conceito" ou "projecto demonstrativo". Esta honestidade gera confianca.
