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

// Retrieve authenticated user's builds
router.get("/me/builds", auth.verifyToken, userController.getUserBuilds);

module.exports = router;
