

const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/verifyToken");
const {
  getUserInfo,
  addExpense,
  getMyExpenses,
  editExpenseIsSpecial,
  resetPassword,
  userSubmitMonth
} = require("../controllers/userController");
const { addOtherExpenses, getMyOtherExpenses } = require("../controllers/otherExpenseController");

// Get current user info
router.get("/info", verifyToken, getUserInfo);

// Add a new expense entry (auto-special logic inside)
router.post("/add-expense", verifyToken, addExpense);
router.put("/reset-password", verifyToken, resetPassword); // ✅ New route

// Get all expenses for logged-in user
router.get("/expenses", verifyToken, getMyExpenses);

// Other expenses (separate model)
router.post("/other-expenses", verifyToken, addOtherExpenses);
router.get("/other-expenses", verifyToken, getMyOtherExpenses);
router.put("/expenses/:expenseId", verifyToken, editExpenseIsSpecial);
router.post("/submit-month", verifyToken, userSubmitMonth);


module.exports = router;


