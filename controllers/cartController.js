const Cart = require("../models/cart");
const Part = require("../models/part");
const Build = require("../models/build");
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
    const user = auth.decode(req.headers.authorization);

    // Check if user is authorized
    if (user.id !== req.body.userId) {
      return res.status(401).send("Unauthorized");
    }

    // Check if user already has an active cart
    const existingCart = await Cart.findOne({
      userId: req.body.userId,
      status: "active",
    });

    if (existingCart) {
      return res.status(400).send("User already has an active cart");
    } else {
      const cart = new Cart({
        userId: req.body.userId,
        parts: req.body.parts,
      });
      const newCart = await cart.save();
      res.status(201).send(newCart);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a part to a cart
module.exports.addPartToCart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (user.id !== req.params.userId) {
      return res.status(401).send("Unauthorized");
    }

    // Find the cart
    const cart = await Cart.findOne({
      userId: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    const { parts } = req.body;

    const partIds = parts.map((part) => part.partId);

    // Find all parts from the database
    const partList = await Part.find({ _id: { $in: partIds } });

    // Loop through all parts from the request body
    for (let i = 0; i < parts.length; i++) {
      const partId = parts[i].partId;
      const partQuantity = parts[i].quantity;

      // Check if the part already exists in the cart
      const existingPart = cart.parts.find(
        (part) => part.partId.toString() === partId
      );

      if (existingPart) {
        // Increase the quantity of the existing part
        existingPart.quantity += partQuantity;
      } else {
        // Find the part in the database
        const part = partList.find((part) => part._id.toString() === partId);

        if (!part) {
          // Check if part is not found
          return res.status(404).send(`${partId} not found`);
        }

        if (part.stock < partQuantity) {
          // Check if part is out of stock
          return res.status(400).send(`${part.name} is out of stock`);
        }

        // Reduce the stock of the part
        part.stock -= partQuantity;

        // Add the new part to the cart
        cart.parts.push({
          partId: part._id,
          name: part.name,
          type: part.type,
          quantity: partQuantity,
          price: part.price,
        });
      }
    }

    // Calculate total amount
    const totalSum = cart.parts.reduce((sum, part) => {
      return sum + part.price * part.quantity;
    }, 0);

    cart.totalAmount = totalSum;
    const updatedCart = await cart.save();
    res.status(200).send(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove part from cart
module.exports.removePartFromCart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (user.id !== req.params.userId) {
      return res.status(401).send("Unauthorized");
    }

    // Find the cart
    const cart = await Cart.findOne({
      userId: req.params.userId,
      status: "active",
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    // Retrieve all parts from the request body
    const partIds = req.body.parts.map((part) => part.partId);

    // Remove the parts from the cart
    for (let i = 0; i < partIds.length; i++) {
      if (cart.parts[i].partId.toString() === partIds[i]) {
        cart.parts.splice(i, 1);
      }
    }

    // Update the total amount
    const totalSum = cart.parts.reduce((sum, part) => {
      return sum + part.price * part.quantity;
    }, 0);

    cart.totalAmount = totalSum;

    // Save the updated cart
    const updatedCart = await cart.save();

    res.status(200).send(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Checkout a cart
module.exports.checkoutCart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (user.id !== req.params.userId) {
      return res.status(401).send("Unauthorized");
    }

    // Find the cart
    const cart = await Cart.findOne({
      userId: req.params.userId,
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
    const updatedCart = await cart.save();

    // Create new build
    const build = new Build({
      userId: req.params.userId,
      parts: cart.parts,
      totalAmount: cart.totalAmount,
    });

    // Save the build
    await build.save();

    res.status(200).send(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    });

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    res.status(200).send("Cart deleted");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
