const express = require("express");
const router = express.Router();
const bookingController = require("../controller/booking");

// Ye wahi middleware hai jo check karega ki user Login hai ya nahi
// (Assuming tumhare paas ye middleware.js me pehle se hai)
const { isLoggedIn } = require("../middleware.js"); 

// --- Route 1: Create Booking ---
// URL: /bookings/
// Ispe "isLoggedIn" guard lagaya hai. Bina login kiye booking nahi hogi.
// router.post("/", isLoggedIn, bookingController.createBooking);

// --- Route 2: Get Booked Dates ---
// URL: /bookings/65a... (Listing ID)
// Isse koi bhi access kar sakta hai (Login zaroori nahi, dates dekhne ke liye)
router.get("/:listingId", bookingController.getBookedDates);

router.get("/", isLoggedIn, bookingController.renderBookings);

// router.get("/:id/success", isLoggedIn, bookingController.renderSuccess);

module.exports = router;