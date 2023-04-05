const express = require("express");

const router = new express.Router();
const errorHandler = require("../middleware/errorHandler");

const User = require("../models/users");

/**
 * @todo fix prettier formatting
 */
router.get(
  "/users/:id",
  errorHandler(async (req, res) => {
    const getUser = await User.findById(req.params.id);

    if (!getUser) return res.status(404).send("User not found");

    return res.status(200).send(getUser);
  })
);

router.get(
  "/users",
  errorHandler(async (_req, res) => {
    const getUsers = await User.find({});

    return res.status(200).send(getUsers);
  })
);

router.patch(
  "/users/:id",
  errorHandler(async (req, res) => {
    const allowedUpdates = ["name", "email", "password", "age"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).send("User not found");
    if (!isValidUpdate) return res.status(400).send("Invalid update");

    res.status(200).send(user);
  })
);

router.post(
  "/users",
  errorHandler(async (req, res) => {
    const user = new User(req.body);

    await user.save();

    res.status(201).send(user);
  })
);

router.delete(
  "/users/:id",
  errorHandler(async (req, res) => {
    const getUser = await User.findByIdAndDelete(req.params.id);

    if (!getUser) return res.status(404).send("User not found");

    return res.status(200).send(getUser);
  })
);

module.exports = router;
