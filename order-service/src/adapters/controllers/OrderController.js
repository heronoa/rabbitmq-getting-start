// controllers/orderController.js
const OrderService = require("../../domain/services/OrderServices"); // Camada de serviço para lógica de pedidos

exports.createOrder = async (req, res) => {
  try {
    const { products, total } = req.body;
    // console.log({ products, total });
    const newOrder = await OrderService.createOrder(products, total);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      error: "Failed to create order",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await OrderService.getOrders();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      error: "Failed to fetch order",
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { productId, quantity } = req.body;

    const updatedOrder = await OrderService.updateOrder(
      orderId,
      productId,
      quantity
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      error: "Failed to update order",
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await OrderService.deleteOrder(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      error: "Failed to delete order",
    });
  }
};
