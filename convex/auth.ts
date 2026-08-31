import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) throw new Error("No account found with this email");
    if (user.password !== args.password) throw new Error("Incorrect password");
    await ctx.db.patch(user._id, { lastLogin: Date.now() });
    return { userId: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName };
  },
});

export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(userId, updates);
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.password !== args.currentPassword) throw new Error("Current password is incorrect");
    await ctx.db.patch(args.userId, { password: args.newPassword });
  },
});

export const getDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
    const loanApplications = await ctx.db
      .query("loanApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return { user, transactions, loanApplications };
  },
});

// Customer-initiated transfer to another SpringWell user (by email). Moves
// money atomically and records both sides of the transaction.
export const transfer = mutation({
  args: {
    fromUserId: v.id("users"),
    toEmail: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) throw new Error("Amount must be greater than zero");

    const from = await ctx.db.get(args.fromUserId);
    if (!from) throw new Error("Sender account not found");
    if (from.status !== "active") throw new Error("Your account is not active");
    if (from.balance < args.amount) throw new Error("Insufficient funds");

    const to = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.toEmail.trim().toLowerCase()))
      .unique();
    if (!to) throw new Error("No SpringWell user found with that email");
    if (to._id === from._id) throw new Error("Cannot transfer to your own account");

    const senderName = `${from.firstName} ${from.lastName}`;
    const note = args.description?.trim();
    const ts = Date.now();

    await ctx.db.patch(from._id, { balance: from.balance - args.amount });
    await ctx.db.patch(to._id, { balance: to.balance + args.amount });

    await ctx.db.insert("transactions", {
      userId: from._id,
      type: "debit",
      amount: args.amount,
      currency: from.currency,
      description: note ? `Transfer to ${to.firstName} ${to.lastName} — ${note}` : `Transfer to ${to.firstName} ${to.lastName}`,
      senderName,
      status: "successful",
      createdAt: ts,
    });
    await ctx.db.insert("transactions", {
      userId: to._id,
      type: "credit",
      amount: args.amount,
      currency: from.currency,
      description: note ? `Transfer from ${senderName} — ${note}` : `Transfer from ${senderName}`,
      senderName,
      status: "successful",
      createdAt: ts,
    });

    return { ok: true as const };
  },
});
