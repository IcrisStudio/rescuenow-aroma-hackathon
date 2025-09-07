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
    const hospitalId = await ctx.db.insert("hospitals", { ...args, created_at: now });

    for (let i = 0; i < args.total_ambulances; i++) {
      await ctx.db.insert("ambulances", {
        hospital_id: hospitalId,
        driver_name: `Driver ${i + 1}`,
        driver_contact: "",
        status: "Free",
        location_lat: args.location_lat,
        location_lng: args.location_lng,
        created_at: now,
      });
    }

    return hospitalId;
  },
});


export const loginHospital = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { name, password }) => {
    const hospitals = await ctx.db
      .query("hospitals")
      .filter((q) => q.eq(q.field("name"), name))
      .collect();

    if (hospitals.length === 0) {
      throw new Error("Hospital not found");
    }

    const hospital = hospitals[0];

    const isValid = hospital.password === password; 

    if (!isValid) {
      throw new Error("Invalid password");
    }

    return { hospitalId: hospital._id, name: hospital.name };
  },
});


export const getHospitalById = query({
  args: { hospitalId: v.id("hospitals") },
  handler: async (ctx, { hospitalId }) => {
    return await ctx.db.get(hospitalId);
  },
});

export const listHospitals = query({
  handler: async (ctx) => {
    return await ctx.db.query("hospitals").collect();
  },
});

export const listHospitalsWithAmbulances = query({
  handler: async (ctx) => {
    const hospitals = await ctx.db.query("hospitals").collect();

    const hospitalsWithAmbulances = await Promise.all(
      hospitals.map(async (hospital) => {
        const ambulances = await ctx.db
          .query("ambulances")
          .filter((q) => q.eq(q.field("hospital_id"), hospital._id))
          .collect();

        return { ...hospital, ambulances };
      })
    );

    return hospitalsWithAmbulances;
  },
});
