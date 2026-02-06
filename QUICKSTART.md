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
- **UPGRADE_ISSUES.md** - All 56 upgrade issues (CDS 6→7/8/9)
- **UPGRADE_ISSUES_CDS6_TO_7.md** - 38 issues for CDS 6→7
- **TEST_UPGRADES.md** - Testing guide with npm scripts
- **PROJECT_SUMMARY.md** - Complete project overview

## Test with Different CDS Versions

```bash
# Test with CDS 7 (warnings expected)
npm run test:cds7

# Test with CDS 8 (errors expected)
npm run test:cds8

# Test with CDS 9 (compilation fails)
npm run test:cds9

# Or run the comprehensive test script
./test-all-versions.sh
```

See **TEST_UPGRADES.md** for detailed testing instructions.

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
