import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { DataSource } from 'typeorm';
import { Action } from './entities/Action';
import router from './routes/productRoutes';
const app = express();
app.use(bodyParser.json());
export const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Action],
    synchronize: true,
});
dataSource
    .initialize()
    .then(() => console.log('Connected to the database'))
    .catch((error) => console.error('Database connection error:', error));
app.use('/api', router);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;
