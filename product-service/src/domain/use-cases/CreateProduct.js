// use-cases/CreateProduct.js
const dotenv = require("dotenv");
const Product = require("../entities/Product");

dotenv.config();

class CreateProduct {
  static async execute({ name, price = 0, description = "", quantity = 0 }) {
    if (!name) {
      throw new Error("Name is required");
    }

    const newProduct = new Product({
      name,
      price,
      description,
      quantity,
    });

    const savedProduct = await newProduct.save();

    return savedProduct;
  }
}

module.exports = CreateProduct;
