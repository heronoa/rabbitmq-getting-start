const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const productsRouter = require("./routes/index");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  // Health Check Route
  res.status(200).json({ msg: "Hello World" });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Product-Service Connected to MongoDB");
  })
  .catch((error) => console.log(`Mongoose Connect Error: ${error}`));

app.listen(process.env.PORT || 3333, () => {
  console.log(`Product-Service listening to port ${process.env.PORT || 3333}`);
});
