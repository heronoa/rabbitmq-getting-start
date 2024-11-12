// use-cases/GetProduct.js
const Product = require("../entities/Product");

class GetProduct {
  static async all() {
    const products = await Product.find();

    if (!products) {
      throw new Error("Products not found");
    }

    return products;
  }
  static async query(query) {
    const products = await Product.find(query);

    if (!products) {
      throw new Error("Products not found");
    }

    return products;
  }

  static async byId(productId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }
}

module.exports = GetProduct;
