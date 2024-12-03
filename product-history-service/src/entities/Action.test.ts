import { DataSource } from 'typeorm';
import { Action } from './Action';
import { expect, test } from '@jest/globals';

// Initialize the database connection
const dataSource = new DataSource({
  type: 'sqlite', // Using SQLite for testing; configure as needed
  database: ':memory:',
  entities: [Action],
  synchronize: true, // Auto-create database schema
  logging: false,
});

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

// Jest test suite
describe('Action Entity', () => {
  test('should create an Action instance and save it to the database', async () => {
    // Create a new Action instance
    const action = new Action();
    action.product_id = 1;
    action.shop_id = 123;
    action.quantity_changed = 5;
    action.action_type = 'Add';
    action.details = JSON.stringify({ description: 'Test action' });
    action.date = new Date();

    // Save the Action to the database
    const actionRepository = dataSource.getRepository(Action);
    const savedAction = await actionRepository.save(action);

    // Assertions
    expect(savedAction).toBeDefined();
    expect(savedAction.id).toBeDefined(); // Ensure that ID is generated
    expect(savedAction.product_id).toBe(1);
    expect(savedAction.shop_id).toBe(123);
    expect(savedAction.quantity_changed).toBe(5);
    expect(savedAction.action_type).toBe('Add');
    expect(savedAction.details).toBe(JSON.stringify({ description: 'Test action' }));
    expect(savedAction.date).toBeInstanceOf(Date);
  });
});
