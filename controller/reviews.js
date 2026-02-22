const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  // console.log(req.params.id);

  // 1. Listing dhundo jisme review dalna hai
  let listing = await Listing.findById(req.params.id);

  // 2. Naya review create karo (jo form se aaya hai)
  // req.body.review wahi hai jo tune name="review[rating]" rakha tha
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;
  console.log(newReview);

  // 3. Review ko listing ke array mein push karo
  listing.reviews.push(newReview);

  // 4. Dono ko save karo
  await newReview.save();
  await listing.save();

  console.log("Naya review save ho gaya!");

  req.flash("success", "New Review Created");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted");

  res.redirect(`/listings/${id}`);
};
