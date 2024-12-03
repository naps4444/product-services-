import 'reflect-metadata';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import app from './app';
import { Action } from './entities/Action';

let dataSource: DataSource;

beforeAll(async () => {
  // Initialize in-memory database for testing purposes
  dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [Action],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  console.log('In-memory database connected');
});

afterAll(async () => {
  // Close the database connection after tests
  await dataSource.destroy();
  console.log('In-memory database disconnected');
});

describe('API Tests', () => {
  test('should return 200 on GET /api', async () => {
    const response = await supertest(app).get('/api');
    expect(response.status).toBe(200);
  });

  test('should create a new Action record', async () => {
    const newAction = {
      product_id: 1,
      shop_id: 2,
      quantity_changed: 10,
      action_type: 'RESTOCK',
      details: JSON.stringify({ notes: 'Test action' }),
      date: new Date().toISOString(),
    };

    const response = await supertest(app).post('/api/log').send(newAction);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Product history logged successfully');

    // Verify if the action was saved to the database
    const actionRepo = dataSource.getRepository(Action);
    const action = await actionRepo.findOneBy({ product_id: 1, shop_id: 2 });
    expect(action).not.toBeNull();
    expect(action?.product_id).toBe(1);
    expect(action?.shop_id).toBe(2);
  });
});
