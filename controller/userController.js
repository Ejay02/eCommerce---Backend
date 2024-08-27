const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailController');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const generateUserResponse = async (user) => {
  const token = generateToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  return {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    mobile: user.mobile,
    token,
    refreshToken
  };
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 168 * 60 * 60 * 1000
  });
};

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    //create a new user
    const newUser = await User.create(req.body);
    const userData = await generateUserResponse(newUser);
    setRefreshTokenCookie(res, userData.refreshToken);
    res.json(userData);
    res.json(newUser);
  } else {
    //existing user
    throw new Error(`User ${req.body.firstname}  ${req.body.lastname} already exists`);
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, mobile } = req.body;

  const findUser = await User.findOne({ email });

  if (!findUser) {
    const newUser = await User.create({
      email,
      password,
      firstname,
      lastname,
      mobile,
      role: 'admin'
    });
    const userData = await generateUserResponse(newUser);
    setRefreshTokenCookie(res, userData.refreshToken);
    res.json(userData);
  } else {
    throw new Error(`User ${firstname} ${lastname} already exists`);
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and password is correct
  const findUser = await User.findOne({ email });
  if (!findUser || !(await findUser.isPasswordMatched(password))) {
    res.status(401); // Unauthorized
    res.json({ message: 'Invalid credentials' });
    return;
  }

  // Generate user response and set refresh token cookie
  const userData = await generateUserResponse(findUser);
  setRefreshTokenCookie(res, userData.refreshToken);
  res.json(userData);
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and is an admin
  const findAdmin = await User.findOne({ email });
  if (!findAdmin || findAdmin.role !== 'admin') {
    throw new Error('Not Authorized');
  }

  // Check password and generate response
  if (await findAdmin.isPasswordMatched(password)) {
    const userData = await generateUserResponse(findAdmin);
    setRefreshTokenCookie(res, userData.refreshToken);
    res.json(userData);
  } else {
    throw new Error('Invalid Credentials');
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token provided in cookies');

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error('No refresh token present for user');

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user?.id !== decoded.id) {
      throw new Error('Refresh token error');
    }

    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token provided in cookies');

  const refreshToken = cookie.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    });
    return res.sendStatus(204); // No Content
  }

  await User.findOneAndUpdate(
    { refreshToken: refreshToken }, // Use an object with the refreshToken property
    { refreshToken: '' } // Update the refreshToken field to an empty string
  );
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  });
  res.sendStatus(204);
});

const getUsers = asyncHandler(async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Query for users with sorting and pagination
    const usersQuery = User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    // Get the total count of users
    const numUsers = await User.countDocuments();

    // Check if page is out of range
    if (skip >= numUsers && page !== 1) {
      return res.status(404).json({ message: 'This page does not exist' });
    }

    const allUsers = await usersQuery;
    res.json({ users: allUsers, total: numUsers, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users: ' + error.message });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findById(id);
    res.json({ user });
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body.firstname,
        lastname: req?.body.lastname,
        email: req?.body.email,
        mobile: req?.body.mobile
        // role: req?.body.role,
      },
      {
        new: true
      }
    );
    res.json(user);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    res.json({ user });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        blocked: true
      },
      {
        new: true
      }
    );
    res.json(block);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        blocked: false
      },
      {
        new: true
      }
    );
    res.json(unblock);
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;

  validateMongoDbId(_id);

  const user = await User.findById(_id);

  if (password) {
    user.password = password;

    const updatedPassword = await user.save();

    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new Error("User with this email doesn't exist");

  try {
    const token = await user.createPasswordResetToken();

    await user.save();

    const resetURL = `Hi ${req.body.firstname},  <br><br>
    We have received a password reset for your Account. <br><br>
    If you initiated this request, please follow the instructions below to reset your password: <br><br>
    To reset your password, click this <a href='http://localhost:4000/user/reset-password/${token}'>link</a>
    <br><br>

    If you did not initiate this, please disregard this email and your password will remain unchanged.
    <br><br>

    <h6>This link will expire in 10minutes.</h6>
  
    Thank you,
    <br>
    ✨
    `;

    const data = {
      to: email,
      text: 'Hi there!',
      subject: 'Password Reset',
      html: resetURL
    };
    sendEmail(data);

    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) throw new Error('Expired token, please try again later');

  user.password = password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongoDbId(_id);

  try {
    const findUser = await User.findById(_id).populate('wishlist');
    res.json(findUser);
  } catch (error) {
    throw new Error(`Error getting wishlist: ${error.message}`);
  }
});

