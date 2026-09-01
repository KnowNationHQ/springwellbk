"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const CREDITS = [
  { desc: "DIRECT DEPOSIT PAYROLL", min: 500, max: 2500 },
  { desc: "VENMO TRANSFER", min: 20, max: 300 },
  { desc: "CASHBACK REWARD", min: 5, max: 50 },
  { desc: "INTEREST PAYMENT", min: 1, max: 15 },
];
const DEBITS = [
  { desc: "STARBUCKS", min: 4, max: 12 },
  { desc: "AMAZON", min: 10, max: 200 },
  { desc: "UBER", min: 8, max: 45 },
  { desc: "WALMART", min: 15, max: 180 },
  { desc: "NETFLIX", min: 9, max: 22 },
  { desc: "SHELL GAS", min: 25, max: 70 },
  { desc: "WHOLE FOODS", min: 20, max: 150 },
  { desc: "TARGET", min: 12, max: 160 },
  { desc: "SPOTIFY", min: 5, max: 16 },
  { desc: "ATM WITHDRAWAL", min: 20, max: 200 },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateMockTxns(count: number) {
  const out: { type: "credit" | "debit"; amount: number; description: string }[] = [];
  for (let i = 0; i < count; i++) {
    const isCredit = Math.random() < 0.35;
    const t = isCredit ? pick(CREDITS) : pick(DEBITS);
    out.push({ type: isCredit ? "credit" : "debit", amount: rand(t.min, t.max), description: t.desc });
  }
  return out;
}

async function syncLinksFor(ctx: any, links: any[]): Promise<void> {
  for (const link of links) {
    const count = rand(1, 3);
    const txns = generateMockTxns(count);
    for (const t of txns) {
      await ctx.runMutation(internal.plaid.applyMock, {
        userId: link.userId,
        type: t.type,
        amount: t.amount,
        description: t.description,
      });
    }
    await ctx.runMutation(internal.plaid.touchLink, { linkId: link._id });
  }
}

export const syncUser = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<{ synced: number }> => {
    const links = await ctx.runQuery(api.plaid.getLinks, { userId: args.userId });
    await syncLinksFor(ctx, links);
    return { synced: links.length };
  },
});

export const syncAll = internalAction({
  args: {},
  handler: async (ctx): Promise<{ syncedLinks: number }> => {
    const links = await ctx.runQuery(internal.plaid.listLinks, {});
    await syncLinksFor(ctx, links);
    return { syncedLinks: links.length };
  },
});

// Returns a link token for the "Connect a bank" flow. With real Plaid API keys
// set in the Convex environment this would return a live Plaid link_token; in
// this demo it returns a mock token so the flow works without credentials.
export const createLinkToken = action({
  args: { userId: v.id("users") },
  handler: async (): Promise<{ token: string; mock: boolean }> => {
    return { token: "mock-link-token-" + Math.random().toString(36).slice(2), mock: true };
  },
});
