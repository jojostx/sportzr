import 'dotenv/config';
import express from "express";
import { db } from "./db/db.js";
import { sql } from "drizzle-orm";
import { matchesRouter } from './routes/matches.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", async (req, res) => {
    const result = db.run(sql`SELECT 1`); 
    
    res.json({ message: "Welcome to Sportzr API", result });
});

app.use("/matches", matchesRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});