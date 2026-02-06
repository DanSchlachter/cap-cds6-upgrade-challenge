/**
 * Catalog Service Integration Tests
 * 
 * NOTE: These tests require the CAP server to be running separately.
 * Start the server with: npm run watch
 * Then run tests with: npm test
 * 
 * For CDS 6: Tests should pass
 * For CDS 8/9: Server won't start (handlers use removed APIs)
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:4004';

describe('CatalogService Integration Tests', () => {
  describe('Books Entity', () => {
    test('GET /catalog/Books should return books', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Books')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
      console.log(`✅ Found ${response.body.value.length} books`);
    });

    test('GET /catalog/Books/$count should return count', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Books/$count')
        .expect(200);

      const count = parseInt(response.text);
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`✅ Book count: ${count}`);
    });

    test('GET /catalog/Books with $select should work', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Books?$select=ID,title,price')
        .expect(200);

      if (response.body.value && response.body.value.length > 0) {
        const book = response.body.value[0];
        expect(book).toHaveProperty('ID');
        expect(book).toHaveProperty('title');
      }
    });

    test('GET /catalog/Books with $filter should work', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Books?$filter=price gt 20')
        .expect(200);

      expect(response.body.value).toBeDefined();
    });
  });

  describe('Authors Entity', () => {
    test('GET /catalog/Authors should return authors', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Authors')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      console.log(`✅ Found ${response.body.value.length} authors`);
    });

    test('GET /catalog/Authors/$count should work', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Authors/$count')
        .expect(200);

      const count = parseInt(response.text);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Reviews Entity', () => {
    test('GET /catalog/Reviews should return reviews', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/Reviews')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });
  });

  describe('Metadata', () => {
    test('GET /catalog/$metadata should return service metadata', async () => {
      const response = await request(BASE_URL)
        .get('/catalog/$metadata')
        .expect(200);

      expect(response.text).toContain('edmx');
      console.log('✅ Metadata retrieved successfully');
    });
  });
});
