import express from 'express';
import { config } from 'dotenv';
import medrouter from './router/med_router.js';
config({
    path:"./.env"
})
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(medrouter);
export default app;