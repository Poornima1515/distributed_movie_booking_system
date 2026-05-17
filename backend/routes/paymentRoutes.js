const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, downloadTicket } = require("../controllers/paymentController");

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/ticket/:bookingId", downloadTicket);

module.exports = router;