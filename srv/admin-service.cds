using { my.bookshop as db } from '../db/schema';

/**
 * Admin Service with restricted access
 */
@requires: 'admin'
service AdminService @(path: '/admin') {
  
  /**
   * All entities exposed for admin
   * UPGRADE ISSUE 18: Service-level restrictions now enforced even for local calls in CDS 9
   * (cds.features.service_level_restrictions=true by default)
   */
  entity Authors as projection on db.Authors;
  entity Books as projection on db.Books;
  entity Orders as projection on db.Orders;
  entity Suppliers as projection on db.Suppliers;
  entity Inventory as projection on db.Inventory;
  
  /**
   * Action with admin privileges
   */
  action resetInventory() returns String;
}
