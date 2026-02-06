using { my.bookshop as db } from '../db/schema';

/**
 * Order Service with draft and temporal features
 */
service OrderService @(path: '/orders') {
  
  /**
   * Orders with Fiori Draft
   * UPGRADE ISSUE 15: Old draft implementation removed in CDS 8
   * Must use lean draft (cds.fiori.draft_compat removed in CDS 9)
   */
  @cds.redirection.target
  @odata.draft.enabled
  entity Orders as projection on db.Orders;
  
  /**
   * OrderItems
   * UPGRADE ISSUE 16: Composition children affected by journal annotation propagation in CDS 9
   */
  entity OrderItems as projection on db.OrderItems;
  
  /**
   * Temporal query patterns
   * UPGRADE ISSUE 17: $at.from and $at.to deprecated, use $valid.from and $valid.to
   */
  entity OrderHistory as select from db.Orders {
    *,
    orderDate as validFrom
  };
}
