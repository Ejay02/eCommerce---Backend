const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv").config();

const dbConnect = () => {
  try {
    const con = mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecting to Mongo DB ...");
  } catch (error) {
    throw new Error(`Couldn't connect to Mongo DB ${process.env.MONGODB_URI}`);
  }
};

module.exports = dbConnect;
