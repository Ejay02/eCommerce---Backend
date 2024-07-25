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

const allowedOrigins = ['http://localhost:5173', 'https://ecommerce-backend-e8uw.onrender.com'];

const corsOptions = {
  origin: (origin, callback) => {
    console.log('Origin:', origin); // Add this line to see the origin being passed
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS:', origin); // Add this line to see which origins are blocked
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
  credentials: true // Allow credentials (e.g., cookies)
};

app.use(morgan('dev'));
// app.use(cors());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight requests handling

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
