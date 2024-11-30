import { dataSource } from '../config/dataSource.js';
import { ProductHistory } from '../entities/ProductHistory.js';

async function logProductAction(actionDetails) {
  try {
    await dataSource.initialize();
    const historyRepo = dataSource.getRepository(ProductHistory);
    const action = new ProductHistory();
    action.action_type = actionDetails.action_type;
    action.product_id = actionDetails.product_id;
    action.shop_id = actionDetails.shop_id;
    action.quantity_changed = actionDetails.quantity_changed;
    action.date = new Date(actionDetails.date);
    await historyRepo.save(action);
    console.log('Product action logged successfully');
  } catch (error) {
    console.error('Error logging product action:', error);
  }
}

export default logProductAction;
