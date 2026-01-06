const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database/trades.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS risk_management_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      max_position_size REAL NOT NULL DEFAULT 1000,
      max_daily_loss REAL NOT NULL DEFAULT 500,
      max_risk_per_trade REAL NOT NULL DEFAULT 50,
      stop_loss_percentage REAL NOT NULL DEFAULT 2.0,
      take_profit_percentage REAL NOT NULL DEFAULT 4.0,
      max_open_positions INTEGER NOT NULL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('BUY', 'SELL')),
      quantity REAL NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      stop_loss REAL,
      take_profit REAL,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED', 'CANCELLED')),
      profit_loss REAL,
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO risk_management_settings (
      max_position_size, max_daily_loss, max_risk_per_trade, 
      stop_loss_percentage, take_profit_percentage, max_open_positions
    ) VALUES (1000, 500, 50, 2.0, 4.0, 5)
  `);
});

module.exports = db;
