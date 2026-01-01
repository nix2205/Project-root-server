const cron = require("node-cron");
const cleanupOldExpenses = require("../services/cleanupOldExpenses");

cron.schedule("5 0 1 * *", async () => {
  // Runs at 00:05 on the 1st of every month
  try {
    console.log("🚀 Running monthly cleanup job...");
    await cleanupOldExpenses();
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  }
});
