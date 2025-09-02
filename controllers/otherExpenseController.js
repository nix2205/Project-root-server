// controllers/otherExpenseController.js
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
      const { description, amount } = entry;

      const newExpense = new OtherExpense({
        username,
        date,
        description,
        amount,
        
        // ✅ ADDED: Initialize the extra fields
        extraamount: 0,
        extradescription: "",
        
        total: amount, // total = amount initially
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

// GET /api/other-expenses/:username
const getOtherExpensesByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const expenses = await OtherExpense.find({ username }).sort({ date: 1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching other expenses for admin:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/user/other-expenses
const getMyOtherExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const expenses = await OtherExpense.find({ username });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching other expenses:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addOtherExpenses,
  getMyOtherExpenses,
  getOtherExpensesByUsername,
};