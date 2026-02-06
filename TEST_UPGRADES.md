# Testing Upgrades to CDS 7, 8, and 9

This document explains how to test the application with different CDS versions to see the upgrade issues firsthand.

## Quick Commands

### Test with CDS 7
```bash
npm run test:cds7
```

### Test with CDS 8
```bash
npm run test:cds8
```

### Test with CDS 9
```bash
npm run test:cds9
```

### Compile Only (No Server Start)
```bash
npm run compile:cds7
npm run compile:cds8
npm run compile:cds9
```

---

## What These Commands Do

These npm scripts use `npx` to temporarily download and run specific CDS versions **without modifying your local `node_modules`** or `package.json`.

- `npx -y -p @sap/cds@^7.0.0 cds watch` - Runs the latest CDS 7.x version
- `npx -y -p @sap/cds@^8.0.0 cds watch` - Runs the latest CDS 8.x version
- `npx -y -p @sap/cds@^9.0.0 cds watch` - Runs the latest CDS 9.x version

The `-y` flag automatically accepts the download prompt, and `-p` specifies the package to install temporarily.

---

## Expected Results

### CDS 6 (Current Version - Works ✅)
```bash
npm run watch
# ✅ Application starts successfully
# ✅ All services available at http://localhost:4004
```

### CDS 7 (Should Work with Warnings ⚠️)
```bash
npm run test:cds7
```

**Expected behavior:**
- ✅ Application should mostly work
- ⚠️ May show deprecation warnings for:
  - `req.user.locale` and `req.user.tenant`
  - `INSERT.as()` usage
  - `srv.impl()` and `srv.with()`
  - Old protocol adapter configuration
- ⚠️ Some behavioral differences in:
  - Service paths (trailing slashes)
  - String length handling (255 → 5000 default)
  - Draft implementation

**Key CDS 7 changes you'll encounter:**
- Node.js 18+ recommended (but not enforced)
- `cds run` replaced with `cds-serve`
- Lean Draft becomes default
- Database service changes (`new DatabaseService` vs `cds.DatabaseService`)

### CDS 8 (Will Show Errors ❌)
```bash
npm run test:cds8
```

**Expected errors:**
- ❌ `INSERT.as()` removed - used in `srv/catalog-service.js:127`
- ❌ `srv.impl()` removed - used in `srv/order-service.js:206`
- ❌ `srv.with()` removed - used in `srv/admin-service.js:148`
- ❌ `@odata.default.order` removed - used in `db/schema.cds:45`
- ❌ `@cds.default.order` removed - used in `db/schema.cds:73`
- ❌ CAP Java 2.x required (if using Java backend)

**Breaking changes in CDS 8:**
1. 11 major API removals
2. Configuration changes for native HANA associations
3. New protocol adapter becomes mandatory
4. Draft implementation changes
5. Java Spring Boot 3.x requirement

### CDS 9 (Will Fail Compilation ❌❌)
```bash
npm run test:cds9
```

**Expected errors:**
- ❌ **Associations without ON conditions** - `db/schema.cds:11,24,37`
  ```
  Error: Association 'books' in entity 'Authors' requires an ON condition
  ```

- ❌ **req.user.locale removed** - `srv/catalog-service.js:37`
  ```
  Error: req.user.locale is not a function
  ```

- ❌ **req.user.tenant removed** - `srv/catalog-service.js:42`
  ```
  Error: req.user.tenant is not available
  ```

- ❌ **Old protocol adapter removed** - `package.json:36`
  ```
  Error: Feature 'odata_new_adapter' no longer supported
  ```

- ❌ **@assert.enum removed** - `db/schema.cds:88`
  ```
  Error: Annotation '@assert.enum' is no longer supported
  ```

- ❌ **@Common.FieldControl removed** - `db/schema.cds:52,67`
  ```
  Error: Annotation '@Common.FieldControl.Mandatory' is no longer supported
  ```

- ❌ **$now behavior changed** - `db/schema.cds:97`
  ```
  Warning: $now behavior has changed in CDS 9
  ```

**Critical CDS 9 breaking changes:**
1. 42 documented breaking changes
2. Mandatory ON conditions for associations
3. Removal of many deprecated APIs
4. Configuration structure changes
5. Temporal data pattern changes
6. CSN proxy object removal

---

## Detailed Testing Steps

### 1. Test CDS 6 (Baseline)
```bash
# Clean start
rm -f db.sqlite
npm run watch
```

Open http://localhost:4004 and verify:
- ✅ All services listed: /catalog, /orders, /admin
- ✅ Can browse Books, Authors, Orders
- ✅ No errors in console

Press `Ctrl+C` to stop.

### 2. Test CDS 7 (Deprecation Warnings)
```bash
npm run test:cds7
```

Look for deprecation warnings in the output:
- ⚠️ Warnings about deprecated APIs
- ⚠️ Recommendations to migrate
- ⚠️ But application should still start

Press `Ctrl+C` to stop.

### 3. Test CDS 8 (Some Failures)
```bash
npm run test:cds8
```

Look for errors in the output:
- ❌ Errors about removed APIs (`INSERT.as`, `srv.impl`, etc.)
- ❌ Configuration errors
- ❌ Application may crash or fail to start handlers

Press `Ctrl+C` to stop.

### 4. Test CDS 9 (Major Failures)
```bash
npm run test:cds9
```

Look for errors in the output:
- ❌ Compilation errors for associations without ON conditions
- ❌ Runtime errors for removed APIs
- ❌ Configuration errors
- ❌ Application will likely fail to start

Press `Ctrl+C` to stop.

### 5. Compile Only Tests (Faster Feedback)
```bash
# Test just compilation without starting server
npm run compile:cds7
npm run compile:cds8
npm run compile:cds9
```

