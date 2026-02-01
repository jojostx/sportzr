import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 1. Define the enum values as a standard JavaScript array
export const matchStatusEnum = ["scheduled", "live", "finished", "postponed", "cancelled"];

export const matches = sqliteTable("matches", {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: text('status', { enum: matchStatusEnum }).notNull(),
    matchDate: integer('match_date', { mode: 'timestamp' }).notNull(),
    startTime: integer('start_time', { mode: 'timestamp' }),
    endTime: integer('end_time', { mode: 'timestamp' }),
    location: text('location').notNull(),
    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const commentaries = sqliteTable("commentaries", {
    id: integer('id').primaryKey({ autoIncrement: true }),

    matchId: integer('match_id')
        .notNull()
        .references(() => matches.id, { onDelete: 'cascade' }),

    minute: integer('minute').notNull(),
    sequence: integer('sequence').notNull(),
    period: text('period').notNull(),
    eventType: text('event_type').notNull(),
    actor: text('actor'),
    team: text('team'),
    message: text('message').notNull(),

    metadata: text('metadata', { mode: 'json' }),

    description: text('description'),

    tags: text('tags', { mode: 'json' })
        .notNull()
        .default(sql`'[]'`),

    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});

export const matchesRelations = relations(matches, ({ many }) => ({
    commentaries: many(commentaries),
}));

export const commentariesRelations = relations(commentaries, ({ one }) => ({
    match: one(matches, {
        fields: [commentaries.matchId],
        references: [matches.id],
    }),
}));