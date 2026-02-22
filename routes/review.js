const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const listingController = require("../controller/reviews.js");

// post review route

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(listingController.createReview)
);

// Delete Review Route

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(listingController.destroyReview)
);

module.exports = router;
