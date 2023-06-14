const Part = require("../models/part");
const auth = require("../middleware/auth");

// Retrieve all parts
module.exports.getAllParts = async (req, res) => {
  try {
    const parts = await Part.find();
    return res.send(parts);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Retrieve all parts active && in stock
module.exports.getAllPartsInStock = async (req, res) => {
  try {
    const parts = await Part.find({ isAvailable: true, stock: { $gt: 0 } });
    return res.send(parts);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Retrieve a part by id
module.exports.getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).send("Part does not exist");
    }
    return res.send(part);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Create a new part (Admin only)
module.exports.createPart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    // Check if part already exists
    if (await Part.findOne({ name: req.body.name })) {
      return res.status(409).send("Part already exists");
    }

    const part = await Part.create({
      name: req.body.name,
      type: req.body.type,
      price: req.body.price,
      stock: req.body.stock,
    });
    return res.send(part);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Update a part (Admin only)
module.exports.updatePart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    const partId = req.params.id;
    const updateField = req.body;

    // Check if part exists
    const existingPart = await Part.findById(partId);

    if (!existingPart) {
      return res.status(404).send("Part not found");
    }

    // Update the specified property
    await Part.updateOne({ _id: partId }, updateField);

    // Fetch the updated part
    const updatedPart = await Part.findById(partId);

    return res.send(updatedPart);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Archive a part (Admin only)
module.exports.archivePart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    const partId = req.params.id;

    // Check if part exists
    const existingPart = await Part.findById(partId);

    if (!existingPart) {
      return res.status(404).send("Part not found");
    }

    // Update the specified property
    await Part.updateOne(
      { _id: partId },
      {
        isAvailable: false,
      }
    );
    // Fetch the updated part
    const updatedPart = await Part.findById(partId);
    return res.send(updatedPart);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Activate a part (Admin only)
module.exports.activatePart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    const partId = req.params.id;

    // Check if part exists
    const existingPart = await Part.findById(partId);

    if (!existingPart) {
      return res.status(404).send("Part not found");
    }

    // Update the specified property
    await Part.updateOne(
      { _id: partId },
      {
        isAvailable: true,
      }
    );

    // Fetch the updated part
    const updatedPart = await Part.findById(partId);
    return res.send(updatedPart);
  } catch (err) {
    return res.status(500).send(err);
  }
};
