// tests/integration/orderService.integration.test.ts
const request = require("supertest");

const orderMocks = require("./orderMocks");
const app = require("../../src/index");
const Order = require("../../src/domain/entities/Order");
const Database = require("../../src/infrastructure/database");
const RabbitMQClient = require("../../src/infrastructure/messaging/RabbitMQClient");

let server;

const cleanOrder = (order) => {
  const { _id, __v, createdAt, updatedAt, products, ...cleanedOrder } = order;

  const cleanedProducts = products.map((product) => {
    const { _id, ...cleanedProduct } = product;
    return cleanedProduct;
  });

  return {
    ...cleanedOrder,
    products: cleanedProducts,
  };
};

describe("Order Service - Integration Tests", () => {
  beforeAll(async () => {
    // Conecta ao banco de dados e ao RabbitMQ antes de rodar os testes

    await Database.connect();
    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
  });

  afterAll(async () => {
    // Desconecta do banco de dados e do RabbitMQ após todos os testes
    await Database.disconnect();
    await RabbitMQClient.close();
  });
  beforeEach(async () => {
    // Limpa a coleção de pedidos antes de cada teste
    await Order.deleteMany({});
  });

  it("health check", async () => {
    // Cria alguns pedidos para o teste

    await request(app).get("/").expect(200);
  });

  it("should list all orders", async () => {
    // Cria alguns pedidos para o teste
    await Order.create(orderMocks);

    const response = await request(app).get("/orders").expect(200);

    const cleanedResponse = response.body.map((order) => cleanOrder(order));

    // Verifica a resposta
    expect(cleanedResponse).toHaveLength(orderMocks.length);
    expect(cleanedResponse).toEqual(
      expect.arrayContaining([
        expect.objectContaining(orderMocks[0]),
        expect.objectContaining(orderMocks[1]),
      ])
    );
  });

  // it("should create an order successfully", async () => {
  //   const response = await request(app)
  //     .post("/orders")
  //     .send(orderMocks[0])
  //     .expect(201);

  //   // Verifica a resposta
  //   expect(response.body).toMatchObject({
  //     message: "Order created successfully",
  //     order: {
  //       products: orderData.products,
  //       total: orderData.total,
  //     },
  //   });

  //   // Verifica se o pedido foi salvo no banco de dados
  //   const savedOrder = await Order.findById(response.body.id);
  //   expect(savedOrder).not.toBeNull();
  //   expect(savedOrder?.products).toBe(orderMocks[0].productId);
  //   expect(savedOrder?.total).toBe(orderMocks[0].total);

  //   // Verifica se a mensagem foi enviada para o RabbitMQ
  //   const queueMessages = await RabbitMQClient.getMessagesFromQueue(
  //     "orders_queue"
  //   ); // Supondo que RabbitMQClient tenha um método para verificar mensagens
  //   expect(queueMessages).toContainEqual(
  //     expect.objectContaining({
  //       action: "order_created",
  //       orderId: response.body.id,
  //     })
  //   );
  // });
});
