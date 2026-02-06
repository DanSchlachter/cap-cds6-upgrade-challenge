# Quick Start Guide

## Installation

```bash
npm install
```

## Run the Application

```bash
npm start
```

Open: http://localhost:4004

## View the Documentation

- **readme.md** - Main user guide
- **UPGRADE_ISSUES.md** - All 56 upgrade issues documented
- **PROJECT_SUMMARY.md** - Complete project overview

## Example: Try to Upgrade

```bash
# This will break! That's the point.
npm install @sap/cds@^8.0.0

# Compare errors with UPGRADE_ISSUES.md
```

## Key Files to Study

1. `db/schema.cds` - 9 data model issues
2. `srv/catalog-service.js` - 9 deprecated APIs
3. `srv/order-service.js` - 8 draft/temporal issues
4. `UPGRADE_ISSUES.md` - Complete documentation

## Issues by Version

- **CDS 8**: 11 breaking changes
- **CDS 9**: 42 breaking changes
- **Total**: 56 documented issues

---

Start with **UPGRADE_ISSUES.md** for the complete guide!
