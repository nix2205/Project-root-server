const User = require("../models/User");
const bcrypt = require("bcryptjs");


const resetPassword = async (req, res) => {
  try {
    const username = req.user.username; // from verifyToken middleware
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/user/info
const getUserInfo = async (req, res) => {
  try {
    const username = req.user.username;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { hq, ex, os, fares, da, kms } = user;
    res.json({ username, hq, ex, os, fares, da, kms });
  } catch (err) {
    console.error("Error in getUserInfo:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/user/expenses/:expenseId
const editExpenseIsSpecial = async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken middleware sets req.user
    const { expenseId } = req.params;
    const { isSpecial } = req.body;

    // Validate input
    if (typeof isSpecial !== "boolean") {
      return res.status(400).json({ message: "isSpecial must be a boolean" });
    }

    // Find the user and update only isSpecial for the matching expense
    const user = await User.findOneAndUpdate(
      { _id: userId, "expenses._id": expenseId },
      { $set: { "expenses.$.isSpecial": isSpecial } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense updated successfully", expenses: user.expenses });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/user/add-expense
// Auto-flags specials: if another expense exists on the same date,
// this new one becomes isSpecial = true, and all existing same-date expenses are marked isSpecial = true.
const addExpense = async (req, res) => {
  try {
    const username = req.user.username;
    const {
      date,
      time,
      location,
      transport,
      zone,
      km,
      fare,
      da,
      total,
      isSpecial,        // frontend may send it, but we also compute below
      extraTA,
      extraDA,
      taDesc,
      daDesc,
      locationDesc,
      isNW,
    } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check existing same-date expenses
    const hasSameDate = (user.expenses || []).some((e) => e.date === date);

    // Final special flag: true if client requested OR there's already an entry that day
    const finalIsSpecial = Boolean(isSpecial) || hasSameDate;

    // If this is a same-day additional entry, upgrade all same-day entries to special
    if (finalIsSpecial && hasSameDate) {
      user.expenses.forEach((e) => {
        if (e.date === date) e.isSpecial = true;
      });
    }

    const newExpense = {
      date,
      time,
      location,
      transport,
      zone,
      km,
      fare,
      da,
      total,
      isSpecial: finalIsSpecial,
      extraTA: extraTA ?? null,
      extraDA: extraDA ?? null,
      taDesc: taDesc ?? null,
      daDesc: daDesc ?? null,
      locationDesc: locationDesc ?? null,
      isNW: isNW ?? false,
    };

    user.expenses.push(newExpense);
    await user.save();

    res.status(200).json({ msg: "Expense saved successfully", expense: newExpense });
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET /api/user/expenses
const getMyExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.expenses || []);
  } catch (err) {
    console.error("Error in getMyExpenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserInfo,
  addExpense,
  getMyExpenses,
  editExpenseIsSpecial,
    resetPassword // ✅ Include here

};





