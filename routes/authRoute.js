const express = require('express');
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
  resetPassword
} = require('../controller/userController');

const { authMiddleware, admin } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

router.post('/register', errorHandler, createUser);
router.post('/forgot-password', errorHandler, forgotPassword);
router.put('/reset-password/:token', errorHandler, resetPassword);

router.put('/change-password', errorHandler, authMiddleware, updatePassword);

router.post('/login', errorHandler, login);
router.get('/get-users', errorHandler, getUsers);
router.get('/refresh', errorHandler, handleRefreshToken);
router.get('/logout', errorHandler, logout);

router.get('/:id', authMiddleware, admin, errorHandler, getUser);
router.delete('/:id', errorHandler, deleteUser);
router.put('/edit', authMiddleware, errorHandler, updateUser);
router.put('/block-user/:id', authMiddleware, admin, errorHandler, blockUser);
router.put('/unblock-user/:id', authMiddleware, admin, errorHandler, unblockUser);

module.exports = router;
