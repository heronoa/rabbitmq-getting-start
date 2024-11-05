const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("../models/Product");

dotenv.config({ path: "../.env.tests" });

beforeEach(async () => {
  await mongoose
    .connect(
      "mongodb://root:example@0.0.0.0:27017/scan-product-service-test?retryWrites=true&writeConcern=majority&authSource=admin"
    )
    .then(() => {
      console.log("Jest connected to mongodb");
    })
    .catch((error) => {
      console.log(`Jest couldn't connect to mongodb  ${error}`);
    });
});

afterEach(async () => {
  await Product.deleteMany();
  await mongoose.connection.close();
});

describe("add a new product", () => {
  it("should add a product and return it back with a id", async () => {

    const newProduct = await Product({
      name: "Test Product 1",
      price: 1,
      description: "This Product is for testing purpose",
    });

    await newProduct.save();

    const products = await Product.find();

    console.log({ products });

    expect(products[0].id).toBeDefined();
  });
});

// describe("get all products", () => {
//   it("should return all products", async () => {
//     const products = await Products.find();
//   });
// });
