const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");


const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);

        req.user = user;
        next();
      }
    } catch (error) {
      res.status(401).json({
        status: "error",
        message: "Invalid Authorization token, please login again.",
      });
    }
  } else {
    res.status(401).json({
      status: "error",
      message: "Empty authorization header, please login again.",
    });
  }
});

const admin = asyncHandler(async (req, res, next) => {

  const { email } = req.user;
  const adm = await User.findOne({ email });

  if (adm.role !== "admin") {
    res.status(403).json({
      status: "error",
      message: "Insufficient permissions",
    });
  } else {
    next();
  }
});

module.exports = { authMiddleware, admin };
