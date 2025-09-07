import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createRequest = mutation({
  args: {
    user_id: v.id("users"),
    hospital_id: v.id("hospitals"),
    ambulance_id: v.id("ambulances"),
    user_lat: v.float64(),
    user_lng: v.float64(),
    case_details: v.optional(v.string()),
    status: v.union(
      v.literal("Pending"),
      v.literal("Accepted"),
      v.literal("Completed"),
      v.literal("Rejected")
    ),
    created_at: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ambulance_id, { status: "Busy" });
    return await ctx.db.insert("requests", args);
  },
});

export const getByUser = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, { user_id }) => {
    return await ctx.db.query("requests")
      .withIndex("by_user_status", (q) => q.eq("user_id", user_id))
      .collect();
  },
});

export const getByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, { hospital_id }) => {
    return await ctx.db.query("requests")
      .withIndex("by_hospital_status", (q) => q.eq("hospital_id", hospital_id))
      .collect();
  },
});



export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("requests"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Accepted"),
      v.literal("Completed"),
      v.literal("Rejected")
    ),
  },
  handler: async (ctx, { requestId, status }) => {
    const req = await ctx.db.get(requestId);
    if (!req) return false;

    if (status === "Completed" || status === "Rejected") {
      await ctx.db.patch(req.ambulance_id, { status: "Free" });
    } else if (status === "Accepted") {
      await ctx.db.patch(req.ambulance_id, { status: "Busy" });
    }

    await ctx.db.patch(requestId, { 
      status, 
      completed_at: status === "Completed" ? Date.now() : undefined 
    });
    return true;
  },
});

export const getHospitalRequests = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, { hospital_id }) => {
    return await ctx.db.query("requests")
      .withIndex("by_hospital_status", (q) => q.eq("hospital_id", hospital_id))
      .collect();
  },
});