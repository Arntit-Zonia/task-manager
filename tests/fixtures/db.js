const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const User = require("../../src/models/users");
const Task = require("../../src/models/tasks");

const mockUserId = new ObjectId();
const mockUser = {
  _id: mockUserId,
  name: "first-user",
  password: "123456789",
  email: "first@random.com",
  avatar: Buffer.from("random-avatar"),
  tokens: [
    {
      token: jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET),
    },
  ],
};

const mockTaskOne = {
  _id: new ObjectId(),
  description: "First test task",
  completed: false,
  owner: mockUserId,
};

const mockTaskTwo = {
  _id: new ObjectId(),
  description: "Second test task",
  completed: true,
  owner: mockUserId,
};

const bearerToken = `Bearer ${mockUser.tokens[0].token}`;

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(mockUser).save();

  await new Task(mockTaskOne).save();
  await new Task(mockTaskTwo).save();
};

module.exports = {
  mockUserId,
  mockUser,
  mockTaskOne,
  mockTaskTwo,
  bearerToken,
  setUpDatabase,
};
