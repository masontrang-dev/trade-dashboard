const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Global state for current mode
let currentDevMode = false;

// Database paths
const prodDbPath = path.join(__dirname, "../database/trades.db");
const devDbPath = path.join(__dirname, "../database/trades_dev.db");

// Initialize with production database
let db = new sqlite3.Database(prodDbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database (PRODUCTION)");
  }
});

// Function to switch database
const switchDatabase = (devMode) => {
  return new Promise((resolve, reject) => {
    const newDbPath = devMode ? devDbPath : prodDbPath;
    const modeLabel = devMode ? "DEVELOPMENT" : "PRODUCTION";

    // Close current database
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
        return reject(err);
      }

      // Open new database
      db = new sqlite3.Database(newDbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err.message);
          return reject(err);
        }

        currentDevMode = devMode;
        console.log(`Switched to ${modeLabel} database`);

        // Initialize schema for new database
        initializeSchema();
        resolve();
      });
    });
  });
};

// Get current database instance
const getDb = () => db;

// Get current dev mode state
const isDevMode = () => currentDevMode;

// Initialize schema on startup
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS risk_management_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maxPositionSize REAL NOT NULL DEFAULT 1000,
      maxDailyLoss REAL NOT NULL DEFAULT 500,
      maxRiskPerTrade REAL NOT NULL DEFAULT 50,
      stopLossPercentage REAL NOT NULL DEFAULT 2.0,
      takeProfitPercentage REAL NOT NULL DEFAULT 4.0,
      maxOpenPositions INTEGER NOT NULL DEFAULT 5,
      enableAlerts BOOLEAN NOT NULL DEFAULT 1,
      defaultRSize REAL DEFAULT 2500,
      maxOpenRisk REAL DEFAULT 2000,
      stateTaxRate REAL DEFAULT 0.0,
      federalTaxRate REAL DEFAULT 0.0,
      marginInterestRate REAL DEFAULT 0.0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Legacy ALTER TABLE statements removed - schema now includes all fields

  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('LONG', 'SHORT')),
      quantity REAL NOT NULL,
      entryPrice REAL NOT NULL,
      exitPrice REAL,
      stopLoss REAL,
      targetPrice1 REAL,
      targetPrice2 REAL,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED', 'CANCELLED')),
      profitLoss REAL,
      riskAmount REAL,
      rSize REAL,
      entryTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      exitTime DATETIME,
      notes TEXT,
      strategy TEXT,
      positionSize REAL,
      taxAmount REAL,
      marginInterest REAL,
      stateTaxRate REAL,
      federalTaxRate REAL,
      marginInterestRate REAL,
      tradingMode TEXT CHECK(tradingMode IN ('DAY', 'SWING')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Legacy ALTER TABLE statements removed - schema now includes all fields

  db.run(`
    INSERT OR IGNORE INTO risk_management_settings (
      maxPositionSize, maxDailyLoss, maxRiskPerTrade, 
      stopLossPercentage, takeProfitPercentage, maxOpenPositions
    ) VALUES (1000, 500, 50, 2.0, 4.0, 5)
  `);

  // Create app_settings table for storing mode state
  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      tradingMode TEXT NOT NULL DEFAULT 'SWING' CHECK(tradingMode IN ('DAY', 'SWING')),
      devMode BOOLEAN NOT NULL DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO app_settings (id, tradingMode, devMode)
    VALUES (1, 'SWING', 0)
  `);
});

// Function to initialize schema (used when switching databases)
const initializeSchema = () => {
  db.serialize(() => {
    // Copy all the schema creation logic here for new databases
    db.run(`
      CREATE TABLE IF NOT EXISTS risk_management_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maxPositionSize REAL NOT NULL DEFAULT 1000,
        maxDailyLoss REAL NOT NULL DEFAULT 500,
        maxRiskPerTrade REAL NOT NULL DEFAULT 50,
        stopLossPercentage REAL NOT NULL DEFAULT 2.0,
        takeProfitPercentage REAL NOT NULL DEFAULT 4.0,
        maxOpenPositions INTEGER NOT NULL DEFAULT 5,
        enableAlerts BOOLEAN NOT NULL DEFAULT 1,
        defaultRSize REAL DEFAULT 2500,
        maxOpenRisk REAL DEFAULT 2000,
        stateTaxRate REAL DEFAULT 0.0,
        federalTaxRate REAL DEFAULT 0.0,
        marginInterestRate REAL DEFAULT 0.0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('LONG', 'SHORT')),
        quantity REAL NOT NULL,
        entryPrice REAL NOT NULL,
        exitPrice REAL,
        stopLoss REAL,
        targetPrice1 REAL,
        targetPrice2 REAL,
        status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'CLOSED', 'CANCELLED')),
        profitLoss REAL,
        riskAmount REAL,
        rSize REAL,
        entryTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        exitTime DATETIME,
        notes TEXT,
        strategy TEXT,
        positionSize REAL,
        taxAmount REAL,
        marginInterest REAL,
        stateTaxRate REAL,
        federalTaxRate REAL,
        marginInterestRate REAL,
        tradingMode TEXT CHECK(tradingMode IN ('DAY', 'SWING')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        tradingMode TEXT NOT NULL DEFAULT 'SWING' CHECK(tradingMode IN ('DAY', 'SWING')),
        devMode BOOLEAN NOT NULL DEFAULT 0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO risk_management_settings (
        maxPositionSize, maxDailyLoss, maxRiskPerTrade, 
        stopLossPercentage, takeProfitPercentage, maxOpenPositions
      ) VALUES (1000, 500, 50, 2.0, 4.0, 5)
    `);

    db.run(`
      INSERT OR IGNORE INTO app_settings (id, tradingMode, devMode)
      VALUES (1, 'SWING', 0)
    `);
  });
};

module.exports = {
  getDb,
  switchDatabase,
  isDevMode,
};
