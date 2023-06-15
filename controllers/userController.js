const User = require("../models/user");
const Build = require("../models/build");
const Cart = require("../models/cart");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

// Get all Users
module.exports.getAllUsers = async (req, res) => {
  try {
    return await User.find().then((result) => {
      res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
      res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
            ? res.status(200).send({ access: auth.createToken(result) })
            : res.status(401).send("Incorrect password");
        }
        return res.status(404).send("User not found");
      })
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
      res.status(200).send("User set to admin");
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Check user details
module.exports.checkUserDetails = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    return User.findById(user.id)
      .select("-password")
      .then((result) => {
        if (result) {
          res.status(200).send(result);
        }
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Retrieve user details and builds
// module.exports.checkUserDetails = async (req, res) => {
//   try {
//     const user = auth.decode(req.headers.authorization);

//     const userPromise = User.findById(user.id).select("-password");
//     const buildPromise = Build.find({ userId: user.id });

//     const [displayUser, build] = await Promise.all([userPromise, buildPromise]);

//     return res.status(200).send({ user: displayUser, build });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

// Retrieve authenticated user's current cart
module.exports.getUserCart = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    const cart = await Cart.findOne({ user: user.userId });

    return res.status(200).send(cart);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Retrieve authenticated user's builds
module.exports.getUserBuilds = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    const builds = await Build.find({ user: user.id });

    return res.status(200).send(builds);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update user password
module.exports.updateUserPassword = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    return User.findById(user.id).then((result) => {
      if (result) {
        const password = bcrypt.compareSync(req.body.password, result.password);

        if (password) {
          result.password = bcrypt.hashSync(req.body.newPassword, 10);

          result.save().then(() => {
            res.send("Password updated");
          });
        } else {
          return res.status(401).send("Incorrect password");
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete a user (Admin only)
module.exports.deleteUser = async (req, res) => {
  try {
    const user = auth.decode(req.headers.authorization);

    if (!user.isAdmin) {
      return res.status(401).send("Unauthorized. Must be an admin");
    }

    return User.findByIdAndDelete(req.params.id).then((result) => {
      res.status(200).send("User deleted");
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
