import { mutation } from "./_generated/server";

export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@springwellbk.com"))
      .unique();
    if (existing) return "Admin already exists";

    await ctx.db.insert("users", {
      email: "admin@springwellbk.com",
      password: "Admin123!@",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      status: "active",
      balance: 100000,
      accountType: "checking",
      currency: "USD",
      createdAt: Date.now(),
      lastLogin: 0,
    });
    return "Admin created: admin@springwellbk.com / Admin123!@";
  },
});

export const seedCustomer = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "customer@test.com"))
      .unique();
    if (existing) return "Customer already exists";

    await ctx.db.insert("users", {
      email: "customer@test.com",
      password: "Test123!@",
      firstName: "John",
      lastName: "Doe",
      role: "customer",
      status: "active",
      balance: 50000,
      accountType: "savings",
      currency: "USD",
      createdAt: Date.now(),
      lastLogin: 0,
    });
    return "Customer created: customer@test.com / Test123!@";
  },
});
