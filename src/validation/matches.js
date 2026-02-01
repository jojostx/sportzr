import { z } from "zod";
// 1. Import the single source of truth from your DB schema
import { matchStatusEnum } from "../db/schema.js";

// 2. Derive the constant for your application logic (e.g. frontend use)
export const MATCH_STATUS = Object.fromEntries(
  matchStatusEnum.map((status) => [status.toUpperCase(), status])
);

// 3. Reusable ISO datetime schema
// "offset: true" is default, but explicit is better. checks for T separator and timezone (Z or +00:00)
const isoDateTimeSchema = z.string().datetime({
  message: "Invalid ISO date-time string (e.g. 2024-01-01T12:00:00Z)"
});

// 4. Schema Definitions
export const listMatchesQuerySchema = z.object({
  // coerce.number handles "10" -> 10 conversion automatically
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().trim().min(1),
    homeTeam: z.string().trim().min(1),
    awayTeam: z.string().trim().min(1),
    location: z.string().trim().min(1),
    startTime: isoDateTimeSchema.optional(),
    endTime: isoDateTimeSchema.optional(),
    status: z.enum(matchStatusEnum).optional(),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.startTime || !data.endTime) {
      return;
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      ctx.addIssue({
        code: "custom", // FIX: Use the string literal directly
        message: "endTime must be after startTime",
        path: ["endTime"],
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});