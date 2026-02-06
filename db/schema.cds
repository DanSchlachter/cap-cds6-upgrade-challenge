namespace my.bookshop;

using { Currency, managed, cuid, temporal } from '@sap/cds/common';

/**
 * Authors entity with problematic patterns for upgrade
 */
entity Authors : cuid, managed {
  name     : String(100);
  country  : String(2);
  
  // UPGRADE ISSUE 1: Association to many without ON condition
  // This will break in CDS 9 - must add ON condition or change to 'to one'
  books    : Association to many Books;
  
  // UPGRADE ISSUE 2: Using $now which changes from current_timestamp to session_context($now) in CDS 9
  lastActive : Timestamp default $now;
}

/**
 * Books entity with temporal data and deprecated annotations
 */
entity Books : cuid, managed, temporal {
  title    : String(100);
  price    : Decimal(10,2);
  currency : Currency;
  stock    : Integer;
  
  // UPGRADE ISSUE 3: Using @assert.enum which is removed in CDS 9 (use @assert.range instead)
  @assert.enum: [ 'Fiction', 'Non-Fiction', 'Science', 'History' ]
  genre    : String(20);
  
  // UPGRADE ISSUE 4: Using @Common.FieldControl.Mandatory (removed in CDS 9, use @mandatory)
  @Common.FieldControl: #Mandatory
  isbn     : String(20);
  
  // UPGRADE ISSUE 5: Using @Common.FieldControl.Readonly (removed in CDS 9, use @readonly)
  @Common.FieldControl: #ReadOnly
  publishedAt : Date;
  
  // Association with ON condition (this is fine)
  author   : Association to Authors on author.ID = $self.author_ID;
  author_ID : UUID;
  
  // Composition - will be affected by @cds.persistence.journal propagation in CDS 9
  reviews  : Composition of many Reviews on reviews.book = $self;
}

/**
 * Reviews with problematic default values
 */
entity Reviews : cuid, managed {
  book     : Association to Books;
  rating   : Integer;
  
  // UPGRADE ISSUE 6: Virtual element pattern (works in CDS 6, different in CDS 9)
  virtual virtualField1 : String;
  
  comment  : String(500);
  
  // Another problematic default
  @odata.default.order
  helpful  : Integer default 0;
}

/**
 * Orders entity with temporal data patterns
 */
entity Orders : cuid, managed, temporal {
  customer : String(100);
  total    : Decimal(10,2);
  currency : Currency;
  
  // UPGRADE ISSUE 7: Using temporal data patterns
  // In CDS 9, $at.from and $at.to are deprecated, use $valid.from and $valid.to
  orderDate : Date;
  
  items    : Composition of many OrderItems on items.order = $self;
}

/**
 * Order Items with complex associations
 */
entity OrderItems : cuid {
  order    : Association to Orders;
  book     : Association to Books;
  quantity : Integer;
  price    : Decimal(10,2);
  
  // UPGRADE ISSUE 8: Another association without ON condition in nested entity
  relatedBooks : Association to many Books;
}

/**
 * Entity with deprecated @cds.default.order annotation
 */
@cds.default.order: 'name'
entity Categories : cuid {
  name        : String(50);
  description : String(200);
}

/**
 * Entity that will be affected by transitive localized views removal
 */
entity Products : cuid {
  key ID : UUID;
  name : localized String(100);
  description : localized String(500);
  price : Decimal(10,2);
  
  // This creates transitive localized view dependencies
  category : Association to Categories;
}

/**
 * Entity with native HANA association patterns
 */
@cds.persistence.table
entity Inventory : cuid {
  product : Association to Products;
  warehouse : String(50);
  quantity : Integer;
  
  // Multiple associations that would generate native HANA associations
  lastOrder : Association to Orders;
  supplier : Association to Suppliers;
}

/**
 * Supplier entity
 */
entity Suppliers : cuid, managed {
  name : String(100);
  country : String(2);
  
  // UPGRADE ISSUE 9: Unmanaged association without proper ON condition
  products : Association to many Products;
}
