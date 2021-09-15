const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check_auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/*
Route           /
Description     get all products
Access          PUBLIC
Parameters      NONE
Method          GET
*/
router.get("/", async (req, res, next) => {
  try {
    const getAllProducts = await Product.find();
    return res.status(200).json(getAllProducts);
  } catch (error) {
    return res.json(error);
  }
});

/*
Route           /
Description     add products
Access          PRIVATE
Parameters      NONE
Method          POST
*/
router.post(
  "/",
  checkAuth,
  upload.single("productImage"),
  async (req, res, next) => {
    try {
      const addNewProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.body.productImage,
      });
      await Product.create(addNewProduct);
      return res.status(200).json({
        message: "Created product suceesfully",
      });
    } catch (error) {
      return res.status(501).json(error);
    }
  }
);

/*
Route           /
Description     get specific product
Access          PUBLIC
Parameters      :productId
Method          GET
*/
router.get("/:productId", async (req, res, next) => {
  try {
    const specificProduct = await Product.findOne({
      _id: req.params.productId,
    }).select("name price productImage");
    if (!specificProduct) {
      return res.status(500).json({
        message: `No product found of id ${req.params.productId}`,
      });
    }
    return res.status(200).json(specificProduct);
  } catch (error) {
    return res.status(500).json(error);
  }
});

/*
Route           /
Description     edit product details
Access          PRIVATE
Parameters      :productId
Method          PATCH
*/
router.patch("/:productId", checkAuth, async (req, res, next) => {
  try {
    const updateProduct = await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
      },
      {
        $set: {
          name: req.body.name,
          price: req.body.price,
          productImage: req.body.productImage,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(updateProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

/*
Route           /
Description     delete product
Access          PRIVATE
Parameters      :productId
Method          DELETE
*/
router.delete("/:productId", checkAuth, async (req, res, next) => {
  try {
    const deleteProduct = await Product.findOneAndDelete({
      _id: req.params.productId,
    });
    res.status(200).json({
      message: "Product was deleted",
      product: deleteProduct,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
