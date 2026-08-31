import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function requireAdmin(ctx: MutationCtx, adminUserId: Id<"users">) {
  const admin = await ctx.db.get(adminUserId);
  if (!admin || admin.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
}

// Credit or debit a customer account. Updates the balance and records the
// transaction in a single atomic mutation.
export const creditDebit = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    if (args.amount <= 0) throw new Error("Amount must be greater than zero");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (args.type === "debit" && user.balance < args.amount) {
      throw new Error("Insufficient funds");
    }

    const ts = args.date ? new Date(args.date + "T12:00:00").getTime() : Date.now();
    const newBalance = args.type === "credit" ? user.balance + args.amount : user.balance - args.amount;
    await ctx.db.patch(args.userId, { balance: newBalance });

    return await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      currency: user.currency,
      description: args.description ?? (args.type === "credit" ? "Admin credit" : "Admin debit"),
      status: "successful",
      createdAt: ts,
      backDate: args.date ?? undefined,
    });
  },
});

export const setUserStatus = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("pending")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    await ctx.db.patch(args.userId, { status: args.status });
  },
});

export const setUserRole = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("customer")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateUser = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal("checking"), v.literal("savings"), v.literal("business"))),
    currency: v.optional(v.union(v.literal("USD"), v.literal("GBP"), v.literal("EUR"))),
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"), v.literal("pending"))),
    balance: v.optional(v.number()),
    creditBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const { adminUserId, userId, ...patch } = args;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (Object.keys(clean).length) await ctx.db.patch(userId, clean);
  },
});

export const deleteUser = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Cannot delete an admin account");
    await ctx.db.delete(args.userId);
  },
});

// Admin-initiated transfer between two customer accounts.
export const transfer = mutation({
  args: {
    adminUserId: v.id("users"),
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    if (args.fromUserId === args.toUserId) throw new Error("Cannot transfer to the same account");
    if (args.amount <= 0) throw new Error("Amount must be greater than zero");

    const from = await ctx.db.get(args.fromUserId);
    const to = await ctx.db.get(args.toUserId);
    if (!from || !to) throw new Error("User not found");
    if (from.balance < args.amount) throw new Error("Insufficient funds");

    const ts = args.date ? new Date(args.date + "T12:00:00").getTime() : Date.now();
    const sender = `${from.firstName} ${from.lastName}`;
    await ctx.db.patch(args.fromUserId, { balance: from.balance - args.amount });
    await ctx.db.patch(args.toUserId, { balance: to.balance + args.amount });
    await ctx.db.insert("transactions", {
      userId: args.fromUserId,
      type: "transfer",
      amount: args.amount,
      currency: from.currency,
      description: args.description ?? `Transfer to ${to.firstName} ${to.lastName}`,
      senderName: sender,
      status: "successful",
      createdAt: ts,
      backDate: args.date ?? undefined,
    });
    await ctx.db.insert("transactions", {
      userId: args.toUserId,
      type: "transfer",
      amount: args.amount,
      currency: from.currency,
      description: args.description ?? `Transfer from ${sender}`,
      senderName: sender,
      status: "successful",
      createdAt: ts,
      backDate: args.date ?? undefined,
    });
  },
});

export const approveLoan = mutation({
  args: {
    adminUserId: v.id("users"),
    applicationId: v.id("loanApplications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);

    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");
    if (app.status === "approved") return;

    const user = await ctx.db.get(app.userId);
    if (user) {
      await ctx.db.patch(app.userId, { balance: user.balance + app.amount });
      await ctx.db.insert("transactions", {
        userId: app.userId,
        type: "credit",
        amount: app.amount,
        currency: user.currency,
        description: `Loan approved: ${app.purpose}`,
        status: "successful",
        createdAt: Date.now(),
      });
    }
    await ctx.db.patch(args.applicationId, { status: "approved" });
  },
});

export const rejectLoan = mutation({
  args: {
    adminUserId: v.id("users"),
    applicationId: v.id("loanApplications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");
    await ctx.db.patch(args.applicationId, { status: "rejected" });
  },
});

export const setMessageStatus = mutation({
  args: {
    adminUserId: v.id("users"),
    messageId: v.id("messages"),
    status: v.union(v.literal("read"), v.literal("replied")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    await ctx.db.patch(args.messageId, { status: args.status });
  },
});

export const listLoans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("loanApplications").order("desc").collect();
  },
});

export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});
