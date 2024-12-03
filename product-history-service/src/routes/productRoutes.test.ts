import { Action } from './../entities/Action';
// router.test.ts
import request from 'supertest';
import express, { Request, Response } from 'express';
import router from './productRoutes';
import { dataSource } from '../server';

jest.mock('../server', () => ({
  dataSource: {
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockImplementation((action) => action),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      find: jest.fn().mockResolvedValue([{ id: 1, action: 'create', product_id: 1, details: 'details', timestamp: new Date() }]),
    }),
  },
}));

describe('Router', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', router);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('POST /log', () => {
    it('should respond with 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/log').send({
        action_type: 'create',
        product_id: 1,
        shop_id: null, // Missing shop_id
        quantity_changed: 5,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'shop_id is required');
    });

    it('should respond with 201 and save the action when valid data is provided', async () => {
      const res = await request(app).post('/api/log').send({
        action_type: 'create',
        product_id: 1,
        shop_id: 123,
        quantity_changed: 5,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Action logged successfully');
      expect(res.body).toHaveProperty('actionId', 1);
    });

    it('should respond with 500 if database is not initialized', async () => {
      jest.spyOn(dataSource, 'isInitialized', 'get').mockReturnValueOnce(false);

      const res = await request(app).post('/api/log').send({
        action_type: 'create',
        product_id: 1,
        shop_id: 123,
        quantity_changed: 5,
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Database not initialized');
    });
  });

  describe('GET /products', () => {
    it('should respond with 200 and return a list of actions', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          action: 'create',
          product_id: 1,
          details: 'details',
          timestamp: expect.any(String),
        }),
      ]));
    });

    it('should respond with 500 if database is not initialized', async () => {
      jest.spyOn(dataSource, 'isInitialized', 'get').mockReturnValueOnce(false);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Database not initialized');
    });
  });

  describe('Error-handling middleware', () => {
    it('should respond with 500 if an error occurs', async () => {
      app.use((req: Request, res: Response, next: Function) => {
        next(new Error('Test error'));
      });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'An unexpected error occurred');
    });
  });
});
