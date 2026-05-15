const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const Booking =
  require("../models/Booking");

const Show =
  require("../models/Show");

const redis =
  require("../config/redis");

const { v4: uuidv4 } =
  require("uuid");
// CREATE ORDER
exports.createOrder = async (req, res) => {

    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order =
            await razorpay.orders.create(options);

        res.status(200).json(order);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};




// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {

  try {

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature,

      seats,

      showId,

      userId

    } = req.body;

    // VERIFY SIGNATURE
    const body =

      razorpay_order_id +

      "|" +

      razorpay_payment_id;

    const expectedSignature =

      crypto

        .createHmac(

          "sha256",

          process.env.RAZORPAY_KEY_SECRET

        )

        .update(body.toString())

        .digest("hex");

    const isAuthentic =

      expectedSignature ===

      razorpay_signature;

    if (!isAuthentic) {

      return res.status(400).json({

        success: false,

        message: "Invalid payment"

      });

    }

    // GET SHOW
    const existingShow =
      await Show.findById(showId);

    if (!existingShow) {

      return res.status(404).json({

        message: "Show not found"

      });

    }

    // SAVE BOOKING
    const booking =
      await Booking.create({

        user: userId,

        movie:
          existingShow.movie,

        theatre:
          existingShow.theatre,

        show: showId,

        seats,

        totalAmount:
          seats.length * 200,

        bookingId:
          uuidv4()

      });

    // UPDATE BOOKED SEATS
    // PREVENT DUPLICATE BOOKINGS
const uniqueSeats = [

  ...new Set([

    ...existingShow.bookedSeats,

    ...seats

  ])

];

existingShow.bookedSeats =
  uniqueSeats;

await existingShow.save();

    // REMOVE REDIS LOCKS
    for (const seat of seats) {

      const lockKey =

        `lock:${showId}:${seat}`;

      await redis.del(lockKey);

    }

    res.status(200).json({

      success: true,

      message:
        "Booking Confirmed",

      booking

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};