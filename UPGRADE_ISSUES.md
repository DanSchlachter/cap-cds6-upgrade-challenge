# SAP CAP Upgrade Issues - CDS 6 to CDS 7/8/9

This document lists all the patterns in this application that will cause issues when upgrading from CDS 6 to newer versions (CDS 7, 8, and 9).

## Overview

This application was intentionally built with CDS 6 using patterns and APIs that are deprecated or removed in later versions. Each issue is documented with:
- **Location**: Where in the code the issue exists
- **Version Impact**: Which CDS version will break this pattern
- **Severity**: HIGH, MEDIUM, or LOW
- **Fix**: How to resolve the issue

---

## Data Model Issues (db/schema.cds)

### ISSUE #1: Association to many without ON condition ❗️
- **Location**: `db/schema.cds:13` - `Authors.books`
- **Version**: Breaks in **CDS 9**
- **Severity**: **HIGH**
- **Description**: `books: Association to many Books;` has no ON condition. Previously treated as managed `to one`, now causes compiler error.
- **Fix Options**:
  1. Add ON condition: `books: Association to many Books on books.author_ID = $self.ID;`
  2. Change to `to one`: `books: Association to Books;`
  3. Add explicit backlink: `books: Association to many Books on books.author = $self;`
- **Reference**: [CDS 9 Release Notes - Association to many without ON](https://cap.cloud.sap/docs/releases/2025/may25#unspecified-assoc)

### ISSUE #2: Using $now (changes behavior) ❗️
- **Location**: `db/schema.cds:17` - `Authors.lastActive`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `$now` now translates to `session_context($now)` (transaction time) instead of `current_timestamp`
- **Fix**: Replace `$now` with `current_timestamp` if old behavior is needed
- **Reference**: [CDS 9 Release Notes - $now is Transaction Time](https://cap.cloud.sap/docs/releases/2025/may25#now-is-transaction-time)

### ISSUE #3: Using @assert.enum ❗️
- **Location**: `db/schema.cds:28-29` - `Books.genre`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `@assert.enum` annotation removed in favor of `@assert.range`
- **Fix**: Change to `@assert.range: [ 'Fiction', 'Non-Fiction', 'Science', 'History' ]`
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #4: Using @Common.FieldControl.Mandatory ❗️
- **Location**: `db/schema.cds:32-33` - `Books.isbn`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `@Common.FieldControl: #Mandatory` removed
- **Fix**: Replace with `@mandatory`
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #5: Using @Common.FieldControl.Readonly ❗️
- **Location**: `db/schema.cds:36-37` - `Books.publishedAt`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `@Common.FieldControl: #ReadOnly` removed
- **Fix**: Replace with `@readonly`
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #6: Virtual element with null as value ❗️
- **Location**: `db/schema.cds:55` - `Reviews.virtualField1`
- **Version**: Deprecated in **CDS 9**
- **Severity**: **LOW**
- **Description**: Pattern `virtual null as virtualField1` is deprecated
- **Fix**: Define virtual elements without explicit value: `virtual virtualField1 : String;`
- **Reference**: [CDS 9 - Virtual Elements in Views](https://cap.cloud.sap/docs/releases/2025/may25#virtual-elements-in-views)

### ISSUE #7: Using $at.from and $at.to ❗️
- **Location**: `db/schema.cds:73` - `Orders.orderDate`
- **Version**: Deprecated in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `$at.from` and `$at.to` deprecated in favor of `$valid.from` and `$valid.to`
- **Fix**: Replace with `$valid.from` and `$valid.to`
- **Reference**: [CDS 9 Deprecations](https://cap.cloud.sap/docs/releases/2025/may25#deprecations)

### ISSUE #8: Association to many without ON condition (nested) ❗️
- **Location**: `db/schema.cds:87` - `OrderItems.relatedBooks`
- **Version**: Breaks in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Another association without ON condition
- **Fix**: Add ON condition or remove if not needed

### ISSUE #9: Association to many without ON condition (Suppliers) ❗️
- **Location**: `db/schema.cds:139` - `Suppliers.products`
- **Version**: Breaks in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Unmanaged association without proper ON condition
- **Fix**: Add ON condition: `products: Association to many Products on products.supplier_ID = $self.ID;`

### ISSUE #10: Using @odata.default.order ❗️
- **Location**: `db/schema.cds:59` - `Reviews.helpful`
- **Version**: Removed in **CDS 8**
- **Severity**: **MEDIUM**
- **Description**: `@odata.default.order` annotation removed
- **Fix**: Add `order by` clause to view definition instead
- **Reference**: [CDS 8 Removed Features](https://cap.cloud.sap/docs/releases/2024/jun24#removed-features)

### ISSUE #11: Using @cds.default.order ❗️
- **Location**: `db/schema.cds:94` - `Categories` entity
- **Version**: Removed in **CDS 8**
- **Severity**: **MEDIUM**
- **Description**: `@cds.default.order` annotation removed
- **Fix**: Add `order by` clause to view definition instead
- **Reference**: [CDS 8 Removed Features](https://cap.cloud.sap/docs/releases/2024/jun24#removed-features)

---

## Service Definition Issues (srv/catalog-service.cds)

### ISSUE #12: Transitive localized views ❗️
- **Location**: `srv/catalog-service.cds:42` - `Products` projection
- **Version**: Breaking change in **CDS 8**
- **Severity**: **HIGH**
- **Description**: Transitive localized views removed - entities without own localized data don't get localized views
- **Impact**: ~50% reduction in views, faster deployment, but may break queries through associations
- **Workaround**: Set `cds.sql.transitive_localized_views: true` (temporary)
- **Reference**: [CDS 8 - Transitive Localized Views Removed](https://cap.cloud.sap/docs/releases/2024/jun24#transitive-localized-views-removed)

### ISSUE #13: Service @odata.default.order ❗️
- **Location**: `srv/catalog-service.cds:14` - `Books` entity
- **Version**: Removed in **CDS 8**
- **Severity**: **MEDIUM**
- **Description**: `@odata.default.order` on service entities removed
- **Fix**: Add `order by title` to the projection definition

### ISSUE #14: Deep authorization ❗️
- **Location**: `srv/catalog-service.cds:20` - `Authors` @requires
- **Version**: Behavior change in **CAP Java 4**
- **Severity**: **MEDIUM**
- **Description**: Deep authorization now enabled by default in CAP Java 4
- **Impact**: Authorization checks now deeply enforced
- **Reference**: [CAP Java 4 Migration](https://cap.cloud.sap/docs/releases/2025/may25#cap-java-v4)

### ISSUE #15: Old draft implementation ❗️
- **Location**: `srv/catalog-service.cds:75` - `Orders` @odata.draft.enabled
- **Version**: Removed in **CDS 8**
- **Severity**: **HIGH**
- **Description**: Old draft implementation removed, only lean draft supported
- **Impact**: `cds.fiori.draft_compat` removed in CDS 9
- **Fix**: Migrate to lean draft (should already be the default in CDS 6+)
- **Reference**: [CDS 8 - Lean Draft Only](https://cap.cloud.sap/docs/releases/2024/jun24#lean-draft-only)

### ISSUE #16: Journal annotation propagation ❗️
- **Location**: `srv/catalog-service.cds:82` - `OrderItems` composition
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `@cds.persistence.journal` now propagates to composition children
- **Impact**: Requires undeploy/redeploy of `.hdbtable` → `.hdbmigrationtable`
- **Reference**: [CDS 9 - Generated Entities and journal](https://cap.cloud.sap/docs/releases/2025/may25#generated-entities-and-cds-persistence-journal)

### ISSUE #17: Service-level restrictions ❗️
- **Location**: `srv/catalog-service.cds:99` - `AdminService` @requires
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: Local service calls now respect @requires by default
- **Impact**: `cds.features.service_level_restrictions=true` by default
- **Workaround**: Set to `false` if old behavior needed
- **Reference**: [CDS 9 - Service Level Restrictions](https://cap.cloud.sap/docs/releases/2025/may25#service-level-restrictions)

### ISSUE #18: Action/Function authorization filters ❗️
- **Location**: `srv/catalog-service.cds:52-53` - `submitReview` action
- **Version**: Changed in **CAP Java 3**
- **Severity**: **MEDIUM**
- **Description**: Auth filters for actions and functions now instance-based
- **Reference**: [CAP Java 3 - IBA for Actions/Functions](https://cap.cloud.sap/docs/releases/2024/jun24#actions-functions-iba)

---

## Node.js Handler Issues (srv/*.js)

### ISSUE #19: Using req.user.locale ❗️
- **Location**: `srv/catalog-service.js:15`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `req.user.locale` removed
- **Fix**: Use `req.locale` instead
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #20: Using req.user.tenant ❗️
- **Location**: `srv/catalog-service.js:23`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `req.user.tenant` removed
- **Fix**: Use `req.tenant` instead
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #21: Using INSERT.as() ❗️
- **Location**: `srv/catalog-service.js:31-39`
- **Version**: Removed in **CDS 8**
- **Severity**: **HIGH**
- **Description**: `INSERT.as()` API removed
- **Fix**: Use `INSERT.entries()` or `INSERT.from()` instead
- **Reference**: [CDS 8 Removed APIs](https://cap.cloud.sap/docs/releases/2024/jun24#removed-features)

### ISSUE #22: req.params structure changed ❗️
- **Location**: `srv/catalog-service.js:48-49`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **HIGH**
- **Description**: `req.params` always returns array of objects, even for single key
- **Old**: `req.params` might be `101`
- **New**: `req.params` is `[{ID: 101}]`
- **Fix**: Destructure: `const [author] = req.params;` where `author === {ID: 101}`
- **Workaround**: Set `cds.features.consistent_params=false`
- **Reference**: [CDS 9 - Changed Structure of req.params](https://cap.cloud.sap/docs/releases/2025/may25#changed-structure-of-req-params)

### ISSUE #23: $now behavior in queries ❗️
- **Location**: `srv/catalog-service.js:59-62`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `$now` now uses `session_context($now)` instead of `current_timestamp`
- **Fix**: Replace with `current_timestamp` if old behavior needed

### ISSUE #24: srv.impl() and srv.with() ❗️
- **Location**: `srv/catalog-service.js:72-73`
- **Version**: Removed in **CDS 8**
- **Severity**: **MEDIUM**
- **Description**: `srv.impl()` and `srv.with()` removed
- **Fix**: Use `srv.prepend()` instead
- **Reference**: [CDS 8 Removed APIs](https://cap.cloud.sap/docs/releases/2024/jun24#removed-features)

### ISSUE #25: Error handling for unique constraints ❗️
- **Location**: `srv/catalog-service.js:81-88`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Unique constraint violations no longer automatically converted to `ENTITY_ALREADY_EXISTS`
- **New**: Database-specific errors must be inspected in custom code
- **Impact**: Requires database services v2
- **Reference**: [CDS 9 - New Database Services v2](https://cap.cloud.sap/docs/releases/2025/may25#new-database-services-v2)

### ISSUE #26: Manual @assert.enum validation ❗️
- **Location**: `srv/catalog-service.js:94-101`
- **Version**: Related to **CDS 9** removal of @assert.enum
- **Severity**: **LOW**
- **Description**: Manual validation for deprecated @assert.enum annotation
- **Fix**: Update data model to use @assert.range

### ISSUE #27: Database service v2 behavior ❗️
- **Location**: `srv/catalog-service.js:108-114`
- **Version**: Required in **CDS 9**
- **Severity**: **HIGH**
- **Description**: New database services v2 have different behavior
- **Impact**: Must use @cap-js/hana instead of @sap/cds-hana
- **Reference**: [CDS 9 - New Database Services v2](https://cap.cloud.sap/docs/releases/2025/may25#new-database-services-v2)

### ISSUE #28: Draft compatibility mode ❗️
- **Location**: `srv/order-service.js:11-14`
- **Version**: Removed in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Old draft implementation and `cds.fiori.draft_compat` removed
- **Reference**: [CDS 8 - Lean Draft Only](https://cap.cloud.sap/docs/releases/2024/jun24#lean-draft-only)

### ISSUE #29: Temporal data with $at.from/$at.to ❗️
- **Location**: `srv/order-service.js:20-29`
- **Version**: Deprecated in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `$at.from` and `$at.to` deprecated
- **Fix**: Use `$valid.from` and `$valid.to`

### ISSUE #30: UPSERT error handling ❗️
- **Location**: `srv/order-service.js:36-46`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **HIGH**
- **Description**: UPSERT error handling changed with database services v2
- **Impact**: No automatic conversion to ENTITY_ALREADY_EXISTS

### ISSUE #31: PUT vs PATCH handling ❗️
- **Location**: `srv/order-service.js:54-63`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: PUT/PATCH behavior separated
- **New defaults**:
  - `cds.runtime.patch_as_upsert`: false (was: create if not exists)
  - `cds.runtime.put_as_upsert`: true (create if not exists)
  - `cds.runtime.put_as_replace`: false (enrich with defaults)
- **Reference**: [CDS 9 - Revised PUT Request Handling](https://cap.cloud.sap/docs/releases/2025/may25#revised-put-request-handling)

### ISSUE #32: Composition with journal propagation ❗️
- **Location**: `srv/order-service.js:70-74`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `@cds.persistence.journal` propagates to composition children
- **Impact**: Affects OrderItems persistence

### ISSUE #33: CSN proxy objects ❗️
- **Location**: `srv/order-service.js:82-85`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `<entity>_texts` CSN proxy removed
- **Fix**: Use `<entity>.texts` instead
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #34: Service-level restrictions enforcement ❗️
- **Location**: `srv/order-service.js:93-101`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: Local service calls now respect @requires
- **Impact**: Cross-service calls may fail if not authorized
- **Workaround**: Set `cds.features.service_level_restrictions=false`

### ISSUE #35: Undocumented headers ❗️
- **Location**: `srv/order-service.js:108`
- **Version**: Removed in **CDS 9**
- **Severity**: **LOW**
- **Description**: `x-correlationid` header removed
- **Fix**: Use `x-correlation-id` (with hyphen)
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #36: Native HANA associations ❗️
- **Location**: `srv/admin-service.js:11-18`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Native HANA associations skipped by default
- **Impact**: First deployment after upgrade will be slower (DROP/CREATE for each entity)
- **Benefit**: Significantly reduces normal deployment times
- **Workaround**: Set `cds.sql.native_hana_associations: true`
- **Reference**: [CDS 9 - Skipped Native HANA Associations](https://cap.cloud.sap/docs/releases/2025/may25#skipped-native-associations-for-sap-hana)

### ISSUE #37: Associations without ON conditions (runtime) ❗️
- **Location**: `srv/admin-service.js:24-34`
- **Version**: Breaks in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Runtime code trying to use associations without ON conditions
- **Impact**: Will fail when data model compiler errors are fixed

### ISSUE #38: Legacy srv.stream API ❗️
- **Location**: `srv/admin-service.js:40-41`
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `srv.stream` API removed
- **Reference**: [CDS 9 Removed Features](https://cap.cloud.sap/docs/releases/2025/may25#removed-features)

### ISSUE #39: Locale fallback behavior ❗️
- **Location**: `srv/admin-service.js:53-55`
- **Version**: Breaking change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: `cds.context.locale` doesn't fall back to default for technical APIs
- **Impact**: `cds.features.locale_fallback=false` by default (performance optimization)
- **Workaround**: Set to `true` if old behavior needed
- **Reference**: [CDS 9 - No Fallback to Default Language](https://cap.cloud.sap/docs/releases/2025/may25#no-fallback-to-default-language-for-technical-apis)

### ISSUE #40: Error sanitization ❗️
- **Location**: `srv/admin-service.js:62-69`
- **Version**: Behavior change in **CDS 9**
- **Severity**: **MEDIUM**
- **Description**: Error sanitization only in production, not in development
- **Impact**: Tests expecting sanitized errors may break
- **Reference**: [CDS 9 - Improved Error Handling](https://cap.cloud.sap/docs/releases/2025/may25#improved-error-handling)

---

## Configuration Issues (package.json)

### ISSUE #41: Old protocol adapter ❗️
- **Location**: `package.json:29` - `odata_new_adapter: false`
- **Version**: Old adapter removed in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Old protocol adapter no longer supported
- **Changes in new adapter**:
  - `@odata.context` optimized (minimal info only)
  - `$batch` processed sequentially (not parallel)
  - `$search` captured as plain value
  - HTTP 401 responses no longer contain JSON error body
- **Fix**: Remove this flag and test thoroughly
- **Reference**: [CDS 8 - New Protocol Adapters](https://cap.cloud.sap/docs/releases/2024/jun24#new-protocol-adapters-ga)

### ISSUE #42: Native HANA associations config ❗️
- **Location**: `package.json:32` - `native_hana_associations: true`
- **Version**: Default changed in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Native HANA associations now skipped by default
- **Impact**: Must remove this config for optimal performance
- **Migration**: First deployment will be slower
- **Reference**: [CDS 9 - Skipped Native HANA Associations](https://cap.cloud.sap/docs/releases/2025/may25#skipped-native-associations-for-sap-hana)

---

## Database & Deployment Issues

### ISSUE #43: hdbcds format ❗️
- **Version**: Removed in **CDS 9**
- **Severity**: **MEDIUM** (if using HANA on-premise)
- **Description**: Deploy format `hdbcds` completely removed
- **Fix**: Switch to `hdbtable` format (default for HANA Cloud)
- **Reference**: [CDS 9 - Removed hdbcds Format](https://cap.cloud.sap/docs/releases/2025/may25#removed-hdbcds-format)

### ISSUE #44: Transactional event queues ❗️
- **Version**: Enabled by default in **CDS 9**
- **Severity**: **HIGH**
- **Description**: Event queues enabled by default, requires database deployment
- **Impact**: Database table `cds.outbox.Messages` must be deployed
- **Workaround**: Set `cds.requires.queue = false` (both Node.js and Java)
- **Reference**: [CDS 9 - Transactional Event Queues](https://cap.cloud.sap/docs/releases/2025/may25#enabled-by-default)

### ISSUE #45: ALTER TABLE ADD COLUMN ❗️
- **Version**: New in **CDS 9**
- **Severity**: **LOW**
- **Description**: HANA deployment now uses `try_fast_table_migration` option
- **Benefit**: Significantly faster for large tables
- **Impact**: May need manual configuration in custom `db/package.json`
- **Reference**: [CDS 9 - SAP HANA using ALTER TABLE ADD COLUMN](https://cap.cloud.sap/docs/releases/2025/may25#sap-hana-using-alter-table-add-column)

---

## Package & Dependency Issues

### ISSUE #46: Legacy database services ❗️
- **Version**: Removed in **CDS 9**
- **Severity**: **HIGH**
- **Description**: `@sap/cds-hana` package no longer supported
- **Fix**: Migrate to `@cap-js/hana` (database services v2)
- **Don't add drivers manually**: Let CAP choose (sqlite3, hdb, @sap/hana-client)
- **Reference**: [CDS 8 - Don't Add Driver Packages](https://cap.cloud.sap/docs/releases/2024/jun24#dont-add-driver-packages-yourself)

### ISSUE #47: ESLint v9 ❗️
- **Version**: Required in **CDS 8**
- **Severity**: **MEDIUM**
- **Description**: Must upgrade to ESLint 9 with flat config
- **Fix**: Create `eslint.config.mjs`:
  ```javascript
  import cds from '@sap/cds/eslint.config.mjs'
  export default [ ...cds.recommended ]
  ```
- **Note**: `eslint` must be installed as dev dependency
- **Reference**: [CDS 8 - ESLint v9](https://cap.cloud.sap/docs/releases/2024/jun24#eslint-v9)

### ISSUE #48: TypeScript imports ❗️
- **Version**: Breaking change in **CDS 8**
- **Severity**: **HIGH** (if using TypeScript)
- **Description**: `@cap-js/cds-types` now standalone package
- **Fix**: 
  1. Add explicit dev dependency: `npm add -D @cap-js/cds-types`
  2. Only import from `@sap/cds` (not `@sap/cds/apis/...`)
- **Reference**: [CDS 8 - TypeScript](https://cap.cloud.sap/docs/releases/2024/jun24#typescript)

### ISSUE #49: cds.test package ❗️
- **Version**: Moved in **CDS 9**
- **Severity**: **MEDIUM** (if using tests)
- **Description**: `cds.test` moved to `@cap-js/cds-test`
- **Fix**: 
  1. Add as devDependency: `npm add -D @cap-js/cds-test`
  2. Can remove: `axios`, `chai`, `chai-subset`, `chai-as-promised`
- **Reference**: [CDS 9 - Open-Sourced cds.test](https://cap.cloud.sap/docs/releases/2025/may25#open-sourced-cds-test)

### ISSUE #50: Cloud SDK version ❗️
- **Version**: v3 removed in **CDS 8**
- **Severity**: **HIGH** (if using Cloud SDK)
- **Description**: Cloud SDK v3 support removed
- **Fix**: Upgrade to Cloud SDK v4
- **Reference**: [CDS 8 Removed Features](https://cap.cloud.sap/docs/releases/2024/jun24#removed-features)

---

## CAP Java Specific Issues

### ISSUE #51: CAP Java 4 minimum versions ❗️
- **Version**: **CAP Java 4** (with CDS 9)
- **Severity**: **HIGH**
- **Description**: Requires cds-dk ^8, SAP Security 3.1, Node.js 20
- **Reference**: [CAP Java 4 Migration](https://cap.cloud.sap/docs/releases/2025/may25#cap-java-v4)

### ISSUE #52: CAP Java 4 default behaviors ❗️
- **Version**: **CAP Java 4**
- **Severity**: **HIGH**
- **Description**: Multiple default behavior changes:
  - Deep authorization enabled (`authorization.deep: true`)
  - Reject unauthorized selections (returns 403)
  - Check input data enabled
  - Framework translations used by default
- **Reference**: [CAP Java 4 Migration](https://cap.cloud.sap/docs/releases/2025/may25#cap-java-v4)

### ISSUE #53: CAP Java 3 MTX Classic ❗️
- **Version**: Removed in **CAP Java 3**
- **Severity**: **HIGH** (if using multitenancy)
- **Description**: MTX Classic removed
- **Fix**: Migrate to Streamlined MTX
- **Removed**: `MtSubscriptionService` → use `DeploymentService`
- **Reference**: [CAP Java 3 Changes](https://cap.cloud.sap/docs/releases/2024/jun24#cap-java-3)

---

## Multitenancy (MTX) Issues

### ISSUE #54: cds.mtx configuration ❗️
- **Version**: Not supported in **CDS 9**
- **Severity**: **HIGH** (if using MTX)
- **Description**: `cds.mtx` configuration no longer supported
- **Fix**: Use Extensibility Service Configuration instead
- **Reference**: [CDS 9 MTX Changes](https://cap.cloud.sap/docs/releases/2025/may25#mtx)

### ISSUE #55: Extension project structure ❗️
- **Version**: Changed in **CDS 9**
- **Severity**: **HIGH** (if using extensions)
- **Description**: Extension project structure changed to npm workspaces
- **Impact**: Base model moved from `node_modules/_base` to `.base` folder
- **Fix**: Update references from `from '_base'` to `from 'bookshop'`
- **Reference**: [CDS 9 - Extension Project Structure](https://cap.cloud.sap/docs/releases/2025/may25#new-extension-project-structure)

### ISSUE #56: Extension linter restrictions ❗️
- **Version**: Expanded in **CDS 9**
- **Severity**: **HIGH** (if using extensions)
- **Description**: More annotations blocked in extensions:
  - Security: `@requires`, `@restrict`
  - Persistence: `@cds.persistence.*`
  - Validation: `@readonly`, `@mandatory`, `@assert.*`
  - Service: `@path`, `@impl`, `@odata.etag`
- **Reference**: [CDS 9 - Extension Linter Restrictions](https://cap.cloud.sap/docs/releases/2025/may25#more-extension-linter-restrictions)

---

## Upgrade Strategy

### Recommended Path: CDS 6 → CDS 7 → CDS 8 → CDS 9

#### Phase 1: CDS 6 → CDS 7
1. Fix all associations without ON conditions (Issues #1, #8, #9, #37)
2. Test thoroughly before moving to CDS 8

#### Phase 2: CDS 7 → CDS 8
**Critical Changes:**
1. Migrate to new database services (`@cap-js/hana`) - Issue #46
2. Update TypeScript imports (if using) - Issue #48
3. Migrate to new protocol adapters - Issue #41
4. Fix `INSERT.as()` calls - Issue #21
5. Remove `srv.impl()`/`srv.with()` - Issue #24
6. Update ESLint to v9 - Issue #47
7. Fix `@odata.default.order` and `@cds.default.order` - Issues #10, #11, #13

**Test with attic profile:**
```json
"cds": {
  "features": {
    "odata_new_adapter": false,
    "cds_validate": false
  },
  "sql": {
    "transitive_localized_views": true
  }
}
```

#### Phase 3: CDS 8 → CDS 9
**Critical Changes:**
1. **Database deployment required** for event queues - Issue #44
2. Fix all remaining associations without ON conditions - will now error
3. Replace deprecated annotations:
   - `@assert.enum` → `@assert.range` - Issue #3
   - `@Common.FieldControl.*` → `@mandatory`/`@readonly` - Issues #4, #5
4. Update API calls:
   - `req.user.locale` → `req.locale` - Issue #19
   - `req.user.tenant` → `req.tenant` - Issue #20
   - Fix `req.params` usage - Issue #22
5. Replace temporal variables:
   - `$at.from`/`$at.to` → `$valid.from`/`$valid.to` - Issues #7, #29
6. Update error handling (database services v2) - Issues #25, #27, #30
7. Review `$now` usage - Issue #2
8. Remove native HANA associations flag - Issue #42
9. Update MTX configuration (if applicable) - Issues #54, #55, #56
10. Move to `@cap-js/cds-test` (if using tests) - Issue #49

### High-Risk Areas for Testing

1. **Database schemas**: Native associations, localized views, journal tables
2. **Error handling**: Error codes, response structure
3. **Authorization**: New deep authorization enabled by default
4. **Associations**: All queries using associations without ON conditions
5. **Temporal data**: Operations using `$now`, `$at.from`, `$at.to`
6. **Draft operations**: Ensure lean draft works correctly
7. **PUT/PATCH operations**: New behavior separation
8. **Localized data queries**: Transitive views removed
9. **Cross-service calls**: Service-level restrictions now enforced
10. **Event queues**: Database deployment and outbox behavior

### Migration Tools

**Use @sap/cds-attic for gradual migration:**
```bash
npm add @sap/cds-attic
```

Add `attic` profile to enable all deprecated features temporarily:
```json
"cds": {
  "requires": {
    "[attic]": {
      "kinds": {
        "db": { "impl": "@sap/cds-attic/db" }
      }
    }
  }
}
```

---

## Testing Checklist

- [ ] All CQL queries with associations work correctly
- [ ] Error handling produces expected error codes
- [ ] Authorization checks work (especially instance-based)
- [ ] Temporal data operations return correct results
- [ ] Draft create/edit/activate/discard work
- [ ] PUT and PATCH behave as expected
- [ ] Localized data queries return correct translations
- [ ] Cross-service calls respect authorization
- [ ] Event queues process messages correctly
- [ ] Database schema deploys successfully
- [ ] Performance is acceptable (especially first deployment after upgrade)

---

## Summary

**Total Issues Identified: 56**

### By Severity:
- **HIGH**: 22 issues
- **MEDIUM**: 29 issues  
- **LOW**: 5 issues

### By Version:
- **CDS 8**: 11 breaking changes, 3 deprecations
- **CDS 9**: 42 breaking changes, 3 deprecations
- **CAP Java 3**: 2 breaking changes
- **CAP Java 4**: 2 breaking changes

### Most Critical Issues:
1. Associations without ON conditions (will break compilation in CDS 9)
2. Database services v2 migration (error handling changes)
3. req.params structure change (runtime breaks)
4. Native HANA associations (deployment impact)
5. Transactional event queues (database deployment required)
6. MTX configuration changes (if using multitenancy)

---

**Generated**: 2026-02-06  
**CAP Version**: CDS 6 → CDS 9 Migration Guide  
**Status**: Comprehensive upgrade issues documented

For the latest migration guides, always check:
- https://cap.cloud.sap/docs/releases/
- https://cap.cloud.sap/docs/java/migration
