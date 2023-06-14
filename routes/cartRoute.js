const router = require("express").Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth");

// Get all carts
router.get("/", cartController.getAllCarts);

// Create a cart
router.post("/", auth.verifyToken, cartController.createCart);

// Add a part to a cart
router.put("/:userId", auth.verifyToken, cartController.addPartToCart);

// Delete a cart
router.delete("/:userId", auth.verifyToken, cartController.deleteCart);


module.exports = router;
