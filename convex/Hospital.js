import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const registerHospital = mutation({
    args: {
        name: v.string(),
        password: v.string(),
        location_lat: v.float64(),
        location_lng: v.float64(),
        contact_number: v.string(),
        total_ambulances: v.number(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const hospitalId = await ctx.db.insert("hospitals", {
            name: args.name,
            password: args.password,
            location_lat: args.location_lat,
            location_lng: args.location_lng,
            contact_number: args.contact_number,
            total_ambulances: args.total_ambulances,
            created_at: now,
        });

        // Create individual ambulance records
        for (let i = 0; i < args.total_ambulances; i++) {
            await ctx.db.insert("ambulances", {
                hospital_id: hospitalId,
                status: "available", // Assuming a status field; adjust as needed
                created_at: now,
            });
        }

        return hospitalId;
    },
});

export const getHospitalById = query({
    args: { hospitalId: v.id("hospitals") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.hospitalId);
    },
});

export const listHospitals = query({
    handler: async (ctx) => {
        return await ctx.db.query("hospitals").collect();
    },
});