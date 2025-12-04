// backend/models/Rating.js
const mongoose = require("mongoose");

// Let MongoDB store flexible schema for all CSV columns
const RatingSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Rating", RatingSchema);
