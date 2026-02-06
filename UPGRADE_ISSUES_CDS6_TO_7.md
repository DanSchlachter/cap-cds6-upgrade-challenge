# SAP CAP Upgrade Issues - CDS 6 to CDS 7

This document focuses specifically on upgrade challenges from **CDS 6** to **CDS 7** (June 2023 release).

## Overview

**CDS 7 Release**: June 2023
- **@sap/cds**: 7.0.3
- **@sap/cds-compiler**: 4.0.2
- **@sap/cds-dk**: 7.0.3
- **CAP Java**: 2.0.1

This was a **MAJOR RELEASE** with breaking changes kept to a minimum but requiring careful attention during migration.

---

## 🔴 MANDATORY PREREQUISITES (Must Do First!)

### PREREQ #1: Node.js 18 Upgrade ❗️
- **Requirement**: Node.js 16+ (Node.js 18 LTS recommended)
- **Why**: Node.js 14 out of maintenance
- **Impact**: **HIGH** - App won't run without upgrade
- **Migration**: Download from https://nodejs.org

### PREREQ #2: Java 17 Upgrade (Java Projects) ❗️
- **Requirement**: Java 17 minimum for CAP Java 2
- **Impact**: **HIGH** - Won't compile/run
- **Migration**: 
  - Upgrade to Java 17
  - In BAS: Use command "Java: Set Default JDK" (F1)

### PREREQ #3: cds-dk Upgrade ❗️
- **Requirement**: @sap/cds-dk 7.x required for @sap/cds 7.x
- **Impact**: **HIGH** - Version mismatch causes errors
- **Migration**:
  ```bash
  npm i -g @sap/cds-dk
  ```

### PREREQ #4: Start Script Changes ❗️
- **Change**: Executable renamed from `cds` to `cds-serve`
- **Location**: `package.json` scripts
- **Impact**: **HIGH** - App won't start
- **Migration**:
  ```json
  {
    "scripts": {
      "start": "cds-serve"  // Was: "cds run"
    }
  }
  ```
- **Note**: CLI still uses `cds run` or `cds serve`

### PREREQ #5: MTX Migration Mandatory ❗️
- **Change**: @sap/cds-mtx removed, must use @sap/cds-mtxs
- **Impact**: **HIGH** - Multitenant apps won't work
- **Migration**:
  ```bash
  cds add multitenancy
  ```
- **Guide**: https://cap.cloud.sap/docs/guides/multitenancy/old-mtx-migration

---

## 🟡 CRITICAL BREAKING CHANGES

### BREAK #1: Default Service Paths Changed ❗️
- **Location**: All services
- **Change**: Services now served with protocol prefix by default
  - Old: `/admin`
  - New: `/odata/v4/admin`
- **Impact**: **HIGH**
  - SAP Fiori Elements apps will break
  - Custom clients fail
  - API consumers need updates
- **Migration**:
  1. Update all service references
  2. Update Fiori app `manifest.json` with new paths
- **Workaround** (temporary):
  ```json
  {
    "cds": {
      "features": {
        "serve_on_root": true
      }
    }
  }
  ```
- **Warning**: Workaround deprecated, will be removed

---

### BREAK #2: Default String Length Changed ❗️
- **Location**: All `cds.String` types without explicit length
- **Change**: Default changed from 5000 to 255
- **Impact**: **HIGH**
  - Existing data may be truncated
  - Performance improvement for row-based DBs
- **Applies to**: All databases except SAP HANA
- **Migration**:
  - Review ALL String types
  - Add explicit lengths
- **Workaround**:
  ```json
  {
    "cds": {
      "cdsc": {
        "defaultStringLength": 5000
      }
    }
  }
  ```

---

### BREAK #3: Table Aliases in Extends Removed ❗️
- **Location**: CDS model `extend` statements
- **Change**: Table aliases from base entity no longer visible
- **Example**:
  ```cds
  // CDS 6: This worked
  entity Base { key id: Integer; }
  entity P as select from Base as b { id };
  extend P with columns { b.id as bid }  // ❌ Breaks in CDS 7
  
  // CDS 7: Must use
  extend P with columns { id as bid }    // ✅ Works
  ```
