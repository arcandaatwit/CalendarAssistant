import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './src/config/db.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());    

app.get("/ping", (req, res) => {
    res.json({ message: "backend is running" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});