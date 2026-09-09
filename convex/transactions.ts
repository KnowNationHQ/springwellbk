import { query } from "./_generated/server";
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
    return (await ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect())
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return (await ctx.db.query("transactions").collect())
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);
  },
});
