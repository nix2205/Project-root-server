// const User = require("../models/User");
// const bcrypt = require("bcryptjs");


// const resetPassword = async (req, res) => {
//   try {
//     const username = req.user.username; // from verifyToken middleware
//     const { newPassword } = req.body;

//     if (!newPassword) {
//       return res.status(400).json({ message: "Password must be at least 6 characters" });
//     }

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Error resetting password:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // GET /api/user/info
// const getUserInfo = async (req, res) => {
//   try {
//     const username = req.user.username;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const { hq, ex, os, fares, da, kms } = user;
//     res.json({ username, hq, ex, os, fares, da, kms });
//   } catch (err) {
//     console.error("Error in getUserInfo:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // PUT /api/user/expenses/:expenseId
// const editExpenseIsSpecial = async (req, res) => {
//   try {
//     const userId = req.user.id; // assuming verifyToken middleware sets req.user
//     const { expenseId } = req.params;
//     const { isSpecial } = req.body;

//     // Validate input
//     if (typeof isSpecial !== "boolean") {
//       return res.status(400).json({ message: "isSpecial must be a boolean" });
//     }

//     // Find the user and update only isSpecial for the matching expense
//     const user = await User.findOneAndUpdate(
//       { _id: userId, "expenses._id": expenseId },
//       { $set: { "expenses.$.isSpecial": isSpecial } },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     res.json({ message: "Expense updated successfully", expenses: user.expenses });
//   } catch (error) {
//     console.error("Error updating expense:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // POST /api/user/add-expense
// const addExpense = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const {
//       date,
//       time,
//       location,
//       transport,
//       zone,
//       km,
//       fare,
//       da,
//       total,
//       isSpecial,        // frontend may send it, but we also compute below
//       extraTA,
//       extraDA,
//       taDesc,
//       daDesc,
//       locationDesc,
//       isNW,
//     } = req.body;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Check existing same-date expenses
//     const hasSameDate = (user.expenses || []).some((e) => e.date === date);

//     // Final special flag: true if client requested OR there's already an entry that day
//     const finalIsSpecial = Boolean(isSpecial) || hasSameDate;

//     // If this is a same-day additional entry, upgrade all same-day entries to special
//     if (finalIsSpecial && hasSameDate) {
//       user.expenses.forEach((e) => {
//         if (e.date === date) e.isSpecial = true;
//       });
//     }

//     const newExpense = {
//       date,
//       time,
//       location,
//       transport,
//       zone,
//       km,
//       fare,
//       da,
//       total,
//       isSpecial: finalIsSpecial,
//       extraTA: extraTA ?? null,
//       extraDA: extraDA ?? null,
//       taDesc: taDesc ?? null,
//       daDesc: daDesc ?? null,
//       locationDesc: locationDesc ?? null,
//       isNW: isNW ?? false,
//     };

//     user.expenses.push(newExpense);
//     await user.save();

//     res.status(200).json({ msg: "Expense saved successfully", expense: newExpense });
//   } catch (err) {
//     console.error("Add expense error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// // GET /api/user/expenses
// // const getMyExpenses = async (req, res) => {
// //   try {
// //     const username = req.user.username;
// //     const user = await User.findOne({ username });
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     res.json(user.expenses || []);
// //   } catch (err) {
// //     console.error("Error in getMyExpenses:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };



// // GET /api/user/expenses?month=9&year=2025
// const getMyExpenses = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const { month, year } = req.query;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let expenses = user.expenses || [];

//     if (month && year) {
//       expenses = expenses.filter((exp) => {
//         if (!exp.date) return false;
//         const [day, mon, yr] = exp.date.split("/").map(Number);
//         return mon === Number(month) && yr === Number(year);
//       });
//     }

//     res.json(expenses);
//   } catch (err) {
//     console.error("Error in getMyExpenses:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// module.exports = {
//   getUserInfo,
//   addExpense,
//   getMyExpenses,
//   editExpenseIsSpecial,
//     resetPassword // ✅ Include here

// };











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



module.exports = {
  getUserInfo,
  addExpense,
  getMyExpenses,
  editExpenseIsSpecial,
  resetPassword,
};
