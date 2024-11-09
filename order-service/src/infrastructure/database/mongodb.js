const mongoose = require("mongoose");

async function startMongoDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Order-Service Connected to MongoDB");
  } catch (error) {
    console.log(`Mongoose Connect Error: ${error}`);
  }
}

module.exports = startMongoDb;
