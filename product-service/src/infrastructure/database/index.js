// database.js
const mongoose = require("mongoose");

class Database {
  constructor() {
    this.dbUri =
      process.env.MONGODB_URL || "mongodb://localhost:27017/order_service";
    this.connection = null;
  }

  async connect() {
    if (this.connection) {
      console.log("Already connected to MongoDB");
      return;
    }

    try {
      this.connection = await mongoose.connect(this.dbUri);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.connection) {
      console.log("No MongoDB connection to close");
      return;
    }

    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
      this.connection = null;
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }
}

// Exporta uma instância única de Database (Singleton)
module.exports = new Database();
