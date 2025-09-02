// controllers/adminController.js

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OtherExpense = require("../models/OtherExpense");

// ✅ NEW: Controller to edit an "Other Expense" entry
const editOtherExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { extraamount, extradescription } = req.body;

    const expense = await OtherExpense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Other expense not found" });
    }

    // Update only the provided fields
    if (extraamount !== undefined) {
      expense.extraamount = extraamount;
    }
    if (extradescription !== undefined) {
      expense.extradescription = extradescription;
    }

    // Recalculate the total
    expense.total = (expense.amount || 0) + (expense.extraamount || 0);

    await expense.save();
    res.json({ message: "Other expense updated successfully", expense });

  } catch (err) {
    console.error("Edit other expense error:", err);
    res.status(500).json({ message: "Failed to update other expense" });
  }
};


// --- Existing functions below ---

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    // The middleware has already confirmed this admin can manage this user.
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
    user.expenses = user.expenses.filter((exp) => exp._id.toString() !== expenseId);
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
    if (req.body.isSpecial === true && req.body.date) {
      user.expenses.forEach((e) => {
        if (e._id.toString() !== expenseId && e.date === req.body.date) {
          e.isSpecial = true;
        }
      });
    }
    await user.save();
    res.json({ message: "Expense updated successfully", expense });
  } catch (err) {
    console.error("Edit expense error:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};


// Add User with password hashing
const addUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      ...rest,
      password: hashedPassword,
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
    // Middleware confirms permission
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
    // The middleware ensures the admin can edit this user.
    const user = await User.findOneAndUpdate({ username }, updatedData, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Get normal expenses
const getNormalExpenses = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.expenses || []);
  } catch (err) {
    console.error("Get normal expenses error:", err);
    res.status(500).json({ error: "Failed to fetch normal expenses" });
  }
};

// Get Other Expenses
const getOtherExpenses = async (req, res) => {
  try {
    const otherExpenses = await OtherExpense.find({ username: req.params.username });
    res.json(otherExpenses);
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

const getManagedUsers = async (req, res) => {
  try {
    const loggedInAdminId = req.user.id;
    // This query finds all users where 'createdBy' matches the admin's ID
    const users = await User.find({ createdBy: loggedInAdminId }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get managed users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Middleware confirms permission
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

module.exports = {
  editOtherExpense, // ✅ Export the new function
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
};




