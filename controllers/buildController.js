const Build = require("../models/build");
const Part = require("../models/part");
const auth = require("../middleware/auth");

// Get all Builds
module.exports.getAllBuilds = async (req, res) => {
  try {
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
  const { userId, parts } = req.body;

  // List all part ids from the request
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

    const totalSum = buildParts.reduce((sum, part) => {
      return sum + part.price * part.quantity;
    }, 0);

    const build = new Build({
      userId,
      parts: buildParts,
      totalAmount: totalSum,
    });

    await build.save();
    return res.send(build);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

