const cds = require('@sap/cds');

/**
 * Order Service Implementation with draft and deprecated patterns
 */
module.exports = cds.service.impl(async function() {
  
  const { Orders, OrderItems } = this.entities;
  
  /**
   * UPGRADE ISSUE 28: Draft compatibility mode
   * Old draft implementation removed in CDS 8
   * cds.fiori.draft_compat removed in CDS 9
   */
  this.before('NEW', 'Orders', async (req) => {
    console.log('Creating new draft order');
    // Old draft patterns might need adjustment
  });
  
  /**
   * UPGRADE ISSUE 29: Using temporal data with $at.from and $at.to
   * Deprecated in CDS 9 - should use $valid.from and $valid.to
   */
  this.on('READ', 'OrderHistory', async (req) => {
    const db = await cds.connect.to('db');
    
    // Query using deprecated temporal syntax
    const orders = await db.run(
      SELECT.from(Orders).where({
        orderDate: { '>=': '$at.from' }
      })
    );
    
    return orders;
  });
  
  /**
   * UPGRADE ISSUE 30: UPSERT behavior changes
   * In CDS 9, unique constraint handling changed
   * Old: INSERT/UPSERT violations → ENTITY_ALREADY_EXISTS
   * New: Database-specific errors
   */
  this.on('UPSERT', 'Orders', async (req, next) => {
    try {
      return await next();
    } catch (error) {
      // This pattern expects old UPSERT error handling
      if (error.code === 'ENTITY_ALREADY_EXISTS') {
        // Update existing record
        return await UPDATE(Orders).set(req.data).where({ ID: req.data.ID });
      }
      throw error;
    }
  });
  
  /**
   * UPGRADE ISSUE 31: PUT vs PATCH handling
   * Behavior changes in CDS 9:
   * - cds.runtime.patch_as_upsert: false (was: create if not exists)
   * - cds.runtime.put_as_upsert: true (create if not exists)
   * - cds.runtime.put_as_replace: false (enrich with defaults)
   */
  this.before('UPDATE', 'Orders', async (req) => {
    // Code assumes old PUT/PATCH behavior
    if (req.method === 'PATCH') {
      console.log('PATCH: expecting old upsert behavior');
    }
  });
  
  /**
   * UPGRADE ISSUE 32: Composition handling with journal propagation
   * In CDS 9, @cds.persistence.journal now propagates to composition children
   * This affects how OrderItems are persisted
   */
  this.after('CREATE', 'Orders', async (order, req) => {
    if (req.data.items) {
      // This pattern might be affected by journal propagation changes
      console.log('Creating order items with composition');
    }
  });
  
  /**
   * UPGRADE ISSUE 33: Using CSN proxy objects
   * <entity>_texts CSN proxy removed in CDS 9
   * Should use <entity>.texts instead
   */
  this.on('READ', 'Orders', async (req, next) => {
    const result = await next();
    
    // This pattern uses deprecated CSN proxy
    const textsEntity = Orders._texts; // Deprecated!
    console.log('Texts entity:', textsEntity);
    
    return result;
  });
  
  /**
   * UPGRADE ISSUE 34: Service-level restrictions
   * In CDS 9, local service calls now respect @requires by default
   * (cds.features.service_level_restrictions=true)
   */
  this.on('CREATE', 'OrderItems', async (req) => {
    // This might fail in CDS 9 if service-level restrictions are enforced
    const catalogService = await cds.connect.to('CatalogService');
    const book = await catalogService.run(SELECT.one.from('Books').where({ ID: req.data.book_ID }));
    
    if (!book) {
      req.error(404, 'Book not found');
    }
    
    return req.data;
  });
  
  /**
   * UPGRADE ISSUE 35: Using undocumented headers
   * x-correlationid removed in CDS 9 - should use x-correlation-id
   */
  this.before('*', async (req) => {
    const correlationId = req.headers['x-correlationid']; // Deprecated header name!
    if (correlationId) {
      console.log('Correlation ID:', correlationId);
    }
  });
});
