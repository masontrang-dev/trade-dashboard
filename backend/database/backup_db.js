const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "trades.db");
const backupPath = path.join(__dirname, `trades_backup_${Date.now()}.db`);

console.log("Creating backup of production database...");
console.log("Source:", dbPath);
console.log("Backup:", backupPath);

try {
  fs.copyFileSync(dbPath, backupPath);
  console.log("✅ Backup created successfully!");
  console.log("You can now run the migration safely.");
} catch (error) {
  console.error("❌ Backup failed:", error);
  process.exit(1);
}