- **Impact**: **MEDIUM** - Extension code breaks
- **Migration**: Remove table alias prefixes

---

### BREAK #4: Identifiers Cannot Start with $ ❗️
- **Location**: Table aliases and mixin names
- **Change**: Identifiers starting with `$` now forbidden
- **Impact**: **MEDIUM** - Compile errors
- **Migration**: Rename all identifiers that start with `$`

---

### BREAK #5: Type of with Association Path Removed ❗️
- **Location**: `type of` expressions
- **Change**: Cannot follow associations anymore
- **Example**:
  ```cds
  // CDS 6: This worked
  entity Books {
    authorName : type of author.name; 
  }
  
  // CDS 7: Must use
  entity Books {
    authorName : Authors:name; 
  }
  ```
- **Impact**: **MEDIUM** - Indirect type references break
- **Migration**: Change to `EntityName:elementName` syntax

---

### BREAK #6: Service-Level Referential Integrity Removed ❗️
- **Location**: Configuration
- **Change**: `cds.features.assert_integrity = 'app'` removed
- **Impact**: **MEDIUM** - App-level integrity checks gone
- **Migration**:
  - Use database constraints
  - Use `@assert.target` annotation
- **Guide**: https://cap.cloud.sap/docs/guides/services/constraints

---

### BREAK #7: Audit Logging Removed ❗️
- **Location**: @sap/cds core
- **Change**: Audit logging moved to separate package
- **Impact**: **MEDIUM** - Built-in audit logging breaks
- **Migration**:
  ```bash
  npm add @sap/cds-audit-logging
  ```

---

### BREAK #8: OData Flavor x4 Deprecated ❗️
- **Location**: Configuration
- **Change**: `cds.odata.flavor` and `cds.odata.structs` deprecated
- **Impact**: **LOW** - Rarely used
- **Will be removed**: Next major version
- **Migration**: Remove these configuration options

---

### BREAK #9: Unofficial Features Removed ❗️
- **Removed APIs**:
  - `req.run()` → Use `srv.run(query)`
  - `req.getUriInfo()` - removed
  - `req.getUrlObject()` - removed
  - `cds.env.features.bigjs` - removed
  - `cds.env.features.parameterized_numbers` - removed
  - `cds.env.features.cds_tx_protection` - removed
- **Impact**: **MEDIUM** - Code using these breaks
- **Migration**: Replace with official APIs

---

## 🟢 IMPORTANT BEHAVIORAL CHANGES

### CHANGE #1: New Database Services ❗️
- **Change**: New database service architecture
- **Packages**:
  - `@cap-js/sqlite` (new)
  - `@cap-js/postgres` (new)
  - `@sap/cds-hana` (coming)
- **Features**:
  - Maximized feature parity across databases
  - Enhanced path expressions with infix filters
  - Standardized portable functions
- **Impact**: **HIGH**
  - Undocumented behavior may change
  - First release - test thoroughly
- **Migration**:
  ```bash
  npm add @cap-js/sqlite
  # or
  npm add @cap-js/postgres
  ```

---

### CHANGE #2: Lean Draft ❗️
- **Change**: Draft handling completely reimplemented
- **Benefits**:
  - Clear separation of draft/active logic
  - Better performance (no UNION SQL)
  - Draft siblings are compliant CSN entities
- **Example**:
  ```javascript
  // CDS 7: Can differentiate
  srv.after("READ", MyEntity, () => {});         // Active
  srv.after("READ", MyEntity.drafts, () => {});  // Drafts
  ```
- **Impact**: **HIGH**
  - Draft query handling may change
  - Required by new database services
- **Migration**:
  - Enabled by default
  - Test thoroughly
- **Compatibility mode**:
  ```json
  {
    "cds": {
      "fiori": {
        "draft_compat": true
      }
    }
  }
  ```
- **Warning**: Compatibility mode will be removed

---

### CHANGE #3: Simplified After Handlers ❗️
- **Change**: `result` argument always an array
- **Before (CDS 6)**:
  ```javascript
  srv.after('READ', Books, result => {
    if (!result) return
    if (!Array.isArray(result)) result = [result]
    for (let each of result) // process
  })
  ```
- **After (CDS 7)**:
  ```javascript
  srv.after('READ', Books, books => {
    for (let each of books) // process
  })
  ```
