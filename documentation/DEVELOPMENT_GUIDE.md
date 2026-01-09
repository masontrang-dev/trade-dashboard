# Development Guide

Technical standards, best practices, and guidelines for developing the Trade Dashboard application.

## Table of Contents

- [Code Standards](#code-standards)
- [Architecture Principles](#architecture-principles)
- [Database Guidelines](#database-guidelines)
- [API Design](#api-design)
- [Frontend Development](#frontend-development)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Code Standards

### Naming Conventions

#### JavaScript/Vue

- **Variables & Functions**: camelCase

  ```javascript
  const entryPrice = 150.0;
  function calculateProfitLoss() {}
  ```

- **Classes**: PascalCase

  ```javascript
  class Trade {}
  class RiskManagementSettings {}
  ```

- **Constants**: UPPER_SNAKE_CASE

  ```javascript
  const API_BASE_URL = "http://localhost:3001/api";
  const RATE_LIMIT = 10;
  ```

- **Components**: PascalCase
  ```javascript
  TradingDashboard.vue;
  ActiveTrades.vue;
  ```

#### Database

- **Tables**: snake_case

  ```sql
  trades
  risk_management_settings
  app_settings
  ```

- **Columns**: camelCase (standardized in v1.2)
  ```sql
  entryPrice
  stopLoss
  profitLoss
  ```

### File Organization

```
backend/
├── models/          # Data models and database logic
├── routes/          # API route handlers
├── services/        # Business logic and external services
└── database/        # Database files and migrations

frontend/
├── components/      # Vue components
├── services/        # API client services
└── utils/          # Utility functions (currently empty)

shared/             # Code shared between frontend and backend
```

### Code Style

#### Indentation

- Use **2 spaces** for indentation (no tabs)
- Consistent across JavaScript, Vue, and JSON files

#### Quotes

- Use **double quotes** for strings
- Consistent with existing codebase

#### Semicolons

- Use semicolons at the end of statements
- Enforced in backend code

#### Line Length

- Aim for **80-100 characters** per line
- Break long lines for readability

#### Comments

- Use JSDoc for function documentation
- Add inline comments for complex logic
- Keep comments up-to-date with code changes

```javascript
/**
 * Calculate profit/loss for a trade
 * @param {string} type - Trade type: 'LONG' or 'SHORT'
 * @param {number} entryPrice - Entry price per share
 * @param {number} exitPrice - Exit/current price per share
 * @param {number} quantity - Number of shares
 * @returns {number} Profit/loss in dollars
 */
function calculateProfitLoss(type, entryPrice, exitPrice, quantity) {
  // Implementation
}
```

---

## Architecture Principles

### Separation of Concerns

1. **Models** - Data access and database operations
2. **Routes** - HTTP request handling and validation
3. **Services** - Business logic and external API integration
4. **Components** - UI rendering and user interaction

### Single Responsibility

Each module should have one clear purpose:

- `Trade.js` - Trade CRUD operations
- `marketData.js` - Market data fetching
- `tradeCalculations.js` - Financial calculations

### DRY (Don't Repeat Yourself)

- Centralize calculations in `shared/tradeCalculations.js`
- Reuse components across views
- Extract common patterns into utilities

### Centralized Calculations

**CRITICAL**: All financial calculations MUST use functions from `shared/tradeCalculations.js`

❌ **Wrong**:

```javascript
const pnl = (exitPrice - entryPrice) * quantity;
```

✅ **Correct**:

```javascript
import { calculateProfitLoss } from "../../shared/tradeCalculations.js";
const pnl = calculateProfitLoss(type, entryPrice, exitPrice, quantity);
```

**Benefits**:

- Consistency across frontend and backend
- Single source of truth for formulas
- Easier testing and maintenance
- Prevents calculation drift

---

## Database Guidelines

### Schema Management

#### Creating Tables

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fieldName TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Adding Columns

Use migrations for schema changes:

```javascript
// backend/database/migrations/add_new_field.js
db.run(`ALTER TABLE trades ADD COLUMN newField TEXT`);
```

#### Field Naming

- Use **camelCase** for all new fields
- Legacy snake_case fields should be migrated
- See `migrate_to_camelcase.js` for migration example

### Query Patterns

#### Parameterized Queries

Always use parameterized queries to prevent SQL injection:

❌ **Wrong**:

```javascript
db.run(`DELETE FROM trades WHERE id = ${id}`);
```

✅ **Correct**:

```javascript
db.run("DELETE FROM trades WHERE id = ?", [id]);
```

#### Promise Wrappers

Wrap database callbacks in Promises for async/await:

```javascript
static async getById(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get("SELECT * FROM trades WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
```

#### Error Handling

Always handle database errors:

```javascript
try {
  const trades = await Trade.getAll();
  res.json(trades);
} catch (error) {
  console.error("Database error:", error);
  res.status(500).json({ error: error.message });
}
```

### Database Backups

Before major migrations:

```bash
cd backend/database
node backup_db.js
```

Creates timestamped backup: `trades_backup_YYYYMMDD_HHMMSS.db`

---

## API Design

### RESTful Principles

- **GET** - Retrieve resources
- **POST** - Create resources
- **PUT** - Update resources
- **DELETE** - Remove resources

### Endpoint Structure

```
/api/resource              # Collection
/api/resource/:id          # Specific item
/api/resource/:id/action   # Action on item
```

### Request Validation

Always validate required fields:

```javascript
if (!symbol || !type || !quantity || !entryPrice) {
  return res.status(400).json({
    error: "Missing required fields: symbol, type, quantity, entryPrice",
  });
}
```

### Response Format

#### Success Response

```javascript
res.json({ data: result });
```

#### Error Response

```javascript
res.status(400).json({
  error: "Error message",
  details: "Additional context",
});
```

#### Created Resource

```javascript
res.status(201).json(newResource);
```

### Error Handling Middleware

Global error handler in `server.js`:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
```

---

## Frontend Development

### Vue 3 Composition API

Use `<script setup>` syntax:

```vue
<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../services/api.js";

const trades = ref([]);
const loading = ref(false);

const totalPnL = computed(() => {
  return trades.value.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
});

onMounted(async () => {
  await loadTrades();
});

async function loadTrades() {
  loading.value = true;
  try {
    trades.value = await api.getAllTrades();
  } catch (error) {
    console.error("Failed to load trades:", error);
  } finally {
    loading.value = false;
  }
}
</script>
```

### Component Structure

```vue
<script setup>
// Imports
// Props & Emits
// Reactive state
// Computed properties
// Lifecycle hooks
// Methods
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Component-specific styles */
</style>
```

### Props and Emits

```vue
<script setup>
const props = defineProps({
  trade: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update", "delete"]);

function handleUpdate() {
  emit("update", props.trade.id);
}
</script>
```

### API Integration

Use the centralized API service:

```javascript
import api from "../services/api.js";

// Get data
const trades = await api.getAllTrades();
const settings = await api.getRiskSettings();

// Create
const newTrade = await api.createTrade(tradeData);

// Update
await api.updateTrade(id, updates);

// Delete
await api.deleteTrade(id);
```

### State Management

Currently using component-level state. For shared state:

```javascript
// In parent component
const sharedData = ref([]);

// Pass to children
<ChildComponent :data="sharedData" @update="handleUpdate" />
```

### Styling Guidelines

- Use **scoped styles** in components
- Follow existing color scheme
- Maintain responsive design
- Use semantic class names

```vue
<style scoped>
.trade-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trade-card--profitable {
  border-left: 4px solid #10b981;
}

.trade-card--losing {
  border-left: 4px solid #ef4444;
}
</style>
```

---

## Testing

### Manual Testing Checklist

#### Trade Operations

- [ ] Create LONG trade
- [ ] Create SHORT trade
- [ ] Update trade details
- [ ] Close trade with profit
- [ ] Close trade with loss
- [ ] Delete trade
- [ ] View trade history

#### Risk Management

- [ ] Update risk settings
- [ ] Verify risk calculations
- [ ] Test risk warnings
- [ ] Check limit enforcement

#### Mode Switching

- [ ] Switch DAY/SWING mode
- [ ] Switch dev/prod database
- [ ] Verify mode persistence

#### Market Data

- [ ] Live price updates
- [ ] Market hours detection
- [ ] Price caching
- [ ] Fallback handling

### Testing Edge Cases

1. **Zero/Null Values**

   - Entry price = 0
   - Quantity = 0
   - Stop loss = null

2. **Extreme Values**

   - Very large positions
   - Very small prices
   - Negative values

3. **Network Issues**

   - API timeout
   - Connection failure
   - Rate limiting

4. **Database Issues**
   - Missing tables
   - Locked database
   - Corrupted data

### Test Data

Use development mode for testing:

```javascript
// Switch to dev database
await api.switchDevMode(true);

// Create test trades
const testTrade = {
  symbol: "TEST",
  type: "LONG",
  quantity: 100,
  entryPrice: 100.0,
  stopLoss: 95.0,
};
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Messages

Follow conventional commits:

```
feat: add margin interest calculation
fix: correct P&L calculation for SHORT trades
docs: update API documentation
refactor: centralize calculation functions
style: format code with prettier
test: add trade calculation tests
chore: update dependencies
```

### Before Committing

1. Test changes locally
2. Run both frontend and backend
3. Check for console errors
4. Verify database migrations
5. Update documentation if needed

---

## Common Patterns

### Async/Await Error Handling

```javascript
async function loadData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    console.error("Failed to load data:", error);
    throw error; // Re-throw if caller needs to handle
  }
}
```

### Loading States

```javascript
const loading = ref(false);

async function fetchData() {
  loading.value = true;
  try {
    const data = await api.getData();
    // Process data
  } catch (error) {
    // Handle error
  } finally {
    loading.value = false;
  }
}
```

### Conditional Rendering

```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Number Formatting

```javascript
// Currency
const formatted = value.toFixed(2);
const currency = `$${value.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

// Percentage
const percent = `${value.toFixed(2)}%`;

// R-multiple
const rMultiple = `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
```

### Date Formatting

```javascript
// ISO 8601 for database
const isoDate = new Date().toISOString();

// Display format
const displayDate = new Date(isoDate).toLocaleString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Database Locked

```javascript
// Ensure all connections are closed
db.close((err) => {
  if (err) console.error(err);
});
```

#### CORS Errors

Check `backend/server.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

#### Market Data Not Loading

1. Check Yahoo Finance API status
2. Verify symbol format (uppercase)
3. Check rate limiting in console
4. Review cache settings

#### Calculation Discrepancies

1. Verify using centralized functions
2. Check rounding rules (2 decimal places)
3. Review formula in CALCULATIONS.md
4. Test with known values

### Debug Logging

#### Backend

```javascript
console.log("Debug:", { variable, data });
console.error("Error:", error);
```

#### Frontend

```javascript
console.log("Component state:", { trades, loading });
console.error("API error:", error);
```

#### Database Queries

```javascript
db.on("trace", (sql) => {
  console.log("SQL:", sql);
});
```

### Performance Optimization

#### Batch Processing

Process trades in batches to avoid overwhelming APIs:

```javascript
const BATCH_SIZE = 5;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

#### Caching

Implement caching for frequently accessed data:

```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }
  return null;
}
```

#### Debouncing

Debounce user input for search/filter:

```javascript
let timeout;
function debounce(fn, delay = 300) {
  clearTimeout(timeout);
  timeout = setTimeout(fn, delay);
}
```

---

## Security Best Practices

### Input Validation

- Validate all user input on the server
- Sanitize data before database operations
- Use parameterized queries

### Environment Variables

- Store sensitive data in `.env`
- Never commit `.env` to git
- Use `.env.example` for templates

### API Security

- Implement rate limiting for production
- Use HTTPS in production
- Add authentication for public deployment

### Database Security

- Use parameterized queries (prevent SQL injection)
- Restrict database file permissions
- Regular backups

---

## Deployment Considerations

### Production Checklist

- [ ] Update CORS configuration
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificate
- [ ] Configure database backups
- [ ] Set up monitoring/logging
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Review security headers

### Environment Variables

```bash
# Production
NODE_ENV=production
PORT=3001
DATABASE_PATH=/path/to/trades.db

# Development
NODE_ENV=development
PORT=3001
```

---

## Code Review Guidelines

### What to Look For

1. **Correctness**

   - Does it work as intended?
   - Are edge cases handled?
   - Are calculations using centralized functions?

2. **Code Quality**

   - Follows naming conventions?
   - Proper error handling?
   - Clear and concise?

3. **Performance**

   - Efficient algorithms?
   - Proper caching?
   - No unnecessary API calls?

4. **Security**

   - Input validation?
   - Parameterized queries?
   - No sensitive data exposed?

5. **Documentation**
   - Code comments where needed?
   - API documentation updated?
   - README updated?

---

## Resources

### Documentation

- [Vue 3 Documentation](https://vuejs.org/)
- [Express Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MDN Web Docs](https://developer.mozilla.org/)

### Tools

- [Postman](https://www.postman.com/) - API testing
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Database management
- [Vue DevTools](https://devtools.vuejs.org/) - Vue debugging

### Internal Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Calculations Guide](./CALCULATIONS.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

---

## Version History

- **v1.0** - Initial development standards
- **v1.1** - Added calculation centralization guidelines
- **v1.2** - Updated for camelCase database fields
- **v1.3** - Added Vue 3 composition API patterns

---

**Last Updated**: January 2026
