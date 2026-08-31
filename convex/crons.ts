import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Keep linked accounts active with fresh mock transactions around the clock.
crons.interval("plaid mock sync", { minutes: 30 }, internal.plaidSync.syncAll, {});

export default crons;
