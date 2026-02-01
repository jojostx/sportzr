import { MATCH_STATUS } from '../validation/matches.js'; 

/**
 * Determines the status of a match based on time, 
 * unless it has a manual "sticky" status (Cancelled/Postponed).
 */
export function getMatchStatus(startTime, endTime, currentStatus, now = new Date()) {
    if (currentStatus === MATCH_STATUS.POSTPONED || currentStatus === MATCH_STATUS.CANCELLED) {
        return currentStatus;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    // 2. Time-based logic for standard states
    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(match, updateStatus) {
    // We now pass match.status to respect sticky states
    const nextStatus = getMatchStatus(match.startTime, match.endTime, match.status);

    if (!nextStatus) {
        return match.status;
    }

    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        match.status = nextStatus;
    }
    return match.status;
}