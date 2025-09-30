// // controllers/otherExpenseController.js
// const OtherExpense = require("../models/OtherExpense");

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
//       const { description, amount } = entry;

//       const newExpense = new OtherExpense({
//         username,
//         date,
//         description,
//         amount,
        
//         // ✅ ADDED: Initialize the extra fields
//         extraamount: 0,
//         extradescription: "",
        
//         total: amount, // total = amount initially
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

// // GET /api/other-expenses/:username
// // const getOtherExpensesByUsername = async (req, res) => {
// //   try {
// //     const { username } = req.params;
// //     const expenses = await OtherExpense.find({ username }).sort({ date: 1 });
// //     res.json(expenses);
// //   } catch (err) {
// //     console.error("Error fetching other expenses for admin:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // };


// // Get Other Expenses (with optional month/year filter)
// const getOtherExpensesByUsername = async (req, res) => {
//   try {
//     const { username } = req.params;
//     const { month, year } = req.query;

//     let query = { username };
//     let expenses = await OtherExpense.find(query);

//     // ✅ Filter manually since date is string
//     if (month && year) {
//       expenses = expenses.filter((exp) => {
//         if (!exp.date) return false;
//         const [day, mon, yr] = exp.date.split("/").map(Number);
//         return mon === Number(month) && yr === Number(year);
//       });
//     }

//     res.json(expenses);
//   } catch (err) {
//     console.error("Get other expenses error:", err);
//     res.status(500).json({ error: "Failed to fetch other expenses" });
//   }
// };



// // GET /api/user/other-expenses
// const getMyOtherExpenses = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const expenses = await OtherExpense.find({ username });
//     res.json(expenses);
//   } catch (err) {
//     console.error("Error fetching other expenses:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// module.exports = {
//   addOtherExpenses,
//   getMyOtherExpenses,
//   getOtherExpensesByUsername,
// };



// const OtherExpense = require("../models/OtherExpense");

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
//       const { description, amount } = entry;

//       const newExpense = new OtherExpense({
//         username,
//         date,
//         description,
//         amount,
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

// // GET /api/user/other-expenses?month=9&year=2025
// const getMyOtherExpenses = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const { month, year } = req.query;

//     let expenses = await OtherExpense.find({ username });

//     if (month && year) {
//       expenses = expenses.filter((exp) => {
//         if (!exp.date) return false;
//         const [day, mon, yr] = exp.date.split("/").map(Number);
//         return mon === Number(month) && yr === Number(year);
//       });
//     }

//     res.json(expenses);
//   } catch (err) {
//     console.error("Error fetching other expenses:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// module.exports = {
//   addOtherExpenses,
//   getMyOtherExpenses,
// };






const OtherExpense = require("../models/OtherExpense");

// POST /api/user/other-expenses
const addOtherExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const { date, entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ msg: "Entries are required." });
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
