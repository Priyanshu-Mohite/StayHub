const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const stripe = require("../config/stripe.config.js");

module.exports.createPaymentIntent = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut } = req.body;
        
        // 1. Listing dhoondo
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        // 2. Nights Calculate karo
        let nights = 1;
        if (checkIn && checkOut) {
            const date1 = new Date(checkIn);
            const date2 = new Date(checkOut);
            const timeDiff = Math.abs(date2 - date1);
            nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        }
        const totalAmount = listing.price * nights;

        // 3. Payment Intent Create karo (METADATA KE SAATH)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,
            currency: "inr",
            automatic_payment_methods: { enabled: true },
            
            // 👇 YE HAI MAGIC! Hum booking details Stripe ke paas rakhwa rahe hain
            metadata: {
                userId: req.user._id.toString(), // Current User ki ID
                listingId: listingId,
                checkIn: checkIn,
                checkOut: checkOut,
                totalAmount: totalAmount
            }
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
};


// NAYA FUNCTION: Jo Payment verify karke Booking banayega
// module.exports.verifyAndCreateBooking = async (req, res) => {
//     try {
//         const { payment_intent } = req.query;

//         // 1. Stripe se pucho: "Ye payment ID asli hai?"
//         const paymentIntentInfo = await stripe.paymentIntents.retrieve(payment_intent);

//         // 2. Check karo status Success hai ya nahi
//         if (paymentIntentInfo.status !== "succeeded") {
//             req.flash("error", "Payment failed or pending.");
//             return res.redirect("/listings");
//         }

//         // 3. Metadata se purana data nikalo (Jo humne parchi chipkayi thi)
//         const { listingId, checkIn, checkOut, userId } = paymentIntentInfo.metadata;

//         // 4. Database mein Booking Save karo! 💾
//         const newBooking = new Booking({
//             user: userId, // Metadata se User ID mili
//             listing: listingId,
//             checkIn: new Date(checkIn),
//             checkOut: new Date(checkOut),
//             paymentId: payment_intent,
//             totalPrice: paymentIntentInfo.amount / 100, // Paise to Rupee
//             status: 'confirmed' // Direct confirm!
//         });

//         await newBooking.save();
//         console.log("🎉 Booking Saved Successfully!");

//         // 5. Ab Success Page dikhao
//         res.render("payments/success.ejs");

//     } catch (error) {
//         console.error("Booking Save Error:", error);
//         req.flash("error", "Payment hua par Booking save nahi hui.");
//         res.redirect("/listings");
//     }
// };

// Webhook wale function ki ab zaroorat nahi hai (Project ke liye), tu usse ignore kar sakta hai.

// ==========================================
// THE REAL WEBHOOK: Backend to Backend Connection
// ==========================================
module.exports.webhook = async (req, res) => {
    // 1. Stripe ka bheja hua lock (Signature) nikal
    const sig = req.headers['stripe-signature'];
    
    // 2. Tera naya private password (Abhi ke liye variable bana rahe hain, baad me .env me dalenge)
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // 3. THE HMAC SHAADI (Match the signatures)
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        // Agar match fail hua (Hacker detected)
        console.error("⚠️ Webhook Mismatch! Hacker Detected ya data corrupt hai:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 4. THE FILTER (Sirf successful payment pe dhyan do)
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntentInfo = event.data.object;

        // 5. Parchi (Metadata) nikalo!
        const { listingId, checkIn, checkOut, userId } = paymentIntentInfo.metadata;

        try {
            // 6. Database mein chup-chap Booking save kar do
            const newBooking = new Booking({
                user: userId, 
                listing: listingId,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                paymentId: paymentIntentInfo.id,
                totalPrice: paymentIntentInfo.amount / 100, 
                status: 'confirmed' 
            });

            await newBooking.save();
            console.log("✅ Webhook Success: Piche se Booking Save ho gayi!");
        } catch (dbErr) {
            console.error("Database Save Error inside Webhook:", dbErr);
        }
    }

    // 7. Stripe ko "OK" bol do taaki wo shanti se baith jaye aur message repeat na kare
    res.status(200).json({ received: true });
};