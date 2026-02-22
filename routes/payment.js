const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js"); 
const paymentController = require("../controller/payments.js"); // Path check kar lena (s/es ka farak)

// 1. Checkout Page (GET)
router.get("/checkout", async (req, res) => {
    try {
        // Login Check
        if (!req.isAuthenticated()) {
            req.flash("error", "Please login to make a payment");
            return res.redirect("/login");
        }

        const { listingId, checkIn, checkOut } = req.query;

        // Validation: Agar Listing ID hi nahi aayi
        if(!listingId) {
            req.flash("error", "Invalid Booking Details");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(listingId);

        // Validation: Agar Listing Database mein nahi mili
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Nights Calculate karo
        let nights = 1;
        if (checkIn && checkOut) {
            const date1 = new Date(checkIn);
            const date2 = new Date(checkOut);
            
            // Check agar dates valid hain
            if(!isNaN(date1) && !isNaN(date2)) {
                const timeDiff = Math.abs(date2 - date1);
                nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            }
        }

        const totalAmount = listing.price * nights;

        // Render Page
        res.render("payments/checkout.ejs", { 
            key: process.env.STRIPE_PUBLISHABLE_KEY,
            listing: listing,
            totalAmount: totalAmount,
            nights: nights
        });

    } catch (err) {
        console.error("Checkout Error:", err);
        req.flash("error", "Something went wrong during checkout.");
        res.redirect("/listings");
    }
});

// 2. Payment Intent (POST)
router.post("/create-payment-intent", express.json(), paymentController.createPaymentIntent);

// 3. Success Page
router.get("/success", async (req, res) => {
    try {
        // Stripe URL mein payment_intent bhejta hai
        const { payment_intent } = req.query;

        // Agar payment_intent nahi hai, toh seedha listing par bhejo (Direct access roka)
        if (!payment_intent) {
            req.flash("error", "Payment details missing!");
            return res.redirect("/listings");
        }

        // Controller ko bolo: "Booking Confirm karo"
        await paymentController.verifyAndCreateBooking(req, res);

    } catch (err) {
        console.error("Success Route Error:", err);
        req.flash("error", "Error confirming booking");
        res.redirect("/listings");
    }
});

module.exports = router;