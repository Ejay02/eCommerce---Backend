const mongoose = require("mongoose");

const validateMongoDbId = (id) => {
  const valid = mongoose.Types.ObjectId.isValid(id);
  if (!valid) throw new Error("Invalid MongoDB ID");
};

module.exports = validateMongoDbId;