- **Impact**: **LOW** - Mostly non-breaking
- **Migration**: Simplify handler code

---

### CHANGE #4: Multiple Protocols Support
- **Change**: Services can be served via multiple protocols
- **Example**:
  ```cds
  @protocol: ['odata-v4', 'rest']
  service AdminService { ... }
  ```
- **Serves at**: 
  - `/odata/v4/admin` 
  - `/rest/admin`
- **Impact**: **MEDIUM** - See service path changes

---

### CHANGE #5: New Packages Required
- **Packages**:
  - `@sap/cds-fiori` - SAP Fiori-related code
  - `@sap/cds-hana` - SAP HANA-related code
- **Impact**: **MEDIUM** - Will become required
- **Migration**:
  ```bash
  npm add @sap/cds-fiori @sap/cds-hana
  ```
- **Note**: Remove direct `hdb` driver dependency

---

### CHANGE #6: $search Behavior
- **Change**: Only searches primitive strings by default
- **Impact**: **LOW** - Custom search may change
- **Migration**: Use `@cds.search` annotation for expression columns

---

### CHANGE #7: SAP Cloud SDK v3 Required
- **Change**: Cloud SDK v2 out of maintenance
- **Impact**: **MEDIUM**
- **Migration**:
  ```bash
  npm add @sap-cloud-sdk/resilience
  ```

---

## 🟡 JAVA-SPECIFIC CHANGES (CAP Java 2.0)

### JAVA #1: New Major Version 2.x ❗️
- **Change**: CAP Java 2.0 is a major release
- **Requirements**: Java 17 minimum
- **Impact**: **HIGH**
  - Breaking API changes
  - Configuration changes
  - Behavior changes
- **Maintenance**: 
  - 1.34.x in maintenance mode (critical bugs only)
  - No fixes for < 1.34.x
- **Migration Guide**: https://cap.cloud.sap/docs/java/migration#one-to-two

---

### JAVA #2: Spring Boot 3 ❗️
- **Change**: Now runs on Spring Boot 3
- **Features**:
  - JDK 17 baseline
  - Spring Framework 6
  - Jakarta EE 9 (javax → jakarta)
  - Tomcat 10.1
  - GraalVM Native Image support
  - Virtual threads (experimental)
- **Impact**: **HIGH**
  - Dependencies need updates
  - Namespace changes
- **End of Life**: Spring Boot 2.7 ends November 2023
- **Migration**: Follow Spring Boot 3 migration guide

---

### JAVA #3: API Cleanup ❗️
- **Removed**: All deprecated interfaces, methods, properties, annotations
- **Changes**:
  - Refs now immutable
  - NULL value handling changed
- **Impact**: **HIGH** - Code breaks
- **Migration**: Update all deprecated API usages first

---

### JAVA #4: Lean Draft Changes ❗️
- **Change**: No navigation between different inactive draft documents
- **Impact**: **MEDIUM**
- **Migration**: Review draft navigation code

---

### JAVA #5: OData $count in $expand
- **New Feature**: Supports `$count` in `$expand`
- **Example**:
  ```http
  GET /service/Authors?$expand=Books($count=true;$top=3)
  ```
- **Impact**: Non-breaking

---

### JAVA #6: Simplified @After-Handlers
- **Change**: Result can be injected as POJO argument
- **Example**:
  ```java
  @After(event = CqnService.EVENT_READ)
  public void afterReadResult(Result result) {
    Stream<Row> rows = result.stream();
  }
  ```
- **Impact**: Non-breaking, cleaner code

---

### JAVA #7: Structured Event Messages
- **New Feature**: Structured messaging configuration
- **Configuration**:
  ```yaml
  cds:
    messaging.services:
      - name: "messaging"
        kind: "enterprise-messaging"
        structured: true
  ```
- **Impact**: May affect message representation

---

## 🟢 MTX SERVICES CHANGES (1.9.2)

### MTX #1: Simplified Configuration
- **New Command**: `cds add multitenancy`
- **Adds**:
  - Package: `@sap/cds-mtxs`
  - Profile: `with-mtx-sidecar`
  - Sidecar subproject: `mtx/sidecar`
- **Impact**: Non-breaking, easier setup

---

