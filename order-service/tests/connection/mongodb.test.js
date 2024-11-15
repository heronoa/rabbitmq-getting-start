const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Order = require("../../src/domain/entities/Order");

beforeAll(async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Jest connected to mongodb");
    })
    .catch((error) => {
      console.log(`Jest couldn't connect to mongodb  ${error}`);
    });
  await Order.deleteMany();
});

afterAll(async () => {
  await Order.deleteMany();
  await mongoose.connection.close();
});

describe("MongoDB Integration Test - Order Model", () => {
  it("should add a order and return it back with a id", async () => {
    const newOrder = await Order({
      orders: [
        { order_id: "0" },
        { order_id: "1" },
        { order_id: "3" },
        { order_id: "4" },
        { order_id: "5" },
      ],
      total: 100,
    });

    await newOrder.save();

    const orders = await Order.find();

    expect(orders[0].id).toBeDefined();
  });
  it("should fetch a list of order with orders, id and total", async () => {
    const orders = await Order.find();

    expect(Array.isArray(orders)).toBe(true);

    const order = orders[0];

    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("total");
    expect(order).toHaveProperty("orders");
  });

  it("should update the total of a order", async () => {
    const firstOrder = (await Order.find())[0];
    expect(firstOrder).not.toBeNull();
    expect(firstOrder.orders.length).toBe(5);
    expect(firstOrder.total).toBe(100);

    // Remover um ID do array e diminuir o preço
    const removedOrderId = { order_id: "0" };
    const priceReduction = 25; // Valor a ser subtraído ao remover um produto
    firstOrder.orders = firstOrder.orders.filter(
      (prod) => prod.order_id !== removedOrderId.order_id
    );
    firstOrder.total -= priceReduction;

    // Salva as mudanças
    const updatedOrder = await firstOrder.save();

    // Busca o pedido atualizado e verifica a remoção do ID e a atualização do preço
    const updatedFoundOrder = await Order.findById(updatedOrder._id);
    expect(updatedFoundOrder.orders).not.toContain(removedOrderId);
    expect(updatedFoundOrder.orders.length).toBe(4); // Verifica que um ID foi removido
    expect(updatedFoundOrder.total).toBe(75); // Verifica que o preço foi atualizado
  });

  it("should delete a order", async () => {
    const orders = await Order.find();

    const firstOrder = orders[0];

    expect(firstOrder).not.toBeNull();

    // Recupera o produto do banco de dados para confirmar a atualização
    await Order.findByIdAndDelete(firstOrder.id);
    const foundOrder = await Order.findById(firstOrder.id);

    // Verifica se o preço foi atualizado corretamente
    expect(foundOrder).toBeNull();
  });
});
