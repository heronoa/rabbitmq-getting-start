// use-cases/GetOrder.js
const Order = require("../entities/Order");

class GetOrder {
  static async all() {
    const orders = await Order.find();

    if (!orders) {
      throw new Error("Orders not found");
    }

    return orders;
  }
  static async query(query) {
    const orders = await Order.find(query);

    if (!orders) {
      throw new Error("Orders not found");
    }

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

module.exports = GetOrder;
