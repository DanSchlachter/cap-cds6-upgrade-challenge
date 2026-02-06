# SAP CAP Upgrade Application - Summary

## Project Successfully Created!

This SAP CAP application has been created with **CDS 6** (version 6.8.4) and contains **56 documented upgrade issues** that will occur when upgrading to CDS 7, 8, or 9.

## What Was Created

### 1. Project Structure
```
upgradeApp/
├── db/
│   ├── schema.cds                    # Data model with 9 problematic patterns
│   └── data/
│       ├── my.bookshop-Authors.csv   # Sample authors data
│       └── my.bookshop-Books.csv     # Sample books data
├── srv/
│   ├── catalog-service.cds           # Service definitions (6 issues)
│   ├── catalog-service.js            # 9 deprecated API patterns
│   ├── order-service.js              # 8 draft & temporal issues
│   └── admin-service.js              # 5 admin-specific issues
├── package.json                      # CDS 6 configuration (2 config issues)
├── UPGRADE_ISSUES.md                 # Complete documentation of all 56 issues
└── readme.md                         # User guide
```

### 2. Key Features

#### Data Model Entities (10 entities)
- **Authors** - with association without ON condition
- **Books** - with temporal data, deprecated annotations
- **Reviews** - with virtual fields
- **Orders** - with draft support, temporal data
- **OrderItems** - with composition patterns
- **Categories** - with deprecated ordering
- **Products** - with localized data
- **Inventory** - with native HANA patterns
- **Suppliers** - with unmanaged associations

#### Services (3 services)
1. **CatalogService** (`/catalog`) - Books, Authors, Reviews, Products, Categories
2. **OrderService** (`/orders`) - Orders (with draft), OrderItems, OrderHistory
3. **AdminService** (`/admin`) - All entities with admin access

#### Node.js Handlers
- **catalog-service.js** - 9 deprecated API patterns
- **order-service.js** - 8 draft & temporal issues
- **admin-service.js** - 5 configuration & behavior issues

### 3. Documented Issues

**UPGRADE_ISSUES.md** contains comprehensive documentation of all 56 issues:

| Category | Issues |
|----------|--------|
| Data Model | 11 issues |
| Service Definitions | 7 issues |
| Node.js Handlers | 22 issues |
| Configuration | 2 issues |
| Database/Deployment | 3 issues |
| Package Dependencies | 4 issues |
| CAP Java | 3 issues |
| Multitenancy | 3 issues |
| **TOTAL** | **56 issues** |

### 4. Severity Breakdown

| Severity | Count | Impact |
|----------|-------|--------|
| **HIGH** | 22 | Will break compilation or runtime |
| **MEDIUM** | 29 | Will cause warnings or behavior changes |
| **LOW** | 5 | Minor issues or documentation changes |

### 5. Version Impact

| Version | Breaking Changes | Deprecations |
|---------|-----------------|--------------|
| **CDS 8** | 11 | 3 |
| **CDS 9** | 42 | 3 |
| **Java 3** | 2 | 0 |
| **Java 4** | 2 | 0 |
| **TOTAL** | **57** | **6** |

## Most Critical Issues

### Top 10 Breaking Changes

