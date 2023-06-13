const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: [true, "Please select a part type"],
    enum: [
      "CPU",
      "GPU",
      "RAM",
      "Motherboard",
      "Storage",
      "Power Supply",
      "Case",
    ],
  },
  price: {
    type: Number,
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Part", partSchema);
