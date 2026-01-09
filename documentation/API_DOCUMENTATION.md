# API Documentation

Complete REST API reference for the Trade Dashboard backend server.

## Base URL

```
http://localhost:3001/api
```

## Table of Contents

- [Health Check](#health-check)
- [Risk Management](#risk-management)
- [Trades](#trades)
- [Mode Management](#mode-management)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

---

## Health Check

### Check API Health

**Endpoint:** `GET /health`

**Description:** Verify that the API server is running and responsive.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2026-01-08T12:00:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Server is healthy

---

## Risk Management

### Get Risk Management Settings

**Endpoint:** `GET /risk-management`

**Description:** Retrieve current risk management configuration.

**Response:**

```json
{
  "id": 1,
  "maxPositionSize": 1000,
  "maxDailyLoss": 2500,
  "maxRiskPerTrade": 50,
  "stopLossPercentage": 2.0,
  "takeProfitPercentage": 4.0,
  "maxOpenPositions": 5,
  "enableAlerts": true,
  "defaultRSize": 2500,
  "maxOpenRisk": 5000,
  "stateTaxRate": 9.2,
  "federalTaxRate": 24,
  "marginInterestRate": 8,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-08T12:00:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Settings retrieved successfully
- `500 Internal Server Error` - Database error

---

### Update Risk Management Settings

**Endpoint:** `PUT /risk-management`

**Description:** Update risk management configuration.

**Request Body:**

```json
{
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

**Fields:**

- `maxDailyLoss` (number) - Maximum daily loss limit in dollars
- `maxOpenRisk` (number) - Maximum total open risk in dollars
- `maxOpenPositions` (number) - Maximum number of concurrent positions
- `defaultRSize` (number) - Default risk per trade (1R) in dollars
- `stateTaxRate` (number) - State tax rate as percentage (e.g., 9.2 for 9.2%)
- `federalTaxRate` (number) - Federal tax rate as percentage (e.g., 24 for 24%)
- `marginInterestRate` (number) - Annual margin interest rate as percentage (e.g., 8 for 8%)
- `enableAlerts` (boolean) - Enable/disable risk alerts

**Response:**

```json
{
  "id": 1,
  "maxDailyLoss": 2500,
  "maxOpenRisk": 5000,
  "defaultRSize": 2500,
  "stateTaxRate": 9.2,
  "federalTaxRate": 24,
  "marginInterestRate": 8,
  "updatedAt": "2026-01-08T12:00:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Settings updated successfully
- `400 Bad Request` - Invalid field values
- `500 Internal Server Error` - Database error

---

## Trades

### Get All Trades

**Endpoint:** `GET /trades`

**Description:** Retrieve all trades (both open and closed), ordered by entry time descending.

**Response:**

```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "type": "LONG",
    "quantity": 500,
    "entryPrice": 150.0,
    "exitPrice": 160.0,
    "stopLoss": 145.0,
    "targetPrice1": 155.0,
    "targetPrice2": 160.0,
    "status": "CLOSED",
    "profitLoss": 5000.0,
    "riskAmount": 2500.0,
    "rSize": 2500.0,
    "taxAmount": 1660.0,
    "marginInterest": 83.33,
    "entryTime": "2026-01-01T09:30:00.000Z",
    "exitTime": "2026-01-06T15:45:00.000Z",
    "notes": "Breakout trade",
    "tradingMode": "SWING",
    "createdAt": "2026-01-01T09:30:00.000Z",
    "updatedAt": "2026-01-06T15:45:00.000Z"
  }
]
```

**Status Codes:**

- `200 OK` - Trades retrieved successfully
- `500 Internal Server Error` - Database error

---

### Get Open Trades

**Endpoint:** `GET /trades/open`

**Description:** Retrieve all open positions with current market prices and real-time P&L.

**Response:**

```json
[
  {
    "id": 2,
    "symbol": "TSLA",
    "type": "LONG",
    "quantity": 100,
    "entryPrice": 250.0,
    "stopLoss": 245.0,
    "targetPrice1": 255.0,
    "targetPrice2": 260.0,
    "status": "OPEN",
    "riskAmount": 500.0,
    "rSize": 2500.0,
    "entryTime": "2026-01-08T10:00:00.000Z",
    "notes": "Momentum play",
    "tradingMode": "DAY",
    "currentPrice": 252.5,
    "createdAt": "2026-01-08T10:00:00.000Z",
    "updatedAt": "2026-01-08T10:00:00.000Z"
  }
]
```

**Notes:**

- Processes trades in batches of 5 to avoid overwhelming the market data API
- Includes `currentPrice` field with live market data
- Excludes closed-trade-only fields (`exitPrice`, `profitLoss`, `taxAmount`, `marginInterest`)

**Status Codes:**

- `200 OK` - Open trades retrieved successfully
- `500 Internal Server Error` - Database or API error

---

### Get Closed Trades

**Endpoint:** `GET /trades/closed`

**Description:** Retrieve all closed trades, ordered by exit time descending.

**Response:**

```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "type": "LONG",
    "quantity": 500,
    "entryPrice": 150.0,
    "exitPrice": 160.0,
    "stopLoss": 145.0,
    "status": "CLOSED",
    "profitLoss": 5000.0,
    "riskAmount": 2500.0,
    "taxAmount": 1660.0,
    "marginInterest": 83.33,
    "entryTime": "2026-01-01T09:30:00.000Z",
    "exitTime": "2026-01-06T15:45:00.000Z"
  }
]
```

**Status Codes:**

- `200 OK` - Closed trades retrieved successfully
- `500 Internal Server Error` - Database error

---

### Get Trade by ID

**Endpoint:** `GET /trades/:id`

**Description:** Retrieve a specific trade by its ID. For open trades, includes current market data and P&L.

**URL Parameters:**

- `id` (integer) - Trade ID

**Response (Open Trade):**

```json
{
  "id": 2,
  "symbol": "TSLA",
  "type": "LONG",
  "quantity": 100,
  "entryPrice": 250.0,
  "status": "OPEN",
  "currentPrice": 252.5,
  "pnl": 250.0,
  "pnlPercent": 1.0,
  "entryTime": "2026-01-08T10:00:00.000Z"
}
```

**Response (Closed Trade):**

```json
{
  "id": 1,
  "symbol": "AAPL",
  "type": "LONG",
  "quantity": 500,
  "entryPrice": 150.0,
  "exitPrice": 160.0,
  "status": "CLOSED",
  "profitLoss": 5000.0,
  "exitTime": "2026-01-06T15:45:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Trade retrieved successfully
- `404 Not Found` - Trade not found
- `500 Internal Server Error` - Database error

---

### Create Trade

**Endpoint:** `POST /trades`

**Description:** Create a new trade position.

**Request Body:**

```json
{
  "symbol": "AAPL",
  "type": "LONG",
  "quantity": 500,
  "entryPrice": 150.0,
  "stopLoss": 145.0,
  "targetPrice1": 155.0,
  "targetPrice2": 160.0,
  "notes": "Breakout trade",
  "riskAmount": 2500.0,
  "rSize": 2500.0,
  "tradingMode": "SWING"
}
```

**Required Fields:**

- `symbol` (string) - Stock ticker symbol
- `type` (string) - Trade type: "LONG" or "SHORT"
- `quantity` (number) - Number of shares
- `entryPrice` (number) - Entry price per share

**Optional Fields:**

- `stopLoss` (number) - Stop loss price
- `targetPrice1` (number) - First target price
- `targetPrice2` (number) - Second target price
- `notes` (string) - Trade notes
- `riskAmount` (number) - Risk amount in dollars
- `rSize` (number) - R-size in dollars
- `tradingMode` (string) - "DAY" or "SWING"

**Response:**

```json
{
  "id": 3,
  "symbol": "AAPL",
  "type": "LONG",
  "quantity": 500,
  "entryPrice": 150.0,
  "stopLoss": 145.0,
  "status": "OPEN",
  "currentPrice": 150.25,
  "entryTime": "2026-01-08T12:00:00.000Z"
}
```

**Status Codes:**

- `201 Created` - Trade created successfully
- `400 Bad Request` - Missing required fields or invalid type
- `500 Internal Server Error` - Database error

---

### Update Trade

**Endpoint:** `PUT /trades/:id`

**Description:** Update an existing trade.

**URL Parameters:**

- `id` (integer) - Trade ID

**Request Body:**

```json
{
  "stopLoss": 147.0,
  "targetPrice1": 157.0,
  "notes": "Updated stop loss"
}
```

**Updatable Fields:**

- `symbol` (string)
- `type` (string)
- `quantity` (number)
- `entryPrice` (number)
- `stopLoss` (number)
- `targetPrice1` (number)
- `targetPrice2` (number)
- `notes` (string)
- `riskAmount` (number)
- `rSize` (number)

**Response:**

```json
{
  "id": 3,
  "changes": 1
}
```

**Status Codes:**

- `200 OK` - Trade updated successfully
- `400 Bad Request` - No fields to update
- `500 Internal Server Error` - Database error

---

### Close Trade

**Endpoint:** `POST /trades/:id/close`

**Description:** Close an open trade with exit price and calculate final P&L, taxes, and margin interest.

**URL Parameters:**

- `id` (integer) - Trade ID

**Request Body:**

```json
{
  "exitPrice": 160.0,
  "taxAmount": 1660.0,
  "marginInterest": 83.33,
  "closeDate": "2026-01-08T15:30:00.000Z"
}
```

**Required Fields:**

- `exitPrice` (number) - Exit price per share (must be > 0)

**Optional Fields:**

- `taxAmount` (number) - Override calculated tax amount
- `marginInterest` (number) - Override calculated margin interest
- `closeDate` (string) - Custom close date/time (ISO 8601 format)

**Response:**

```json
{
  "message": "Trade closed successfully",
  "tradeId": 3,
  "pnl": 5000.0,
  "pnlPercent": 6.67,
  "rMultiple": 2.0,
  "taxAmount": 1660.0,
  "marginInterest": 83.33,
  "netProfit": 3256.67
}
```

**Calculation Details:**

- **P&L**: Calculated based on trade type (LONG/SHORT)
- **Tax Amount**: Only applied to profitable trades using configured tax rates
- **Margin Interest**: Calculated based on position size, margin rate, and days held (only if held > 1 day)
- **Net Profit**: Gross P&L minus taxes and margin interest

**Status Codes:**

- `200 OK` - Trade closed successfully
- `400 Bad Request` - Invalid exit price or missing required fields
- `404 Not Found` - Trade not found or already closed
- `500 Internal Server Error` - Database error

---

### Delete Trade

**Endpoint:** `DELETE /trades/:id`

**Description:** Permanently delete a trade.

**URL Parameters:**

- `id` (integer) - Trade ID

**Response:**

```json
{
  "message": "Trade deleted successfully"
}
```

**Status Codes:**

- `200 OK` - Trade deleted successfully
- `404 Not Found` - Trade not found
- `500 Internal Server Error` - Database error

---

## Mode Management

### Switch Trading Mode

**Endpoint:** `POST /trades/switch-mode`

**Description:** Switch between DAY and SWING trading modes.

**Request Body:**

```json
{
  "mode": "DAY",
  "devMode": false
}
```

**Required Fields:**

- `mode` (string) - Trading mode: "DAY" or "SWING"

**Optional Fields:**

- `devMode` (boolean) - Current dev mode state (for response)

**Response:**

```json
{
  "message": "Successfully switched to DAY mode",
  "mode": "DAY",
  "devMode": false,
  "openTradesCount": 3
}
```

**Status Codes:**

- `200 OK` - Mode switched successfully
- `400 Bad Request` - Invalid mode value
- `500 Internal Server Error` - Database error

---

### Switch Development Mode

**Endpoint:** `POST /trades/switch-dev-mode`

**Description:** Switch between production and development databases.

**Request Body:**

```json
{
  "devMode": true
}
```

**Required Fields:**

- `devMode` (boolean) - true for development, false for production

**Response:**

```json
{
  "message": "Successfully switched to DEVELOPMENT mode",
  "devMode": true
}
```

**Notes:**

- Switches between `trades.db` (production) and `trades_dev.db` (development)
- All subsequent API calls will use the selected database
- Useful for testing without affecting production data

**Status Codes:**

- `200 OK` - Dev mode switched successfully
- `400 Bad Request` - Invalid devMode value
- `500 Internal Server Error` - Database error

---

### Get Mode Settings

**Endpoint:** `GET /trades/mode-settings`

**Description:** Retrieve current trading mode and dev mode settings.

**Response:**

```json
{
  "tradingMode": "SWING",
  "devMode": false
}
```

**Status Codes:**

- `200 OK` - Settings retrieved successfully
- `500 Internal Server Error` - Database error

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters or body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server or database error

### Error Examples

**Missing Required Fields:**

```json
{
  "error": "Missing required fields: symbol, type, quantity, entryPrice"
}
```

**Invalid Trade Type:**

```json
{
  "error": "Type must be either LONG or SHORT"
}
```

**Trade Not Found:**

```json
{
  "error": "Trade not found"
}
```

**Database Error:**

```json
{
  "error": "Failed to load open trades",
  "details": "SQLITE_ERROR: no such table: trades"
}
```

---

## Data Models

### Trade Model

```typescript
interface Trade {
  id: number;
  symbol: string;
  type: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  targetPrice1?: number;
  targetPrice2?: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  profitLoss?: number;
  riskAmount?: number;
  rSize?: number;
  entryTime: string; // ISO 8601 datetime
  exitTime?: string; // ISO 8601 datetime
  notes?: string;
  strategy?: string;
  positionSize?: number;
  taxAmount?: number;
  marginInterest?: number;
  stateTaxRate?: number;
  federalTaxRate?: number;
  marginInterestRate?: number;
  tradingMode?: "DAY" | "SWING";
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  currentPrice?: number; // Only for open trades
}
```

### Risk Management Settings Model

```typescript
interface RiskManagementSettings {
  id: number;
  maxPositionSize: number;
  maxDailyLoss: number;
  maxRiskPerTrade: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxOpenPositions: number;
  enableAlerts: boolean;
  defaultRSize: number;
  maxOpenRisk: number;
  stateTaxRate: number;
  federalTaxRate: number;
  marginInterestRate: number;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
}
```

### App Settings Model

```typescript
interface AppSettings {
  id: number;
  tradingMode: "DAY" | "SWING";
  devMode: boolean;
  updatedAt: string; // ISO 8601 datetime
}
```

---

## Rate Limiting

### Market Data API

The Yahoo Finance API integration includes rate limiting:

- **Rate Limit**: 10 requests per minute
- **Batch Processing**: Open trades are processed in batches of 5
- **Caching**: Prices are cached for 1 minute during market hours, 1 hour outside market hours
- **Fallback**: Uses cached prices if API is unavailable

### Market Hours

- **Trading Hours**: 9:30 AM - 4:00 PM ET, Monday-Friday
- **Outside Hours**: Extended caching and fallback to last known prices

---

## Authentication

Currently, the API does not implement authentication. All endpoints are publicly accessible on localhost.

**Security Note**: This application is designed for local development and personal use. If deploying to a public server, implement proper authentication and authorization.

---

## CORS Configuration

CORS is enabled for all origins in development mode. Modify `backend/server.js` for production deployment.

---

## Versioning

**Current Version**: 1.3.0

The API does not currently use versioning in the URL path. Breaking changes will be documented in release notes.

---

## Support

For API issues or questions:

1. Check the error response for details
2. Review server logs in the terminal
3. Consult the [CALCULATIONS.md](./CALCULATIONS.md) for formula details
4. Refer to the [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for implementation details

---

**Last Updated**: January 2026
