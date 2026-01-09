# Trade Dashboard

A comprehensive trading management system for day and swing traders, featuring real-time position tracking, risk management, and performance analytics using the R-multiple methodology.

## 🎯 Overview

Trade Dashboard is a full-stack web application designed to help traders manage their positions, track risk exposure, and analyze trading performance. The system supports both day trading and swing trading modes with separate risk tracking methodologies.

### Key Features

- **Real-time Position Tracking** - Monitor open positions with live market data
- **R-Multiple System** - Position sizing and performance tracking using Van Tharp's R-multiple methodology
- **Risk Management** - Automated risk calculations with configurable limits
- **Dual Trading Modes** - Separate DAY and SWING modes with different risk tracking
- **Tax & Margin Calculations** - Automatic calculation of taxes and margin interest
- **Performance Analytics** - Comprehensive trade history with win/loss analysis
- **Development Mode** - Separate database for testing without affecting production data

## 📋 Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Database](#database)

## 🏗 Architecture

The application follows a client-server architecture:

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   (Vue 3)       │ ◄─────► │   (Express)     │
│   Port: 5173    │   HTTP  │   Port: 3001    │
└─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   SQLite DB     │
                            │  (trades.db)    │
                            └─────────────────┘
```

### Components

- **Frontend**: Vue 3 SPA with Vite build system
- **Backend**: Express.js REST API server
- **Database**: SQLite for data persistence
- **Shared**: Common calculation logic used by both frontend and backend
- **External API**: Yahoo Finance for real-time market data

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd trade-dashboard
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env if needed (default PORT=3001)
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   Server will start on http://localhost:3001

2. **Start the frontend development server** (in a new terminal)

   ```bash
   cd frontend
   npm run dev
   ```

   Application will be available at http://localhost:5173

3. **Access the application**
   Open your browser to http://localhost:5173

## 📁 Project Structure

```
trade-dashboard/
├── backend/                    # Express.js backend server
│   ├── database/              # SQLite database files and migrations
│   │   ├── trades.db          # Production database
│   │   ├── trades_dev.db      # Development database
│   │   └── migrations/        # Database migration scripts
│   ├── models/                # Data models and database logic
│   │   ├── Trade.js           # Trade model with CRUD operations
│   │   ├── RiskManagementSettings.js
│   │   └── database.js        # Database connection and schema
│   ├── routes/                # API route handlers
│   │   ├── trades.js          # Trade endpoints
│   │   └── riskManagement.js  # Risk management endpoints
│   ├── services/              # Business logic services
│   │   └── marketData.js      # Yahoo Finance API integration
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── server.js              # Express server entry point
│
├── frontend/                   # Vue 3 frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Vue components
│   │   │   ├── TradingDashboard.vue  # Main dashboard
│   │   │   ├── ActiveTrades.vue      # Open positions view
│   │   │   ├── TradeHistory.vue      # Closed trades view
│   │   │   ├── TradeForm.vue         # Trade entry form
│   │   │   ├── SettingsModal.vue     # Settings configuration
│   │   │   ├── ModeSelector.vue      # Trading mode switcher
│   │   │   ├── RiskSettings.vue      # Risk management settings
│   │   │   ├── RToggle.vue           # R-multiple toggle component
│   │   │   └── Toast.vue             # Notification component
│   │   ├── services/          # API client services
│   │   │   └── api.js         # Backend API client
│   │   ├── App.vue            # Root component
│   │   └── main.js            # Application entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── shared/                     # Shared code between frontend and backend
│   └── tradeCalculations.js   # Centralized calculation functions
│
├── CALCULATIONS.md             # Detailed calculation formulas
├── API_DOCUMENTATION.md        # API endpoint documentation
├── DEVELOPMENT_GUIDE.md        # Development standards and guidelines
└── README.md                   # This file
```

## ✨ Features

### Trading Modes

#### DAY Mode

- Tracks daily loss limit
- Resets risk tracking daily
- Accumulates realized losses + open risk
- Designed for day traders with intraday positions

#### SWING Mode

- Tracks total open risk across all positions
- No daily reset
- Monitors aggregate position risk
- Designed for swing traders holding multi-day positions

### Position Management

- **Create Trades**: Enter symbol, type (LONG/SHORT), entry price, stop loss, and targets
- **Automatic Position Sizing**: Calculates shares based on R-size and risk per share
- **Real-time P&L**: Live profit/loss tracking with current market prices
- **Close Trades**: Record exit price with automatic tax and margin interest calculations
- **Edit/Delete**: Modify or remove trades as needed

### Risk Management

- **Configurable Limits**: Set max daily loss, max open risk, and max positions
- **R-Size Configuration**: Define your risk per trade (1R)
- **Tax Rates**: Configure state and federal tax rates
- **Margin Interest**: Set annual margin rate for cost calculations
- **Visual Indicators**: Color-coded risk warnings (safe, caution, warning, danger)

### Performance Tracking

- **R-Multiple Analysis**: Track performance in R-multiples
- **Win/Loss Statistics**: Analyze win rate and average R per trade
- **Profit Metrics**: View gross profit, taxes, margin interest, and net profit
- **Trade History**: Complete record of all closed trades with detailed metrics

### Development Features

- **Dev Mode**: Separate database for testing
- **Database Switching**: Toggle between production and development databases
- **Migration Scripts**: Database schema migration tools
- **Backup Utilities**: Database backup and restore scripts

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete REST API reference
- **[Calculations Guide](./CALCULATIONS.md)** - Detailed formula documentation
- **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Coding standards and best practices
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Database migration instructions
- **[Close Trade Feature](./CLOSE_TRADE_FEATURE.md)** - Trade closing functionality
- **[Mode Selector](./MODE_SELECTOR_IMPLEMENTATION.md)** - Trading mode implementation

## 🛠 Technology Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **Axios** - HTTP client for API requests
- **Native JavaScript** - No heavy UI framework dependencies

### Backend

- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **SQLite3** - Embedded SQL database
- **Axios** - HTTP client for external APIs
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

### External Services

- **Yahoo Finance API** - Real-time stock price data

## 💻 Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start Vite dev server
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build  # Creates dist/ folder

# Backend
cd backend
npm start  # Production mode
```

