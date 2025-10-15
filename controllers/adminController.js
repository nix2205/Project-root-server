const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OtherExpense = require("../models/OtherExpense");
const dayjs = require("dayjs");

// ✅ Edit an "Other Expense" entry
const editOtherExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { extraamount, extradescription } = req.body;

    const expense = await OtherExpense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Other expense not found" });
    }

    if (extraamount !== undefined) expense.extraamount = extraamount;
    if (extradescription !== undefined) expense.extradescription = extradescription;

    expense.total = (expense.amount || 0) + (expense.extraamount || 0);

    await expense.save();
    res.json({ message: "Other expense updated successfully", expense });

  } catch (err) {
    console.error("Edit other expense error:", err);
    res.status(500).json({ message: "Failed to update other expense" });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOneAndDelete({ username });
    if (!user) return res.status(404).json({ message: "User not found" });
    await OtherExpense.deleteMany({ username });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Delete Other Expense
const deleteOtherExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await OtherExpense.findByIdAndDelete(id);
    res.json({ message: "Other expense deleted" });
  } catch (err) {
    console.error("Delete other expense error:", err);
    res.status(500).json({ message: "Failed to delete other expense" });
  }
};

// Delete User Expense
const deleteUserExpense = async (req, res) => {
  try {
    const { username, expenseId } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove expense
    user.expenses = user.expenses.filter((exp) => exp._id.toString() !== expenseId);

    // Update lastReported & months
    if (user.expenses.length > 0) {
      const latest = user.expenses.sort((a, b) => {
        const [dA, mA, yA] = a.date.split("/").map(Number);
        const [dB, mB, yB] = b.date.split("/").map(Number);
        return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
      })[0];
      user.lastReported = latest.date;

      // Recalculate months totals
      user.months = [];
      user.expenses.forEach((e) => {
        const [d, mon, yr] = e.date.split("/").map(Number);
        const monthKey = `${yr}-${String(mon).padStart(2, "0")}`;
        let monthEntry = user.months.find((m) => m.month === monthKey);
        if (monthEntry) monthEntry.total += e.total;
        else user.months.push({ month: monthKey, total: e.total, approved: false });
      });
    } else {
      user.lastReported = null;
      user.months = [];
    }

    await user.save();
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// Edit User Expense
const editUserExpense = async (req, res) => {
  try {
    const { username, expenseId } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const expense = user.expenses.id(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const updatable = [
      "date", "time", "location", "transport", "zone", "km",
      "fare", "da", "total", "isSpecial", "extraTA", "extraDA",
      "taDesc", "daDesc", "locationDesc", "isFW", "isNFW", "isNW"
    ];
    updatable.forEach((key) => {
      if (key in req.body) expense[key] = req.body[key];
    });

    // Update all same-day expenses if this one isSpecial
    if (req.body.isSpecial === true && req.body.date) {
      user.expenses.forEach((e) => {
        if (e._id.toString() !== expenseId && e.date === req.body.date) {
          e.isSpecial = true;
        }
      });
    }

    // Update lastReported & month totals
    const allExpenses = user.expenses;
    if (allExpenses.length > 0) {
      const latest = allExpenses.sort((a, b) => {
        const [dA, mA, yA] = a.date.split("/").map(Number);
        const [dB, mB, yB] = b.date.split("/").map(Number);
        return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
      })[0];
      user.lastReported = latest.date;
    }

    await user.save();
    res.json({ message: "Expense updated successfully", expense });
  } catch (err) {
    console.error("Edit expense error:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};

// Add User
const addUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      ...rest,
      password: hashedPassword,
      lastReported: null,
      months: [],
    });

    await user.save();
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
};

// Get Single User Info
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user info error:", err);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

// Edit User Info
const editUser = async (req, res) => {
  try {
    const { username } = req.params;
    const updatedData = req.body;
    const user = await User.findOneAndUpdate({ username }, updatedData, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Get Expenses (normal)
const getNormalExpenses = async (req, res) => {
  try {
    const { username } = req.params;
    const { month, year } = req.query;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    let expenses = user.expenses || [];
    if (month && year) {
      expenses = expenses.filter((exp) => {
        if (!exp.date) return false;
        const [d, m, y] = exp.date.split("/").map(Number);
        return m === Number(month) && y === Number(year);
      });
    }
    res.json(expenses);
  } catch (err) {
    console.error("Get normal expenses error:", err);
    res.status(500).json({ error: "Failed to fetch normal expenses" });
  }
};

// Get Other Expenses
const getOtherExpenses = async (req, res) => {
  try {
    const { username } = req.params;
    const { month, year } = req.query;

    let expenses = await OtherExpense.find({ username });
    if (month && year) {
      expenses = expenses.filter((exp) => {
        if (!exp.date) return false;
        const [d, m, y] = exp.date.split("/").map(Number);
        return m === Number(month) && y === Number(year);
      });
    }
    res.json(expenses);
  } catch (err) {
    console.error("Get other expenses error:", err);
    res.status(500).json({ error: "Failed to fetch other expenses" });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get Managed Users
const getManagedUsers = async (req, res) => {
  try {
    const loggedInAdminId = req.user.id;
    const users = await User.find({ createdBy: loggedInAdminId }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get managed users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "New password is required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { username },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// Update Username
const updateUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ error: "New username is required" });

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const user = await User.findOneAndUpdate({ username }, { username: newUsername }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Username updated successfully", user });
  } catch (err) {
    console.error("Update username error:", err);
    res.status(500).json({ error: "Failed to update username" });
  }
};

// Get last reported date
const getLastReportedDate = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ lastReported: user.lastReported || null });
  } catch (err) {
    console.error("Get last reported date error:", err);
    res.status(500).json({ error: "Failed to fetch last reported date" });
  }
};


// Approve Expense
const approveExpense = async (req, res) => {
  try {
    const { username } = req.params;
    const { month, year, total } = req.body;

    if (!month || !year || total === undefined) {
      return res.status(400).json({ error: "Month, year, and total are required" });
    }

    // Convert month number or name to 3-letter uppercase format
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    let formattedMonth;
    if (typeof month === "number") {
      formattedMonth = monthNames[month - 1];
    } else if (typeof month === "string") {
      const match = monthNames.find((m) => m.toLowerCase() === month.toLowerCase().slice(0, 3));
      formattedMonth = match || month.toUpperCase().slice(0, 3);
    }

    const finalMonthKey = `${formattedMonth}`; // Example: "OCT-2025"

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if this month already exists
    const existingMonthIndex = user.months.findIndex((m) => m.month === finalMonthKey);

    if (existingMonthIndex !== -1) {
      // Month already exists: update total (only if previously approved)
      user.months[existingMonthIndex].total = total;
      user.months[existingMonthIndex].approved = true;
    } else {
      // Month doesn't exist yet: add new entry
      user.months.push({
        month: finalMonthKey,
        total,
        approved: true,
      });
    }

    await user.save();

    res.json({
      message: "Expense approved successfully",
      months: user.months,
    });
  } catch (err) {
    console.error("Approve expense error:", err);
    res.status(500).json({ error: "Failed to approve expense" });
  }
};


// Disapprove Expense
const disapproveExpense = async (req, res) => {
  try {
    const { username } = req.params;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    let formattedMonth;
    if (typeof month === "number") {
      formattedMonth = monthNames[month - 1];
    } else if (typeof month === "string") {
      const match = monthNames.find((m) => m.toLowerCase() === month.toLowerCase().slice(0, 3));
      formattedMonth = match || month.toUpperCase().slice(0, 3);
    }

    const finalMonthKey = `${formattedMonth}`;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Remove the month entry entirely
    user.months = user.months.filter((m) => m.month !== finalMonthKey);

    await user.save();

    res.json({
      message: "Expense disapproved successfully",
      months: user.months,
    });
  } catch (err) {
    console.error("Disapprove expense error:", err);
    res.status(500).json({ error: "Failed to disapprove expense" });
  }
};



module.exports = {
  editOtherExpense,
  deleteOtherExpense,
  deleteUserExpense,
  editUserExpense,
  deleteUser,
  addUser,
  getUserInfo,
  editUser,
  getNormalExpenses,
  getOtherExpenses,
  getAllUsers,
  resetPassword,
  getManagedUsers,
  getLastReportedDate,
  updateUsername,
  approveExpense,
  disapproveExpense,
};
