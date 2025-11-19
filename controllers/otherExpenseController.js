
const OtherExpense = require("../models/OtherExpense");
const User = require("../models/User");

const formatMonthKey = (month) => {
  const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  if (typeof month === "number") {
    if (month < 1 || month > 12) return null;
    return monthNames[month - 1];
  }
  if (typeof month === "string") {
    const m = month.trim();
    if (!m) return null;
    const three = m.slice(0, 3).toUpperCase();
    const match = monthNames.find(x => x === three);
    return match || three;
  }
  return null;
};


// POST /api/user/other-expenses
const addOtherExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const userRole = req.user.role;
    const { date, entries } = req.body;

    if (!date) return res.status(400).json({ msg: "Date is required" });
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ msg: "Entries are required." });
    }

    // derive month key from date
    const parts = date.split("/").map(Number);
    if (parts.length !== 3) return res.status(400).json({ msg: "Date must be in DD/MM/YYYY format" });
    const [, month, year] = parts;
    const monthKey = formatMonthKey(month);
    if (!monthKey) return res.status(400).json({ msg: "Invalid month in date" });

    // fetch user and check months
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const monthEntry = user.months.find(m => m.month === monthKey);
    if (monthEntry && monthEntry.submittedAt && userRole !== "admin") {
      return res.status(400).json({ msg: `Month ${monthKey} has been submitted and is locked. You cannot add other expenses for this month.` });
    }

    const createdEntries = [];

    for (const entry of entries) {
      const { description, amount, billNo } = entry;  // ✅ accept billNo

      const newExpense = new OtherExpense({
        username,
        date,
        description,
        amount,
        billNo: billNo || "",   // ✅ save billNo
        extraamount: 0,
        extradescription: "",
        total: amount,
      });

      const saved = await newExpense.save();
      createdEntries.push(saved);
    }

    res.status(200).json({ msg: "Expenses added", data: createdEntries });
  } catch (err) {
    console.error("Error saving other expenses:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// // POST /api/user/other-expenses
// const addOtherExpenses = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const { date, entries } = req.body;

//     if (!Array.isArray(entries) || entries.length === 0) {
//       return res.status(400).json({ msg: "Entries are required." });
//     }

//     const createdEntries = [];

//     for (const entry of entries) {
//       const { description, amount, billNo } = entry;  // ✅ accept billNo

//       const newExpense = new OtherExpense({
//         username,
//         date,
//         description,
//         amount,
//         billNo: billNo || "",   // ✅ save billNo
//         extraamount: 0,
//         extradescription: "",
//         total: amount,
//       });

//       const saved = await newExpense.save();
//       createdEntries.push(saved);
//     }

//     res.status(200).json({ msg: "Expenses added", data: createdEntries });
//   } catch (err) {
//     console.error("Error saving other expenses:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// GET /api/user/other-expenses?month=9&year=2025
const getMyOtherExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const { month, year } = req.query;

    let expenses = await OtherExpense.find({ username });

    if (month && year) {
      expenses = expenses.filter((exp) => {
        if (!exp.date) return false;
        const [day, mon, yr] = exp.date.split("/").map(Number);
        return mon === Number(month) && yr === Number(year);
      });
    }

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching other expenses:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addOtherExpenses,
  getMyOtherExpenses,
};
