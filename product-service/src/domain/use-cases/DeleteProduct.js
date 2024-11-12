// use-cases/GetProduct.js
const Product = require("../entities/Product");

class DeleteProduct {
  static async execute(id) {
    if (!id) {
      throw new Error("Must provide an id");
    }

    const products = await Product.findByIdAndDelete(id);

    return products;
  }
}

module.exports = DeleteProduct;
