


// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema({
//   date: String,         // e.g., "31/07/2025"
//   time: String,         // e.g., "10:30 AM"
//   location: String,     // e.g., "Guntur"
//   transport: String,    // e.g., "bike"
//   zone: String,         // e.g., "EX"
//   km: Number,           // e.g., 45
//   fare: Number,         // e.g., 200
//   da: Number,           // e.g., 200
//   extraTA: { type: Number, default: null },
//   extraDA: { type: Number, default: null },
//   taDesc: { type: String, default: null },
//   daDesc: { type: String, default: null },
//   locationDesc: { type: String, default: null },
//   isSpecial: { type: Boolean, default: false },
//   isNW: { type: Boolean, default: false },   // No Work
//   total: Number         // fare + da + otherExp
// });

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdBy: { type: String, required: true },

//   role: { type: String, enum: ["admin", "user"], default: "user" },

//   hq: { type: String, default: ""},
//   ex: { type: [String], default: [] },
//   os: { type: [String], default: [] },

//   kms: { type: Map, of: Number }, // e.g., { "Hyderabad": 0, "Chennai": 25 }
//   fares: {
//     type: Map,
//     of: {
//       bike: Number,
//       bus: Number,
//       train: Number,
//     },
//   },
//   da: { type: Map, of: Number }, // city-wise DA

//   expenses: [expenseSchema] // <<== Added this line
// });

// module.exports = mongoose.model("User", userSchema);






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

// 🌙 Add the MonthSummarySchema
const monthSummarySchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g. "2025-09"
  total: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdBy: { type: String, required: true },

  role: { type: String, enum: ["admin", "user"], default: "user" },

  hq: { type: String, default: "" },
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
