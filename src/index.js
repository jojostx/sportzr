import 'dotenv/config';
import express from "express";
import http from "http";
import { db } from "./db/db.js";
import { sql } from "drizzle-orm";
import { matchesRouter } from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js';

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", async (req, res) => {
    const result = db.run(sql`SELECT 1`); 
    
    res.json({ message: "Welcome to Sportzr API", result });
});

app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
    const baseurl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running on: ${baseurl}`);
    console.log(`Websocket server is running on: ${baseurl.replace('http', 'ws')}/ws`);
});