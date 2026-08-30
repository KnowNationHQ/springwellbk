import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    accountType: v.union(v.literal("checking"), v.literal("savings"), v.literal("business")),
    currency: v.union(v.literal("USD"), v.literal("GBP"), v.literal("EUR")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) {
      throw new Error("Email already registered");
    }
    return await ctx.db.insert("users", {
      ...args,
      balance: 0,
      status: "pending",
      role: "customer",
      createdAt: Date.now(),
    });
  },
});

export const updateBalance = mutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { balance: user.balance + args.amount });
  },
});

export const updateStatus = mutation({
  args: { userId: v.id("users"), status: v.union(v.literal("active"), v.literal("suspended"), v.literal("pending")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { status: args.status });
  },
});
