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
      enable_alerts BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(
    `
    ALTER TABLE risk_management_settings ADD COLUMN state_tax_rate REAL DEFAULT 0.0;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding state_tax_rate column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE risk_management_settings ADD COLUMN federal_tax_rate REAL DEFAULT 0.0;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding federal_tax_rate column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE risk_management_settings ADD COLUMN margin_interest_rate REAL DEFAULT 0.0;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding margin_interest_rate column:", err.message);
      }
    }
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('LONG', 'SHORT')),
      quantity REAL NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      stop_loss REAL,
      take_profit REAL,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED', 'CANCELLED')),
      profit_loss REAL,
      risk_amount REAL,
      r_size REAL,
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(
    `
    ALTER TABLE trades ADD COLUMN strategy TEXT;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding strategy column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN position_size REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding position_size column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN target_price REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding target_price column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN tax_amount REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding tax_amount column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN margin_interest REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding margin_interest column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN state_tax_rate REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding state_tax_rate column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN federal_tax_rate REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding federal_tax_rate column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE trades ADD COLUMN margin_interest_rate REAL;
  `,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("Error adding margin_interest_rate column:", err.message);
      }
    }
  );

  db.run(`
    INSERT OR IGNORE INTO risk_management_settings (
      max_position_size, max_daily_loss, max_risk_per_trade, 
      stop_loss_percentage, take_profit_percentage, max_open_positions
    ) VALUES (1000, 500, 50, 2.0, 4.0, 5)
  `);
});

module.exports = db;
