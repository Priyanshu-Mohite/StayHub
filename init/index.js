const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const NodeGeocoder = require("node-geocoder"); // Geocoder Import karo

// Geocoder Setup
const options = {
  provider: "openstreetmap",
};
const geocoder = NodeGeocoder(options);

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
}
main();

const initDB = async () => {
  await Listing.deleteMany({});
  await Review.deleteMany({});

  const cleanData = [];

  // Har ek listing par loop lagao aur uski location ka coordinate nikalo
  for (let obj of initData.data) {
    try {
      // 1. Geocoder ko call karo location ke naam ke sath
      let geoData = await geocoder.geocode(obj.location);

      let coordinates = [77.209, 28.6139]; // Default Delhi rakh lo agar kuch na mile
      
      // 2. Agar location mil gayi toh coordinates update kar do
      if (geoData.length > 0) {
        coordinates = [geoData[0].longitude, geoData[0].latitude];
      }

      // 3. Object taiyaar karo
      let newListingData = {
        ...obj,
        owner: new mongoose.Types.ObjectId("696f87e321ea876fd7696b2a"),
        geometry: {
          type: "Point",
          coordinates: coordinates, // Ab yahan dynamic aayega
        },
      };

      cleanData.push(newListingData);
      console.log(`Prepared data for: ${obj.location}`); // Track karne ke liye
    } catch (err) {
      console.log(`Error geocoding ${obj.location}:`, err);
    }
  }

  // 4. Sab ek sath insert kar do
  await Listing.insertMany(cleanData);
  console.log("Data was initialized with dynamic locations!");
};

initDB();


// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js"); // 1. Review model import kar

// // MongoDB URL
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// // connect to MongoDB
// async function main() {
//   try {
//     await mongoose.connect(MONGO_URL);
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.log("MongoDB connection error:", err);
//   }
// }

// // call the function
// main();

// // const initDb = async () => {
// //     await Listing.deleteMany({});
// //     await Listing.insertMany(initData.data);
// //     console.log("data was saved");
// // };

// const initDB = async () => {
//   await Listing.deleteMany({});
//   await Review.deleteMany({});

//   const cleanData = initData.data.map((obj) => ({
//     // Ye line magic hai: Ye har object se sirf URL nikaal legi
//     ...obj,
//     // image: obj.image.url,
//     owner: new mongoose.Types.ObjectId("696f87e321ea876fd7696b2a"),

//     geometry: {
//       type: "Point",
//       coordinates: [77.209, 28.6139], // [longitude, latitude]
//     },
//   }));

//   await Listing.insertMany(cleanData);
//   console.log("data was initialized with owner");
// };

// initDB();
