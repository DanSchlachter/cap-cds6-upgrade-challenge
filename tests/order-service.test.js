/**
 * Order Service Integration Tests
 * 
 * NOTE: These tests require the CAP server to be running separately.
 * Start the server with: npm run watch
 * Then run tests with: npm test
 * 
 * For CDS 6: Tests should pass
 * For CDS 8/9: Server won't start (handlers use srv.impl())
 */

const request = require('supertest');

const BASE_URL = process.env.TEST_URL || 'http://localhost:4004';

describe('OrderService Integration Tests', () => {
  describe('Orders Entity', () => {
    test('GET /orders/Orders should return orders', async () => {
      const response = await request(BASE_URL)
        .get('/orders/Orders')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      console.log(`✅ Found ${response.body.value.length} orders`);
    });

    test('GET /orders/Orders/$count should work', async () => {
      const response = await request(BASE_URL)
        .get('/orders/Orders/$count')
        .expect(200);

      const count = parseInt(response.text);
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`✅ Order count: ${count}`);
    });

    test('GET /orders/Orders with $filter should work', async () => {
      const response = await request(BASE_URL)
        .get('/orders/Orders?$filter=status eq \'open\'')
        .expect(200);

      expect(response.body.value).toBeDefined();
    });
  });

  describe('Order Items', () => {
    test('GET /orders/OrderItems should return order items', async () => {
      const response = await request(BASE_URL)
        .get('/orders/OrderItems')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });
  });

  describe('Order History', () => {
    test('GET /orders/OrderHistory should return order history', async () => {
      const response = await request(BASE_URL)
        .get('/orders/OrderHistory')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });
  });

  describe('Metadata', () => {
    test('GET /orders/$metadata should return service metadata', async () => {
      const response = await request(BASE_URL)
        .get('/orders/$metadata')
        .expect(200);

      expect(response.text).toContain('edmx');
      console.log('✅ OrderService metadata retrieved');
    });
  });
});
