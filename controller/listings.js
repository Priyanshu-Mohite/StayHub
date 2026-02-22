const Listing = require("../models/listing.js");
const NodeGeocoder = require("node-geocoder");

// 1. Geocoder configuration (OpenStreetMap free hai, koi key nahi chahiye)
const options = {
  provider: "openstreetmap",
};
const geocoder = NodeGeocoder(options);

// module.exports.index = async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// };

module.exports.index = async (req, res) => {
  const { category } = req.query; // URL se category nikali (?category=Mountains)

  let allListings;

  if (category) {
    // Agar category hai toh filter karo
    allListings = await Listing.find({ category: category });
  } else {
    // Agar category nahi hai toh saare listings dikhao
    allListings = await Listing.find({});
  }

  // Optional: Agar filter karne ke baad kuch na mile
  if (category && allListings.length === 0) {
    req.flash("error", `No listings found for ${category}`);
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
  // console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // Ye reviews ke andar ke author ko populate karega
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  // console.log(listing);

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, "..", filename);

  // 2. Form se location uthao aur uska geocode nikalo
  let geoData = await geocoder.geocode(req.body.listing.location);

  // Agar location galat hai ya nahi mili toh handle karo
  if (!geoData.length) {
    req.flash("error", "Location not found! Please check the address.");
    return res.redirect("/listings/new");
  }

  // let {title, description, image, price, country, location} = req.body;

  // let listing = req.body.listing; // js obj ayegi aur uss obj ka name listing hai
  // console.log(listing);

  // if(!req.body.listing) { // bad request means client ki mistake ki bajaha se server isse handle nahi kar sakta
  //   throw new ExpressError(400, "Invalid Listing Data");
  // }

  const newListing = new Listing(req.body.listing);

  // 3. Geometry data save karo (GeoJSON format: [longitude, latitude])
  newListing.geometry = {
    type: "Point",
    coordinates: [geoData[0].longitude, geoData[0].latitude],
  };

  // if(!newListing.title) {
  //   throw new ExpressError(400, "Title is required");
  // }

  // if(!newListing.description) {
  //   throw new ExpressError(400, "Description is required");
  // }

  newListing.owner = req.user._id;

  newListing.image = { url, filename };

  await newListing.save();
  console.log(newListing); // Check karne ke liye ki geometry save hui ya nahi
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/e_blur:50,w_600/"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  // if(!req.body.listing) { // bad request means client ki mistake ki bajaha se server isse handle nahi kar sakta
  //     throw new ExpressError(400, "Invalid Listing Data");
  //   }

  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { runValidators: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated");

  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.searchListing = async (req, res) => {
  // 1. Frontend se query nikalo (name="q" tha na form mein)
  let { q } = req.query;

  // 2. Agar koi khali search button daba de
  if (!q || q.trim() === "") {
    req.flash("error", "Search query cannot be empty!");
    return res.redirect("/listings");
  }

  // 3. Database mein dhoondo (Case Insensitive Search)
  // $regex ka matlab pattern matching
  // $options: "i" ka matlab 'Goa' aur 'goa' same hai
  let allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  // 4. Agar koi result na mile
  if (allListings.length === 0) {
    req.flash("error", "No listings found for '" + q + "'");
    return res.redirect("/listings");
  }

  // 5. Result mil gaya toh index page par dikha do
  res.render("listings/search.ejs", { allListings });
};
