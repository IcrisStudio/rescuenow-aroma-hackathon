import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create ambulance
export const createAmbulance = mutation({
  args: {
    hospital_id: v.id("hospitals"),
    driver_name: v.string(),
    driver_contact: v.string(),
    status: v.union(v.literal("Free"), v.literal("Busy"), v.literal("Maintenance")),
    location_lat: v.float64(),
    location_lng: v.float64(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ambulances", { ...args, created_at: Date.now() });
  },
});

// Update ambulance status
export const updateAmbulanceStatus = mutation({
  args: {
    ambulanceId: v.id("ambulances"),
    status: v.union(v.literal("Free"), v.literal("Busy"), v.literal("Maintenance")),
  },
  handler: async (ctx, { ambulanceId, status }) => {
    await ctx.db.patch(ambulanceId, { status });
    return true;
  },
});

// Get ambulances by hospital
export const getAmbulancesByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, { hospital_id }) => {
    return await ctx.db
      .query("ambulances")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", hospital_id))
      .collect();
  },
});

// Get free ambulances by hospital
export const getFreeAmbulancesByHospital = query({
  args: { hospital_id: v.id("hospitals") },
  handler: async (ctx, { hospital_id }) => {
    return await ctx.db
      .query("ambulances")
      .withIndex("by_hospital_status", (q) =>
        q.eq("hospital_id", hospital_id).eq("status", "Free")
      )
      .collect();
  },
});
