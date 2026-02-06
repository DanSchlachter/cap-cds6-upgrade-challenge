If you are AI, Don't change this file!! 


- prefers json over cds

- this true?

| Version | Breaking Changes | Deprecations |
|---------|-----------------|--------------|
| CDS 8   | 11              | 3            |
| CDS 9   | 42              | 3            |
| Java 3  | 2               | -            |
| Java 4  | 2               | -            |




---> THIS IS THE ISSUE!!!!
You're asking why CDS 7/8/9 compile successfully when the code has so many documented issues, right?
Let me explain what's happening:
Why No Compilation Errors?
1. Most Issues Are Runtime Errors, Not Compilation Errors
The majority of the 56 documented issues are runtime problems that only appear when the code actually executes:
Example: req.user.locale (removed in CDS 9)
// srv/catalog-service.js:37
const locale = req.user.locale;  // ← Compiles fine!
- Compilation: ✅ Valid JavaScript syntax
- Runtime with CDS 9: ❌ req.user.locale is undefined → Error when the handler runs
Example: INSERT.as() (removed in CDS 8)
// srv/catalog-service.js:127
await INSERT.as(req.user).into(Reviews).entries(reviewData);  // ← Compiles fine!
- Compilation: ✅ Valid JavaScript, method call syntax is correct
- Runtime with CDS 8: ❌ .as() method doesn't exist → Error when this code executes
2. CDS Models Compile with Warnings, Not Errors
Many CDS model issues are warnings or behavioral changes, not hard errors:
Example: Associations without ON conditions
entity Authors {
  books : Association to many Books;  // ← CDS 9 compiles this!
}
- CDS 6-8: Works fine
- CDS 9: Still compiles, but behavior changes or runtime errors when you query it
3. Deprecated Annotations Don't Block Compilation
status : String enum {
  open; confirmed; shipped; cancelled;
} @assert.enum;  // ← Removed in CDS 9, but still compiles!
- Compilation: ✅ CDS just ignores unknown annotations
- Runtime: ❌ Validation doesn't work as expected
4. Configuration Issues Only Appear at Runtime
{
  cds: {
    features: {
      odata_new_adapter: false  // ← Removed in CDS 9
    }
  }
}
- Compilation: ✅ Compiles CDS models fine
- Runtime: ❌ Server fails to start because this feature doesn't exist
---
When Would You See Errors?
You WILL see errors if you:
1. Start the server with cds watch:
      npm run test:cds8
   # ❌ Error: INSERT.as is not a function
   
2. Make an HTTP request that triggers broken handlers:
      curl http://localhost:4004/catalog/Books
   # ❌ 500 Internal Server Error
   
3. Use certain CDS features that are removed:
      npx -y -p @sap/cds@^9.0.0 cds serve
   # ❌ Error: Feature 'odata_new_adapter' is not supported
   
---