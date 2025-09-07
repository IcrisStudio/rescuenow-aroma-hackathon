"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Input } from "../../../../components/ui/input";

export default function AddAmbulance({ hospitalId }) {
  const createAmbulance = useMutation(api.Ambulance.createAmbulance);
  const ambulances = useQuery(api.Ambulance.getAmbulancesByHospital, { hospital_id: hospitalId }) || [];

  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [status, setStatus] = useState("Free");
  const [loading, setLoading] = useState(false);

  const handleAddAmbulance = async () => {
    if (!driverName || !driverContact) {
      toast.error("Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      await createAmbulance({
        hospital_id: hospitalId,
        driver_name: driverName,
        driver_contact: driverContact,
        status,
        location_lat: 0,
        location_lng: 0,
      });
      toast.success("Ambulance added!");
      setDriverName("");
      setDriverContact("");
      setStatus("Free");
    } catch (err) {
      toast.error("Failed to add ambulance!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <Card className="rounded-xl shadow-md border border-black/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Add Ambulance / Driver</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Driver Name</Label>
            <Input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Enter driver name"
            />
          </div>
          <div className="space-y-2">
            <Label>Driver Contact</Label>
            <Input
              value={driverContact}
              onChange={(e) => setDriverContact(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-12 rounded-md border border-black/20 bg-gray-50 px-3 focus:ring-2 focus:ring-black transition-all"
            >
              <option value="Free">Free</option>
              <option value="Busy">Busy</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              onClick={handleAddAmbulance}
              className="w-full h-12 rounded-md bg-black text-white hover:opacity-90 font-medium"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Ambulance"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Display all ambulances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ambulances.map((ambulance) => (
          <motion.div
            key={ambulance._id.toString()}
            whileHover={{ scale: 1.02 }}
            className="border border-black/10 rounded-xl shadow-sm p-4 bg-white"
          >
            <h2 className="font-semibold text-lg">{ambulance.driver_name}</h2>
            <p className="text-gray-600">Contact: {ambulance.driver_contact}</p>
            <p className="text-gray-600">Status: {ambulance.status}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
