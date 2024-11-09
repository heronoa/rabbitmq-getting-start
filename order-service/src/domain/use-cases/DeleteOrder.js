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

  static async byId(orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }
}

module.exports = DeleteOrder;
