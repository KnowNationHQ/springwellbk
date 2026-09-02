import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) throw new Error("No account found with this username");
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

const OTP_TTL_MS = 10 * 60 * 1000;

export const requestLoginCode = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) return { ok: true as const };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + OTP_TTL_MS;
    await ctx.db.patch(user._id, { otpCode: code, otpExpiresAt: expiresAt });

    await ctx.scheduler.runAfter(0, api.email.sendOtpEmail, { to: user.email, code });

    return { ok: true as const };
  },
});

export const verifyLoginCode = mutation({
  args: { username: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new Error("Invalid or expired code");
    }
    if (Date.now() > user.otpExpiresAt) {
      await ctx.db.patch(user._id, { otpCode: undefined, otpExpiresAt: undefined });
      throw new Error("Invalid or expired code");
    }
    if (user.otpCode !== args.code.trim()) {
      throw new Error("Invalid or expired code");
    }
    await ctx.db.patch(user._id, {
      otpCode: undefined,
      otpExpiresAt: undefined,
      lastLogin: Date.now(),
    });
    return {
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  },
});

const RESET_TTL_MS = 30 * 60 * 1000;

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) return { ok: true as const };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await ctx.db.patch(user._id, {
      resetCode: code,
      resetExpiresAt: Date.now() + RESET_TTL_MS,
    });
    await ctx.scheduler.runAfter(0, api.email.sendPasswordResetEmail, { to: user.email, code });
    return { ok: true as const };
  },
});

export const resetPassword = mutation({
  args: { email: v.string(), code: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user || !user.resetCode || !user.resetExpiresAt) {
      throw new Error("Invalid or expired code");
    }
    if (Date.now() > user.resetExpiresAt) {
      await ctx.db.patch(user._id, { resetCode: undefined, resetExpiresAt: undefined });
      throw new Error("Invalid or expired code");
    }
    if (user.resetCode !== args.code.trim()) {
      throw new Error("Invalid or expired code");
    }
    await ctx.db.patch(user._id, {
      password: args.newPassword,
      resetCode: undefined,
      resetExpiresAt: undefined,
    });
    return { ok: true as const };
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
