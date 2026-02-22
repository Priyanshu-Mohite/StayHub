const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  // 1. KISNE BOOK KIYA? (Link to User Model)
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Ye 'User' model se connect karega
    required: true,
  },

  // 2. KAUNSI PROPERTY? (Link to Listing Model)
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing", // Ye 'Listing' model se connect karega
    required: true,
  },

  // 3. KAB SE KAB TAK?
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },

  // 4. KITNA PAISA?
  totalPrice: {
    type: Number,
    required: true,
  },

  // 5. STATUS KYA HAI? (Lifecycle management)
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"], // Sirf ye 3 values allowed hongi
    default: "pending",
  },

  // 6. KAB CREATE HUA? (Timestamps)
  // Mongoose auto-create karega: createdAt, updatedAt
}, { timestamps: true });


// --- "BEST OF ALL TIME" FEATURE: Schema Level Validation ---
// Hum DB level par hi check lagayenge ki CheckOut date, CheckIn ke baad hi honi chahiye.
// Aisa nahi hona chahiye ki CheckIn: 10th Feb, CheckOut: 5th Feb.

// models/booking.js

// Validate middleware bina 'next' ke
bookingSchema.pre('validate', function() {
  // Logic wahi same hai
  if (this.checkIn && this.checkOut && this.checkIn >= this.checkOut) {
    // Seedha error phek do, Mongoose khud sambhal lega
    throw new Error('Check-out date must be after check-in date.');
  }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;