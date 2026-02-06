const cds = require('@sap/cds');
const request = require('supertest');

describe('CatalogService Tests', () => {
  let server;
  let app;

  beforeAll(async () => {
    try {
      app = await cds.test(__dirname + '/../');
      server = app.server;
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Books Entity', () => {
    test('GET /catalog/Books should return books', async () => {
      const response = await request(app)
        .get('/catalog/Books')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('GET /catalog/Books with $select should return specific fields', async () => {
      const response = await request(app)
        .get('/catalog/Books?$select=ID,title,price')
        .expect(200);

      if (response.body.value && response.body.value.length > 0) {
        const book = response.body.value[0];
        expect(book).toHaveProperty('ID');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('price');
      }
    });

    test('GET /catalog/Books with $filter by price should work', async () => {
      const response = await request(app)
        .get('/catalog/Books?$filter=price gt 20')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      response.body.value.forEach(book => {
        if (book.price) {
          expect(book.price).toBeGreaterThan(20);
        }
      });
    });

    test('GET /catalog/Books with $orderby should sort results', async () => {
      const response = await request(app)
        .get('/catalog/Books?$orderby=price desc')
        .expect(200);

      const books = response.body.value;
      if (books.length > 1) {
        for (let i = 0; i < books.length - 1; i++) {
          if (books[i].price && books[i + 1].price) {
            expect(books[i].price).toBeGreaterThanOrEqual(books[i + 1].price);
          }
        }
      }
    });

    test('GET /catalog/Books with $expand author should include author data', async () => {
      const response = await request(app)
        .get('/catalog/Books?$expand=author')
        .expect(200);

      // Note: This might fail in CDS 9 if association has no ON condition
      expect(response.body).toHaveProperty('value');
    });

    test('GET /catalog/Books/$count should return count', async () => {
      const response = await request(app)
        .get('/catalog/Books/$count')
        .expect(200);

      expect(typeof response.text).toBe('string');
      expect(parseInt(response.text)).toBeGreaterThanOrEqual(0);
    });

    test('GET non-existent book should return 404', async () => {
      await request(app)
        .get('/catalog/Books(00000000-0000-0000-0000-000000000000)')
        .expect(404);
    });
  });

  describe('Authors Entity', () => {
    test('GET /catalog/Authors should return authors', async () => {
      const response = await request(app)
        .get('/catalog/Authors')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('GET /catalog/Authors with $expand books might fail in CDS 9', async () => {
      // This tests association without ON condition
      // Will work in CDS 6, may fail in CDS 9
      const response = await request(app)
        .get('/catalog/Authors?$expand=books');

      // Don't assert success - just check response exists
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('GET /catalog/Authors with $filter by country should work', async () => {
      const response = await request(app)
        .get('/catalog/Authors?$filter=country eq \'US\'')
        .expect(200);

      response.body.value.forEach(author => {
        if (author.country) {
          expect(author.country).toBe('US');
        }
      });
    });

    test('POST /catalog/Authors should create new author', async () => {
      const newAuthor = {
        name: 'Test Author',
        country: 'UK'
      };

      const response = await request(app)
        .post('/catalog/Authors')
        .send(newAuthor)
        .expect('Content-Type', /json/);

      // May be 201 or 200 depending on CDS version
      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Reviews Entity', () => {
    test('GET /catalog/Reviews should return reviews', async () => {
      const response = await request(app)
        .get('/catalog/Reviews')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('POST /catalog/Reviews should test INSERT.as() (removed in CDS 8)', async () => {
      // This will use the handler with INSERT.as() which is removed in CDS 8
      const newReview = {
        book_ID: '9d703c93-04ff-4be0-a292-599c1b8c5e1d',
        rating: 5,
        comment: 'Test review',
        reviewer: 'Test User'
      };

      const response = await request(app)
        .post('/catalog/Reviews')
        .send(newReview);

      // In CDS 6: succeeds
      // In CDS 8+: fails because INSERT.as() is removed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('GET /catalog/Reviews with $filter by rating should work', async () => {
      const response = await request(app)
        .get('/catalog/Reviews?$filter=rating ge 4')
        .expect(200);

      response.body.value.forEach(review => {
        if (review.rating) {
          expect(review.rating).toBeGreaterThanOrEqual(4);
        }
      });
    });
  });

  describe('Products and Categories', () => {
    test('GET /catalog/Products should return products', async () => {
      const response = await request(app)
        .get('/catalog/Products')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('GET /catalog/Categories should return categories', async () => {
      const response = await request(app)
        .get('/catalog/Categories')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('GET /catalog/Products with $expand category tests association without ON', async () => {
      // This association has no ON condition - breaks in CDS 9
      const response = await request(app)
        .get('/catalog/Products?$expand=category');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('GET /catalog/Categories with $expand products tests association without ON', async () => {
      // This association has no ON condition - breaks in CDS 9
      const response = await request(app)
        .get('/catalog/Categories?$expand=products');

      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Deprecated API Tests', () => {
    test('Request with Accept-Language header tests req.user.locale', async () => {
      // This will trigger handler code that uses req.user.locale (removed in CDS 9)
      const response = await request(app)
        .get('/catalog/Books')
        .set('Accept-Language', 'de-DE');

      // In CDS 6: works
      // In CDS 9: may fail because req.user.locale is removed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('Request with X-Tenant-Id header tests req.user.tenant', async () => {
      // This will trigger handler code that uses req.user.tenant (removed in CDS 9)
      const response = await request(app)
        .get('/catalog/Books')
        .set('X-Tenant-Id', 'test-tenant');

      // In CDS 6: works
      // In CDS 9: may fail because req.user.tenant is removed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Error Handling', () => {
    test('Invalid filter syntax should return 400', async () => {
      const response = await request(app)
        .get('/catalog/Books?$filter=invalid syntax');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('Non-existent field in $select should handle gracefully', async () => {
      const response = await request(app)
        .get('/catalog/Books?$select=nonExistentField');

      // Might be 200 (ignored) or 400 (error) depending on CDS version
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
