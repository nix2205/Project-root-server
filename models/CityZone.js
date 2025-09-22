const mongoose = require("mongoose");

const CityZoneSchema = new mongoose.Schema({
  city: { type: String, required: true },
  lat: { type: Number, required: true },     // center point latitude
  lon: { type: Number, required: true },     // center point longitude
  radiusKm: { type: Number, required: true } // radius around point
});

module.exports = mongoose.model("CityZone", CityZoneSchema);
