# Trade Dashboard Backend

Node.js backend for the trade dashboard application with SQLite database for storing risk management settings and trades.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

Or start production server:

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Risk Management Settings

- `GET /api/risk-management` - Get current risk management settings
- `PUT /api/risk-management` - Update risk management settings

### Trades

- `GET /api/trades` - Get all trades
- `GET /api/trades/open` - Get open positions
- `GET /api/trades/:id` - Get specific trade
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

## Database

SQLite database with two main tables:

- `risk_management_settings` - Stores risk management parameters
- `trades` - Stores trade records

The database file is created automatically at `database/trades.db` when the server starts.
