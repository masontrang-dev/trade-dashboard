# Documentation Index

Complete guide to all documentation for the Trade Dashboard project.

## 📚 Documentation Overview

This project includes comprehensive documentation covering all aspects of the application, from quick start guides to detailed technical specifications.

---

## 🚀 Getting Started

### [Quick Start Guide](./QUICK_START.md)

**For new users** - Get up and running in 5 minutes.

- Installation steps
- First trade walkthrough
- Common workflows
- Basic troubleshooting

**Start here if you're new to the application.**

---

### [README](./README.md)

**Project overview** - High-level introduction to Trade Dashboard.

- Feature overview
- Architecture diagram
- Technology stack
- Project structure
- Installation guide
- Development setup

**Read this for a complete project overview.**

---

## 📖 User Documentation

### [Calculations Guide](./CALCULATIONS.md)

**Formula reference** - Detailed documentation of all financial calculations.

- Position sizing formulas
- Risk calculations
- Profit & loss calculations
- Tax calculations
- Margin interest
- R-multiple system
- Target price calculations
- Complete worked examples

**Essential for understanding how the system calculates trades.**

---

## 🔧 Technical Documentation

### [API Documentation](./API_DOCUMENTATION.md)

**REST API reference** - Complete endpoint documentation.

- Health check
- Risk management endpoints
- Trade CRUD operations
- Mode management
- Error handling
- Request/response formats
- Data models

**Use this when integrating with the API or debugging API calls.**

---

### [Development Guide](./DEVELOPMENT_GUIDE.md)

**Coding standards** - Best practices and technical guidelines.

- Code standards and naming conventions
- Architecture principles
- Database guidelines
- API design patterns
- Frontend development with Vue 3
- Testing strategies
- Git workflow
- Common patterns
- Troubleshooting

**Required reading for developers contributing to the project.**

---

### [Component Documentation](./COMPONENT_DOCUMENTATION.md)

**Vue component reference** - Detailed component specifications.

- Component hierarchy
- TradingDashboard (main container)
- ActiveTrades (open positions)
- TradeHistory (closed trades)
- TradeForm (create/edit)
- SettingsModal (configuration)
- ModeSelector (mode switching)
- RiskSettings (risk display)
- RToggle (display toggle)
- Toast (notifications)

**Use this when working with frontend components.**

---

### [Database Schema](./DATABASE_SCHEMA.md)

**Database reference** - Complete schema documentation.

- Table structures
- Column definitions
- Constraints and indexes
- Data types
- Query examples
- Migration guide
- Backup and restore
- Maintenance procedures

**Essential for database operations and migrations.**

---

## 📝 Feature Documentation

### [Close Trade Feature](./CLOSE_TRADE_FEATURE.md)

**Feature specification** - Trade closing functionality.

- Closing workflow
- Tax calculations
- Margin interest
- Custom close dates
- Implementation details

---

### [Mode Selector Implementation](./MODE_SELECTOR_IMPLEMENTATION.md)

**Feature specification** - Trading mode system.

- DAY vs SWING modes
- Risk tracking differences
- Mode switching
- Dev mode functionality

---

### [Migration Guide](./MIGRATION_GUIDE.md)

**Database migrations** - Schema migration instructions.

- camelCase migration
- Tax rate additions
- Margin interest fields
- Migration procedures

---

### [Refactoring Summary](./REFACTORING_SUMMARY.md)

**Change log** - Major refactoring documentation.

- Code reorganization
- Calculation centralization
- Breaking changes
- Upgrade instructions

---

## 📂 Documentation by Role

### For End Users

1. [Quick Start Guide](./QUICK_START.md) - Get started quickly
2. [README](./README.md) - Understand the application
3. [Calculations Guide](./CALCULATIONS.md) - Learn the formulas

### For Developers

