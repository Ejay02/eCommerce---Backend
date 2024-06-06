const express = require("express");
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
const { admin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, 
// admin,
 createProduct);
router.get("/:id", getProduct);
router.get("/", getProducts);
router.put("/:id", authMiddleware, admin, updateProduct);
router.delete("/:id", authMiddleware, admin, deleteProduct);

module.exports = router;
