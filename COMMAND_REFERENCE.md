# Quick Command Reference

## ✅ Test Commands That Work Now

### Using npm scripts (Recommended)

#### Compile Only (Fast - No Server Start)
```bash
npm run compile:cds7    # Compile with CDS 7 (~10 seconds)
npm run compile:cds8    # Compile with CDS 8 (~10 seconds)
npm run compile:cds9    # Compile with CDS 9 (~10 seconds)
```

#### Full Server Start (Slower)
```bash
npm run test:cds7       # Start server with CDS 7
npm run test:cds8       # Start server with CDS 8
npm run test:cds9       # Start server with CDS 9
```
Press `Ctrl+C` to stop the server.

---

### Using Direct npx Commands

#### Compile Only
```bash
npx -y -p @sap/cds@^7.0.0 cds compile srv
npx -y -p @sap/cds@^8.0.0 cds compile srv
npx -y -p @sap/cds@^9.0.0 cds compile srv
```

#### Start Server
```bash
npx -y -p @sap/cds@^7.0.0 cds watch
npx -y -p @sap/cds@^8.0.0 cds watch
npx -y -p @sap/cds@^9.0.0 cds watch
```

#### Check Version
```bash
npx -y -p @sap/cds@^7.0.0 cds --version
npx -y -p @sap/cds@^8.0.0 cds --version
npx -y -p @sap/cds@^9.0.0 cds --version
```

---

### Using Helper Scripts

#### Quick Test (Simple Success/Fail)
```bash
./quick-test.sh 7       # Test CDS 7
./quick-test.sh 8       # Test CDS 8
./quick-test.sh 9       # Test CDS 9
```

#### Comprehensive Test (All Versions)
```bash
./test-all-versions.sh
```

---

## Expected Results

| Test | CDS 6 | CDS 7 | CDS 8 | CDS 9 |
|------|-------|-------|-------|-------|
| Compile | ✅ Success | ✅ Success (warnings) | ✅ Success (warnings) | ✅ Success (warnings) |
| Start Server | ✅ Works | ⚠️ Works (deprecations) | ❌ Errors | ❌ Fails |

**Note**: 
- CDS 7/8/9 will compile successfully but show deprecation warnings
- CDS 8/9 will fail at **runtime** when starting the server (handler errors)
- Use `compile:*` commands for quick feedback

---

## Command Syntax Explained

### Old syntax (doesn't work with npm 10+):
```bash
❌ npx --yes @sap/cds@^7.0.0 watch
❌ npx --package=@sap/cds@^7.0.0 --yes cds watch
```

### New syntax (works with npm 10+):
```bash
✅ npx -y -p @sap/cds@^7.0.0 cds watch
```

**Flags:**
- `-y` = automatically accept download (same as `--yes`)
- `-p PACKAGE` = package to install temporarily (same as `--package=PACKAGE`)

---

## Troubleshooting

### "could not determine executable to run"
**Cause**: Wrong npx syntax for npm 10+  
**Fix**: Use `npx -y -p @sap/cds@^X.0.0 cds ...`

### Commands take too long
**Cause**: First run downloads CDS version  
**Fix**: Subsequent runs are faster. Use `compile:*` instead of `test:*`

### Port 4004 already in use
**Cause**: Another CDS server is running  
**Fix**: Press `Ctrl+C` or run:
```bash
lsof -ti:4004 | xargs kill -9
```

---

## Environment

- **Node.js**: v22.21.1
- **npm**: 10.9.4
- **Current CDS**: 6.8.4

---

## Full Documentation

- **TEST_UPGRADES.md** - Comprehensive testing guide with expected errors
- **readme.md** - Main project documentation
- **UPGRADE_ISSUES.md** - All 56 upgrade issues documented
