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
    return await ctx.db.query("transactions").withIndex("by_user_createdAt", (q) => q.eq("userId", args.userId)).order("desc").collect();
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db.query("transactions").withIndex("by_createdAt").order("desc").take(limit);
  },
});
