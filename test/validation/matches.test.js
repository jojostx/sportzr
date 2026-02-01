import test from "node:test";
import assert from "node:assert/strict";
import {
  MATCH_STATUS,
  createMatchSchema,
  listMatchesQuerySchema,
  matchIdParamSchema,
  updateScoreSchema,
} from "../../src/validation/matches.js";

const validMatch = {
  sport: "soccer",
  homeTeam: "Home FC",
  awayTeam: "Away FC",
  location: "Stadium A",
  status: MATCH_STATUS.SCHEDULED,
};

test("listMatchesQuerySchema accepts optional limit and coerces to number", () => {
  const emptyResult = listMatchesQuerySchema.safeParse({});
  assert.equal(emptyResult.success, true);

  const result = listMatchesQuerySchema.safeParse({ limit: "10" });
  assert.equal(result.success, true);
  assert.equal(result.data.limit, 10);
});

test("listMatchesQuerySchema rejects invalid limit values", () => {
  assert.equal(listMatchesQuerySchema.safeParse({ limit: 0 }).success, false);
  assert.equal(listMatchesQuerySchema.safeParse({ limit: 101 }).success, false);
  assert.equal(listMatchesQuerySchema.safeParse({ limit: "3.5" }).success, false);
});

test("matchIdParamSchema requires a positive integer id", () => {
  const result = matchIdParamSchema.safeParse({ id: "7" });
  assert.equal(result.success, true);
  assert.equal(result.data.id, 7);

  assert.equal(matchIdParamSchema.safeParse({ id: 0 }).success, false);
  assert.equal(matchIdParamSchema.safeParse({ id: "-1" }).success, false);
});

test("createMatchSchema accepts valid input and coerces scores", () => {
  const result = createMatchSchema.safeParse({
    ...validMatch,
    homeScore: "2",
    awayScore: "0",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.homeScore, 2);
  assert.equal(result.data.awayScore, 0);
});

test("createMatchSchema enforces required non-empty strings", () => {
  const result = createMatchSchema.safeParse({
    ...validMatch,
    sport: "   ",
  });

  assert.equal(result.success, false);
});

test("createMatchSchema validates ISO date strings", () => {
  const result = createMatchSchema.safeParse(validMatch);

  assert.equal(result.success, false);
});

test("createMatchSchema validates optional start/end time format", () => {
  const result = createMatchSchema.safeParse({
    ...validMatch,
    startTime: "not-a-date",
  });

  assert.equal(result.success, false);
});

test("createMatchSchema enforces endTime after startTime", () => {
  const result = createMatchSchema.safeParse({
    ...validMatch,
    startTime: "2025-01-02T03:04:05Z",
    endTime: "2025-01-02T03:04:04Z",
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error?.issues.some((issue) => issue.path[0] === "endTime"),
    true
  );
});

test("createMatchSchema validates status enum values", () => {
  const result = createMatchSchema.safeParse({
    ...validMatch,
    status: "paused",
  });

  assert.equal(result.success, false);
});

test("updateScoreSchema requires non-negative integer scores", () => {
  const result = updateScoreSchema.safeParse({ homeScore: "1", awayScore: 2 });
  assert.equal(result.success, true);
  assert.equal(result.data.homeScore, 1);

  assert.equal(
    updateScoreSchema.safeParse({ homeScore: -1, awayScore: 2 }).success,
    false
  );
});