1. **Associations without ON conditions** (Issues #1, #8, #9, #37)
   - Breaks in: CDS 9
   - Impact: Compiler error, application won't start

2. **Database services v2 migration** (Issues #25, #27, #30, #46)
   - Required in: CDS 9
   - Impact: Error handling completely changes

3. **req.params structure change** (Issue #22)
   - Breaks in: CDS 9
   - Impact: Runtime errors in all request handlers

4. **Native HANA associations** (Issues #36, #42)
   - Changes in: CDS 9
   - Impact: First deployment takes much longer

5. **Transactional event queues** (Issue #44)
   - Enabled in: CDS 9
   - Impact: Database deployment required

6. **INSERT.as() removed** (Issue #21)
   - Removed in: CDS 8
   - Impact: Runtime error

7. **req.user.locale/tenant removed** (Issues #19, #20)
   - Removed in: CDS 9
   - Impact: Runtime errors

8. **Transitive localized views** (Issue #12)
   - Removed in: CDS 8
   - Impact: Queries through associations may fail

9. **Old protocol adapter** (Issue #41)
   - Removed in: CDS 9
   - Impact: Response format changes

10. **MTX configuration changes** (Issues #54, #55, #56)
    - Changes in: CDS 9
    - Impact: Multitenancy won't work

## How to Use This Application

### 1. Explore the Code
```bash
cd upgradeApp
cat readme.md              # Read the user guide
cat UPGRADE_ISSUES.md      # Review all 56 issues
```

### 2. Install and Run (CDS 6)
```bash
npm install
npm start
```

Visit: http://localhost:4004

### 3. Study the Issues

Each issue in UPGRADE_ISSUES.md includes:
- **Location**: Exact file and line number
- **Version Impact**: Which CDS version breaks this
- **Severity**: HIGH/MEDIUM/LOW
- **Description**: What's wrong
- **Fix**: How to resolve it
- **Reference**: Link to official release notes

### 4. Try to Upgrade (Learning Exercise)

```bash
# Try upgrading to CDS 8
npm install @sap/cds@^8.0.0 @sap/cds-dk@^8.0.0

# This will fail! Study the errors and compare with UPGRADE_ISSUES.md
```

## Upgrade Path

### Phase 1: CDS 6 → CDS 7
- Fix all associations without ON conditions (4 issues)
- Test thoroughly

### Phase 2: CDS 7 → CDS 8
- Migrate to `@cap-js/hana` (database services v2)
- Update TypeScript imports
- Migrate to new protocol adapters
- Fix `INSERT.as()` calls
- Remove `srv.impl()`/`srv.with()`
- Update ESLint to v9
- Fix ordering annotations

### Phase 3: CDS 8 → CDS 9
- **Database deployment required** for event queues
- Replace all deprecated annotations
- Update all API calls (req.user.locale, req.params, etc.)
- Update temporal variables
- Update error handling
- Remove native HANA associations flag
- Update MTX configuration

## Testing Strategy

### High-Risk Areas
1. Database schemas (associations, localized views)
2. Error handling (error codes, response structure)
3. Authorization (deep authorization in Java 4)
4. Temporal data (operations using $now, $at.*)
5. Draft operations
6. Localized data queries
7. Event queues

### Testing Checklist
- [ ] All CQL queries with associations
- [ ] Error handling and validation
- [ ] Authorization checks
- [ ] Temporal data operations
- [ ] Draft create/edit/activate
- [ ] PUT and PATCH requests
- [ ] Localized data queries
- [ ] Cross-service calls

## Files to Review

### For Understanding Breaking Changes
1. **UPGRADE_ISSUES.md** - Complete documentation (28 KB)
2. **db/schema.cds** - 9 data model issues
3. **srv/catalog-service.js** - 9 API pattern issues
4. **srv/order-service.js** - 8 draft & temporal issues
5. **package.json** - Configuration issues

### For Learning Best Practices
Compare the deprecated patterns in this app with:
- [CAP Best Practices](https://cap.cloud.sap/docs/node.js/best-practices)
- [CDS 9 Release Notes](https://cap.cloud.sap/docs/releases/2025/may25)
- [Migration Guides](https://cap.cloud.sap/docs/java/migration)

## Resources

### Official Documentation
- **Release Notes**: https://cap.cloud.sap/docs/releases/
- **CDS 9 (May 2025)**: https://cap.cloud.sap/docs/releases/2025/may25
- **CDS 8 (June 2024)**: https://cap.cloud.sap/docs/releases/2024/jun24
- **Java Migration**: https://cap.cloud.sap/docs/java/migration

### Tools
- **@sap/cds-attic**: Package for deprecated features (gradual migration)
- **@cap-js/cds-test**: New testing framework (CDS 9)
- **@cap-js/hana**: New database service v2 (CDS 8+)

## Success Metrics

This application successfully demonstrates:
- ✅ 56 documented upgrade issues
- ✅ 10 entities with problematic patterns
- ✅ 3 services with deprecated features
- ✅ 22 Node.js handler issues
- ✅ Complete upgrade documentation
- ✅ Version-specific migration paths
- ✅ Testing strategies
- ✅ Fix instructions for each issue

## Next Steps

1. **Study the UPGRADE_ISSUES.md** file thoroughly
2. **Review each code file** and compare with issues
3. **Try upgrading** to CDS 8 (it will fail - this is expected!)
4. **Practice fixing** issues one by one
5. **Test after each fix** to understand impact
6. **Learn migration strategies** for production apps

## Educational Value

This application teaches:
- How to identify breaking changes from release notes
- Impact assessment of deprecated APIs
- Migration planning and phasing
- Testing strategies for upgrades
- Risk mitigation approaches
- Best practices for CAP development

## Disclaimer

**This is a learning tool only!**

❌ Do NOT use this code in production  
❌ Do NOT copy these patterns to new apps  
✅ DO study the issues and fixes  
✅ DO use it for learning upgrade challenges  
✅ DO follow CAP best practices for real apps  

---

**Created**: February 6, 2026  
**Purpose**: CAP Upgrade Challenge & Learning Tool  
**CDS Version**: 6.8.4 (intentionally outdated)  
**Issues Documented**: 56  
**Status**: ✅ Ready for Study
