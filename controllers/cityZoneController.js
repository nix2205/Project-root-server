const CityZone = require("../models/CityZone");
const haversineDistance = require("../utils/haversineDistance");

// Add a new city zone
const addCityZone = async (req, res) => {
  try {
    const { city, lat, lon, radiusKm } = req.body;

    if (!city || !lat || !lon || !radiusKm) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const newZone = new CityZone({ city, lat, lon, radiusKm });
    const savedZone = await newZone.save();

    res.status(201).json(savedZone);
  } catch (err) {
    console.error("Error adding city zone:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all zones
const getAllZones = async (req, res) => {
  try {
    const zones = await CityZone.find();
    res.json(zones);
  } catch (err) {
    console.error("Error fetching city zones:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a zone
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    await CityZone.findByIdAndDelete(id);
    res.json({ msg: "Zone deleted" });
  } catch (err) {
    console.error("Error deleting city zone:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Resolve city from coordinates
const resolveCityFromCoords = async (req, res) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ msg: "Latitude and longitude required" });
    }

    const zones = await CityZone.find();
    for (const zone of zones) {
      const dist = haversineDistance(lat, lon, zone.lat, zone.lon);
      if (dist <= zone.radiusKm) {
        return res.json({ city: zone.city, matchedBy: "custom-zone" });
      }
    }

    res.json({ city: "Unknown", matchedBy: "none" });
  } catch (err) {
    console.error("Error resolving city:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addCityZone,
  getAllZones,
  deleteZone,
  resolveCityFromCoords,
};
