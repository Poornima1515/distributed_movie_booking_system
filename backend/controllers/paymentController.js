const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const User = require("../models/User");
const Meal = require("../models/Meal");
const PromoCode = require("../models/PromoCode");
const redis = require("../config/redis");
const { v4: uuidv4 } = require("uuid");
const { sendTicketEmail } = require("../utils/emailService");
const { logAction } = require("../utils/auditLogger");

// ─── DYNAMIC PRICE CALCULATOR ─────────────────────────────────────────────────
const getDynamicPrice = (basePrice, bookedCount, totalSeats) => {
  if (totalSeats === 0) return basePrice;
  const occupancy = bookedCount / totalSeats;
  if (occupancy >= 0.9) return Math.round(basePrice * 1.5);
  if (occupancy >= 0.75) return Math.round(basePrice * 1.25);
  if (occupancy >= 0.5) return Math.round(basePrice * 1.1);
  return basePrice;
};

// ─── GET SEAT CATEGORY PRICE ──────────────────────────────────────────────────
const getSeatCategoryPrice = (show, seat) => {
  if (!show.seatCategories || show.seatCategories.length === 0) return null;
  for (const cat of show.seatCategories) {
    if (cat.seats && cat.seats.includes(seat)) return cat.price;
  }
  return null;
};

