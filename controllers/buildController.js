const Build = require("../models/build");
const Cart = require("../models/cart");
const Part = require("../models/part");
const auth = require("../middleware/auth");

// Get all Builds (admin only)
module.exports.getAllBuilds = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized");
    }

    await Build.find().then((result) => {
      res.status(200).send(result);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

// Create build
module.exports.createBuild = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = auth.decode(req.headers.authorization);

    if (user.id !== userId) {
      return res.status(401).send("Unauthorized");
    }

    // Find the cart
    const cart = await Cart.findOne({
      userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    // Check if cart is empty
    if (cart.parts.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    // Update the stock of the parts
    for (let i = 0; i < cart.parts.length; i++) {
      const part = await Part.findById(cart.parts[i].partId);
      part.stock -= cart.parts[i].quantity;
      await part.save();
    }

    // Update the cart status
    cart.status = "completed";
    await cart.save();

    // Create new build
    const build = new Build({
      userId,
      parts: cart.parts,
      totalAmount: cart.totalAmount,
    });

    // Save the build
    return await build.save().then((result) => {
      res.status(200).send(result);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete build
module.exports.deleteBuild = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(403).send("Unauthorized. Must be an admin");
    }

    const { id } = req.params;

    return await Build.findByIdAndDelete(id).then((result) => {
      res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
