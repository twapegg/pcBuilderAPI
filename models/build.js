const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Part",
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
