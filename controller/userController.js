const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailController');
const crypto = require('crypto');

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    //create a new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    //existing user
    throw new Error(`User ${req.body.firstname}  ${req.body.lastname} already exists`);
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?.id);

    const updateUser = await User.findByIdAndUpdate(
      findUser?.id,
      {
        refreshToken: refreshToken
      },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 168 * 60 * 60 * 1000
    });
    res.json({
      id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id)
    });
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
    const users = await User.find();
    res.json(users);
  } catch (error) {
    throw new Error(error);
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

module.exports = {
  login,
  logout,
  getUser,
  getUsers,
  blockUser,
  deleteUser,
  updateUser,
  createUser,
  unblockUser,
  resetPassword,
  updatePassword,
  forgotPassword,
  handleRefreshToken
};
