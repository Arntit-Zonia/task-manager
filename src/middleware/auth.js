const jwt = require("jsonwebtoken");

const User = require("../models/users");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifiedToken = jwt.verify(token, "testsecret");
    const user = await User.findOne({ _id: verifiedToken._id, "tokens.token": token });

    if (!user) throw new Error("User not found");

    // Adds user and token to request object so they can be accessed in the route handler
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
