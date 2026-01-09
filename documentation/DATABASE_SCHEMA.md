# Database Schema Documentation

Complete documentation of the SQLite database schema for the Trade Dashboard application.

## Table of Contents

- [Overview](#overview)
- [Database Files](#database-files)
- [Tables](#tables)
  - [trades](#trades-table)
  - [risk_management_settings](#risk_management_settings-table)
  - [app_settings](#app_settings-table)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migrations](#migrations)
- [Backup and Restore](#backup-and-restore)

---

## Overview

The Trade Dashboard uses SQLite as its database engine. SQLite is a serverless, self-contained SQL database that stores data in a single file, making it ideal for desktop and small-scale applications.

### Key Characteristics

- **Database Engine**: SQLite 3
- **Location**: `backend/database/`
- **Naming Convention**: camelCase for column names (standardized in v1.2)
- **Timestamps**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Auto-increment**: Used for primary keys

---

## Database Files

### Production Database

**File**: `backend/database/trades.db`

Used for live trading data. This is the default database when the application starts.

### Development Database

**File**: `backend/database/trades_dev.db`

Used for testing and development. Switch to this database using the dev mode toggle to avoid affecting production data.

### Backup Files

**Pattern**: `backend/database/trades_backup_YYYYMMDD_HHMMSS.db`

Timestamped backup files created by the backup utility.

---

## Tables

### trades Table

Stores all trade records, both open and closed positions.

#### Schema

```sql
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
```

#### Columns

| Column             | Type     | Nullable | Default | Description                                    |
| ------------------ | -------- | -------- | ------- | ---------------------------------------------- |
| id                 | INTEGER  | NO       | AUTO    | Primary key, auto-increment                    |
| symbol             | TEXT     | NO       | -       | Stock ticker symbol (e.g., "AAPL")             |
| type               | TEXT     | NO       | -       | Trade type: "LONG" or "SHORT"                  |
| quantity           | REAL     | NO       | -       | Number of shares                               |
| entryPrice         | REAL     | NO       | -       | Entry price per share                          |
| exitPrice          | REAL     | YES      | NULL    | Exit price per share (closed trades only)      |
| stopLoss           | REAL     | YES      | NULL    | Stop loss price                                |
| targetPrice1       | REAL     | YES      | NULL    | First target price (+1R)                       |
| targetPrice2       | REAL     | YES      | NULL    | Second target price (+2R)                      |
| status             | TEXT     | NO       | 'OPEN'  | Trade status: "OPEN", "CLOSED", or "CANCELLED" |
| profitLoss         | REAL     | YES      | NULL    | Gross profit/loss in dollars                   |
| riskAmount         | REAL     | YES      | NULL    | Risk amount in dollars (1R)                    |
| rSize              | REAL     | YES      | NULL    | R-size configuration at trade entry            |
| entryTime          | DATETIME | NO       | NOW     | Trade entry timestamp (ISO 8601)               |
| exitTime           | DATETIME | YES      | NULL    | Trade exit timestamp (ISO 8601)                |
| notes              | TEXT     | YES      | NULL    | User notes about the trade                     |
| strategy           | TEXT     | YES      | NULL    | Trading strategy used                          |
| positionSize       | REAL     | YES      | NULL    | Total position value (entryPrice × quantity)   |
| taxAmount          | REAL     | YES      | NULL    | Tax amount on profit                           |
| marginInterest     | REAL     | YES      | NULL    | Margin interest charged                        |
| stateTaxRate       | REAL     | YES      | NULL    | State tax rate used (%)                        |
| federalTaxRate     | REAL     | YES      | NULL    | Federal tax rate used (%)                      |
| marginInterestRate | REAL     | YES      | NULL    | Margin interest rate used (% APR)              |
| tradingMode        | TEXT     | YES      | NULL    | Trading mode: "DAY" or "SWING"                 |
| createdAt          | DATETIME | NO       | NOW     | Record creation timestamp                      |
| updatedAt          | DATETIME | NO       | NOW     | Record last update timestamp                   |

#### Constraints

- **Primary Key**: `id`
- **Check Constraints**:
  - `type IN ('LONG', 'SHORT')`
  - `status IN ('OPEN', 'CLOSED', 'CANCELLED')`
  - `tradingMode IN ('DAY', 'SWING')`

#### Indexes

Recommended indexes for performance:

```sql
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_entry_time ON trades(entryTime DESC);
CREATE INDEX idx_trades_exit_time ON trades(exitTime DESC);
```

#### Example Records

**Open Trade:**

```json
{
  "id": 1,
  "symbol": "AAPL",
  "type": "LONG",
  "quantity": 500,
  "entryPrice": 150.0,
  "exitPrice": null,
  "stopLoss": 145.0,
  "targetPrice1": 155.0,
  "targetPrice2": 160.0,
  "status": "OPEN",
  "profitLoss": null,
  "riskAmount": 2500.0,
  "rSize": 2500.0,
  "entryTime": "2026-01-08T09:30:00.000Z",
  "exitTime": null,
  "notes": "Breakout trade",
  "tradingMode": "SWING",
  "createdAt": "2026-01-08T09:30:00.000Z",
  "updatedAt": "2026-01-08T09:30:00.000Z"
}
```

**Closed Trade:**

```json
{
  "id": 2,
  "symbol": "TSLA",
  "type": "SHORT",
  "quantity": 200,
  "entryPrice": 250.0,
  "exitPrice": 240.0,
  "stopLoss": 255.0,
  "status": "CLOSED",
  "profitLoss": 2000.0,
  "riskAmount": 1000.0,
  "rSize": 2500.0,
  "taxAmount": 664.0,
  "marginInterest": 27.78,
  "entryTime": "2026-01-05T10:00:00.000Z",
  "exitTime": "2026-01-08T15:30:00.000Z",
  "notes": "Reversal trade",
  "tradingMode": "DAY",
  "createdAt": "2026-01-05T10:00:00.000Z",
  "updatedAt": "2026-01-08T15:30:00.000Z"
}
```

---

### risk_management_settings Table

Stores user-configurable risk management parameters.

#### Schema

```sql
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
```

#### Columns

| Column               | Type     | Nullable | Default | Description                                  |
| -------------------- | -------- | -------- | ------- | -------------------------------------------- |
| id                   | INTEGER  | NO       | AUTO    | Primary key, auto-increment                  |
| maxPositionSize      | REAL     | NO       | 1000    | Maximum position size in dollars (legacy)    |
| maxDailyLoss         | REAL     | NO       | 500     | Maximum daily loss limit in dollars          |
| maxRiskPerTrade      | REAL     | NO       | 50      | Maximum risk per trade in dollars (legacy)   |
| stopLossPercentage   | REAL     | NO       | 2.0     | Default stop loss percentage (legacy)        |
| takeProfitPercentage | REAL     | NO       | 4.0     | Default take profit percentage (legacy)      |
| maxOpenPositions     | INTEGER  | NO       | 5       | Maximum number of concurrent positions       |
| enableAlerts         | BOOLEAN  | NO       | 1       | Enable/disable risk alerts (1=true, 0=false) |
| defaultRSize         | REAL     | YES      | 2500    | Default risk per trade (1R) in dollars       |
| maxOpenRisk          | REAL     | YES      | 2000    | Maximum total open risk in dollars           |
| stateTaxRate         | REAL     | YES      | 0.0     | State tax rate as percentage (e.g., 9.2)     |
| federalTaxRate       | REAL     | YES      | 0.0     | Federal tax rate as percentage (e.g., 24)    |
| marginInterestRate   | REAL     | YES      | 0.0     | Annual margin interest rate (e.g., 8)        |
| createdAt            | DATETIME | NO       | NOW     | Record creation timestamp                    |
| updatedAt            | DATETIME | NO       | NOW     | Record last update timestamp                 |

#### Constraints

- **Primary Key**: `id`
- Only one record should exist (enforced by application logic)

#### Default Values

```json
{
  "id": 1,
  "maxDailyLoss": 2500,
  "maxOpenRisk": 5000,
  "maxOpenPositions": 5,
  "defaultRSize": 2500,
  "stateTaxRate": 9.2,
  "federalTaxRate": 24,
  "marginInterestRate": 8,
  "enableAlerts": true
}
```

#### Notes

- **Legacy Fields**: `maxPositionSize`, `maxRiskPerTrade`, `stopLossPercentage`, `takeProfitPercentage` are maintained for backward compatibility but not actively used
- **Active Fields**: `defaultRSize`, `maxDailyLoss`, `maxOpenRisk` are the primary risk management parameters
- **Tax Rates**: Stored as percentages (9.2 = 9.2%, not 0.092)

---

### app_settings Table

Stores application-level settings and state.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  tradingMode TEXT NOT NULL DEFAULT 'SWING' CHECK(tradingMode IN ('DAY', 'SWING')),
  devMode BOOLEAN NOT NULL DEFAULT 0,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Columns

| Column      | Type     | Nullable | Default | Description                            |
| ----------- | -------- | -------- | ------- | -------------------------------------- |
| id          | INTEGER  | NO       | 1       | Primary key, constrained to 1          |
| tradingMode | TEXT     | NO       | 'SWING' | Current trading mode: "DAY" or "SWING" |
| devMode     | BOOLEAN  | NO       | 0       | Development mode flag (1=dev, 0=prod)  |
| updatedAt   | DATETIME | NO       | NOW     | Record last update timestamp           |

#### Constraints

- **Primary Key**: `id`
- **Check Constraints**:
  - `id = 1` (ensures only one record)
  - `tradingMode IN ('DAY', 'SWING')`

#### Example Record

```json
{
  "id": 1,
  "tradingMode": "SWING",
  "devMode": 0,
  "updatedAt": "2026-01-08T12:00:00.000Z"
}
```

#### Notes

- Only one record exists in this table
- Used to persist application state across restarts
- `devMode` is stored but database switching is handled in-memory

---

## Indexes

### Recommended Indexes

For optimal query performance, create these indexes:

```sql
-- Trades table indexes
CREATE INDEX IF NOT EXISTS idx_trades_status
  ON trades(status);

CREATE INDEX IF NOT EXISTS idx_trades_symbol
  ON trades(symbol);

CREATE INDEX IF NOT EXISTS idx_trades_entry_time
  ON trades(entryTime DESC);

CREATE INDEX IF NOT EXISTS idx_trades_exit_time
  ON trades(exitTime DESC);

CREATE INDEX IF NOT EXISTS idx_trades_trading_mode
  ON trades(tradingMode);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_trades_status_entry
  ON trades(status, entryTime DESC);
```

### Index Usage

- **idx_trades_status**: Used by `getOpenPositions()` and `getClosedTrades()`
- **idx_trades_symbol**: Used for filtering by symbol
- **idx_trades_entry_time**: Used for sorting open trades
- **idx_trades_exit_time**: Used for sorting closed trades
- **idx_trades_status_entry**: Optimizes combined status + time queries

---

## Constraints

### Primary Keys

All tables use auto-incrementing integer primary keys:

- `trades.id`
- `risk_management_settings.id`
- `app_settings.id` (constrained to 1)

### Check Constraints

#### trades Table

```sql
CHECK(type IN ('LONG', 'SHORT'))
CHECK(status IN ('OPEN', 'CLOSED', 'CANCELLED'))
CHECK(tradingMode IN ('DAY', 'SWING'))
```

#### app_settings Table

```sql
CHECK(id = 1)
CHECK(tradingMode IN ('DAY', 'SWING'))
```

### Foreign Keys

Currently, no foreign key relationships exist between tables. Each table is independent.

### Not Null Constraints

Critical fields that cannot be null:

- `trades.symbol`
- `trades.type`
- `trades.quantity`
- `trades.entryPrice`
- `trades.status`
- `risk_management_settings.*` (most fields)
- `app_settings.*` (all fields)

---

## Migrations

### Migration Strategy

Database schema changes are handled through migration scripts in `backend/database/migrations/`.

### Migration Script Pattern

```javascript
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../trades.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Backup first
  console.log("Creating backup...");

  // Run migration
  db.run(`ALTER TABLE trades ADD COLUMN newField TEXT`, (err) => {
    if (err) {
      console.error("Migration failed:", err);
    } else {
      console.log("Migration successful");
    }
  });
});

db.close();
```

### Existing Migrations

#### migrate_to_camelcase.js

Converts legacy snake_case column names to camelCase:

- `entry_price` → `entryPrice`
- `stop_loss` → `stopLoss`
- `profit_loss` → `profitLoss`
- etc.

#### migrate_add_tax_rates.js

Adds tax rate columns to tables:

- `stateTaxRate`
- `federalTaxRate`

#### migrate_tax_and_interest.js

Adds margin interest fields:

- `marginInterest`
- `marginInterestRate`

### Running Migrations

```bash
cd backend/database
node migrations/migrate_to_camelcase.js
```

**Important**: Always backup the database before running migrations!

---

## Backup and Restore

### Creating Backups

#### Manual Backup

```bash
cd backend/database
node backup_db.js
```

Creates: `trades_backup_YYYYMMDD_HHMMSS.db`

#### Programmatic Backup

```javascript
const fs = require("fs");
const path = require("path");

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(__dirname, `trades_backup_${timestamp}.db`);
fs.copyFileSync("trades.db", backupPath);
```

### Restoring from Backup

```bash
cd backend/database
cp trades_backup_20260108_120000.db trades.db
```

**Warning**: This will overwrite the current database!

### Backup Best Practices

1. **Before Migrations**: Always backup before schema changes
2. **Regular Backups**: Schedule periodic backups for production
3. **Test Restores**: Periodically test backup restoration
4. **Version Control**: Don't commit database files to git
5. **Separate Dev/Prod**: Use different databases for testing

---

## Data Types

### SQLite Type Affinity

SQLite uses dynamic typing with type affinity:

| Declared Type | Affinity | Usage                           |
| ------------- | -------- | ------------------------------- |
| INTEGER       | INTEGER  | IDs, counts, booleans (0/1)     |
| REAL          | REAL     | Prices, quantities, percentages |
| TEXT          | TEXT     | Symbols, notes, enums           |
| DATETIME      | TEXT     | ISO 8601 timestamps             |
| BOOLEAN       | INTEGER  | Flags (0=false, 1=true)         |

### Precision

- **Monetary Values**: Stored as REAL, rounded to 2 decimal places in application
- **Quantities**: Stored as REAL to support fractional shares (future)
- **Percentages**: Stored as REAL (9.2 = 9.2%, not 0.092)
- **Timestamps**: ISO 8601 strings with milliseconds

---

## Query Examples

### Get All Open Trades

```sql
SELECT * FROM trades
WHERE status = 'OPEN'
ORDER BY entryTime DESC;
```

### Get Closed Trades for Today

```sql
SELECT * FROM trades
WHERE status = 'CLOSED'
  AND DATE(exitTime) = DATE('now')
ORDER BY exitTime DESC;
```

### Calculate Total Open Risk

```sql
SELECT SUM(riskAmount) as totalRisk
FROM trades
WHERE status = 'OPEN';
```

### Get Win Rate

```sql
SELECT
  COUNT(*) as totalTrades,
  SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) as wins,
  (SUM(CASE WHEN profitLoss > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as winRate
FROM trades
WHERE status = 'CLOSED';
```

### Get Trades by Symbol

```sql
SELECT * FROM trades
WHERE symbol = 'AAPL'
ORDER BY entryTime DESC;
```

---

## Maintenance

### Database Size

Monitor database size:

```bash
ls -lh backend/database/trades.db
```

### Vacuum Database

Reclaim unused space:

```sql
VACUUM;
```

Run periodically to optimize database file size.

### Integrity Check

Verify database integrity:

```sql
PRAGMA integrity_check;
```

Should return: `ok`

### Analyze Statistics

Update query optimizer statistics:

```sql
ANALYZE;
```

Run after significant data changes.

---

## Security Considerations

### File Permissions

Ensure database files have appropriate permissions:

```bash
chmod 600 backend/database/trades.db
```

### SQL Injection Prevention

Always use parameterized queries:

```javascript
// ✅ Correct
db.run("SELECT * FROM trades WHERE id = ?", [id]);

// ❌ Wrong
db.run(`SELECT * FROM trades WHERE id = ${id}`);
```

### Backup Security

- Store backups in secure location
- Encrypt sensitive backups
- Limit access to database files

---

## Troubleshooting

### Database Locked

**Error**: `SQLITE_BUSY: database is locked`

**Solution**:

1. Close all connections
2. Check for long-running transactions
3. Increase timeout: `db.configure("busyTimeout", 5000)`

### Corrupted Database

**Error**: `SQLITE_CORRUPT: database disk image is malformed`

**Solution**:

1. Restore from backup
2. Try recovery: `sqlite3 trades.db ".recover" | sqlite3 recovered.db`

### Missing Columns

**Error**: `SQLITE_ERROR: no such column: columnName`

**Solution**:

1. Check if migration was run
2. Verify schema version
3. Run appropriate migration script

---

## Version History

- **v1.0** - Initial schema with snake_case columns
- **v1.1** - Added tax and margin interest fields
- **v1.2** - Migrated to camelCase column names
- **v1.3** - Added app_settings table for mode persistence

---

**Last Updated**: January 2026
