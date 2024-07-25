/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 2000;
const authRoute = require('./routes/authRoute');
const blogRoute = require('./routes/blogRoute');
const productRoute = require('./routes/productRoute');
const categoryRoute = require('./routes/productCategoryRoute');
const blogCategoryRoute = require('./routes/blogCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const colorRoute = require('./routes/colorRoute');
const couponRoute = require('./routes/couponRoute');
const enquiryRoute = require('./routes/enquiryRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

dbConnect();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/user', authRoute);
app.use('/product', productRoute);
app.use('/blog', blogRoute);
app.use('/category', categoryRoute);
app.use('/blog-category', blogCategoryRoute);
app.use('/brand', brandRoute);
app.use('/coupon', couponRoute);
app.use('/color', colorRoute);
app.use('/enquiry', enquiryRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🧙🏽‍♂️ listening at port ${PORT}`);
});
