// use-cases/CreateOrder.js
const Order = require("../entities/Order");

class UpdateOrder {
  static async one(id, products, total) {
    if (!products && !total) {
      throw new Error("No data to update");
    }

    if (total && total <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (products && products.length <= 0) {
      throw new Error("Must send at least one product");
    }

    if (!id) {
      throw new Error("No id has been provided");
    }

    const updatedOrder = Order.findByIdAndUpdate(
      id,
      {
        products,
        total,
      },
      { new: true }
    );

    console.log({ updatedOrder });

    return updatedOrder;
  }
}

module.exports = UpdateOrder;
