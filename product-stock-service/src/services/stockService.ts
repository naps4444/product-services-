import axios from 'axios';

export async function logProductHistory(actionType: string, productId: number, shopId: number, quantityChanged: number) {
  try {
    const response = await axios.post('http://localhost:4000/log', {
      action_type: actionType,
      product_id: productId,
      shop_id: shopId,
      quantity_changed: quantityChanged,
      date: new Date().toISOString(),
    });
    console.log('Product history logged:', response.data);
  } catch (error) {
    console.error('Error logging product history:', error);
  }
}
