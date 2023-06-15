const router = require("express").Router();
const buildController = require("../controllers/buildController");

// Get all builds
router.get("/", buildController.getAllBuilds);

// Create a build
router.post("/", buildController.createBuild);

// Delete a build
router.delete("/:id", buildController.deleteBuild);

module.exports = router;
