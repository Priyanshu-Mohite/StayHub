if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// console.log(process.env);

// const paymentController = require("./controller/payments.js");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");

// MongoDB URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;  

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const paymentRouter = require("./routes/payment.js");


// import {asyncHandler} from './utils/wrapAsync.js';

// connect to MongoDB
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
}

// call the function
main();

// app.post("/webhook", express.raw({ type: "application/json" }), paymentController.webhook);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// 1. Store define karo
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

// 2. Error listener (err define karna mat bhoolna)
store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

// 3. sessionOptions mein use karo
const sessionOptions = {
  store: store, // Yahan store connect ho raha hai
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions)); // sessions ko associate kar rahe hai with our website 

app.use(flash());
// pbkdf2 hashing
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });


// test route
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.get("/testListing", async (req, res) => {
  try {
    let sampleListing = new Listing({
      title: "My New Villa",
      description: "By the beach",
      price: 1200,
      location: "Calangute, Goa",
      country: "India",
    });

    await sampleListing.save();
    res.send("saved successfully");
  } catch (err) {
    console.log(err);
    res.send("error while saving");
  }
});


app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);

app.use("/bookings", bookingRouter);

app.use("/", paymentRouter);


// --- ISSE REPLACE KARO ---
// Purana: app.all("*", ...) 
// Naya (Express 5 compatible):
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // console.error(err); // Ye line console mein pura error print karegi
  // res.status(statusCode).send(message);

  res.status(statusCode).render("listings/error.ejs", { message });
});


// start server
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
