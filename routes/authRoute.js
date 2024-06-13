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
  resetPassword,
  adminLogin,
  getWishlist,
  address,
  userCart,
  getUserCart,
  emptyCart
} = require('../controller/userController');

const { authMiddleware, admin } = require('../middlewares/authMiddleware');

router.post('/register', createUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.put('/change-password', authMiddleware, updatePassword);

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/cart', authMiddleware, userCart);

router.get('/get-users', getUsers);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);

router.get('/wishlists', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);

router.get('/:id', authMiddleware, admin, getUser);

router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete('/:id', deleteUser);
router.put('/edit', authMiddleware, updateUser);
router.put('/address', authMiddleware, address);

router.put('/block-user/:id', authMiddleware, admin, blockUser);
router.put('/unblock-user/:id', authMiddleware, admin, unblockUser);

module.exports = router;
