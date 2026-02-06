const cds = require('@sap/cds');

/**
 * Admin Service Implementation
 */
module.exports = cds.service.impl(async function() {
  
  const { Inventory, Suppliers } = this.entities;
  
  /**
   * UPGRADE ISSUE 36: Native HANA associations
   * In CDS 9, native HANA associations skipped by default
   * (cds.sql.native_hana_associations: false)
   * First deployment after upgrade will be slower
   */
  this.on('READ', 'Inventory', async (req, next) => {
    const result = await next();
    
    // This code relies on native HANA association behavior
    console.log('Reading inventory with native associations');
    
    return result;
  });
  
  /**
   * UPGRADE ISSUE 37: Associations without ON conditions
   * Suppliers.products has no ON condition - will fail in CDS 9
   */
  this.after('READ', 'Suppliers', async (suppliers, req) => {
    for (const supplier of suppliers) {
      // This association has no ON condition!
      // Will cause compiler error in CDS 9
      try {
        const products = await SELECT.from('Products')
          .where({ supplier_ID: supplier.ID });
        supplier.productCount = products.length;
      } catch (error) {
        console.error('Error reading products:', error);
      }
    }
  });
  
  /**
   * UPGRADE ISSUE 38: Using legacy srv.stream API
   * srv.stream removed in CDS 9
   */
  this.on('resetInventory', async (req) => {
    const db = await cds.connect.to('db');
    
    // Reset all inventory
    await DELETE.from(Inventory);
    
    // Legacy pattern that might not work in newer versions
    console.log('Inventory reset completed');
    
    return 'Inventory reset successfully';
  });
  
  /**
   * UPGRADE ISSUE 39: Locale fallback behavior
   * In CDS 9, cds.context.locale doesn't fall back to default for technical APIs
   * (cds.features.locale_fallback=false by default)
   */
  this.before('*', async (req) => {
    const locale = cds.context.locale || 'en'; // This fallback behavior changes!
    console.log('Admin operation with locale:', locale);
  });
  
  /**
   * UPGRADE ISSUE 40: Error sanitization in production
   * In CDS 9, error sanitization only happens in production (not in development)
   * Tests might break if they expect sanitized errors
   */
  this.on('CREATE', 'Suppliers', async (req, next) => {
    try {
      return await next();
    } catch (error) {
      // Error structure and sanitization behavior changed
      console.error('Error creating supplier:', error);
      throw error;
    }
  });
});
