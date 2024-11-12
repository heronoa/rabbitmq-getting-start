// tests/integration/productService.integration.test.ts
const request = require("supertest");

const productMocks = require("./productMocks");
const app = require("../../src/index");
const Product = require("../../src/domain/entities/Product");
const Database = require("../../src/infrastructure/database");
const RabbitMQClient = require("../../src/infrastructure/messaging/RabbitMQClient");

const cleanProduct = (product) => {
  const { _id, __v, createdAt, updatedAt, ...cleanedProduct } = product;

  return {
    ...cleanedProduct,
  };
};

describe("Product Service - Integration Tests", () => {
  beforeAll(async () => {
    // Conecta ao banco de dados e ao RabbitMQ antes de rodar os testes

    await Database.connect();
    await RabbitMQClient.connect(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );
    await Product.deleteMany({});
  });

  afterAll(async () => {
    // Desconecta do banco de dados e do RabbitMQ após todos os testes
    await Product.deleteMany({});
    await Database.disconnect();
    await RabbitMQClient.close();
  });
  beforeEach(async () => {
    // Limpa a coleção de pedidos antes de cada teste
    await Product.deleteMany({});
  });

  it("health check", async () => {
    // Cria alguns pedidos para o teste

    await request(app).get("/").expect(200);
  });

  it("should list all products", async () => {
    await Product.create(productMocks);

    const response = await request(app).get("/products").expect(200);

    const cleanedResponse = response.body.map((product) =>
      cleanProduct(product)
    );

    expect(cleanedResponse).toHaveLength(productMocks.length);
    expect(cleanedResponse).toEqual(
      expect.arrayContaining([
        expect.objectContaining(productMocks[0]),
        expect.objectContaining(productMocks[1]),
        expect.objectContaining(productMocks[2]),
      ])
    );
  });

  it("should create an product successfully", async () => {
    const response = await request(app)
      .post("/products")
      .send(productMocks[0])
      .expect(201);

    expect(response.body).toMatchObject({
      message: "Product created successfully",
      product: productMocks[0],
    });

    const savedProduct = await Product.findById(response.body.product._id);
    expect(savedProduct).not.toBeNull();
    expect(savedProduct).toMatchObject(productMocks[0]);
    expect(savedProduct?.price).toBe(productMocks[0].price);
  });

  it("should update an product successfully", async () => {
    const createdProduct = await Product.create(productMocks[0]);

    expect(createdProduct).not.toBeNull();

    const updatingProduct = createdProduct.toObject();

    expect(cleanProduct(updatingProduct)).toEqual(productMocks[0]);

    const response = await request(app)
      .patch(`/products/${updatingProduct._id}`)
      .send({
        price: (updatingProduct.price - updatingProduct.price / 2) >> 0,
      });

    expect(response).not.toBeNull();

    const updatedProduct = response.body;

    expect(updatedProduct).toMatchObject({
      price: (updatingProduct.price - updatingProduct.price / 2) >> 0,
    });

    const getUpdatedResponse = await request(app).get(
      `/products/${updatedProduct._id}`
    );

    const fetchUpdatedProduct = getUpdatedResponse.body;

    expect(fetchUpdatedProduct).toMatchObject({
      price: (updatingProduct.price - updatingProduct.price / 2) >> 0,
    });

    expect(fetchUpdatedProduct).toEqual(updatedProduct);
  });

  it("should delete an product successfully", async () => {
    await Product.create(productMocks[0]);
    const response = await request(app).get("/products").expect(200);
    const firstProduct = response.body[0];

    expect(firstProduct).not.toBeNull();

    await request(app).delete(`/products/${firstProduct._id}`);

    const deleteResponse = await request(app).get(
      `/products/${firstProduct._id}`
    );

    const deletedProduct = deleteResponse.body;

    expect(deletedProduct).toEqual({
      error: "Failed to fetch product",
    });
  });

  // it("should decrease quantity of products when receive a message from products queue", async () => {});
});
