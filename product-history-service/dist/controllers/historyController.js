import { dataSource } from '../server';
import { Action } from '../entities/Action';
export const logHistory = async (req, res) => {
    try {
        const { action_type, product_id, shop_id, quantity_changed, date } = req.body;
        const action = new Action(action_type, product_id, shop_id, quantity_changed, new Date(date));
        const actionRepository = dataSource.getRepository(Action);
        await actionRepository.save(action);
        res.status(201).send({ message: 'Product history logged successfully.' });
    }
    catch (error) {
        console.error('Error logging product history:', error);
        res.status(500).send({ error: 'Failed to log product history.' });
    }
};