### MTX #2: Sidecar Default for Node.js ❗️
- **Change**: Sidecar now default for Node.js (was Java only)
- **Impact**: **MEDIUM**
  - Project structure changes
  - Deployment structure changes
- **Migration**: Use `cds add multitenancy` for proper setup

---

### MTX #3: Static Profiles
- **Change**: Uses static profiles `mtx-sidecar` and `with-mtx-sidecar`
- **Impact**: Simplified configuration

---

### MTX #4: CLI Support for Tenant Upgrade
- **New Command**:
  ```bash
  cds upgrade t1 --at http://localhost:4005 -u alice:
  ```
- **Impact**: Easier local testing

---

## 🔧 TOOLKIT/CLI CHANGES (7.0.3)

### TOOL #1: cds deploy Changes ❗️
- **Change**: `cds deploy --to sqlite` no longer modifies package.json
- **Impact**: **LOW** - Less side effects
- **Migration**: Remove `--no-save` flag if used

---

### TOOL #2: cds build Changes ❗️
- **Removed**:
  - `cds build/all` no longer available
  - `cds build --for java` no longer supports CAP Java Classic
- **Impact**: **MEDIUM** - Build commands fail
- **Migration**:
  - Use `cds build` instead of `cds build/all`
  - Migrate from CAP Java Classic

---

### TOOL #3: Deploy Format hdbtable ❗️
- **Change**: Default SAP HANA format changed from `hdbcds` to `hdbtable`
- **Creates**: `hdbtable` and `hdbview` files
- **Impact**: **HIGH** - Deployment artifacts change
- **Configuration**:
  ```json
  {
    "cds": {
      "hana": { 
        "deploy-format": "hdbtable"
      }
    }
  }
  ```
- **Revert if needed**:
  ```json
  {
    "cds": {
      "requires": {
        "db": {
          "kind": "hana",
          "deploy-format": "hdbcds"
        }
      }
    }
  }
  ```

---

### TOOL #4: Improved cds env
- **Change**: Simplified querying `cds env <key>` (no `get` needed)
- **New**: `--keys` option
- **Examples**:
  ```bash
  cds env requires
  cds env requires --keys
  ```
- **Impact**: Non-breaking

---

## 🆕 NEW FEATURES (Beta/Non-Breaking)

### NEW #1: Calculated Elements (Beta)
- **On-Read (Virtual)**:
  ```cds
  entity People {
    firstName : String;
    lastName : String;
    fullName : String = firstName || ' ' || lastName;
  }
  ```
- **On-Write (Stored)**:
  ```cds
  entity People {
    fullName : String = (firstName || ' ' || lastName) stored;
  }
  ```
- **Requirements**:
  - Type specification mandatory
  - Java runtime: on-read in ad-hoc queries
  - Node.js: on roadmap
- **Impact**: Beta feature, test thoroughly

---

### NEW #2: Annotated Return Types
- **New Feature**: Annotate action/function return types
- **Example**:
  ```cds
  action myAction() returns array of {
    @title: 'Book Title'
    title : String;
  };
  ```
- **Impact**: Non-breaking

---

## 📊 UPGRADE PRIORITY MATRIX

### 🔴 MUST FIX IMMEDIATELY (P0)
1. ✅ Upgrade Node.js to 18
2. ✅ Upgrade Java to 17 (Java projects)
3. ✅ Upgrade cds-dk: `npm i -g @sap/cds-dk`
4. ✅ Change start scripts: `cds run` → `cds-serve`
5. ✅ Migrate @sap/cds-mtx to @sap/cds-mtxs
6. ✅ Update service paths (add protocol prefix)
7. ✅ Review string lengths in models
8. ✅ Remove table alias usage in extends
9. ✅ Fix identifiers starting with `$`
10. ✅ Update `type of` association paths

### 🟡 HIGH PRIORITY (P1)
1. Test with Lean Draft or enable compatibility mode
2. Migrate to new database services
3. Add @sap/cds-fiori and @sap/cds-hana packages
4. Update to Spring Boot 3 (Java)
5. Remove deprecated Java API usages
6. Update SAP Cloud SDK to v3
7. Switch to hdbtable deploy format

