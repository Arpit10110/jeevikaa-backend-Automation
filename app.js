import express from 'express';
import dotenv from "dotenv";
import medrouter from './router/med_router.js';
import cors from "cors"
dotenv.config();

const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true,
};

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(medrouter);

export default app;