const validator = require("validator");

const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  occupation: {
    type: String,
    validate(value) {
      if (value === "Receptionist")
        throw new Error("We don't do that anymore!");
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value))
        throw new Error("Please insert a valid Email address!");
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password"))
        throw new Error('Password cannot contain "password"');
    },
  },
});

const User = model("User", userSchema);

module.exports = User;
