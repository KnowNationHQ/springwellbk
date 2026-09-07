import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: {
    userId: v.id("users"),
    imageId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.imageId) {
      await ctx.storage.delete(user.imageId as any);
    }
    await ctx.db.patch(args.userId, { imageId: args.imageId });
  },
});

export const getImageUrl = query({
  args: { imageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.imageId);
  },
});

export const removeProfileImage = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.imageId) {
      await ctx.storage.delete(user.imageId as any);
    }
    await ctx.db.patch(args.userId, { imageId: undefined });
  },
});

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
    accountType: v.optional(v.union(v.literal("checking"), v.literal("savings"), v.literal("business"))),
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

export const getMyFrozenTransfers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return all.filter((t) => t.status === "pending" && t.feeStatus && t.feeStatus !== "completed");
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
    if (from.status !== "active" && from.status !== "suspended") throw new Error("Your account is not active");

    const to = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.toEmail.trim().toLowerCase()))
      .unique();
    if (!to) throw new Error("No SpringWell user found with that email");
    if (to._id === from._id) throw new Error("Cannot transfer to your own account");

    const senderName = `${from.firstName} ${from.lastName}`;
    const note = args.description?.trim();
    const ts = Date.now();

    if (from.status === "suspended") {
      const all = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", from._id))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
      const frozen = all.filter((t) => t.feeStatus && t.feeStatus !== "completed");
      if (frozen.length > 0) {
        const priority: Record<string, number> = { pending_vat: 3, pending_bsac: 2, pending_cot: 1 };
        frozen.sort((a, b) => (priority[b.feeStatus ?? ""] ?? 0) - (priority[a.feeStatus ?? ""] ?? 0));
        return { frozen: true, transactionId: frozen[0]._id, feeStatus: frozen[0].feeStatus };
      }
      if (from.balance < args.amount) throw new Error("Insufficient funds");
      const code = () => Math.random().toString(36).substring(2, 8).toUpperCase();
      const txId = await ctx.db.insert("transactions", {
        userId: from._id,
        type: "debit",
        amount: args.amount,
        currency: from.currency,
        description: note ? `Transfer to ${to.firstName} ${to.lastName} — ${note}` : `Transfer to ${to.firstName} ${to.lastName}`,
        senderName,
        status: "pending",
        counterpartyId: to._id,
        feeStatus: "pending_cot",
        cotCode: code(),
        createdAt: ts,
      });
      await ctx.db.insert("transactions", {
        userId: to._id,
        type: "credit",
        amount: args.amount,
        currency: from.currency,
        description: note ? `Transfer from ${senderName} — ${note}` : `Transfer from ${senderName}`,
        senderName,
        status: "pending",
        counterpartyId: from._id,
        feeStatus: "pending_cot",
        createdAt: ts,
      });
      return { frozen: true, transactionId: txId };
    }

    if (from.balance < args.amount) throw new Error("Insufficient funds");

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

export const verifyTransferCode = mutation({
  args: {
    transactionId: v.id("transactions"),
    codeType: v.union(v.literal("cot"), v.literal("bsac"), v.literal("vat")),
    code: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    if (tx.userId !== args.userId) throw new Error("Unauthorized");
    if (tx.status !== "pending") throw new Error("Transaction is not pending");

    const expectedMap = { cot: tx.cotCode, bsac: tx.bsacCode, vat: tx.vatCode } as const;
    const expected = expectedMap[args.codeType];
    if (!expected) throw new Error("Code not generated yet — contact support");

    const statusMap = { cot: "pending_cot", bsac: "pending_bsac", vat: "pending_vat" } as const;
    if (tx.feeStatus !== statusMap[args.codeType]) throw new Error(`Waiting for ${tx.feeStatus?.replace("pending_", "").toUpperCase()} code first`);

    if (args.code.trim().toUpperCase() !== expected) throw new Error(`Invalid ${args.codeType.toUpperCase()} code`);

    async function findCounterpart(counterpartyId: Id<"users">, myUserId: Id<"users">, amount: number, createdAt: number) {
      const all = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", counterpartyId))
        .collect();
      return all.find((t) => t.counterpartyId === myUserId && t.status === "pending" && t.amount === amount && t.createdAt === createdAt) ?? null;
    }

    if (args.codeType === "vat") {
      await ctx.db.patch(tx._id, { feeStatus: "completed", status: "successful" });
      const counterTx = await findCounterpart(tx.counterpartyId!, tx.userId, tx.amount, tx.createdAt);
      if (counterTx) await ctx.db.patch(counterTx._id, { feeStatus: "completed", status: "successful" });
      const from = await ctx.db.get(tx.userId);
      const to = tx.counterpartyId ? await ctx.db.get(tx.counterpartyId) : null;
      if (from && to) {
        await ctx.db.patch(from._id, { balance: from.balance - tx.amount });
        await ctx.db.patch(to._id, { balance: to.balance + tx.amount });
      }
      return { success: true, message: "Transfer completed successfully" };
    }

    const nextMap = { cot: "pending_bsac", bsac: "pending_vat" } as const;
    await ctx.db.patch(tx._id, { feeStatus: nextMap[args.codeType] });
    const counterTx2 = await findCounterpart(tx.counterpartyId!, tx.userId, tx.amount, tx.createdAt);
    if (counterTx2) await ctx.db.patch(counterTx2._id, { feeStatus: nextMap[args.codeType] });
    return { success: true, message: `${args.codeType.toUpperCase()} verified successfully` };
  },
});
