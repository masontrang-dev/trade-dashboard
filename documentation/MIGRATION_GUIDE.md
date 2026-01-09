# Database Migration Guide: snake_case → camelCase

## Overview

This migration converts all database columns from snake_case to camelCase for consistency across the entire application. It also properly renames target fields:

- `take_profit` → `targetPrice1` (Target 1)
- `target_price` → `targetPrice2` (Target 2)

## Migration Steps

### 1. Backup Your Database (IMPORTANT!)

Before running the migration, **backup your production database**:

```bash
cd backend/database
cp trades.db trades.db.backup
cp trades_dev.db trades_dev.db.backup
```

### 2. Run the Migration

```bash
cd backend
node database/migrate_to_camelcase.js
```

The migration script will:

- ✅ Migrate both PRODUCTION and DEVELOPMENT databases
- ✅ Convert all column names to camelCase
- ✅ Rename `take_profit` → `targetPrice1`
- ✅ Rename `target_price` → `targetPrice2`
- ✅ Remove duplicate fields
- ✅ Preserve all existing data
- ✅ Use transactions (rollback on error)

### 3. Verify Migration

After migration, verify the changes:

```bash
# Check production database
sqlite3 backend/database/trades.db "PRAGMA table_info(trades);"

# Check development database
sqlite3 backend/database/trades_dev.db "PRAGMA table_info(trades);"
```

You should see camelCase column names like:

- `entryPrice` (was `entry_price`)
- `stopLoss` (was `stop_loss`)
- `targetPrice1` (was `take_profit`)
- `targetPrice2` (was `target_price`)
- `profitLoss` (was `profit_loss`)
- etc.

### 4. Restart the Application

```bash
# Backend
cd backend
npm start

# Frontend (in separate terminal)
cd frontend
npm run dev
```

## What Changed

### Database Schema

**Trades Table:**

- `entry_price` → `entryPrice`
- `exit_price` → `exitPrice`
- `stop_loss` → `stopLoss`
- `take_profit` → `targetPrice1` ⭐ (renamed)
- `target_price` → `targetPrice2` ⭐ (renamed)
- `profit_loss` → `profitLoss`
- `risk_amount` → `riskAmount`
- `r_size` → `rSize`
- `entry_time` → `entryTime`
- `exit_time` → `exitTime`
- `position_size` → `positionSize`
- `tax_amount` → `taxAmount`
- `margin_interest` → `marginInterest`
- `state_tax_rate` → `stateTaxRate`
- `federal_tax_rate` → `federalTaxRate`
- `margin_interest_rate` → `marginInterestRate`
- `trading_mode` → `tradingMode`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

**Risk Management Settings Table:**

- `max_position_size` → `maxPositionSize`
- `max_daily_loss` → `maxDailyLoss`
- `max_risk_per_trade` → `maxRiskPerTrade`
- `stop_loss_percentage` → `stopLossPercentage`
- `take_profit_percentage` → `takeProfitPercentage`
- `max_open_positions` → `maxOpenPositions`
- `enable_alerts` → `enableAlerts`
- `state_tax_rate` → `stateTaxRate`
- `federal_tax_rate` → `federalTaxRate`
- `margin_interest_rate` → `marginInterestRate`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

**App Settings Table:**

- `trading_mode` → `tradingMode`
- `dev_mode` → `devMode`
- `updated_at` → `updatedAt`

### Backend Changes

- ✅ Trade model updated to use camelCase
- ✅ RiskManagementSettings model updated (field mapping removed)
- ✅ All routes updated to use camelCase
- ✅ Database schema initialization updated

### Frontend Changes

- ✅ Removed all field mapping in components
- ✅ Backend now returns camelCase directly
- ✅ Cleaner, more maintainable code

## Rollback (If Needed)

If you need to rollback:

```bash
cd backend/database
rm trades.db trades_dev.db
mv trades.db.backup trades.db
mv trades_dev.db.backup trades_dev.db
```

Then restart the application with the old code (git checkout previous commit).

## API Changes

### Before (snake_case):

```json
{
  "entry_price": 150.0,
  "stop_loss": 145.0,
  "take_profit": 155.0,
  "profit_loss": 500.0
}
```

### After (camelCase):

```json
{
  "entryPrice": 150.0,
  "stopLoss": 145.0,
  "targetPrice1": 155.0,
  "targetPrice2": 160.0,
  "profitLoss": 500.0
}
```

## Notes

- ⚠️ **Breaking Change**: This is a breaking change. The old API format will not work after migration.
- ✅ **Data Preserved**: All your trade data is preserved during migration.
- ✅ **Atomic**: Migration uses transactions - either all changes succeed or none do.
- 🎯 **Consistency**: Frontend and backend now use identical field names.

## Support

If you encounter any issues during migration:

1. Check the migration script output for errors
2. Verify database backups exist
3. Check application logs for any errors
4. Restore from backup if needed
