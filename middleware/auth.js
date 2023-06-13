const jwt = require("jsonwebtoken");

// Create token
module.exports.createToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };

  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
};

// Verify token
module.exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.slice(7);
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if (err) return res.status(401).send("Access Denied");
    next();
  });
};

// Decode token
module.exports.decode = (token) => {
  if (token) {
    try {
      const decodedToken = jwt.decode(token.slice(7), { complete: true });
      return decodedToken.payload.user;
    } catch (err) {
      return { auth: "failed" };
    }
  }
  return { auth: "failed" };
};
