const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  description: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const Task = model("Task", taskSchema);

module.exports = Task;
