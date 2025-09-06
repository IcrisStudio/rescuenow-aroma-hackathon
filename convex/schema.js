import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        phone: v.string(),
        email: v.string(),
        created_at: v.number(),
    })
    .index("by_phone", ["phone"])
    .index("by_email", ["email"]),

    hospitals: defineTable({
        name: v.string(),
        password: v.string(),
        location_lat: v.float64(),
        location_lng: v.float64(),
        contact_number: v.string(),
        total_ambulances: v.number(),
        created_at: v.number(),
    })
    .index("by_name", ["name"])
    .index("by_contact_number", ["contact_number"]),

    ambulances: defineTable({
        hospital_id: v.id("hospitals"),
        driver_name: v.string(),
        driver_contact: v.string(),
        status: v.union(v.literal("Free"), v.literal("Busy"), v.literal("Maintenance")),
        location_lat: v.float64(),
        location_lng: v.float64(),
        created_at: v.number(),
    })
    .index("by_hospital", ["hospital_id"])
    .index("by_hospital_status", ["hospital_id", "status"]),

    requests: defineTable({
        user_id: v.id("users"),
        hospital_id: v.id("hospitals"),
        ambulance_id: v.id("ambulances"),
        status: v.union(
            v.literal("Pending"),
            v.literal("Accepted"),
            v.literal("Completed"),
            v.literal("Rejected")
        ),
        user_lat: v.float64(),
        user_lng: v.float64(),
        created_at: v.number(),
        completed_at: v.optional(v.number()),
    })
    .index("by_user_status", ["user_id", "status"])
    .index("by_hospital_status", ["hospital_id", "status"])
    .index("by_ambulance_status", ["ambulance_id", "status"])
    .index("by_created_at", ["created_at"]),

    admin: defineTable({
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal("SuperAdmin"), v.literal("HospitalAdmin")),
        created_at: v.number(),
    })
    .index("by_email", ["email"]),
});