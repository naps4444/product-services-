import request from 'supertest';
import express from 'express';
import { dataSource } from '../server';
import { logHistory } from './historyController';
import { Action } from '../entities/Action';

// Setup the Express app
const app = express();
app.use(express.json());
app.post('/api/log', logHistory);

// Mock data for the tests
const validRequestBody = {
  action_type: 'Update',
  shop_id: 1,
  product_id: 123,
  quantity_changed: 10,
  details: 'Product updated',
  date: new Date().toISOString()
};

const invalidRequestBody = {
  action_type: '',
  shop_id: 'string' as any,
  product_id: 'string' as any,
  quantity_changed: 'string' as any,
  details: 12345,
  date: 'invalid-date'
};

describe('POST /api/log', () => {
  beforeAll(async () => {
    // Initialize the database connection
    await dataSource.initialize();
  });

  afterAll(async () => {
    // Close the database connection
    await dataSource.destroy();
  });

  it('should log product history successfully with valid data', async () => {
    const response = await request(app)
      .post('/api/log')
      .send(validRequestBody);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Product history logged successfully.');
  });

  it('should return 400 for invalid shop_id', async () => {
    const response = await request(app)
      .post('/api/log')
      .send({ ...validRequestBody, shop_id: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid shop_id. It must be a number.');
  });

  it('should return 400 for invalid action_type', async () => {
    const response = await request(app)
      .post('/api/log')
      .send({ ...validRequestBody, action_type: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid action_type. It must be a non-empty string.');
  });

  it('should return 400 for invalid quantity_changed', async () => {
    const response = await request(app)
      .post('/api/log')
      .send({ ...validRequestBody, quantity_changed: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid quantity_changed. It must be a number.');
  });

  it('should return 400 for invalid date format', async () => {
    const response = await request(app)
      .post('/api/log')
      .send({ ...validRequestBody, date: 'invalid-date' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid date format.');
  });

  it('should return 500 if there is a server error', async () => {
    // Simulate an error by mocking the repository save method
    jest.spyOn(dataSource.getRepository(Action), 'save').mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/api/log')
      .send(validRequestBody);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to log product history.');
  });
});
