const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const User = require("../../src/models/users");

const mockObjectId = new ObjectId();
const mockUser = {
  _id: mockObjectId,
  name: "first-user",
  password: "123456789",
  email: "first@random.com",
  avatar: Buffer.from("random-avatar"),
  tokens: [
    {
      token: jwt.sign({ _id: mockObjectId }, process.env.JWT_SECRET),
    },
  ],
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await new User(mockUser).save();
};

module.exports = {
  mockObjectId,
  mockUser,
  setUpDatabase,
};
