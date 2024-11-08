const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
