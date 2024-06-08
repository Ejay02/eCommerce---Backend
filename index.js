const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 2000;
const authRouter = require("./routes/authRoute");
const blogRouter = require("./routes/blogRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/productCategoryRoute");
const bodyParser = require("body-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/product", productRouter);
app.use("/blog", blogRouter);
app.use("/category", categoryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🧙🏽‍♂️ listening at port ${PORT}`);
});
