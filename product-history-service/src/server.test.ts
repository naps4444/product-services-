import request from 'supertest';
import app from './server'; // Import the server instance
import { dataSource } from './server'; // Import the data source for initialization
import { Action } from './entities/Action';

// Ensure the database is properly set up before running tests
beforeAll(async () => {
  await dataSource.initialize();
});

// Clean up after tests
afterAll(async () => {
  await dataSource.destroy();
});

describe('POST /log', () => {
  it('should log an action successfully and return status 201', async () => {
    const actionData = {
      product_id: 1,
      shop_id: 123,
      quantity_changed: 10,
      action_type: 'purchase',
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Action logged successfully.');

    // Verify the data is saved in the database
    const savedAction = await dataSource.manager.findOne(Action, {
      where: { product_id: 1, shop_id: 123 },
    });

    expect(savedAction).not.toBeNull();
    expect(savedAction!.product_id).toBe(1);
    expect(savedAction!.shop_id).toBe(123);
    expect(savedAction!.quantity_changed).toBe(10);
    expect(savedAction!.action_type).toBe('purchase');
  });

  it('should return status 400 for missing or invalid product_id', async () => {
    const actionData = {
      shop_id: 123,
      quantity_changed: 10,
      action_type: 'purchase',
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid or missing product_id');
  });

  it('should return status 400 for missing or invalid shop_id', async () => {
    const actionData = {
      product_id: 1,
      quantity_changed: 10,
      action_type: 'purchase',
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid or missing shop_id');
  });

  it('should return status 400 for missing or invalid quantity_changed', async () => {
    const actionData = {
      product_id: 1,
      shop_id: 123,
      action_type: 'purchase',
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid or missing quantity_changed');
  });

  it('should return status 400 for missing or invalid action_type', async () => {
    const actionData = {
      product_id: 1,
      shop_id: 123,
      quantity_changed: 10,
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid or missing action_type');
  });

  it('should return status 500 if database connection fails', async () => {
    // Simulate database not initialized by closing the dataSource
    await dataSource.destroy();

    const actionData = {
      product_id: 1,
      shop_id: 123,
      quantity_changed: 10,
      action_type: 'purchase',
    };

    const response = await request(app)
      .post('/log')
      .send(actionData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to log action');

    // Reinitialize dataSource for the rest of the tests
    await dataSource.initialize();
  });
});
