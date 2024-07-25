const user = require('./userModel');
const blogCategoryModel = require('./blogCategoryModel');
const blog = require('./blogModel');
const brand = require('./brandModel');
const cart = require('./cartModel');
const color = require('./colorModel');
const coupon = require('./couponModel');
const enquiry = require('./enquiryModel');
const order = require('./orderModel');
const productCategory = require('./productCategoryModel');
const product = require('./productModel');

module.exports = {
  user,
  blogCategoryModel,
  blog,
  brand,
  cart,
  color,
  enquiry,
  coupon,
  product,
  productCategory,
  order
};
