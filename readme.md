# SAP CAP Upgrade Challenge Application

This is an SAP CAP (Cloud Application Programming) application built with **CDS 6** that intentionally contains patterns and APIs that are deprecated or removed in later versions (CDS 7, 8, and 9). The purpose is to demonstrate the challenges involved in upgrading CAP applications across major versions.

## Overview

This application is designed to be **difficult to upgrade** and serves as a learning tool for understanding:
- Breaking changes across CDS versions
- Deprecated APIs and patterns
- Migration strategies
- Testing approaches for upgrades

## Current Version

- **@sap/cds**: 6.8.4
- **@sap/cds-dk**: 6.8.3
- **Node.js**: Compatible with Node.js 14+

## Project Structure

```
upgradeApp/
├── db/
│   ├── schema.cds          # Data model with problematic patterns
│   └── data/               # Initial test data
├── srv/
│   ├── catalog-service.cds # Service definitions
│   ├── catalog-service.js  # Handlers with deprecated APIs
│   ├── order-service.js    # Draft & temporal patterns
│   └── admin-service.js    # Admin operations
├── package.json            # CDS 6 dependencies
├── UPGRADE_ISSUES.md       # Comprehensive upgrade documentation (56 issues)
└── readme.md               # This file
```

## Key Problematic Patterns

### 1. Data Model Issues (db/schema.cds)
- **Associations to many without ON conditions** (breaks in CDS 9)
- **`$now` usage** (behavior change in CDS 9)
- **`@assert.enum`** (removed in CDS 9)
- **`@Common.FieldControl.Mandatory/Readonly`** (removed in CDS 9)
- **Deprecated `$at.from`/`$at.to`** (use `$valid.from`/`$valid.to`)
- **`@odata.default.order`** and **`@cds.default.order`** (removed in CDS 8)

### 2. Service Definition Issues (srv/*.cds)
- Old draft implementation patterns
- Transitive localized view dependencies
- Service-level authorization patterns
- Composition with journal annotation propagation

### 3. Node.js Handler Issues (srv/*.js)
- **`req.user.locale`** and **`req.user.tenant`** (removed in CDS 9)
- **`INSERT.as()`** (removed in CDS 8)
- **`req.params` structure** (breaking change in CDS 9)
- **`srv.impl()`** and **`srv.with()`** (removed in CDS 8)
- Error handling for unique constraints (changed in CDS 9)
- CSN proxy objects `<entity>_texts` (removed in CDS 9)
- Undocumented headers like `x-correlationid`

### 4. Configuration Issues (package.json)
- Old protocol adapter (`odata_new_adapter: false`)
- Native HANA associations enabled
- Missing database services v2 packages

## Getting Started

### Installation

```bash
npm install
```

### Run the Application

```bash
npm start
# or
npm run watch
```

The application will start on http://localhost:4004

### Explore the API

Open http://localhost:4004 in your browser to see the service endpoints:
- `/catalog` - Catalog Service (Books, Authors, Reviews)
- `/orders` - Order Service (Orders with draft, OrderItems)
- `/admin` - Admin Service (requires admin role)

### Deploy Database

```bash
npx cds deploy --to sqlite
```

## Documented Upgrade Issues

See **[UPGRADE_ISSUES.md](./UPGRADE_ISSUES.md)** for a comprehensive list of **56 documented issues** organized by:
- Location in code
- CDS version impact
- Severity (HIGH/MEDIUM/LOW)
- Detailed fix instructions
- References to official release notes

### Issue Summary

| Severity | Count |
|----------|-------|
| HIGH     | 22    |
| MEDIUM   | 29    |
| LOW      | 5     |
| **TOTAL** | **56** |

### Issues by Version

| Version | Breaking Changes | Deprecations |
|---------|-----------------|--------------|
| CDS 8   | 11              | 3            |
| CDS 9   | 42              | 3            |
| Java 3  | 2               | -            |
| Java 4  | 2               | -            |

## Upgrade Strategy

### Recommended Path: CDS 6 → CDS 7 → CDS 8 → CDS 9

#### Phase 1: CDS 6 → CDS 7
1. Fix all associations without ON conditions
2. Test thoroughly