1. [Development Guide](./DEVELOPMENT_GUIDE.md) - Coding standards
2. [Component Documentation](./COMPONENT_DOCUMENTATION.md) - Frontend components
3. [API Documentation](./API_DOCUMENTATION.md) - Backend API
4. [Database Schema](./DATABASE_SCHEMA.md) - Database structure

### For System Administrators

1. [README](./README.md) - Deployment overview
2. [Database Schema](./DATABASE_SCHEMA.md) - Database management
3. [Migration Guide](./MIGRATION_GUIDE.md) - Schema updates

### For API Consumers

1. [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
2. [Calculations Guide](./CALCULATIONS.md) - Understand calculations
3. [Database Schema](./DATABASE_SCHEMA.md) - Data models

---

## 🔍 Documentation by Topic

### Installation & Setup

- [Quick Start Guide](./QUICK_START.md) - Quick installation
- [README](./README.md) - Detailed setup

### Trading & Risk Management

- [Calculations Guide](./CALCULATIONS.md) - All formulas
- [Close Trade Feature](./CLOSE_TRADE_FEATURE.md) - Closing trades
- [Mode Selector Implementation](./MODE_SELECTOR_IMPLEMENTATION.md) - Trading modes

### Development

- [Development Guide](./DEVELOPMENT_GUIDE.md) - Standards and practices
- [Component Documentation](./COMPONENT_DOCUMENTATION.md) - Component specs
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Recent changes

### API & Backend

- [API Documentation](./API_DOCUMENTATION.md) - REST endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Database structure
- [Migration Guide](./MIGRATION_GUIDE.md) - Schema migrations

### Frontend

- [Component Documentation](./COMPONENT_DOCUMENTATION.md) - Vue components
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Frontend patterns

---

## 📋 Quick Reference

### Common Tasks

| Task                    | Documentation                                                     |
| ----------------------- | ----------------------------------------------------------------- |
| Install the application | [Quick Start Guide](./QUICK_START.md)                             |
| Create a trade          | [Quick Start Guide](./QUICK_START.md#2-create-your-first-trade)   |
| Close a trade           | [Close Trade Feature](./CLOSE_TRADE_FEATURE.md)                   |
| Configure risk settings | [Quick Start Guide](./QUICK_START.md#1-configure-risk-settings)   |
| Switch trading modes    | [Mode Selector Implementation](./MODE_SELECTOR_IMPLEMENTATION.md) |
| Understand calculations | [Calculations Guide](./CALCULATIONS.md)                           |
| Make API calls          | [API Documentation](./API_DOCUMENTATION.md)                       |
| Add a new component     | [Component Documentation](./COMPONENT_DOCUMENTATION.md)           |
| Modify database schema  | [Database Schema](./DATABASE_SCHEMA.md)                           |
| Follow coding standards | [Development Guide](./DEVELOPMENT_GUIDE.md)                       |

### Formula Quick Reference

| Formula         | Documentation                                             |
| --------------- | --------------------------------------------------------- |
| Position sizing | [Calculations Guide](./CALCULATIONS.md#position-sizing)   |
| Risk per share  | [Calculations Guide](./CALCULATIONS.md#risk-per-share)    |
| Profit/Loss     | [Calculations Guide](./CALCULATIONS.md#profit--loss)      |
| R-multiple      | [Calculations Guide](./CALCULATIONS.md#r-multiple-system) |
| Tax amount      | [Calculations Guide](./CALCULATIONS.md#tax-calculations)  |
| Margin interest | [Calculations Guide](./CALCULATIONS.md#margin-interest)   |
| Target prices   | [Calculations Guide](./CALCULATIONS.md#target-prices)     |

### API Quick Reference

| Endpoint                   | Documentation                                                               |
| -------------------------- | --------------------------------------------------------------------------- |
| GET /api/trades            | [API Documentation](./API_DOCUMENTATION.md#get-all-trades)                  |
| POST /api/trades           | [API Documentation](./API_DOCUMENTATION.md#create-trade)                    |
| POST /api/trades/:id/close | [API Documentation](./API_DOCUMENTATION.md#close-trade)                     |
| GET /api/risk-management   | [API Documentation](./API_DOCUMENTATION.md#get-risk-management-settings)    |
| PUT /api/risk-management   | [API Documentation](./API_DOCUMENTATION.md#update-risk-management-settings) |

---

## 🔄 Documentation Updates

### Version History

- **v1.3** - Added comprehensive documentation suite (January 2026)
- **v1.2** - camelCase migration documentation
- **v1.1** - Tax and margin interest documentation
- **v1.0** - Initial documentation

### Contributing to Documentation

When updating documentation:

1. **Keep it current** - Update docs when code changes
2. **Be comprehensive** - Include examples and edge cases
3. **Cross-reference** - Link to related documentation
4. **Test examples** - Verify all code examples work
5. **Update this index** - Add new documentation files here

### Documentation Standards

- Use Markdown format
- Include table of contents for long documents
- Add code examples with syntax highlighting
- Use tables for structured data
- Include version history at the end
- Add "Last Updated" timestamp

---

## 📞 Support

### Getting Help

1. **Check documentation** - Search this index for relevant docs
2. **Review examples** - Look at code examples in guides
3. **Check troubleshooting** - See troubleshooting sections
4. **Inspect code** - Review source code for implementation details

### Reporting Issues

When reporting documentation issues:

1. Specify which document
2. Describe the issue or confusion
3. Suggest improvements
4. Include examples if applicable

---

## 📦 Documentation Files

### Complete File List

```
trade-dashboard/
├── README.md                           # Project overview
├── QUICK_START.md                      # Quick start guide
├── DOCUMENTATION_INDEX.md              # This file
├── API_DOCUMENTATION.md                # API reference
├── CALCULATIONS.md                     # Formula documentation
├── DEVELOPMENT_GUIDE.md                # Development standards
├── COMPONENT_DOCUMENTATION.md          # Component reference
├── DATABASE_SCHEMA.md                  # Database schema
├── CLOSE_TRADE_FEATURE.md             # Close trade feature
├── MODE_SELECTOR_IMPLEMENTATION.md     # Mode selector feature
├── MIGRATION_GUIDE.md                  # Database migrations
└── REFACTORING_SUMMARY.md             # Refactoring history
```

### Documentation Size

| Document                   | Lines | Purpose          |
| -------------------------- | ----- | ---------------- |
| README.md                  | ~350  | Project overview |
| QUICK_START.md             | ~400  | Getting started  |
| API_DOCUMENTATION.md       | ~800  | API reference    |
| CALCULATIONS.md            | ~470  | Formula guide    |
| DEVELOPMENT_GUIDE.md       | ~800  | Dev standards    |
| COMPONENT_DOCUMENTATION.md | ~900  | Component specs  |
| DATABASE_SCHEMA.md         | ~700  | Database docs    |

**Total**: ~4,400 lines of comprehensive documentation

---

## 🎯 Next Steps

### New Users

1. Read [Quick Start Guide](./QUICK_START.md)
2. Review [README](./README.md)
3. Explore [Calculations Guide](./CALCULATIONS.md)

### New Developers

1. Read [Development Guide](./DEVELOPMENT_GUIDE.md)
2. Review [Component Documentation](./COMPONENT_DOCUMENTATION.md)
3. Study [API Documentation](./API_DOCUMENTATION.md)
4. Examine [Database Schema](./DATABASE_SCHEMA.md)

### System Administrators

1. Review [README](./README.md) deployment section
2. Study [Database Schema](./DATABASE_SCHEMA.md)
3. Understand [Migration Guide](./MIGRATION_GUIDE.md)

---

**Documentation Version**: 1.3.0  
**Last Updated**: January 2026  
**Total Documents**: 12 files  
**Total Coverage**: Complete end-to-end documentation

---

**Happy Trading! 📈**
