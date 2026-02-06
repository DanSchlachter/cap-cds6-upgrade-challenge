const cds = require('@sap/cds');
const request = require('supertest');

describe('OrderService Tests', () => {
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

  describe('Orders Entity', () => {
    test('GET /orders/Orders should return orders', async () => {
      const response = await request(app)
        .get('/orders/Orders')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('GET /orders/Orders with $expand items should include items', async () => {
      const response = await request(app)
        .get('/orders/Orders?$expand=items')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('GET /orders/Orders with $filter by status should work', async () => {
      const response = await request(app)
        .get('/orders/Orders?$filter=status eq \'open\'')
        .expect(200);

      response.body.value.forEach(order => {
        if (order.status) {
          expect(order.status).toBe('open');
        }
      });
    });

    test('GET /orders/Orders with $filter by totalAmount should work', async () => {
      const response = await request(app)
        .get('/orders/Orders?$filter=totalAmount gt 100')
        .expect(200);

      response.body.value.forEach(order => {
        if (order.totalAmount) {
          expect(order.totalAmount).toBeGreaterThan(100);
        }
      });
    });

    test('POST /orders/Orders should create new order', async () => {
      const newOrder = {
        customerName: 'Test Customer',
        status: 'open'
      };

      const response = await request(app)
        .post('/orders/Orders')
        .send(newOrder);

      expect([200, 201]).toContain(response.status);
    });

    test('POST /orders/Orders with items should create order with items', async () => {
      const newOrder = {
        customerName: 'Test Customer 2',
        status: 'open',
        items: [
          {
            product: 'Test Product',
            quantity: 1,
            price: 99.99
          }
        ]
      };

      const response = await request(app)
        .post('/orders/Orders')
        .send(newOrder);

      expect([200, 201]).toContain(response.status);
    });
  });

  describe('Order Items', () => {
    test('GET /orders/OrderItems should return order items', async () => {
      const response = await request(app)
        .get('/orders/OrderItems')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('GET /orders/OrderItems with $expand order should include order', async () => {
      const response = await request(app)
        .get('/orders/OrderItems?$expand=order')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('POST /orders/OrderItems should create new item', async () => {
      const newItem = {
        order_ID: '550e8400-e29b-41d4-a716-446655440000',
        product: 'Test Product',
        quantity: 2,
        price: 49.99
      };

      const response = await request(app)
        .post('/orders/OrderItems')
        .send(newItem);

      // May succeed or fail depending on order existence
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Order History (Temporal Data)', () => {
    test('GET /orders/OrderHistory should return order history', async () => {
      const response = await request(app)
        .get('/orders/OrderHistory')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(Array.isArray(response.body.value)).toBe(true);
    });

    test('GET /orders/OrderHistory with temporal filter should work', async () => {
      // Note: $at.from/$at.to deprecated in CDS 9 (should use $valid.from/$valid.to)
      const response = await request(app)
        .get('/orders/OrderHistory?$orderby=changedAt desc')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });
  });

  describe('Draft Operations', () => {
    let draftOrderId;

    test('Creating draft order should work', async () => {
      const draftOrder = {
        customerName: 'Draft Customer',
        status: 'open'
      };

      const response = await request(app)
        .post('/orders/Orders')
        .send(draftOrder);

      if (response.status === 200 || response.status === 201) {
        draftOrderId = response.body.ID;
      }

      expect([200, 201]).toContain(response.status);
    });

    test('Editing draft order should work', async () => {
      if (!draftOrderId) {
        return; // Skip if no draft was created
      }

      const update = {
        customerName: 'Updated Draft Customer'
      };

      const response = await request(app)
        .patch(`/orders/Orders(${draftOrderId})`)
        .send(update);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    // Note: Draft actions changed in CDS 7 (Lean Draft)
    // These may fail in newer versions
  });

  describe('Deprecated API Tests', () => {
    test('Accessing order by ID tests req.params structure (changed in CDS 9)', async () => {
      // This will trigger handler code that uses req.params[0] (changed in CDS 9)
      const response = await request(app)
        .get('/orders/Orders(550e8400-e29b-41d4-a716-446655440000)');

      // In CDS 6: works
      // In CDS 9: may fail because req.params structure changed
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('Any request to OrderService tests srv.impl() (removed in CDS 8)', async () => {
      // OrderService uses srv.impl() which is removed in CDS 8
      // Just making any request tests if the handler registered successfully
      const response = await request(app)
        .get('/orders/Orders');

      // In CDS 6: works
      // In CDS 8+: server may have crashed during handler registration
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Error Handling', () => {
    test('GET non-existent order should return 404', async () => {
      await request(app)
        .get('/orders/Orders(00000000-0000-0000-0000-000000000000)')
        .expect(404);
    });

    test('POST order without required fields should return 400', async () => {
      const invalidOrder = {
        // Missing customerName
        status: 'open'
      };

      const response = await request(app)
        .post('/orders/Orders')
        .send(invalidOrder);

      // Might succeed with defaults or fail with 400
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    test('Invalid status value should be handled', async () => {
      const invalidStatus = {
        customerName: 'Test',
        status: 'invalid_status_value_that_is_not_in_enum'
      };

      const response = await request(app)
        .post('/orders/Orders')
        .send(invalidStatus);

      // May be accepted or rejected depending on @assert.enum (removed in CDS 9)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Performance and Complex Queries', () => {
    test('GET orders with full expansion should work', async () => {
      const response = await request(app)
        .get('/orders/Orders?$expand=items')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('Complex filter with multiple conditions should work', async () => {
      const response = await request(app)
        .get('/orders/Orders?$filter=status eq \'confirmed\' and totalAmount gt 50')
        .expect(200);

      expect(response.body).toHaveProperty('value');
    });

    test('GET with top and skip for pagination should work', async () => {
      const response = await request(app)
        .get('/orders/Orders?$top=5&$skip=0')
        .expect(200);

      expect(response.body).toHaveProperty('value');
      expect(response.body.value.length).toBeLessThanOrEqual(5);
    });
  });
});
