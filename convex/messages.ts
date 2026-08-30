import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      status: "unread",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(v.literal("read"), v.literal("replied")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { status: args.status });
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_status", (q) => q.eq("status", "unread"))
      .collect();
    return unread.length;
  },
});
