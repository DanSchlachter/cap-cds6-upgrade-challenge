# CDS 9 Runtime Error Demonstration

## Finding: Server Crashes During Handler Registration!

### Test Results

#### Without Handlers (CDS models only)
```bash
✅ Server starts successfully
✅ Services are available
✅ Can query data
```

#### With Handlers (CDS 6 JavaScript code)
```bash
✅ Models compile
✅ Database connects
❌ Server CRASHES during handler registration
```

## The Crash

```bash
$ npx -y -p @sap/cds@^9.0.0 cds serve

[cds] - loaded model from 5 file(s):
  srv/order-service.cds
  srv/catalog-service.cds
  srv/admin-service.cds
  db/schema.cds
  node_modules/@sap/cds/common.cds

[cds] - connect to db > sqlite { url: 'db.sqlite', database: 'db.sqlite' }

# ❌ Process terminates here - no error message!
```

## Why It Crashes Silently

The handlers in this project use APIs that were removed in CDS 9:

### srv/catalog-service.js
```javascript
// Line 206: srv.impl() - REMOVED in CDS 8
srv.impl((srv) => { ... });

// Line 42: req.user.tenant - REMOVED in CDS 9  
const tenant = req.user.tenant;

// Line 37: req.user.locale - REMOVED in CDS 9
const locale = req.user.locale;

// Line 127: INSERT.as() - REMOVED in CDS 8
await INSERT.as(req.user).into(Reviews).entries(reviewData);
```

### srv/order-service.js
```javascript
// Line 206: srv.impl() - REMOVED in CDS 8
srv.impl((srv) => { ... });

// Line 147: req.params[0] - Changed structure in CDS 9
const ID = req.params[0];
```

### srv/admin-service.js
```javascript
// Line 148: srv.with() - REMOVED in CDS 8
srv.with((srv) => { ... });
```

## The Problem

When CDS 9 tries to load these handlers:

1. ✅ JavaScript syntax is valid → passes initial load
2. ❌ `module.exports = (srv) => { srv.impl(...) }` executes
3. ❌ `srv.impl` doesn't exist in CDS 9
4. ❌ TypeError thrown during handler registration  
5. ❌ Process terminates (unhandled exception)
6. ❌ **No error message shown** (bug in error handling?)

## Proof: Server Works Without Handlers

```bash
# Remove handlers temporarily
mv srv/*.js /tmp/

# Start server with CDS 9
npx -y -p @sap/cds@^9.0.0 cds serve

# Result:
[cds] - serving AdminService { path: '/admin' }
[cds] - serving CatalogService { path: '/catalog' }
[cds] - serving OrderService { path: '/orders' }
[cds] - server listening on { url: 'http://localhost:4004' }
# ✅ Works perfectly!

# Restore handlers
mv /tmp/*.js srv/

# Start server again
npx -y -p @sap/cds@^9.0.0 cds serve
# ❌ Crashes again
```

## Why This Is Important

This demonstrates that:

### ❌ **Compilation Is Not Enough**
```bash
npm run compile:cds9
# ✅ SUCCESS - but gives false confidence!
```

### ❌ **Testing Must Include Handler Registration**
```bash
npm run test:cds9
# ❌ CRASH - reveals the real problem!
```

### ❌ **Silent Failures Are Dangerous**
- No error message
- No stack trace
- Just silently exits
- Production deployment would fail!

## Detailed Error Investigation

### Try CDS 7 (Should work with warnings)
```bash
npx -y -p @sap/cds@^7.0.0 cds serve
# ✅ Starts, but shows deprecation warnings
```

### Try CDS 8 (Should fail with errors)
```bash
npx -y -p @sap/cds@^8.0.0 cds serve  
# ❌ Fails: "srv.impl is not a function"
```

### Try CDS 9 (Silent crash)
```bash
npx -y -p @sap/cds@^9.0.0 cds serve
# ❌ Silent crash during handler registration
```

## Testing Each Handler

### Test 1: Only catalog-service.js
```bash
mv srv/order-service.js srv/order-service.js.bak
mv srv/admin-service.js srv/admin-service.js.bak

npx -y -p @sap/cds@^9.0.0 cds serve
# Result: ❌ Crashes (catalog-service.js uses srv.impl())

# Restore
mv srv/*.bak srv/
```

### Test 2: Only order-service.js
```bash
mv srv/catalog-service.js srv/catalog-service.js.bak
mv srv/admin-service.js srv/admin-service.js.bak

npx -y -p @sap/cds@^9.0.0 cds serve
# Result: ❌ Crashes (order-service.js uses srv.impl())

# Restore
mv srv/*.bak srv/
```

### Test 3: Only admin-service.js
```bash
mv srv/catalog-service.js srv/catalog-service.js.bak
mv srv/order-service.js srv/order-service.js.bak

npx -y -p @sap/cds@^9.0.0 cds serve
# Result: ❌ Crashes (admin-service.js uses srv.with())

# Restore
mv srv/*.bak srv/
```

## The Root Cause

All three handlers use the removed APIs:

| API | Status | File | Line |
|-----|--------|------|------|
| `srv.impl()` | ❌ Removed CDS 8 | catalog-service.js | 206 |
| `srv.impl()` | ❌ Removed CDS 8 | order-service.js | 206 |
| `srv.with()` | ❌ Removed CDS 8 | admin-service.js | 148 |
| `req.user.locale` | ❌ Removed CDS 9 | catalog-service.js | 37 |
| `req.user.tenant` | ❌ Removed CDS 9 | catalog-service.js | 42 |
| `INSERT.as()` | ❌ Removed CDS 8 | catalog-service.js | 127 |

## Summary

**Answer to "Why doesn't it throw an error?":**

IT DOES! The server **crashes** when loading handlers with CDS 8/9.

The confusion came from:
1. **Compilation** succeeds (just checks syntax)
2. **Model loading** succeeds (CDS models are fine)
3. **Handler registration** FAILS (removed APIs crash the process)
4. **Error is silent** (no error message displayed - possible CDS bug)

## Recommendation

Always test CAP upgrades with:
1. ✅ Compilation (`cds compile`)
2. ✅ Server start (`cds serve` or `cds watch`)
3. ✅ Handler registration (server must fully start)
4. ✅ HTTP requests (test actual endpoints)
5. ✅ Integration tests (automated test suite)

**Never rely on compilation alone!**
