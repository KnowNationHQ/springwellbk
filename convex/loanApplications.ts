import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("loanApplications").order("desc").collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("loanApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    purpose: v.string(),
    fullName: v.string(),
    gender: v.string(),
    dateOfBirth: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    employmentStatus: v.string(),
    monthlyIncome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("loanApplications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
