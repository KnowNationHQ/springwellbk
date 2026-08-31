import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getLinks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bankLinks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const linkBank = mutation({
  args: { userId: v.id("users"), institution: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    const institutions = ["Chase", "Bank of America", "Wells Fargo", "Citibank", "Capital One"];
    const institution =
      args.institution ?? institutions[Math.floor(Math.random() * institutions.length)];
    return await ctx.db.insert("bankLinks", {
      userId: args.userId,
      institution,
      accessToken: "mock_" + Math.random().toString(36).slice(2) + Date.now().toString(36),
      lastSync: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const listLinks = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bankLinks").collect();
  },
});

export const applyMock = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.status !== "active") return;
    let amount = Math.max(1, Math.round(args.amount));
    if (args.type === "debit" && user.balance <= amount) amount = Math.max(1, Math.floor(user.balance * 0.5));
    const newBalance = args.type === "credit" ? user.balance + amount : Math.max(0, user.balance - amount);
    await ctx.db.patch(args.userId, { balance: newBalance });
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.type,
      amount,
      currency: user.currency,
      description: args.description,
      status: "successful",
      source: "plaid",
      createdAt: Date.now(),
    });
  },
});

export const touchLink = internalMutation({
  args: { linkId: v.id("bankLinks") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.linkId, { lastSync: Date.now() });
  },
});

export type MockTxn = { type: "credit" | "debit"; amount: number; description: string };
