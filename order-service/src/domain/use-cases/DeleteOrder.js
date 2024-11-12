// use-cases/GetOrder.js
const Order = require("../entities/Order");

class DeleteOrder {
  static async execute(id) {
    if (!id) {
      throw new Error("Must provide an id");
    }

    const orders = await Order.findByIdAndDelete(id);

    return orders;
  }
}

module.exports = DeleteOrder;
