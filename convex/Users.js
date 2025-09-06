import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const registerUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    created_at: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("users", args);
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return await ctx.db.query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db.query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const listHospitalsFunc = mutation({
  handler: async (ctx) => {
    return await ctx.db.query("hospitals").collect();
  },
});

export const getUserRequests = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, { user_id }) => {
    const requests = await ctx.db.query("requests")
      .filter(q => q.eq(q.field("user_id"), user_id))
      .collect();

    const requestsWithDetails = await Promise.all(
      requests.map(async (r) => {
        const hospital = await ctx.db.get(r.hospital_id);
        const ambulance = await ctx.db.get(r.ambulance_id);
        return { ...r, hospital, ambulance };
      })
    );

    const active = requestsWithDetails.filter(r => r.status === "Pending" || r.status === "Accepted");
    const completed = requestsWithDetails.filter(r => r.status === "Completed" || r.status === "Rejected");

    return { active, completed };
  },
});
