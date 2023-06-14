const router = require("express").Router();
const buildController = require("../controllers/buildController");

// Get all builds
router.get("/", buildController.getAllBuilds);

// Create a build
router.post("/", buildController.createBuild);


module.exports = router;
