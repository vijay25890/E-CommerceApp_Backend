const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const checkAuth = require("../middleware/check_auth");

/*
Route           /
Description     get all orders
Access          PRIVATE
Parameters      NONE
Method          GET
*/
router.get("/", checkAuth, async (req, res, next) => {
  try {
    const getAllOrders = await Order.find().select("product quantity _id");
    return res.status(200).json(getAllOrders);
  } catch (error) {
    res.status(500).json(error);
  }
});

/*
Route           /
Description     add orders
Access          PRIVATE
Parameters      NONE
Method          POST 
*/
router.post("/", checkAuth, async (req, res, next) => {
  try {
    const addNewOrder = await Product.findById(req.body.productId);
    if (!addNewOrder) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const order = await new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId,
    });
    await Order.create(order);
    res.status(500).json("Order Created");
  } catch (error) {
    res.status(500).json(error);
  }
});

/*
Route           /
Description     get specific order
Access          PRIVATE
Parameters      :orderId
Method          GET
*/
router.get("/:orderId", checkAuth, async (req, res, next) => {
  try {
    const getSpecificOrder = await Order.findById(req.params.orderId);
    if (!getSpecificOrder) {
      return res.status(500).json({
        message: `No order found at ${req.params.orderId}`,
      });
    }
    return res.status(200).json(getSpecificOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

/*
Route           /
Description     delete order
Access          PRIVATE
Parameters      :orderId
Method          DELETE
*/
router.delete("/:orderId", checkAuth, (req, res, next) => {
  try {
    const deleteOrder = Order.findOneAndDelete({ _id: req.params.orderId });
    res.status(200).json({
      message: "Order deleted",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
