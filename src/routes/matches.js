import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchesRouter = Router();

const isProduction = process.env.NODE_ENV === 'production';
const MAX_LIMIT = 100;

// Define your routes here, e.g. GET /matches, POST /matches, etc.
matchesRouter.get("/", async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid Query Parameters',
            details: parsed.error.issues
        });
    }
    // Implement logic to list matches based on parsed.data
    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try {
        const matchesList = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit);

        return res.status(200).json({ data: matchesList });
    } catch (error) {
        return res
            .status(500).json({
                error: "Failed to fetch matches.",
                details: JSON.stringify(error)
            });
    }
});

matchesRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid Payload',
            details: parsed.error.issues
        });
    }

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            homeScore: parsed.data.homeScore ?? 0,
            awayScore: parsed.data.awayScore ?? 0,
            status: getMatchStatus(parsed.data.startTime, parsed.data.endTime, parsed.data.status)
        }).returning();

        if (res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated(event);
        }

        res.status(201).json({ message: "Match created successfully", data: event });
    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Failed to create match.",
                details: isProduction ? null : JSON.stringify(error)
            });
    }
});