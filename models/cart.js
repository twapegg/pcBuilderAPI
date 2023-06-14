const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  parts: [
    {
      partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Part",
      },
      name: {
        type: String,
      },
      type: {
        type: String,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  status: {
    type: String,
    default: "active",
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
