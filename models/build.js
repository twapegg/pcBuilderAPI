const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
  userId: {
    type: Object.mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  parts: [
    {
      partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Part",
      },
      quantity: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  purchasedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Build", buildSchema);
