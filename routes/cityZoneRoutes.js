const express = require("express");
const router = express.Router();
const {
  addCityZone,
  getAllZones,
  deleteZone,
  resolveCityFromCoords,
} = require("../controllers/cityZoneController");

// Add a city zone
router.post("/", addCityZone);

// Get all city zones
router.get("/", getAllZones);

// Delete a city zone
router.delete("/:id", deleteZone);

// Resolve a city from given lat/lon
router.post("/resolve", resolveCityFromCoords);

module.exports = router;
