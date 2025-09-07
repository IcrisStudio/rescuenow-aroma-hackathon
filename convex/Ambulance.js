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
    return await ctx.db.insert("ambulances", { 
      ...args, 
      total_rides: 0, // Initialize total rides
      created_at: Date.now() 
    });
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

export const verifyAmbulanceDriver = mutation({
  args: {
    hospital_id: v.id("hospitals"),
    driver_name: v.string(),
    driver_contact: v.string(),
  },
  handler: async (ctx, { hospital_id, driver_name, driver_contact }) => {
    const drivers = await ctx.db
      .query("ambulances")
      .withIndex("by_hospital", (q) => q.eq("hospital_id", hospital_id))
      .collect();

    // Safely filter using optional chaining
    const driver = drivers.find(
      (a) =>
        a.driver_name?.toLowerCase() === driver_name.toLowerCase() &&
        a.driver_contact?.toLowerCase() === driver_contact.toLowerCase()
    );

    return driver ? { success: true, driver } : { success: false };
  },
});

// Update ambulance live location
export const updateAmbulanceLocation = mutation({
  args: {
    ambulance_id: v.id("ambulances"),
    lat: v.float64(),
    lng: v.float64(),
  },
  handler: async (ctx, { ambulance_id, lat, lng }) => {
    // Update ambulance location
    await ctx.db.patch(ambulance_id, { location_lat: lat, location_lng: lng });

    // Update active requests with this ambulance
    const requests = await ctx.db.query("requests")
      .withIndex("by_ambulance_status", (q) => q.eq("ambulance_id", ambulance_id).eq("status", "Accepted"))
      .collect();

    for (const r of requests) {
      await ctx.db.patch(r._id, { ambulance_lat: lat, ambulance_lng: lng });
    }

    return true;
  },
});