### 🟢 MEDIUM PRIORITY (P2)
1. Simplify after handlers
2. Update cds build commands
3. Remove unofficial feature usages
4. Review OData flavor usage
5. Test MTX sidecar setup

### ⚪ LOW PRIORITY (P3)
1. Adopt calculated elements (beta)
2. Use multiple protocols feature
3. Use improved CLI commands
4. Review $search behavior

---

## ✅ MIGRATION CHECKLIST

### Prerequisites
- [ ] Upgrade Node.js to 18
- [ ] Upgrade Java to 17 (Java projects)
- [ ] `npm i -g @sap/cds-dk`

### Package.json Updates
- [ ] Change `"cds run"` to `"cds-serve"` in scripts
- [ ] Add `@sap/cds-fiori`
- [ ] Add `@sap/cds-hana`
- [ ] Add `@cap-js/sqlite` or `@cap-js/postgres`
- [ ] Add `@sap-cloud-sdk/resilience`
- [ ] Migrate `@sap/cds-mtx` to `@sap/cds-mtxs`

### CDS Model Changes
- [ ] Add explicit string lengths to all String types
- [ ] Remove table aliases from extend statements
- [ ] Rename identifiers starting with `$`
- [ ] Fix `type of` with association paths

### Node.js Code Changes
- [ ] Update service paths (add protocol prefix)
- [ ] Replace `req.run()` with `srv.run()`
- [ ] Simplify after handlers (result always array)
- [ ] Update `$search` implementations
- [ ] Remove referential integrity app checks
- [ ] Remove unofficial API usages

### Java Code Changes
- [ ] Follow CAP Java 2.0 migration guide
- [ ] Update deprecated APIs
- [ ] Update to Spring Boot 3
- [ ] Test NULL handling changes
- [ ] Review draft navigation code

### Configuration Changes
- [ ] Set deploy-format to `hdbtable`
- [ ] Configure Lean Draft (or compat mode)
- [ ] Update MTX configuration with `cds add multitenancy`
- [ ] Review protocol configuration
- [ ] Update service path workarounds

### Testing
- [ ] Test with new database services
- [ ] Test Lean Draft behavior
- [ ] Test all service endpoints
- [ ] Test multitenant operations
- [ ] Test build and deployment
- [ ] Test SAP Fiori Elements apps
- [ ] Test API consumers

### Deployment
- [ ] Update deployment descriptors
- [ ] Update service bindings
- [ ] Update Fiori app manifests
- [ ] Test in target environment
- [ ] Plan database migration for hdbtable

---

## 🔗 MIGRATION RESOURCES

### Official Guides
- **Java Migration**: https://cap.cloud.sap/docs/java/migration#one-to-two
- **MTX Migration**: https://cap.cloud.sap/docs/guides/multitenancy/old-mtx-migration
- **Database Guide**: https://cap.cloud.sap/docs/guides/databases/
- **Multitenancy Guide**: https://cap.cloud.sap/docs/guides/multitenancy/
- **Node.js Reference**: https://cap.cloud.sap/docs/node.js/
- **Release Notes**: https://cap.cloud.sap/docs/releases/2023/jun23

### Support
- **CAP Community**: https://community.sap.com/
- **GitHub Issues**: https://github.com/cap-js/
- **Stack Overflow**: Tag `sapui5` + `cap`

---

## 📈 SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Mandatory Prerequisites | 5 |
| Critical Breaking Changes | 9 |
| Important Behavioral Changes | 7 |
| Java-Specific Changes | 7 |
| MTX Changes | 4 |
| Toolkit/CLI Changes | 4 |
| New Features | 2 |
| **TOTAL ISSUES** | **38** |

### By Severity
| Severity | Count |
|----------|-------|
| P0 (Must Fix) | 10 |
| P1 (High Priority) | 7 |
| P2 (Medium Priority) | 5 |
| P3 (Low Priority) | 4 |
| Non-Breaking | 12 |
| **TOTAL** | **38** |

---

**Generated**: February 6, 2026  
**CDS Version**: 6.x → 7.0.3 Migration Guide  
**Status**: Comprehensive upgrade guide based on June 2023 release notes  

For CDS 7 → 8 → 9 upgrade issues, see [UPGRADE_ISSUES.md](./UPGRADE_ISSUES.md)
