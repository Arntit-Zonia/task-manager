const jwt = require("jsonwebtoken");

const User = require("../models/users");

/**
 * Verifies if a user is authenticated before running the route handler
 *
 * @param {Object} req - req obj containing JWT value
 * @param {Object} res - res obj used to send an error if authentication fails
 * @param {Function} next - next middleware function in the stack, called when authentication is successful
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: verifiedToken._id, "tokens.token": token });

    if (!user) throw new Error("User not found");

    // Adds user and token to the request object so they can be accessed in the route handler
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
