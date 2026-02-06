/**
 * Admin Service Integration Tests
 * 
 * NOTE: These tests require the CAP server to be running separately.
 * Start the server with: npm run watch
 * Then run tests with: npm test
 * 
 * For CDS 6: Tests should pass
 * For CDS 8/9: Server won't start (handlers use srv.with())
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:4004';

describe('AdminService Integration Tests', () => {
  describe('Admin Service Access', () => {
    test('GET /admin should return service document', async () => {
      const response = await request(BASE_URL)
        .get('/admin')
        .expect(200);

      expect(response.body).toBeTruthy();
    });

    test('GET /admin/$metadata should return metadata', async () => {
      const response = await request(BASE_URL)
        .get('/admin/$metadata')
        .expect(200);

      expect(response.text).toContain('edmx');
      console.log('✅ AdminService metadata retrieved');
    });
  });

  describe('Admin - Authors', () => {
    test('GET /admin/Authors should return authors', async () => {
      const response = await request(BASE_URL)
        .get('/admin/Authors')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      console.log(`✅ Admin: Found ${response.body.value.length} authors`);
    });

    test('GET /admin/Authors/$count should work', async () => {
      const response = await request(BASE_URL)
        .get('/admin/Authors/$count')
        .expect(200);

      const count = parseInt(response.text);
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`✅ Admin author count: ${count}`);
    });
  });

  describe('Admin - Books', () => {
    test('GET /admin/Books should return books', async () => {
      const response = await request(BASE_URL)
        .get('/admin/Books')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('GET /admin/Books/$count should work', async () => {
      const response = await request(BASE_URL)
        .get('/admin/Books/$count')
        .expect(200);

      const count = parseInt(response.text);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Admin - Orders', () => {
    test('GET /admin/Orders should return orders', async () => {
      const response = await request(BASE_URL)
        .get('/admin/Orders')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });
  });
});
