const router = require("express").Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Get all users
router.get("/", userController.getAllUsers);

// Register user
router.post("/register", userController.registerUser);

// Login user
router.post("/login", userController.loginUser);

// Set user as admin
router.patch("/admin/:id", auth.verifyToken, userController.setAdmin);

// Check user details
router.get("/me", auth.verifyToken, userController.checkUserDetails);

// Retrieve authenticated user's current cart
router.get("/me/cart", auth.verifyToken, userController.getUserCart);

// Retrieve authenticated user's builds
router.get("/me/builds", auth.verifyToken, userController.getUserBuilds);

// Update user password
router.patch("/me/password", auth.verifyToken, userController.updateUserPassword);

// Delete user (admin only)
router.delete("/:id", auth.verifyToken, userController.deleteUser);

module.exports = router;
