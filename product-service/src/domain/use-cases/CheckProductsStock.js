const dotenv = require("dotenv");
const Product = require("../entities/Product");

dotenv.config();

class CheckProductsStock {
  static async execute(products) {
    try {
      const productsStock = await Product.find({
        _id: { $in: products.map((p) => p._id) },
        quantity: { $gt: 0 },
      });

      return productsStock.length === products.length;
    } catch (error) {
      console.error("Error checking stock:", error);
      return false;
    }
  }
}

module.exports = CheckProductsStock;
