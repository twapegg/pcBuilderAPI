const User = require("../models/user");
const Build = require("../models/build");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

// Get all Users
module.exports.getAllUsers = async (req, res) => {
  try {
    return await User.find().then((result) => {
      res.send(result);
    });
  } catch (err) {
    return res.send(err);
  }
};

// Register a User
module.exports.registerUser = async (req, res) => {
  try {
    if ((await User.find({ email: req.body.email }).countDocuments) > 0) {
      return res.status(400).send("Email already exists");
    }

    return User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin,
    }).then((result) => {
      res.send(result);
    });
  } catch (err) {
    return res.send(err);
  }
};

// Login a User
module.exports.loginUser = async (req, res) => {
  try {
    // Check if user exists
    if (
      User.findOne({ email: req.body.email }).then((result) => {
        if (result) {
          const password = bcrypt.compareSync(
            req.body.password,
            result.password
          );
          return password
            ? res.send({ access: auth.createToken(result) })
            : res.status(401).send("Incorrect password");
        }
        return res.status(404).send("User not found");
      })
    );
  } catch (error) {
    res.send(error);
  }
};

// Purchase a build
module.exports.purchaseBuild = async (req, res) => {
  try {
    const { user } = req;
    const build = await Build.findById(req.body.buildId);

    if (!build) {
      return res.status(404).send("Build not found");
    }

    if (user.builds.includes(build._id)) {
      return res.status(400).send("Build already purchased");
    }

    await user.builds.push({ builds: build._id });
    return res.status(200).send("Purchase successful");
  } catch (err) {
    return res.send(err);
  }
};
