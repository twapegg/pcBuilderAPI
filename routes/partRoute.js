const router = require("express").Router();
const partController = require("../controllers/partController");
const auth = require("../middleware/auth");

// Get all parts
router.get("/", partController.getAllParts);

// Get all parts in stock
router.get("/inStock", partController.getAllPartsInStock);

// Get a part by id
router.get("/:id", partController.getPartById);

// Create a part (Admin only)
router.post("/", auth.verifyToken, partController.createPart);

// Update a part (Admin only)
router.put("/:id", auth.verifyToken, partController.updatePart);

// Archive a part (Admin only)
router.patch("/:id/archive", auth.verifyToken, partController.archivePart);

// Activate a part (Admin only)
router.patch("/:id/activate", auth.verifyToken, partController.activatePart);

module.exports = router;
