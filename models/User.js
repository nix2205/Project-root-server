// models/User.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  date: String,
  time: String,
  location: String,
  transport: String,
  zone: String,
  km: Number,
  fare: Number,
  da: Number,
  extraTA: { type: Number, default: null },
  extraDA: { type: Number, default: null },
  taDesc: { type: String, default: null },
  daDesc: { type: String, default: null },
  locationDesc: { type: String, default: null },
  isSpecial: { type: Boolean, default: false },
  isNW: { type: Boolean, default: false },
  total: Number
});

const monthSummarySchema = new mongoose.Schema({
  month: { type: String, required: true },   // e.g. "OCT"
  approved: { type: Boolean, default: false },
  total: { type: Number, default: 0 },       // store the grand total at submit time
  submittedBy: { type: String, default: null }, // username who submitted
  submittedAt: { type: Date, default: null },
  approvedAt: { type: Date, default: null },
});


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdBy: { type: String, required: true },
//company name or ceo name, manager name, employee name, employee id
  role: { type: String, enum: ["admin", "user"], default: "user" },

  hq: { type: String, default: "" }, // need radius as well for all cities
  ex: { type: [String], default: [] },
  os: { type: [String], default: [] },

  kms: { type: Map, of: Number },
  fares: {
    type: Map,
    of: {
      bike: Number,
      bus: Number,
      train: Number,
    },
  },
  da: { type: Map, of: Number },

  // ✅ Newly added fields from Dashboard
  lastReported: { type: String, default: null }, // e.g., "05/10/2025"
  months: [monthSummarySchema], // store monthly summaries here

  expenses: [expenseSchema],
});

module.exports = mongoose.model("User", userSchema);