These commands will show compilation errors without starting the server, making it faster to identify issues.

---

## Comparing Outputs

### Expected Console Output Comparison

#### CDS 6 (Clean Output)
```
[cds] - loaded model from 3 file(s):

  db/schema.cds
  srv/catalog-service.cds
  srv/order-service.cds
  srv/admin-service.cds

[cds] - connect to db > sqlite { database: 'db.sqlite' }
[cds] - serving CatalogService { path: '/catalog' }
[cds] - serving OrderService { path: '/orders' }
[cds] - serving AdminService { path: '/admin' }

[cds] - server listening on { url: 'http://localhost:4004' }
```

#### CDS 7 (Warnings Added)
```
[cds] - loaded model from 3 file(s):
  ...

⚠️  DEPRECATION WARNING: req.user.locale will be removed in CDS 9
⚠️  DEPRECATION WARNING: INSERT.as() will be removed in CDS 8
⚠️  DEPRECATION WARNING: srv.impl() will be removed in CDS 8

[cds] - connect to db > sqlite { database: 'db.sqlite' }
[cds] - serving CatalogService { path: '/catalog' }
...
[cds] - server listening on { url: 'http://localhost:4004' }
```

#### CDS 8 (Errors Start)
```
[cds] - loaded model from 3 file(s):
  ...

❌ Error: srv/catalog-service.js:127
   INSERT.as() is no longer supported. Use INSERT.entries() instead.

❌ Error: srv/order-service.js:206
   srv.impl() is no longer supported. Use srv.on() or srv.before() instead.

❌ Error: Annotation '@odata.default.order' in db/schema.cds:45
   This annotation is no longer supported.

[cds] - Application failed to start
```

#### CDS 9 (Major Failures)
```
❌ Error: db/schema.cds:11:3
   Association 'books' requires an ON condition in CDS 9.
   
   entity Authors {
     key ID : UUID;
     books : Association to many Books; // ❌ Missing ON condition
   }
   
   Fix: books : Association to many Books on books.author = $self;

❌ Error: Feature 'odata_new_adapter: false' is no longer supported
   The old protocol adapter has been removed.

❌ Error: srv/catalog-service.js:37
   req.user.locale is not available
   Use req.locale instead

[cds] - Compilation failed
```

---

## Useful Testing Commands

### Check CDS Version Being Used
```bash
npx -y -p @sap/cds@^7.0.0 cds --version
npx -y -p @sap/cds@^8.0.0 cds --version
npx -y -p @sap/cds@^9.0.0 cds --version
```

### View Detailed Compilation Output
```bash
npx -y -p @sap/cds@^9.0.0 cds compile db/schema.cds --to sql
npx -y -p @sap/cds@^9.0.0 cds compile srv --to edmx
```

### Check for Deprecated APIs
```bash
# CDS 7 has a built-in linter
npx -y -p @sap/cds@^7.0.0 cds lint
```

### Deploy to SQLite with Different Versions
```bash
npx -y -p @sap/cds@^7.0.0 cds deploy --to sqlite
npx -y -p @sap/cds@^8.0.0 cds deploy --to sqlite
npx -y -p @sap/cds@^9.0.0 cds deploy --to sqlite
```

---

## Troubleshooting

### Issue: "npx takes too long"
**Solution:** The first run downloads the CDS version. Subsequent runs are faster. Use `compile:*` scripts for faster feedback.

### Issue: "Port 4004 already in use"
**Solution:** Stop any running CDS processes with `Ctrl+C` or:
```bash
lsof -ti:4004 | xargs kill -9
```

### Issue: "SQLite database locked"
**Solution:** Remove the database file:
```bash
rm -f db.sqlite
```

### Issue: "Different errors than expected"
**Solution:** CDS versions may have point releases with fixes. Check exact version:
```bash
npx @sap/cds@^9.0.0 --version
```

---

## Next Steps After Testing

Once you've seen the errors:

1. **Read the error messages carefully** - They often include fix suggestions
2. **Check UPGRADE_ISSUES.md** - Find the corresponding issue number
3. **Read UPGRADE_ISSUES_CDS6_TO_7.md** - For CDS 7 specific guidance
4. **Follow the fix instructions** - Each issue includes detailed fix steps
5. **Test incrementally** - Fix CDS 7 issues first, then 8, then 9
6. **Create upgrade branches** - Test fixes in separate branches

---

## Clean Up

After testing, you can clean up:

```bash
# Remove npx cache (optional)
rm -rf ~/.npm/_npx

# Remove SQLite database
rm -f db.sqlite

# Return to CDS 6
npm run watch
```

---

## Summary

| Command | CDS Version | Expected Result |
|---------|-------------|-----------------|
| `npm run watch` | 6.8.4 | ✅ Works perfectly |
| `npm run test:cds7` | 7.x | ⚠️ Works with warnings |
| `npm run test:cds8` | 8.x | ❌ Errors from removed APIs |
| `npm run test:cds9` | 9.x | ❌ Compilation fails |
| `npm run compile:cds7` | 7.x | ⚠️ Compiles with warnings |
| `npm run compile:cds8` | 8.x | ❌ Compilation errors |
| `npm run compile:cds9` | 9.x | ❌ Compilation fails |

---

## Documentation References

- **UPGRADE_ISSUES.md** - All 56 issues for CDS 6→7/8/9
- **UPGRADE_ISSUES_CDS6_TO_7.md** - 38 issues for CDS 6→7
- **readme.md** - Getting started guide
- **QUICKSTART.md** - Quick command reference

---

**Remember:** This application is intentionally broken for CDS 7/8/9. The errors you see are expected and documented!
