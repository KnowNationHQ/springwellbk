import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    balance: v.number(),
    creditBalance: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("pending")),
    role: v.union(v.literal("customer"), v.literal("admin")),
    lastLogin: v.optional(v.number()),
    otpCode: v.optional(v.string()),
    otpExpiresAt: v.optional(v.number()),
    resetCode: v.optional(v.string()),
    resetExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("credit"), v.literal("debit"), v.literal("transfer")),
    amount: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
    senderName: v.optional(v.string()),
    status: v.union(v.literal("successful"), v.literal("pending"), v.literal("failed")),
    backDate: v.optional(v.string()),
    source: v.optional(v.string()),
    counterpartyId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  loanApplications: defineTable({
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
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("unread"), v.literal("read"), v.literal("replied")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"]),

  bankLinks: defineTable({
    userId: v.id("users"),
    institution: v.string(),
    accessToken: v.string(),
    lastSync: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
