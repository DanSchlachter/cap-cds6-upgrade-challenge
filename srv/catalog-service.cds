using { my.bookshop as db } from '../db/schema';

/**
 * Catalog Service with deprecated patterns and features
 * that will cause issues when upgrading to CDS 7/8/9
 */
service CatalogService @(path: '/catalog') {
  
  /**
   * Books projection using deprecated @odata.default.order
   * UPGRADE ISSUE 10: @odata.default.order removed in CDS 8
   * Should add 'order by' to the view instead
   */
  @odata.default.order: 'title'
  entity Books as projection on db.Books;
  
  /**
   * Authors with restricted access
   * UPGRADE ISSUE 11: Old authorization patterns may behave differently with
   * deep authorization enabled by default in CAP Java 4
   */
  @requires: 'authenticated-user'
  entity Authors as projection on db.Authors;
  
  /**
   * Reviews projection
   */
  entity Reviews as projection on db.Reviews;
  
  /**
   * Products with localized data
   * UPGRADE ISSUE 12: Transitive localized views removed in CDS 8
   * Will affect if querying through associations
   */
  entity Products as projection on db.Products;
  
  /**
   * Categories projection using deprecated @cds.default.order
   * UPGRADE ISSUE 13: @cds.default.order removed in CDS 8
   */
  entity Categories as projection on db.Categories;
  
  /**
   * Action using deprecated pattern
   * UPGRADE ISSUE 14: Action/Function authorization filters changed in CAP Java 3
   */
  @requires: 'Reviewer'
  action submitReview(bookId: UUID, rating: Integer, comment: String) returns String;
  
  /**
   * Function with old pattern
   */
  function getTopBooks(limit: Integer) returns array of Books;
}
