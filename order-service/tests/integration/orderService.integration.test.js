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
const cleanProducts = (products) => {
  const cleanedProducts = products.map((product) => {
    const { _id, ...cleanedProduct } = product;
    return cleanedProduct;
  });

  return cleanedProducts;
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
    await Order.create(orderMocks);

    const response = await request(app).get("/orders").expect(200);

    const cleanedResponse = response.body.map((order) => cleanOrder(order));

    expect(cleanedResponse).toHaveLength(orderMocks.length);
    expect(cleanedResponse).toEqual(
      expect.arrayContaining([
        expect.objectContaining(orderMocks[0]),
        expect.objectContaining(orderMocks[1]),
      ])
    );
  });

  it("should create an order successfully", async () => {
    const response = await request(app)
      .post("/orders")
      .send(orderMocks[0])
      .expect(201);

    expect(response.body).toMatchObject({
      message: "Order created successfully",
      order: {
        products: orderMocks[0].products,
        total: orderMocks[0].total,
      },
    });

    const savedOrder = await Order.findById(response.body.order._id);
    expect(savedOrder).not.toBeNull();
    expect(savedOrder?.products).toMatchObject(orderMocks[0].products);
    expect(savedOrder?.total).toBe(orderMocks[0].total);

    await new Promise((resolve, reject) => {
      RabbitMQClient.consumeFromQueue(
        process.env.ORDER_QUEUE_NAME,
        (message) => {
          try {
            // Verifica o conteúdo da mensagem
            console.log("received message:", { message });

            expect(message).toEqual(
              expect.objectContaining({
                status: "created",
                orderId: response.body.order._id,
              })
            );

            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  });
});
