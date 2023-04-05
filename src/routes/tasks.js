const express = require("express");

const router = new express.Router();
const errorHandler = require("../middleware/errorHandler");

const Task = require("../models/tasks");

/**
 * @todo fix prettier formatting
 */
router.get(
  "/tasks/:id",
  errorHandler(async (req, res) => {
    const getTask = await Task.findById(req.params.id);

    if (!getTask) return res.status(404).send("Task not found");

    return res.status(200).send(getTask);
  })
);

router.get(
  "/tasks",
  errorHandler(async (_req, res) => {
    const getTasks = await Task.find({});

    return res.status(200).send(getTasks);
  })
);

router.patch(
  "/tasks/:id",
  errorHandler(async (req, res) => {
    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) return res.status(404).send("Task not found");
    if (!isValidUpdate) return res.status(400).send("Invalid update");

    res.status(200).send(task);
  })
);

router.post(
  "/tasks",
  errorHandler(async (req, res) => {
    const task = new Task(req.body);

    await task.save();

    res.status(201).send(task);
  })
);

router.delete(
  "/tasks/:id",
  errorHandler(async (req, res) => {
    const getTask = await Task.findByIdAndDelete(req.params.id);

    if (!getTask) return res.status(404).send("Task not found");

    return res.status(200).send(getTask);
  })
);

module.exports = router;
