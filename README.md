# Projeto Educacional com Node.js e RabbitMQ

Este é um projeto educacional que demonstra um caso de uso simples de integração entre microserviços usando RabbitMQ para comunicação assíncrona. O projeto consiste em dois serviços: `order-service` e `product-service`. O objetivo é simular o fluxo de processamento de pedidos de compra em um ambiente desacoplado e baseado em filas.

## Visão Geral

O `product-service` recebe pedidos de compra de um front-end e os envia para uma fila do RabbitMQ chamada `order-service-queue`. O `order-service` então consome essa fila, processa os pedidos e realiza diversas verificações, como o status do pagamento e o envio. Após o processamento, o `order-service` envia os detalhes da ordem para outra fila chamada `product-service-queue`. Finalmente, o `product-service` consome essa fila para retornar o status atualizado ao cliente.

## Estrutura do Projeto

O projeto está dividido nas seguintes pastas:

- **order-service**: Responsável por consumir a fila de pedidos, processar e atualizar o status da ordem, interagir com o banco de dados para salvar, modificar, deletar e atualizar as ordens.
- **product-service**: Envia pedidos para a fila de pedidos e consome a fila de resposta para atualizar o cliente sobre o status.

## Requisitos

- Node.js (versão 14 ou superior)
- RabbitMQ
- Banco de dados (MongoDB ou outro de sua escolha)

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. Instale as dependências de cada serviço:

   ```bash
   cd order-service
   npm install
   cd ../product-service
   npm install
   ```

   Configure o RabbitMQ:

3. Configure o RabbitMQ:

   - Certifique-se de que o RabbitMQ está rodando em seu ambiente.
   - Você pode usar o arquivo docker compose que está no caminho root do projeto usando `docker compose -d`

4. Configure as variáveis de ambiente:

   - Cada serviço tem um arquivo .env.example para orientar a definição de envs
   - Crie um arquivo `.env` em cada serviço com as seguintes configurações (substitua os valores conforme necessário):

     ```plaintext
     RABBITMQ_URL="amqp://guest:guest@localhost:5672"
     PRODUCT_QUEUE_NAME="product-service-queue"
     ORDER_QUEUE_NAME="order-service-queue"
     MONGODB_URL="mongodb://root:example@0.0.0.0:27017/scan-product-service?retryWrites=true&writeConcern=majority&authSource=admin"
     ```

## Execução

1. Inicie as imgens docker:

   ```bash
   docker compose up -d
   ```

2. Inicie o `order-service`:

   ```bash
   cd order-service
   npm start
   ```

3. Em uma nova janela de terminal, inicie o `product-service`:

   ```bash
   cd product-service
   npm start
   ```

## Funcionamento

1. **Envio do Pedido**:

   - O `product-service` recebe uma ordem de compra de um cliente e envia para a fila `order-service-queue`.

2. **Processamento do Pedido**:

   - O `order-service` consome a fila `order-service-queue`, processa o pedido e salva as informações no banco de dados.

3. **Resposta do Pedido**:

   - Após o processamento, o `order-service` envia uma atualização da ordem para a fila `product-service-queue`.

4. **Atualização ao Cliente**:
   - O `product-service` consome a fila `product-service-queue` para obter o status atualizado da ordem e enviar as informações de volta ao cliente.
