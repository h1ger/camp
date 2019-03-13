var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model("User", UserSchema, 'users');