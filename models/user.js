const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// passport-local-mongoose plugin
// This handles cases where the module might be exported as an object
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

// Model
const User = mongoose.model("User", userSchema);

module.exports = User;
