import { mutation } from "./_generated/server";

function genAccountNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SWB-${code}`;
}

export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@springwellbk.com"))
      .unique();
    if (existing) return "Admin already exists";

    await ctx.db.insert("users", {
      username: "admin",
      email: "admin@springwellbk.com",
      password: "Admin123!@",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      status: "active",
      accountNumber: "SWB-ADMIN001",
      balance: 100000,
      creditBalance: 25000,
      accountType: "checking",
      currency: "USD",
      createdAt: Date.now(),
      lastLogin: 0,
    });
    return "Admin created: admin / Admin123!@";
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
      username: "customer",
      email: "customer@test.com",
      password: "Test123!@",
      firstName: "John",
      lastName: "Doe",
      role: "customer",
      status: "active",
      accountNumber: "SWB-CUST001",
      balance: 50000,
      creditBalance: 12000,
      accountType: "savings",
      currency: "USD",
      createdAt: Date.now(),
      lastLogin: 0,
    });
    return "Customer created: customer / Test123!@";
  },
});

export const migrateAccountNumbers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (!(user as any).accountNumber) {
        await ctx.db.patch(user._id, { accountNumber: genAccountNumber() } as any);
        count++;
      }
    }
    return `Patched ${count} users with account numbers`;
  },
});