// CREATE ORDER (with dynamic pricing + discounts)
exports.createOrder = async (req, res) => {
  try {
    const { amount, showId, seats, promoCode, loyaltyDiscount: loyaltyDiscountReq } = req.body;

    let finalAmount = amount;

    if (showId && seats && seats.length > 0) {
      const show = await Show.findById(showId);
      if (show) {
        const totalSeats = show.seats?.length || 50;
        const bookedCount = show.bookedSeats?.length || 0;
        let ticketsTotal = 0;
        for (const seat of seats) {
          const catPrice = getSeatCategoryPrice(show, seat);
          const base = catPrice || show.price || 200;
          ticketsTotal += getDynamicPrice(base, bookedCount, totalSeats);
        }
        finalAmount = ticketsTotal;
      }
    }

    // Apply promo discount to order amount
    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && promo.usedCount < promo.maxUses && (!promo.expiresAt || new Date() < promo.expiresAt) && finalAmount >= promo.minAmount) {
        const disc = promo.discountType === 'percentage'
          ? Math.round(finalAmount * promo.discountValue / 100)
          : Math.min(promo.discountValue, finalAmount);
        finalAmount = Math.max(0, finalAmount - disc);
      }
    }

    // Apply loyalty discount
    if (loyaltyDiscountReq && Number(loyaltyDiscountReq) > 0) {
      finalAmount = Math.max(0, finalAmount - Number(loyaltyDiscountReq));
    }

    // Razorpay minimum is ₹1
    finalAmount = Math.max(1, finalAmount);

    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.status(200).json({ ...order, dynamicPrice: Math.round(finalAmount / (seats?.length || 1)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY PAYMENT + SAVE BOOKING + SEND EMAIL
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      seats,
      showId,
      userId,
      meals: mealsData,
      promoCode: promoCodeInput,
      loyaltyPointsToRedeem
    } = req.body;

    // VERIFY SIGNATURE
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const existingShow = await Show.findById(showId).populate('movie').populate('theatre');
    if (!existingShow) return res.status(404).json({ message: "Show not found" });

    const user = await User.findById(userId);

    // CALCULATE TICKET AMOUNT with dynamic pricing + seat categories
    const totalSeats = existingShow.seats?.length || 50;
    const bookedCount = existingShow.bookedSeats?.length || 0;

    let ticketsTotal = 0;
    for (const seat of seats) {
      const catPrice = getSeatCategoryPrice(existingShow, seat);
      const base = catPrice || existingShow.price || 200;
      ticketsTotal += getDynamicPrice(base, bookedCount, totalSeats);
    }

    // CALCULATE MEALS TOTAL
    let mealsTotal = 0;
    const processedMeals = [];

    if (mealsData && mealsData.length > 0) {
      for (const item of mealsData) {
        if (!item.mealId || item.quantity <= 0) continue;
        const meal = await Meal.findById(item.mealId);
        if (meal && meal.isAvailable) {
          const lineTotal = meal.price * item.quantity;
          mealsTotal += lineTotal;
          processedMeals.push({
            meal: meal._id,
            quantity: item.quantity,
            price: meal.price
          });
        }
      }
    }

    const totalAmount = ticketsTotal + mealsTotal;

    // APPLY PROMO CODE
    let promoDiscount = 0;
    let appliedPromoCode = '';
    if (promoCodeInput) {
      const promo = await PromoCode.findOne({ code: promoCodeInput.toUpperCase(), isActive: true });
      if (promo && promo.usedCount < promo.maxUses && (!promo.expiresAt || new Date() < promo.expiresAt) && totalAmount >= promo.minAmount) {
        promoDiscount = promo.discountType === 'percentage'
          ? Math.round(totalAmount * promo.discountValue / 100)
          : Math.min(promo.discountValue, totalAmount);
        appliedPromoCode = promo.code;
        promo.usedCount += 1;
        await promo.save();
      }
    }

    const finalAmount = Math.max(0, totalAmount - promoDiscount);

    // APPLY LOYALTY POINTS REDEMPTION
    const { applyRedemption } = require('./loyaltyController');
    let loyaltyDiscount = 0;
    let loyaltyPointsUsed = 0;
    if (loyaltyPointsToRedeem && Number(loyaltyPointsToRedeem) >= 100) {
      loyaltyDiscount = await applyRedemption(userId, Number(loyaltyPointsToRedeem));
      loyaltyPointsUsed = loyaltyDiscount > 0 ? Number(loyaltyPointsToRedeem) : 0;
    }

    const grandTotal = Math.max(0, finalAmount - loyaltyDiscount);

    // LOYALTY POINTS (1 point per ₹10 of grand total)
    const loyaltyPointsEarned = Math.floor(grandTotal / 10);

    // SAVE BOOKING
    const booking = await Booking.create({
      user: userId,
      movie: existingShow.movie._id,
      theatre: existingShow.theatre._id,
      show: showId,
      seats,
      totalAmount: grandTotal,
      bookingId: uuidv4(),
      userEmail: user?.email || '',
      status: 'CONFIRMED',
      meals: processedMeals,
      mealsTotal,
      loyaltyPointsEarned,
      promoCode: appliedPromoCode,
      promoDiscount: promoDiscount + loyaltyDiscount
    });

    // UPDATE BOOKED SEATS (prevent duplicates)
    existingShow.bookedSeats = [...new Set([...existingShow.bookedSeats, ...seats])];
    await existingShow.save();

    // REMOVE REDIS LOCKS
    for (const seat of seats) {
      await redis.del(`lock:${showId}:${seat}`);
    }

    // UPDATE THEATRE REVENUE (use grandTotal after all discounts)
    const theatre = await Theatre.findById(existingShow.theatre._id);
    if (theatre) {
      const rate = theatre.commissionRate || 10;
      const ownerRev = grandTotal * (1 - rate / 100);
      const adminRev = grandTotal * (rate / 100);
      theatre.ownerRevenue += ownerRev;
      theatre.adminRevenue += adminRev;
      theatre.totalRevenue += grandTotal;
      await theatre.save();
    }

    // UPDATE USER LOYALTY POINTS + TOTAL SPENT
    // Note: loyaltyPointsUsed already deducted in applyRedemption above
    if (user) {
      user.loyaltyPoints = (user.loyaltyPoints || 0) + loyaltyPointsEarned;
      user.totalSpent = (user.totalSpent || 0) + grandTotal;
      await user.save();
    }

    logAction({ userId, userName: user?.name, action: 'CREATE_BOOKING', resource: 'Booking', resourceId: booking._id.toString(), details: { seats, totalAmount: grandTotal, promoDiscount, loyaltyDiscount, movie: existingShow.movie?.title }, ip: req.ip });

    // EMIT SOCKET EVENTS FROM BACKEND
    const io = req.app.get('io');
    if (io) {
      io.to(showId).emit('bookingConfirmed', { showId, seats });
      io.to('admin-room').emit('newBookingActivity', {
        type: 'BOOKING',
        userName: user?.name || 'A user',
        seats,
        movieTitle: existingShow.movie?.title || 'a movie',
        theatreName: existingShow.theatre?.name || '',
        timestamp: new Date().toISOString()
      });
    }

    // SEND EMAIL TICKET (non-blocking)
    if (user?.email) {
      sendTicketEmail({
        to: user.email,
        booking,
        movie: existingShow.movie,
        theatre: existingShow.theatre,
        show: existingShow
      }).catch(err => console.error('Email error (ticket):', err.message));
    }

    res.status(200).json({
      success: true,
      message: "Booking Confirmed",
      booking,
      loyaltyPointsEarned,
      promoDiscount,
      loyaltyDiscount,
      finalAmount: grandTotal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD PDF TICKET
exports.downloadTicket = async (req, res) => {
  try {
    const { generateTicketPDF } = require('../utils/pdfTicket');
    const booking = await Booking.findById(req.params.bookingId)
      .populate('movie').populate('theatre').populate('show');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    console.log('Generating PDF for booking:', booking.bookingId);
    const pdfBuffer = await generateTicketPDF(booking, booking.movie, booking.theatre, booking.show);
    console.log('PDF generated, size:', pdfBuffer.length);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CineVerse-Ticket-${booking.bookingId?.slice(0, 8)}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error.message, error.stack);
    res.status(500).json({ message: 'PDF generation failed: ' + error.message });
  }
};
