// tests/integration/orderService.integration.test.ts
const request = require("supertest");

const orderMocks = require("./orderMocks");
const app = require("../../src/index");
const Order = require("../../src/domain/entities/Order");
const Database = require("../../src/infrastructure/database");
const RabbitMQClient = require("../../src/infrastructure/messaging/RabbitMQClient");

const cleanOrders = (orders) => {
  const cleanedOrders = orders.map((order) => {
    const { _id, ...cleanedOrder } = order;
    return cleanedOrder;
  });

  return cleanedOrders;
};

const cleanOrder = (order) => {
  const { _id, __v, createdAt, updatedAt, orders, ...cleanedOrder } = order;

  const cleanedOrders = cleanOrders(orders);

  return {
    ...cleanedOrder,
    orders: cleanedOrders,
  };
};

describe("Order Service - Integration Tests", () => {
  beforeAll(async () => {
    // Conecta ao banco de dados e ao RabbitMQ antes de rodar os testes

    await Database.connect();
    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    await Order.deleteMany({});
  });

  afterAll(async () => {
    // Desconecta do banco de dados e do RabbitMQ após todos os testes
    await Order.deleteMany({});
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
        orders: orderMocks[0].orders,
        total: orderMocks[0].total,
      },
    });

    const savedOrder = await Order.findById(response.body.order._id);
    expect(savedOrder).not.toBeNull();
    expect(savedOrder?.orders).toMatchObject(orderMocks[0].orders);
    expect(savedOrder?.total).toBe(orderMocks[0].total);
  });

  it("should update an order successfully", async () => {
    const createdOrder = await Order.create(orderMocks[0]);

    expect(createdOrder).not.toBeNull();

    const updatingOrder = createdOrder.toObject();

    expect(cleanOrder(updatingOrder)).toEqual(orderMocks[0]);

    const response = await request(app)
      .patch(`/orders/${updatingOrder._id}`)
      .send({
        total: (updatingOrder.total - updatingOrder.total / 2) >> 0,
      });

    expect(response).not.toBeNull();

    const updatedOrder = response.body;

    expect(updatedOrder).toMatchObject({
      total: (updatingOrder.total - updatingOrder.total / 2) >> 0,
    });

    const getUpdatedResponse = await request(app).get(
      `/orders/${updatedOrder._id}`
    );

    const fetchUpdatedOrder = getUpdatedResponse.body;

    expect(fetchUpdatedOrder).toMatchObject({
      total: (updatingOrder.total - updatingOrder.total / 2) >> 0,
    });

    expect(fetchUpdatedOrder).toEqual(updatedOrder);
  });

  it("should delete an order successfully", async () => {
    await Order.create(orderMocks[0]);
    const response = await request(app).get("/orders").expect(200);
    const firstOrder = response.body[0];

    expect(firstOrder).not.toBeNull();

    await request(app).delete(`/orders/${firstOrder._id}`);

    const deleteResponse = await request(app).get(`/orders/${firstOrder._id}`);

    const deletedOrder = deleteResponse.body;

    expect(deletedOrder).toEqual({
      error: "Failed to fetch order",
    });
  });

  it("should create a new order when a message is received from orders queue", async () => {
    // Envia uma mensagem para a fila orders_queue
    await RabbitMQClient.sendToQueue(
      process.env.ORDER_QUEUE_NAME,
      orderMocks[0]
    );

    // Aguarda a criação da ordem no banco de dados
    await new Promise((resolve) => setTimeout(resolve, 500)); // Ajuste o delay conforme necessário

    // Verifica se a nova ordem foi criada no banco de dados
    const createdOrder = await Order.findOne({ total: orderMocks[0].total });

    expect(createdOrder).not.toBeNull();

    const createdOrderOrders = createdOrder.orders.map((order) =>
      order.toObject()
    );

    expect(createdOrderOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining(orderMocks[0].orders[0]),
        expect.objectContaining(orderMocks[0].orders[0]),
      ])
    );
    expect(createdOrder.total).toBe(orderMocks[0].total);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Ajuste o delay conforme necessário

    await new Promise((resolve, reject) => {
      RabbitMQClient.consumeFromQueue(
        process.env.PRODUCT_QUEUE_NAME,
        (message) => {
          try {
            // Verifica o conteúdo da mensagem
            expect(message).toEqual(
              expect.objectContaining({
                status: "created",
                orderId: createdOrder._id.toString(),
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
