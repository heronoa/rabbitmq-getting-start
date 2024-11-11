// use-cases/CreateOrder.js
const dotenv = require("dotenv");
const Order = require("../entities/Order");
const RabbitMQClient = require("../../infrastructure/messaging/RabbitMQClient");

dotenv.config();

class CreateOrder {
  static async execute(products, total) {
    if (total <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    if (products.length <= 0) {
      throw new Error("Must send at least one product");
    }

    const newOrder = new Order({
      products,
      total,
    });

    const savedOrder = await newOrder.save();

    return savedOrder;
  }
}

module.exports = CreateOrder;
