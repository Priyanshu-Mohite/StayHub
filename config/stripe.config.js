// 1. Environment variables load karne ke liye
require("dotenv").config(); 

// 2. Stripe library import ki
const Stripe = require("stripe");

// 3. Stripe ko Secret Key ke saath initialize kiya
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 4. Export kar diya taaki baaki files isse use kar sakein
module.exports = stripe;