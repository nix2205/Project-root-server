const User = require("../models/User");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");

// ✅ Reset password
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



// ✅ Get user info (for frontend pages)
const getUserInfo = async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { hq, ex, os, fares, da, kms, months, lastReported } = user;

    res.json({ username, hq, ex, os, fares, da, kms, months, lastReported });
  } catch (err) {
    console.error("Error in getUserInfo:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Edit expense special flag
const editExpenseIsSpecial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { expenseId } = req.params;
    const { isSpecial } = req.body;

    if (typeof isSpecial !== "boolean") {
      return res.status(400).json({ message: "isSpecial must be a boolean" });
    }

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



// ✅ Add new expense (also updates lastReported & monthly summary)
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
      isSpecial,
      extraTA,
      extraDA,
      taDesc,
      daDesc,
      locationDesc,
      isNW,
    } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🩶 Check for same-day duplicates
    const hasSameDate = (user.expenses || []).some((e) => e.date === date);
    const finalIsSpecial = Boolean(isSpecial) || hasSameDate;

    if (finalIsSpecial && hasSameDate) {
      user.expenses.forEach((e) => {
        if (e.date === date) e.isSpecial = true;
      });
    }

    // 🩵 Add new expense
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

    // 🌸 Update lastReported
    user.lastReported = date;

    // 🧾 Update monthly total
    const [day, month, year] = date.split("/").map(Number);
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    let monthEntry = user.months.find((m) => m.month === monthKey);
    if (monthEntry) {
      monthEntry.total += total;
    } else {
      user.months.push({ month: monthKey, total, approved: false });
    }

    await user.save();

    res.status(200).json({ msg: "Expense saved successfully", expense: newExpense });
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};



// ✅ Get all expenses (with optional month/year filter)
const getMyExpenses = async (req, res) => {
  try {
    const username = req.user.username;
    const { month, year } = req.query;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    let expenses = user.expenses || [];

    if (month && year) {
      expenses = expenses.filter((exp) => {
        if (!exp.date) return false;
        const [day, mon, yr] = exp.date.split("/").map(Number);
        return mon === Number(month) && yr === Number(year);
      });
    }

    res.json(expenses);
  } catch (err) {
    console.error("Error in getMyExpenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const formatMonthKey = (month) => {
  const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  if (typeof month === "number") {
    if (month < 1 || month > 12) return null;
    return monthNames[month - 1];
  }
  if (typeof month === "string") {
    const m = month.trim();
    if (!m) return null;
    const three = m.slice(0, 3).toLowerCase();
    const match = monthNames.find(x => x.toLowerCase() === three);
    return match || m.toUpperCase().slice(0, 3);
  }
  return null;
};

const userSubmitMonth = async (req, res) => {
  try {
    const username = req.user?.username || req.body.username || req.params.username;
    const { month, total } = req.body;

    if (!month || total === undefined) {
      return res.status(400).json({ error: "Month and total required" });
    }

    const formattedMonth = formatMonthKey(month);
    if (!formattedMonth) return res.status(400).json({ error: "Invalid month" });

    const finalMonthKey = formattedMonth; // "NOV" ONLY

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingIndex = user.months.findIndex(m => m.month === finalMonthKey);

    const now = new Date();

    if (existingIndex !== -1) {
      user.months[existingIndex].total = total;
      user.months[existingIndex].approved = false;
      user.months[existingIndex].submittedBy = username;
      user.months[existingIndex].submittedAt = now;
      user.months[existingIndex].approvedAt = null;
    } else {
      user.months.push({
        month: finalMonthKey,
        total,
        approved: false,
        submittedBy: username,
        submittedAt: now,
      });
    }

    await user.save();
    return res.json({ message: "Month submitted", months: user.months });
  } catch (err) {
    console.error("userSubmitMonth error:", err);
    return res.status(500).json({ error: "Failed to submit month" });
  }
};



module.exports = {
  getUserInfo,
  addExpense,
  getMyExpenses,
  editExpenseIsSpecial,
  resetPassword,
  userSubmitMonth,
};