#### Phase 2: CDS 7 → CDS 8 (Major Changes)
1. Migrate to `@cap-js/hana` (database services v2)
2. Update TypeScript imports
3. Migrate to new protocol adapters
4. Fix `INSERT.as()` calls
5. Remove `srv.impl()`/`srv.with()`
6. Update ESLint to v9
7. Fix `@odata.default.order` and `@cds.default.order`

#### Phase 3: CDS 8 → CDS 9 (Major Changes)
1. **Database deployment required** for event queues
2. Fix remaining associations without ON conditions
3. Replace deprecated annotations (`@assert.enum`, etc.)
4. Update API calls (`req.user.locale` → `req.locale`)
5. Fix `req.params` usage
6. Update temporal variables (`$at.*` → `$valid.*`)
7. Update error handling (database services v2)
8. Remove native HANA associations flag

## Testing the Application

### Run Tests (if implemented)
```bash
npm test
```

### Manual Testing Checklist
- [ ] All CQL queries with associations
- [ ] Error handling and validation
- [ ] Authorization checks
- [ ] Temporal data operations
- [ ] Draft operations
- [ ] PUT and PATCH requests
- [ ] Localized data queries
- [ ] Cross-service calls

## High-Risk Areas

When upgrading, pay special attention to:

1. **Database schemas** - Native associations, localized views, journal tables
2. **Error handling** - Error codes and response structure
3. **Authorization** - Deep authorization enabled by default in Java 4
4. **Associations** - All queries using associations without ON conditions
5. **Temporal data** - Operations using `$now`, `$at.from`, `$at.to`
6. **Draft operations** - Ensure lean draft works correctly
7. **Localized data** - Transitive views removed in CDS 8
8. **Event queues** - Database deployment required in CDS 9

## Migration Tools

### Use @sap/cds-attic for Gradual Migration

```bash
npm add @sap/cds-attic
```

Enable deprecated features temporarily:
```json
{
  "cds": {
    "requires": {
      "[attic]": {
        "kinds": {
          "db": { "impl": "@sap/cds-attic/db" }
        }
      }
    },
    "features": {
      "odata_new_adapter": false,
      "cds_validate": false
    },
    "sql": {
      "transitive_localized_views": true
    }
  }
}
```

## CAP Java Considerations

If migrating to CAP Java:

### CAP Java 4 Requirements
- cds-dk: `^8`
- SAP Security: `3.1`
- Node.js: `20`

### Default Behavior Changes
- Deep authorization enabled
- Reject unauthorized selections (403)
- Check input data enabled
- Framework translations used

### Removed Features
- MTX Classic (use Streamlined MTX)
- `MtSubscriptionService` (use `DeploymentService`)
- `cds-feature-xsuaa` (use `cds-feature-identity`)

## Resources

### Official Documentation
- [CAP Release Notes](https://cap.cloud.sap/docs/releases/)
- [CDS 9 Release - May 2025](https://cap.cloud.sap/docs/releases/2025/may25)
- [CDS 8 Release - June 2024](https://cap.cloud.sap/docs/releases/2024/jun24)
- [CAP Java Migration Guides](https://cap.cloud.sap/docs/java/migration)

### Key Release Notes Analyzed
- **May 2025**: CDS 9 (Node.js 9.0, Compiler 6.0, Java 4.0)
- **June 2024**: CDS 8 (Node.js 8.0, Compiler 5.0, Java 3.0)

## Known Limitations

This application will **not run** successfully on CDS 9 without modifications due to:
1. Compiler errors from associations without ON conditions
2. Runtime errors from deprecated API usage
3. Configuration incompatibilities

This is **intentional** to demonstrate upgrade challenges.

## Contributing

This is a demonstration/learning application. If you find additional upgrade issues or patterns to document, please consider:
1. Adding them to UPGRADE_ISSUES.md
2. Updating the code examples
3. Providing fix instructions

## License

ISC

## Disclaimer

This application is for **educational purposes only**. It demonstrates deprecated patterns and should not be used as a template for new applications. Always follow [CAP Best Practices](https://cap.cloud.sap/docs/node.js/best-practices) for production applications.

---

**Created**: 2026-02-06  
**Purpose**: CAP Upgrade Challenge & Learning Tool  
**CDS Version**: 6.8.4 (intentionally outdated)
