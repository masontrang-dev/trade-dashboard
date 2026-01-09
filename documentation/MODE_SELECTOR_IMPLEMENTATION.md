# Trading Mode & Dev Mode Implementation

## Overview

Added a global trading mode selector with DAY/SWING modes and a separate DEV mode toggle. The system now supports:

- **Trading Mode**: Switch between DAY and SWING trading strategies
- **Dev Mode**: Separate development database for testing without affecting production data

## Features Implemented

### 1. Mode Selector Component (`ModeSelector.vue`)

- **Trading Mode Toggle**: Switch between DAY and SWING modes
- **Dev Mode Checkbox**: Enable/disable development mode
- **Confirmation Modal**: Requires user confirmation before switching trading modes
- **Visual Indicators**:
  - Active mode highlighted with color-coded buttons (Orange for DAY, Blue for SWING)
  - Pulsing "DEVELOPMENT" badge when in dev mode
  - Shows count of open trades that will be affected by mode change

### 2. Frontend State Management

**Location**: `TradingDashboard.vue`

**State Variables**:

```javascript
const tradingMode = ref("SWING"); // "DAY" | "SWING"
const devMode = ref(false); // true | false
```

**Features**:

- Loads mode settings from backend on startup
- Falls back to localStorage if backend unavailable
- Syncs with backend when modes are changed
- Updates dashboard title dynamically based on trading mode
- Reloads all trades after mode changes

### 3. Backend Database Support

**Location**: `backend/models/database.js`

**Dual Database System**:

- **Production DB**: `backend/database/trades.db`
- **Development DB**: `backend/database/trades_dev.db`

**Key Functions**:

- `getDb()`: Returns current active database instance
- `switchDatabase(devMode)`: Switches between prod/dev databases
- `isDevMode()`: Returns current dev mode state

**New Table**: `app_settings`

```sql
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  trading_mode TEXT NOT NULL DEFAULT 'SWING' CHECK(trading_mode IN ('DAY', 'SWING')),
  dev_mode BOOLEAN NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 4. API Endpoints

**Location**: `backend/routes/trades.js`

#### POST `/api/trades/switch-mode`

Switch trading mode (DAY/SWING)

```json
Request: { "mode": "DAY", "devMode": false }
Response: {
  "message": "Successfully switched to DAY mode",
  "mode": "DAY",
  "devMode": false,
  "openTradesCount": 5
}
```

#### POST `/api/trades/switch-dev-mode`

Switch development mode

```json
Request: { "devMode": true }
Response: {
  "message": "Successfully switched to DEVELOPMENT mode",
  "devMode": true
}
```

#### GET `/api/trades/mode-settings`

Get current mode settings

```json
Response: {
  "tradingMode": "SWING",
  "devMode": false
}
```

## Usage

### Switching Trading Mode

1. Click on DAY or SWING button in the mode selector
2. Confirm the mode change in the modal dialog
3. System will:
   - Update the mode in the database
   - Re-evaluate all open trades against new mode rules
   - Reload all trades from the database
   - Update the dashboard title

### Enabling Dev Mode

1. Check the "DEV Mode" checkbox
2. System will:
   - Switch to the development database (`trades_dev.db`)
   - Load all trades from the dev database
   - Display "DEVELOPMENT" badge
   - All new trades will be saved to dev database

### Disabling Dev Mode

1. Uncheck the "DEV Mode" checkbox
2. System will:
   - Switch back to production database (`trades.db`)
   - Load all trades from production database
   - Remove "DEVELOPMENT" badge

## Data Isolation

### Production Database

- **File**: `backend/database/trades.db`
- **Purpose**: Real trading data
- **Access**: Default mode, used for actual trading

### Development Database

- **File**: `backend/database/trades_dev.db`
- **Purpose**: Testing and development
- **Access**: Only when DEV mode is enabled
- **Benefits**:
  - Test new features without affecting real data
  - Experiment with different strategies
  - Safe environment for learning

## Technical Details

### State Persistence

- **Frontend**: localStorage + backend sync
- **Backend**: SQLite database (`app_settings` table)
- **Startup**: Loads from backend, falls back to localStorage

### Database Switching

- Closes current database connection
- Opens new database connection
- Initializes schema if database is new
- Updates global state

### Trade Re-evaluation

When switching trading modes:

1. Fetches all open trades
2. Logs count of trades to be re-evaluated
3. Returns count in API response
4. Frontend reloads all trades with new mode context

## UI Components

### Header Layout

```
[Trading Dashboard Title] [ModeSelector] [RToggle]
```

### ModeSelector Layout

```
Trading Mode: [DAY] [SWING]  |  ☑ DEV Mode [DEVELOPMENT]
```

## Color Scheme

- **DAY Mode**: Orange gradient (#f39c12 → #e67e22)
- **SWING Mode**: Blue gradient (#3498db → #2980b9)
- **DEV Mode**: Purple gradient (#9b59b6 → #8e44ad)

## Files Modified/Created

### Created:

- `frontend/src/components/ModeSelector.vue`
- `MODE_SELECTOR_IMPLEMENTATION.md`

### Modified:

- `frontend/src/components/TradingDashboard.vue`
- `frontend/src/services/api.js`
- `backend/models/database.js`
- `backend/models/Trade.js`
- `backend/routes/trades.js`

## Future Enhancements

- Add mode-specific trading rules and validations
- Implement automatic mode switching based on time of day
- Add analytics comparing DAY vs SWING performance
- Export/import dev data to production
- Add more granular mode configurations
