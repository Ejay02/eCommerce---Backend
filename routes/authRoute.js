const express = require("express");
const router = express.Router();
const {
  createUser,
  login,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controller/userController");

const { authMiddleware, admin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/forgot-password", forgotPassword);
router.put("/password-reset/:token", resetPassword);


router.put("/change-password", authMiddleware, updatePassword);


router.post("/login", login);
router.get("/get-users", getUsers);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);

router.get("/:id", authMiddleware, admin, getUser);
router.delete("/:id", deleteUser);
router.put("/edit", authMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, admin, blockUser);
router.put("/unblock-user/:id", authMiddleware, admin, unblockUser);

module.exports = router;
