const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("../models/Product");

beforeAll(async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Jest connected to mongodb");
    })
    .catch((error) => {
      console.log(`Jest couldn't connect to mongodb  ${error}`);
    });
});

afterAll(async () => {
  await Product.deleteMany();
  await mongoose.connection.close();
});

describe("MongoDB Integration Test - Product Model", () => {
  it("should add a product and return it back with a id", async () => {
    const newProduct = await Product({
      name: "Test Product 1",
      price: 1,
      description: "This Product is for testing purpose",
    });

    await newProduct.save();

    const products = await Product.find();

    expect(products[0].id).toBeDefined();
  });
  it("should fetch a list of product with name, id, description and price", async () => {
    const products = await Product.find();

    expect(Array.isArray(products)).toBe(true);

    const product = products[0];
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("description");
  });

  it("should update the price of a product", async () => {
    const products = await Product.find();

    const firstProduct = products[0];

    firstProduct.price = 75;

    const updatedProduct = await firstProduct.save();

    // Recupera o produto do banco de dados para confirmar a atualização
    const foundProduct = await Product.findById(updatedProduct._id);

    // Verifica se o preço foi atualizado corretamente
    expect(foundProduct.price).toBe(75);
  });

  it("should delete a product", async () => {
    const products = await Product.find();

    const firstProduct = products[0];

    expect(firstProduct).not.toBeNull();

    // Recupera o produto do banco de dados para confirmar a atualização
    await Product.findByIdAndDelete(firstProduct.id);
    const foundProduct = await Product.findById(firstProduct.id);

    // Verifica se o preço foi atualizado corretamente
    expect(foundProduct).toBeNull();
  });
});

// describe("get all products", () => {
//   it("should return all products", async () => {
//     const products = await Products.find();
//   });
// });