const address = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  validateMongoDbId(_id);
  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body.address
      },
      {
        new: true
      }
    );
    res.json(user);
  } catch (error) {
    throw new Error(`Error saving address: ${error.message}`);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    let products = [];
    const user = await User.findById(_id);

    // check if user already have products in cart
    const x = await Cart.findOne({ orderBy: user._id });
    if (x) {
      products.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};

      object.product = cart[i]._id;

      object.count = cart[i].count;

      object.color = cart[i].color;

      let getPrice = await Product.findById(cart[i]._id).select('price').exec();

      object.price = getPrice.price;

      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(`Error creating user cart: ${error.message}`);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate(
      'products.product'
      // '_id title price totalAfterDiscount'
    );

    res.json(cart);
  } catch (error) {
    throw new Error(`Error fetching user cart: ${error.message}`);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findOne({ _id });
    const userCart = await Cart.findOneAndDelete({ orderBy: user?._id });

    res.json(userCart);
  } catch (error) {
    throw new Error(`Error emptying cart: ${error.message}`);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { coupon } = req.body;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });

    if (validCoupon === null) {
      throw new Error(`Coupon ${coupon} not found`);
    }

    const user = await User.findOne({
      _id
    });

    const cart = await Cart.findOne({ orderBy: user?._id }).populate('products.product');

    if (cart === null) {
      throw new Error('Cart is empty');
    }

    let discountedTotal = 0;

    if (cart.cartTotal !== null) {
      discountedTotal = (cart.cartTotal - (cart.cartTotal * validCoupon.discount) / 100).toFixed(2);
    }

    await Cart.findOneAndUpdate({ orderBy: user?._id }, { discountedTotal }, { new: true });

    res.json(discountedTotal);
  } catch (error) {
    throw new Error(`Error applying coupon : ${error.message}`);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  const { COD, appliedCoupon } = req.body;
  if (!COD) throw new Error('COD order failed');

  try {
    const user = await User.findById(_id);

    let userCart = await Cart.findOne({ orderBy: user?._id });

    let finalAmount = 0;

    if (appliedCoupon && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    let _newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uuidv4(),
        method: 'COD',
        amount: finalAmount,
        status: 'Cash on Delivery',
        created: Date.now(),
        currency: 'USD'
      },
      orderBy: user?._id,
      orderStatus: 'Cash on Delivery'
    }).save();

    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } }
        }
      };
    });

    const _updated = await Product.bulkWrite(update, {});

    res.json({ message: 'success' });
  } catch (error) {
    throw new Error(`Error creating order ` + error.message);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const userOrders = await Order.findOne({ orderBy: _id })
      .populate('products.product')
      .populate('orderBy')
      .exec();

    res.json(userOrders);
  } catch (error) {
    throw new Error(`Error getting orders : ` + error.message);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status
        }
      },
      { new: true }
    );

    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
});

module.exports = {
  login,
  logout,
  getUser,
  address,
  getUsers,
  userCart,
  blockUser,
  emptyCart,
  getOrders,
  updateUser,
  createUser,
  deleteUser,
  adminLogin,
  createOrder,
  getWishlist,
  unblockUser,
  applyCoupon,
  getUserCart,
  createAdmin,
  resetPassword,
  updatePassword,
  forgotPassword,
  updateOrderStatus,
  handleRefreshToken
};
