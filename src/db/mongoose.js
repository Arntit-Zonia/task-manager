const initMongoose = () => {
  const mongoose = require("mongoose");

  mongoose.connect(process.env.MONGODB_URL);
};

module.exports = initMongoose;
