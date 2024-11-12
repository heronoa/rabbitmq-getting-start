// use-cases/CreateProduct.js
const Product = require("../entities/Product");

class UpdateProduct {
  static async one(productId, productUpdated) {
    // A lógica de negócios de criar um pedido

    const {
      name = undefined,
      price = undefined,
      description = undefined,
      quantity = undefined,
    } = productUpdated;

    if (!name && !price && !description && !quantity) {
      throw new Error("No change has be send to update");
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than or equal to 0");
    }
    if (name === "") {
      throw new Error("No blank name");
    }
    if (price <= 0) {
      throw new Error("Quantity must be greater than or equal to 0");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productUpdated,
      { new: true }
    );

    return updatedProduct;
  }
}

module.exports = UpdateProduct;
