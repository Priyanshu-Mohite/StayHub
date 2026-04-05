// const Booking = require("../models/booking"); // Step 0 wala model import kiya

// module.exports.createBooking = async (req, res) => {
//   try {
//     const { listingId, checkIn, checkOut } = req.body;
//     const userId = req.user._id;

//     const newCheckIn = new Date(checkIn);
//     const newCheckOut = new Date(checkOut);

//     const conflictingBooking = await Booking.findOne({
//       listing: listingId,
//       checkIn: { $lt: newCheckOut },
//       checkOut: { $gt: newCheckIn }
//     });

//     if (conflictingBooking) {
//       req.flash("error", "Dates already booked");
//       return res.redirect("back");
//     }

//     const newBooking = new Booking({
//       listing: listingId,
//       user: userId,
//       checkIn: newCheckIn,
//       checkOut: newCheckOut,
//       totalPrice: 5000,
//       status: "confirmed"
//     });

//     await newBooking.save();

//     // 🔥 ONLY REDIRECT
//     res.redirect(`/bookings/${newBooking._id}/success`);

//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Something went wrong");
//   }
// };

const Booking = require("../models/booking");
// 🔥 STEP 1: Yahan Listing model bhi import kar le, kyunki hume uska version check karna hai
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    const userId = req.user._id;

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    // 🔥 STEP 2: READ (Listing ka current version uthao)
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("back");
    }

    // 3. Tera original logic: Check if dates overlap
    const conflictingBooking = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: newCheckOut },
      checkOut: { $gt: newCheckIn },
    });

    if (conflictingBooking) {
      req.flash("error", "Dates already booked");
      return res.redirect("back");
    }

    // 🔥 STEP 3: OPTIMISTIC LOCKING (The Magic)
    // Date conflict nahi tha, par save karne se pehle confirm karo kisi aur ne parallel booking toh nahi daal di!
    const updatedListing = await Listing.findOneAndUpdate(
      {
        _id: listingId,
        version: listing.version, // SHART: Version wahi hona chahiye jo line 14 pe read kiya tha
      },
      {
        $inc: { version: 1 }, // Success pe version +1 kardo aage walo ke liye
      },
      { new: true },
    );

    // 🔥 STEP 4: RACE CONDITION DETECTED! (Sneha wala case)
    if (!updatedListing) {
      console.log("Race condition averted!");
      req.flash(
        "error",
        "Someone else just booked this property a millisecond ago! Please try different dates.",
      );
      return res.redirect("back"); // Agar payment gateway laga hota, toh uske refund ka code yahan aata
    }

    // 5. SUCCESS (Rahul wala case) - Version match ho gaya, ab aaram se save karo
    const newBooking = new Booking({
      listing: listingId,
      user: userId,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      totalPrice: 5000,
      status: "confirmed",
    });

    await newBooking.save();

    // ONLY REDIRECT
    res.redirect(`/bookings/${newBooking._id}/success`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports.renderSuccess = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/bookings");
    }

    res.render("bookings/success", { booking });
  } catch (err) {
    console.log(err);
    res.redirect("/bookings");
  }
};

// --- STEP 1: Bookings dikhane ka logic ---
module.exports.renderBookings = async (req, res) => {
  try {
    // 1. Current User ki ID nikalo
    const currUserId = req.user._id;

    // 2. Database mein dhundo: "Wo bookings do jahan user == currUser"
    // .populate('listing') ka matlab: Sirf Listing ID mat do, puri Listing (Photo, Naam) bhi do.
    const bookings = await Booking.find({ user: currUserId }).populate(
      "listing",
    );

    // 3. User ko 'index.ejs' page dikhao aur data bhejo
    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot fetch bookings");
    res.redirect("/listings");
  }
};

module.exports.getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find({
      listing: listingId,
      status: "confirmed",
    });

    // Hum Dates ko saaf-suthra karke bhejenge (Sirf YYYY-MM-DD)
    const bookedDates = bookings.map((booking) => {
      return {
        // .toISOString().split('T')[0] se time hat jata hai
        // Example: "2026-01-22T00:00:00.000Z" ban jayega "2026-01-22"
        from: booking.checkIn.toISOString().split("T")[0],
        to: booking.checkOut.toISOString().split("T")[0],
      };
    });

    res.status(200).json(bookedDates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Could not fetch dates" });
  }
};