### Running Migrations

```bash
cd backend/database
node migrate_to_camelcase.js  # Run camelCase migration
```

### Database Backup

```bash
cd backend/database
node backup_db.js  # Creates timestamped backup
```

## 🗄 Database

### Schema

The application uses SQLite with three main tables:

1. **trades** - Stores all trade records (open and closed)
2. **risk_management_settings** - User-configurable risk parameters
3. **app_settings** - Application state (trading mode, dev mode)

### Database Files

- `trades.db` - Production database
- `trades_dev.db` - Development database
- `*.backup` - Timestamped backup files

### Field Naming Convention

All database fields use **camelCase** naming convention (e.g., `entryPrice`, `stopLoss`, `profitLoss`).

## 🔒 Security Considerations

- **CORS**: Configured for localhost development
- **Helmet**: Security headers enabled
- **Input Validation**: Server-side validation on all endpoints
- **SQL Injection**: Parameterized queries throughout
- **Rate Limiting**: Market data API requests are rate-limited

## 🐛 Troubleshooting

### Backend won't start

- Check if port 3001 is available
- Verify Node.js version (20.19.0+ or 22.12.0+)
- Ensure all dependencies are installed: `npm install`

### Frontend can't connect to backend

- Verify backend is running on port 3001
- Check CORS configuration in `backend/server.js`
- Verify API_BASE_URL in `frontend/src/services/api.js`

### Market data not loading

- Yahoo Finance API may be temporarily unavailable
- Check network connectivity
- Verify symbol format (use standard ticker symbols)
- Review rate limiting in `backend/services/marketData.js`

### Database errors

- Ensure database files have write permissions
- Check SQLite3 is properly installed
- Run migrations if schema is outdated

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project. For questions or issues, please contact the repository owner.

## 📧 Support

For support, please open an issue in the repository or contact the maintainer.

---

**Version**: 1.3.0  
**Last Updated**: January 2026
