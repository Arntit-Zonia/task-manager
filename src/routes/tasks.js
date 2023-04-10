const express = require("express");

const router = new express.Router();
const errorHandler = require("../middleware/errorHandler");
const auth = require("../middleware/auth");

const Task = require("../models/tasks");

/**
 * @todo fix prettier formatting
 */
router.get(
  "/tasks/:id",
  auth,
  errorHandler(async (req, res) => {
    const getTask = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!getTask) return res.status(404).send("Task not found");

    return res.status(200).send(getTask);
  })
);

router.get(
  "/tasks",
  auth,
  errorHandler(async ({ user, query: { completed, limit = 5, skip = 0, sortBy = "" } }, res) => {
    const [field, value] = sortBy.split(":");

    await user.populate({
      path: "tasks",
      ...(completed && { match: { completed: completed === "true" } }),
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        // asc = 1, desc = -1
        sort: {
          ...(sortBy && { [field]: value === "desc" ? -1 : 1 }),
        },
      },
    });

    return res.status(200).send(user.tasks);
  })
);

router.patch(
  "/tasks/:id",
  auth,
  errorHandler(async ({ body, params: { id: _id }, user: { id: owner } }, res) => {
    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    const task = await Task.findOne({ _id, owner });

    if (!task) return res.status(404).send("Task not found");
    if (!isValidUpdate) return res.status(400).send("Invalid update");

    updates.forEach((update) => (task[update] = body[update]));

    await task.save();

    res.status(200).send(task);
  })
);

router.post(
  "/tasks",
  auth,
  errorHandler(async ({ body, user: { _id } }, res) => {
    const task = new Task({ ...body, owner: _id });

    await task.save();

    res.status(201).send(task);
  })
);

router.delete(
  "/tasks/:id",
  auth,
  errorHandler(async ({ params: { id: _id }, user: { id: owner } }, res) => {
    const getTask = await Task.findOneAndDelete({ _id, owner });

    if (!getTask) return res.status(404).send("Task not found");

    return res.status(200).send(getTask);
  })
);

module.exports = router;
