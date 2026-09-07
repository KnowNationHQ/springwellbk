import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function requireAdmin(ctx: MutationCtx, adminUserId: Id<"users">) {
  const admin = await ctx.db.get(adminUserId);
  if (!admin || admin.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
}

// Credit or debit a customer account. Records the transaction as PENDING;
// the balance is applied only when an admin completes it with the activation
// code (see completeTransaction). This mirrors the reference two-step flow.
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

    const ts = args.date ? new Date(args.date + "T12:00:00").getTime() : Date.now();
    return await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      currency: user.currency,
      description: args.description ?? (args.type === "credit" ? "Admin credit" : "Admin debit"),
      status: "pending",
      createdAt: ts,
      backDate: args.date ?? undefined,
    });
  },
});

// Activation code required to release (complete) a pending transaction.
// Override via Convex env var ACTIVATION_CODE in production.
const ACTIVATION_CODE = process.env.ACTIVATION_CODE ?? "SWB-ADMIN-2026";

// Generate a fresh activation code for a pending transaction.
export const generateActivationCode = mutation({
  args: {
    adminUserId: v.id("users"),
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "SWB-";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    await ctx.db.patch(args.transactionId, { activationCode: code });
    return code;
  },
});

// Complete a pending transaction after verifying the admin's activation code.
// Applies the balance change and marks the transaction successful.
export const completeTransaction = mutation({
  args: {
    adminUserId: v.id("users"),
    transactionId: v.id("transactions"),
    activationCode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") throw new Error("Transaction is not pending");
    const expected = tx.activationCode ?? ACTIVATION_CODE;
    if (args.activationCode.trim() !== expected) {
      throw new Error("Invalid activation code");
    }

    if (tx.type === "transfer") {
      const from = await ctx.db.get(tx.userId);
      const to = tx.counterpartyId ? await ctx.db.get(tx.counterpartyId) : null;
      if (!from || !to) throw new Error("Account not found");
      if (from.balance < tx.amount) throw new Error("Sender has insufficient funds");
      await ctx.db.patch(tx.userId, { balance: from.balance - tx.amount });
      await ctx.db.patch(tx.counterpartyId!, { balance: to.balance + tx.amount });
      const counterpart = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", tx.counterpartyId!))
        .filter((q) =>
          q.and(
            q.eq(q.field("counterpartyId"), tx.userId),
            q.eq(q.field("status"), "pending"),
          ),
        )
        .first();
      if (counterpart) await ctx.db.patch(counterpart._id, { status: "successful" });
    } else if (tx.type === "debit" && tx.counterpartyId) {
      const from = await ctx.db.get(tx.userId);
      const to = await ctx.db.get(tx.counterpartyId);
      if (!from || !to) throw new Error("Account not found");
      if (from.balance < tx.amount) throw new Error("Sender has insufficient funds");
      await ctx.db.patch(tx.userId, { balance: from.balance - tx.amount });
      await ctx.db.patch(tx.counterpartyId, { balance: to.balance + tx.amount });
      const counterpart = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", tx.counterpartyId!))
        .filter((q) =>
          q.and(
            q.eq(q.field("counterpartyId"), tx.userId),
            q.eq(q.field("status"), "pending"),
          ),
        )
        .first();
      if (counterpart) await ctx.db.patch(counterpart._id, { status: "successful" });
    } else if (tx.type === "credit") {
      const user = await ctx.db.get(tx.userId);
      if (!user) throw new Error("Account not found");
      await ctx.db.patch(tx.userId, { balance: user.balance + tx.amount });
    }

    await ctx.db.patch(tx._id, { status: "successful" });
    return tx._id;
  },
});

// Backdate an existing transaction's date (admin override).
export const backDateTransaction = mutation({
  args: {
    adminUserId: v.id("users"),
    transactionId: v.id("transactions"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const ts = new Date(args.date + "T12:00:00").getTime();
    await ctx.db.patch(args.transactionId, { createdAt: ts, backDate: args.date });
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
    void adminUserId;
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

// Admin-initiated transfer between two customer accounts. Records both legs as
// PENDING; balances are applied when an admin completes the transaction with
// the activation code (see completeTransaction).
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

    const ts = args.date ? new Date(args.date + "T12:00:00").getTime() : Date.now();
    const sender = `${from.firstName} ${from.lastName}`;
    await ctx.db.insert("transactions", {
      userId: args.fromUserId,
      type: "transfer",
      amount: args.amount,
      currency: from.currency,
      description: args.description ?? `Transfer to ${to.firstName} ${to.lastName}`,
      senderName: sender,
      status: "pending",
      counterpartyId: args.toUserId,
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
      status: "pending",
      counterpartyId: args.fromUserId,
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

export const pendingTransactions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setUserImage = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
    imageId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.imageId) {
      await ctx.storage.delete(user.imageId as any);
    }
    await ctx.db.patch(args.userId, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {
    adminUserId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.imageId) {
      await ctx.storage.delete(user.imageId as any);
    }
    await ctx.db.patch(args.userId, { imageId: undefined });
  },
});

export const generateTransferCodes = mutation({
  args: {
    adminUserId: v.id("users"),
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminUserId);
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (tx.status !== "pending" || !tx.feeStatus) throw new Error("Not a frozen transfer");
    const code = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    const patch: Record<string, string> = {};
    let label = "";
    if (!tx.cotCode) {
      patch.cotCode = code();
      label = "COT";
    } else if (!tx.bsacCode) {
      patch.bsacCode = code();
      label = "BSAC";
    } else if (!tx.vatCode) {
      patch.vatCode = code();
      label = "VAT";
    }

    if (Object.keys(patch).length === 0) throw new Error("All codes already generated");
    await ctx.db.patch(tx._id, patch);

    const counterTx = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", tx.counterpartyId!))
      .filter((q) => q.and(q.eq(q.field("counterpartyId"), tx.userId), q.eq(q.field("type"), "transfer"), q.eq(q.field("status"), "pending")))
      .first();
    if (counterTx) await ctx.db.patch(counterTx._id, patch);

    return { label, code: patch[`${label.toLowerCase()}Code`] as string };
  },
});

export const pendingFrozenTransfers = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("transactions").collect();
    return all.filter((t) => t.status === "pending" && t.feeStatus);
  },
});
