const router = require("express").Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Get all users
router.get("/", userController.getAllUsers);

// Register user
router.post("/register", userController.registerUser);

// Login user
router.post("/login", userController.loginUser);

module.exports = router;
