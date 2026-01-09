# Quick Start Guide

Get up and running with Trade Dashboard in 5 minutes.

## Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- Terminal/Command line access
- Web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### 1. Install Dependencies

Open two terminal windows and run:

**Terminal 1 - Backend:**

```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)

The backend uses default settings, but you can customize:

```bash
cd backend
cp .env.example .env
# Edit .env if you want to change the port (default: 3001)
```

## Running the Application

### Start Backend Server

In Terminal 1:

```bash
cd backend
npm run dev
```

You should see:

```
Server running on port 3001
Connected to SQLite database (PRODUCTION)
```

### Start Frontend Server

In Terminal 2:

```bash
cd frontend
npm run dev
```

You should see:

```
VITE v7.3.0  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser to: **http://localhost:5173**

## First Steps

### 1. Configure Risk Settings

Click the **Settings** button (⚙️) to configure:

- **Max Daily Loss**: $2,500 (for DAY mode)
- **Max Open Risk**: $5,000 (for SWING mode)
- **Default R Size**: $2,500 (risk per trade)
- **Tax Rates**: State 9.2%, Federal 24%
- **Margin Rate**: 8% APR

Click **Save Settings**.

### 2. Create Your First Trade

Click **+ New Trade** button:

**Example LONG Trade:**

- Symbol: `AAPL`
- Type: `LONG`
- Entry Price: `150.00`
- Stop Loss: `145.00`
- R Size: `2500` (default)

The system automatically calculates:

- Position Size: 500 shares
- Risk Amount: $2,500
- Position Value: $75,000
- Target 1: $155.00 (+1R)
- Target 2: $160.00 (+2R)

Click **Create Trade**.

### 3. Monitor Your Position

The **Active Trades** tab shows:

- Current price (live from Yahoo Finance)
- Real-time P&L
- R-multiple progress
- Risk metrics

### 4. Close a Trade

When ready to exit:

1. Click **Close** button on the trade
2. Enter exit price (pre-filled with current price)
3. Optionally set custom close date
4. Click **Confirm Close**

The system automatically calculates:

- Profit/Loss
- Tax amount (if profitable)
- Margin interest (if held > 1 day)
- Net profit

### 5. View Trade History

Click **History** tab to see:

- All closed trades
- Win/loss statistics
- Total P&L
- Average R-multiple

## Trading Modes

### SWING Mode (Default)

- Tracks total open risk across all positions
- Use for multi-day positions
- Risk limit: Max Open Risk

### DAY Mode

- Tracks daily loss limit
- Accumulates realized losses + open risk
- Resets daily
- Risk limit: Max Daily Loss

**Switch modes** using the mode selector at the top.

## Development Mode

Test without affecting production data:

1. Toggle **Dev Mode** switch
2. Creates separate `trades_dev.db` database
3. All trades go to dev database
4. Switch back to production anytime

## Common Workflows

### Day Trading Workflow

1. Switch to **DAY mode**
2. Set Max Daily Loss (e.g., $2,500)
3. Create trades with appropriate R-size
4. Monitor daily loss limit
5. Close all positions before market close
6. Review performance in History tab

### Swing Trading Workflow

1. Switch to **SWING mode**
2. Set Max Open Risk (e.g., $5,000)
3. Create trades with longer-term targets
4. Monitor aggregate risk across positions
5. Close positions at targets or stops
6. Track multi-day performance

## Tips & Tricks

### Position Sizing

- The system calculates shares automatically based on R-size and stop loss
- Adjust R-size per trade for different risk levels
- Default R-size is configurable in Settings

### R-Multiple System

- **+1R** = Made 1× your risk (100% return on risk)
- **+2R** = Made 2× your risk (200% return on risk)
- **-1R** = Lost your full risk (hit stop loss)
- Track performance in R-multiples, not just dollars

### Risk Management

- Keep risk per trade consistent (e.g., always $2,500)
- Monitor risk percentage indicator (green = safe, red = danger)
- Don't exceed your daily/open risk limits

### Market Data

- Prices update automatically from Yahoo Finance
- Cache duration: 1 minute during market hours, 1 hour after hours
- If price fails to load, uses cached or entry price

### Toggle Display

- Use **$ / R** toggle to switch between dollar and R-multiple views
- Helps visualize performance in different contexts

## Keyboard Shortcuts

Currently, the application uses mouse/click interactions. Keyboard shortcuts may be added in future versions.

## Troubleshooting

### Backend won't start

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process if needed
kill -9 <PID>
```

### Frontend won't start

```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill the process if needed
kill -9 <PID>
```

### Can't connect to backend

1. Verify backend is running on port 3001
2. Check console for errors
3. Verify `API_BASE_URL` in `frontend/src/services/api.js`

### Market prices not loading

1. Check internet connection
2. Verify symbol is correct (uppercase ticker)
3. Check browser console for API errors
4. Yahoo Finance may be temporarily unavailable

### Database errors

1. Check file permissions on `backend/database/trades.db`
2. Ensure SQLite3 is installed
3. Try creating a backup and restarting

## Next Steps

### Learn More

- **[README.md](./README.md)** - Full project overview
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference
- **[CALCULATIONS.md](./CALCULATIONS.md)** - Formula details
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development standards
- **[COMPONENT_DOCUMENTATION.md](./COMPONENT_DOCUMENTATION.md)** - Component details
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database schema

### Customize

- Adjust tax rates for your jurisdiction
- Set risk limits based on your account size
- Configure margin rate based on your broker

### Backup

```bash
cd backend/database
node backup_db.js
```

Creates timestamped backup for safety.

## Example Trading Session

### Morning Setup (9:00 AM)

1. Open application
2. Review risk settings
3. Check open positions from yesterday (SWING mode)
4. Plan today's trades

### Market Open (9:30 AM)

1. Create new trade entries
2. Monitor for entry signals
3. Enter trades with calculated position sizes

### During Market Hours

1. Monitor active positions
2. Watch for target hits
3. Adjust stops if needed (edit trade)
4. Close positions at targets or stops

### Market Close (4:00 PM)

1. Close all DAY trades
2. Review performance in History
3. Calculate win rate and average R
4. Plan for next session

### End of Day

1. Backup database (optional)
2. Review notes on each trade
3. Analyze what worked and what didn't

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error messages in browser console (F12)
3. Check backend terminal for server errors
4. Consult the full documentation

## Updates

To update the application:

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

---

**Ready to trade!** 🚀

Create your first trade and start tracking your performance with the R-multiple system.

---

**Last Updated**: January 2026
