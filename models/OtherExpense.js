

// // models/OtherExpense.js
// const mongoose = require("mongoose");

// const otherExpenseSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   date: { type: String, required: true }, // format: "DD/MM/YYYY"
//   amount: { type: Number, required: true },
//   description: { type: String, required: true },
  
//   // ✅ CHANGED: Made these fields optional with default values
//   extraamount: { type: Number, default: 0 },
//   extradescription: { type: String, default: "" },
  
//   total: { type: Number, required: true },
// });

// module.exports = mongoose.model("OtherExpense", otherExpenseSchema);



const mongoose = require("mongoose");

const otherExpenseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: String, required: true }, // format: "DD/MM/YYYY"
  amount: { type: Number, required: true },
  description: { type: String, required: true },

  billNo: { type: String, default: "" },  // ✅ NEW FIELD

  extraamount: { type: Number, default: 0 },
  extradescription: { type: String, default: "" },

  total: { type: Number, required: true },
});

module.exports = mongoose.model("OtherExpense", otherExpenseSchema);
