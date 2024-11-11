const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Order = require("../src/domain/entities/Order");

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
  it("should add a product and return it back with a id", async () => {
    const newOrder = await Order({
      products: [
        { product_id: "0" },
        { product_id: "1" },
        { product_id: "3" },
        { product_id: "4" },
        { product_id: "5" },
      ],
      total: 100,
    });

    await newOrder.save();

    const orders = await Order.find();

    expect(orders[0].id).toBeDefined();
  });
  it("should fetch a list of product with products, id and total", async () => {
    const orders = await Order.find();

    expect(Array.isArray(orders)).toBe(true);

    const product = orders[0];

    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("total");
    expect(product).toHaveProperty("products");
  });

  it("should update the total of a product", async () => {
    const firstOrder = (await Order.find())[0];
    expect(firstOrder).not.toBeNull();
    expect(firstOrder.products.length).toBe(5);
    expect(firstOrder.total).toBe(100);

    // Remover um ID do array e diminuir o preço
    const removedProductId = { product_id: "0" };
    const priceReduction = 25; // Valor a ser subtraído ao remover um produto
    firstOrder.products = firstOrder.products.filter(
      (prod) => prod.product_id !== removedProductId.product_id
    );
    firstOrder.total -= priceReduction;

    // Salva as mudanças
    const updatedOrder = await firstOrder.save();

    // Busca o pedido atualizado e verifica a remoção do ID e a atualização do preço
    const updatedFoundOrder = await Order.findById(updatedOrder._id);
    expect(updatedFoundOrder.products).not.toContain(removedProductId);
    expect(updatedFoundOrder.products.length).toBe(4); // Verifica que um ID foi removido
    expect(updatedFoundOrder.total).toBe(75); // Verifica que o preço foi atualizado
  });

  it("should delete a product", async () => {
    const orders = await Order.find();

    const firstProduct = orders[0];

    expect(firstProduct).not.toBeNull();

    // Recupera o produto do banco de dados para confirmar a atualização
    await Order.findByIdAndDelete(firstProduct.id);
    const foundProduct = await Order.findById(firstProduct.id);

    // Verifica se o preço foi atualizado corretamente
    expect(foundProduct).toBeNull();
  });
});
