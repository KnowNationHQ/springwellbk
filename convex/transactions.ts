import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit"), v.literal("transfer")),
    amount: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
    senderName: v.optional(v.string()),
    backDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", {
      ...args,
      status: "successful",
      createdAt: Date.now(),
    });
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db.query("transactions").order("desc").take(limit);
  },
});
