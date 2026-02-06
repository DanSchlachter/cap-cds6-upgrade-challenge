# Running with Local CDS 6

## ✅ Application Now Works!

The errors you saw initially were **service definition issues** (not upgrade issues). They've been fixed:

1. Split services into separate files (better organization)
2. Added `@cds.redirection.target` to resolve ambiguous redirections
3. Fixed temporal data in test data
4. Fixed default value issues

## Using Local CDS 6 (Not Global)

### ✅ Recommended: Use npx (Already Working!)

```bash
npx cds watch
npx cds serve
npx cds deploy --to sqlite
npx cds compile db/schema.cds
```

**How it works**: `npx` automatically uses your local CDS 6.8.4 installation from `node_modules`, not the global version.

### Verify You're Using Local CDS 6

```bash
# Check what npx will use
npx cds --version
# Should show: @sap/cds: 6.8.4

# Compare with global
which cds
cds --version
# This shows your global installation (probably newer)
```

## Alternative Methods

### Option 2: Use npm scripts (package.json)

```bash
npm start      # Uses local CDS via npm scripts
npm run watch  # Uses local CDS via npm scripts
```

These are already configured in your `package.json`:
```json
{
  "scripts": {
    "start": "cds run",
    "watch": "cds watch"
  }
}
```

### Option 3: Temporary PATH override

```bash
# In your terminal session
export PATH="./node_modules/.bin:$PATH"

# Now regular 'cds' commands use local version
cds watch
cds serve
```

### Option 4: Create a shell alias

```bash
# Add to your shell (for this project only)
alias cds6='./node_modules/.bin/cds'

# Use it
cds6 watch
cds6 serve
```

## Quick Start

```bash
# 1. Make sure you're in the project directory
cd /Users/D053371/SAPDevelop/upgradeApp

# 2. Install dependencies (if you haven't)
npm install

# 3. Deploy database
npx cds deploy --to sqlite

# 4. Start the application
npx cds watch

# 5. Open in browser
# http://localhost:4004
```

## What Services Are Available?

Once running, visit http://localhost:4004 to see:

- **CatalogService** (`/catalog`)
  - Books, Authors, Reviews, Products, Categories
  - Actions: submitReview, getTopBooks

- **OrderService** (`/orders`) 
  - Orders (with Fiori draft)
  - OrderItems
  - OrderHistory

- **AdminService** (`/admin`)
  - All entities (requires admin role)
  - Action: resetInventory

## Test the Endpoints

```bash
# Get all books
curl http://localhost:4004/catalog/Books

# Get all authors
curl http://localhost:4004/catalog/Authors

# Get orders (with draft support)
curl http://localhost:4004/orders/Orders
```

## Files Structure

```
upgradeApp/
├── srv/
│   ├── catalog-service.cds     # CatalogService definition
│   ├── catalog-service.js      # CatalogService handlers
│   ├── order-service.cds       # OrderService definition (NEW - split out)
│   ├── order-service.js        # OrderService handlers
│   ├── admin-service.cds       # AdminService definition (NEW - split out)
│   └── admin-service.js        # AdminService handlers
├── db/
│   ├── schema.cds              # Data model
│   └── data/
│       ├── my.bookshop-Authors.json  # Sample authors
│       └── my.bookshop-Books.json    # Sample books
└── db.sqlite                   # SQLite database (after deploy)
```

## What Changed to Fix the Errors?

1. **Split services into separate .cds files**:
   - Created `srv/order-service.cds` 
   - Created `srv/admin-service.cds`
   - This is a **best practice** anyway!

2. **Added `@cds.redirection.target`** to `OrderService.Orders`:
   ```cds
   @cds.redirection.target
   @odata.draft.enabled
   entity Orders as projection on db.Orders;
   ```
   This tells CDS which entity to use for redirections when multiple projections of the same base entity exist.

3. **Fixed temporal data**:
   - Simplified `orderDate` field (removed problematic default)
   - Added `validFrom` and `validTo` to Books test data

4. **Renamed data files** from `.csv` to `.json` (they were JSON format)

## All 56 Upgrade Issues Still Present!

The application still contains all the documented upgrade issues in **UPGRADE_ISSUES.md**. What we fixed were:
- ❌ NOT upgrade issues
- ✅ CDS 6 compilation/runtime issues

The **real upgrade challenges** appear when you try to upgrade to CDS 7/8/9:
- Associations without ON conditions
- Deprecated APIs (INSERT.as, req.user.locale, etc.)
- Configuration changes
- Error handling changes
- etc.

## Ready to Study Upgrade Issues?

```bash
# Read the comprehensive guide
cat UPGRADE_ISSUES.md

# Try to upgrade (will break!)
npm install @sap/cds@^8.0.0

# Study what breaks and why
npx cds watch
```

---

**Current Status**: ✅ Application runs successfully on CDS 6.8.4  
**Using**: Local CDS installation via `npx`  
**Global Installation**: Unaffected
