const Cart = require("../models/cart");
const Part = require("../models/part");
const auth = require("../middleware/auth");

// Get all carts
module.exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).send(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a cart
module.exports.createCart = async (req, res) => {
  try {
    const cart = new Cart({
      userId: req.body.userId,
      parts: req.body.parts,
    });
    const newCart = await cart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a part to a cart
module.exports.addPartToCart = async (req, res) => {
  try {
    const { parts } = req.body;

    const partIds = parts.map((part) => part.partId);

    // Find all parts from the database
    const partList = await Part.find({ _id: { $in: partIds } });

    // Initialize parts property for build
    const buildParts = [];

    // Loop through all parts from the database
    for (let i = 0; i < partList.length; i++) {
      const partId = parts[i].partId;
      const partQuantity = parts[i].quantity;
      const part = partList.find((part) => part._id.toString() === partId);

      if (!part) {
        // Check if part is not found
        return res.status(404).send(`Part with ID ${partId} not found`);
      }

      buildParts.push({
        partId: part._id,
        name: part.name,
        type: part.type,
        quantity: partQuantity,
        price: part.price,
      });
    }

    // Calculate total amount
    const totalSum = buildParts.reduce((sum, part) => {
      return sum + part.price * part.quantity;
    }, 0);

    // Find the cart
    const cart = await Cart.findOne({
      userId: req.params.userId,
      status: "active",
    });

    //? If cart is not found, create a new cart
    cart.totalAmount = totalSum;
    cart.parts.push(...buildParts);
    const updatedCart = await cart.save();
    res.status(200).send(updatedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a cart
module.exports.deleteCart = async (req, res) => {
  try {
    const user = await auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(403).send("Unauthorized. Must be an admin");
    }

    const cart = await Cart.findOneAndDelete({
      userId: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    res.status(200).send("Cart deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
