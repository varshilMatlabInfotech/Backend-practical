const mongoose = require("mongoose");

const newUserSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    mobileNo:Number,
    email: { type: String, unique: true },
    password: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("User", newUserSchema);
