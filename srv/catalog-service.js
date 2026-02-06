const cds = require('@sap/cds');

/**
 * Catalog Service Implementation with deprecated patterns
 * that will cause issues when upgrading to CDS 7/8/9
 */
module.exports = cds.service.impl(async function() {
  
  const { Books, Authors, Reviews } = this.entities;
  
  /**
   * UPGRADE ISSUE 19: Using req.user.locale
   * Deprecated in CDS 9 - should use req.locale instead
   */
  this.before('READ', 'Books', async (req) => {
    const locale = req.user.locale || 'en';
    console.log(`Reading books with locale: ${locale}`);
  });
  
  /**
   * UPGRADE ISSUE 20: Using req.user.tenant
   * Deprecated in CDS 9 - should use req.tenant instead
   */
  this.before('READ', 'Authors', async (req) => {
    const tenant = req.user.tenant || 'default';
    console.log(`Reading authors for tenant: ${tenant}`);
  });
  
  /**
   * UPGRADE ISSUE 21: Using INSERT.as()
   * Removed in CDS 8 - should use INSERT.entries() or INSERT.from()
   */
  this.on('submitReview', async (req) => {
    const { bookId, rating, comment } = req.data;
    
    // Deprecated API - INSERT.as()
    await INSERT.into(Reviews).as(
      SELECT.from(Books).where({ ID: bookId }).columns(
        { val: bookId, as: 'book_ID' },
        { val: rating, as: 'rating' },
        { val: comment, as: 'comment' }
      )
    );
    
    return 'Review submitted';
  });
  
  /**
   * UPGRADE ISSUE 22: Using req.params incorrectly
   * In CDS 9, req.params structure changed - always returns array of objects
   * Old: req.params might be single value
   * New: req.params is always array, e.g., [{ID: 101}]
   */
  this.on('getTopBooks', async (req) => {
    // This pattern assumes old req.params behavior
    const limit = req.params || 10;
    
    const books = await SELECT.from(Books).limit(limit);
    return books;
  });
  
  /**
   * UPGRADE ISSUE 23: Using $now in queries
   * Behavior changes in CDS 9 - now uses session_context($now) instead of current_timestamp
   */
  this.after('READ', 'Authors', async (authors, req) => {
    for (const author of authors) {
      // Query using $now - behavior will change
      const recentBooks = await SELECT.from(Books)
        .where({ author_ID: author.ID })
        .and('modifiedAt >', '$now');
      
      author.recentBooksCount = recentBooks.length;
    }
  });
  
  /**
   * UPGRADE ISSUE 24: Using old-style srv.impl() in nested service calls
   * srv.impl() and srv.with() removed in CDS 8 - should use srv.prepend()
   */
  const internalService = await cds.connect.to('CatalogService');
  
  /**
   * UPGRADE ISSUE 25: Expecting specific error handling behavior
   * Error handling improved in CDS 9 - error.code properties changed
   * Unique constraint violations no longer automatically converted to ENTITY_ALREADY_EXISTS
   */
  this.on('CREATE', 'Books', async (req, next) => {
    try {
      return await next();
    } catch (error) {
      // This expects old error handling behavior
      if (error.code === 'ENTITY_ALREADY_EXISTS') {
        req.error(409, 'Book already exists');
      }
      throw error;
    }
  });
  
  /**
   * UPGRADE ISSUE 26: Using @assert.enum in validation
   * @assert.enum removed in CDS 9 - should use @assert.range
   */
  this.before('CREATE', 'Books', async (req) => {
    const genre = req.data.genre;
    // Manual validation for deprecated @assert.enum
    const validGenres = ['Fiction', 'Non-Fiction', 'Science', 'History'];
    if (!validGenres.includes(genre)) {
      req.error(400, `Invalid genre. Must be one of: ${validGenres.join(', ')}`);
    }
  });
  
  /**
   * UPGRADE ISSUE 27: Direct database access with deprecated patterns
   * In CDS 9, database service v2 required with different behavior
   */
  this.on('READ', 'Reviews', async (req, next) => {
    const db = await cds.connect.to('db');
    
    // Old pattern - might need adjustment with new database services
    const reviews = await db.run(
      SELECT.from(Reviews).where(req.query.where)
    );
    
    return reviews;
  });
});
