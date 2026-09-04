import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    username: v.string(),
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
    const existingEmail = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existingEmail) throw new Error("Email already registered");
    const existingUser = await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", args.username)).unique();
    if (existingUser) throw new Error("Username already taken");
    const userId = await ctx.db.insert("users", {
      ...args,
      balance: 0,
      creditBalance: 0,
      status: "pending",
      role: "customer",
      createdAt: Date.now(),
    });
    try {
      await ctx.scheduler.runAfter(0, api.email.sendWelcomeEmail, { to: args.email, firstName: args.firstName });
    } catch (_) {}
    return userId;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const migrateUsernames = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (!user.username) {
        const base = user.email.split("@")[0];
        await ctx.db.patch(user._id, { username: base });
        count++;
      }
    }
    return `Patched ${count} users with usernames`;
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

export const fixAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "admin@springwellbk.com")).unique();
    if (admin && admin.role !== "admin") {
      await ctx.db.patch(admin._id, { role: "admin" });
      return "Fixed admin role";
    }
    return "Admin role already correct";
  },
});
