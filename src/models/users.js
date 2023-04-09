const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Schema, model } = require("mongoose");

const Task = require("./tasks");

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  occupation: {
    type: String,
    validate(value) {
      if (value === "Receptionist") throw new Error("We don't do that anymore!");
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Please insert a valid Email address!");
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) throw new Error('Password cannot contain "password"');
    },
  },
  tokens: [
    {
      token: { type: String, required: true },
    },
  ],
});

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user._id.toString() }, "testsecret");

  user.tokens.push({ token });

  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Email not found");

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) throw new Error("Password does not match");

  return user;
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const hashedPassword = await bcrypt.hash(user.password, 8);

    user.password = hashedPassword;
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });

  next();
});

const User = model("User", userSchema);

module.exports = User;
