


// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// --- existing routes ---
router.post("/add-user", adminController.addUser);
router.get("/user/:username", adminController.getUserInfo);
router.put("/edit-user/:username", adminController.editUser);
router.put("/update-username/:username", adminController.updateUsername);

router.get("/users", adminController.getAllUsers);
router.get("/normal-expenses/:username", adminController.getNormalExpenses);
router.get("/other-expenses/:username", adminController.getOtherExpenses);
router.put("/reset-password/:username", adminController.resetPassword);
router.put("/expense/:username/:expenseId", adminController.editUserExpense);
router.delete("/expense/:username/:expenseId", adminController.deleteUserExpense);
router.delete("/other-expense/:id", adminController.deleteOtherExpense);
router.delete("/user/:username", adminController.deleteUser);
router.put("/other-expense/:id", adminController.editOtherExpense);
router.get("/last-reported/:username", adminController.getLastReportedDate);
router.put("/approve-month/:username", adminController.adminApproveMonth);


module.exports = router;




