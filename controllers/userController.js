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
      await User.findOne({ email: req.body.email }).then((result) => {
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

// Set user as admin
module.exports.setAdmin = async (req, res) => {
  try {
    const admin = await auth.decode(req.headers.authorization);
    const user = await User.findById(req.params.id);

    if (!admin.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    if (user.isAdmin) {
      return res.status(400).send("User is already an admin");
    }

    return user.updateOne({ isAdmin: true }).then((result) => {
      res.send("User set to admin");
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Check user details
module.exports.checkUserDetails = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    return User.findById(user.id)
      .select("-password")
      .then((result) => {
        res.send(result);
      });
  } catch (err) {
    return res.send(err);
  }
};

// Retrieve authenticated user's builds
module.exports.getUserBuilds = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    const builds = await Build.find({ user: user.id });

    return res.send(builds);
  } catch (err) {
    return res.send(err);
  }
};
