const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const errorHandler = require("../middleware/routeErrorHandler");
const auth = require("../middleware/auth");

const User = require("../models/users");

const router = new express.Router();
const upload = multer({
  limits: { fileSize: 1000000 }, // 1MB file size limit
  fileFilter(_req, { originalname }, cb) {
    if (!originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error("Please upload an image"));

    cb("", true);
  },
});

/**
 * @todo fix prettier formatting
 */
router.get(
  "/users/me",
  auth,
  errorHandler(async (req, res) => {
    res.status(200).send(req.user);
  })
);

router.get(
  "/users/:id/avatar",
  errorHandler(async ({ params: { id } }, res) => {
    const user = await User.findById(id);

    if (!user || !user.avatar) throw new Error("User not found");

    res.set("Content-Type", "image/png");

    res.send(user.avatar);
  })
);

router.patch(
  "/users/me",
  auth,
  errorHandler(async ({ user, body }, res) => {
    const allowedUpdates = ["name", "email", "password", "age"];
    const updates = Object.keys(body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) return res.status(400).send("Invalid update");

    updates.forEach((update) => (user[update] = body[update]));

    await user.save();

    res.status(200).send(user);
  })
);

// add user
router.post(
  "/users",
  errorHandler(async (req, res) => {
    const user = new User(req.body);
    const token = await user.generateAuthToken();

    await user.save();

    res.status(201).send({ user, token });
  })
);

router.post(
  "/users/login",
  errorHandler(async (req, res) => {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    if (!user) return res.status(404).send("User not found");

    res.status(200).send({ user, token });
  })
);

router.post(
  "/users/logout",
  auth,
  errorHandler(async ({ user, token: currentToken }, res) => {
    user.tokens = user.tokens.filter((token) => token.token !== currentToken);

    await user.save();

    res.status(200).send({ tokens: user.tokens, removedToken: currentToken });
  })
);

router.post(
  "/users/logoutAll",
  auth,
  errorHandler(async ({ user }, res) => {
    const { tokens } = user;

    user.tokens = [];

    await user.save();

    res.status(200).send({ user, removedTokens: tokens });
  })
);

router.post("/users/me/avatar", auth, upload.single("avatar"), async ({ user, file: { buffer } }, res) => {
  const bufferImage = await sharp(buffer).resize({ width: 250, height: 250 }).png().toBuffer();

  user.avatar = bufferImage;

  await user.save();

  res.status(200).send();
});

router.delete(
  "/users/me",
  auth,
  errorHandler(async ({ user }, res) => {
    await user.deleteOne();

    return res.status(200).send(user);
  })
);

router.delete("/users/me/avatar", auth, async ({ user }, res) => {
  // removes avatar field
  user.avatar = undefined;

  await user.save();

  res.status(200).send();
});

module.exports = router;
