"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AddAmbulance from "./AmbulancePage";

// Leaflet map loaded dynamically to avoid SSR issues
const HospitalMap = dynamic(() => import("./HospitalMap.js"), { ssr: false });

const HospitalAdmin = () => {
  const params = useParams();
  const hospitalId = params.hospitalid;

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const hospitalData = useQuery(api.Hospital.getHospitalById, { hospitalId });

  useEffect(() => {
    const token = localStorage.getItem("hospitalAdminSessionToken");

    setTimeout(() => {
      if (token) setIsAdmin(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-700">Checking admin credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-gray-700 text-lg">You are not logged in as admin.</p>
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-gray-700 text-lg">Loading hospital details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">{hospitalData.name} Admin Panel</h1>
      <p className="text-gray-700 mb-4">
        Contact: {hospitalData.contact_number} <br />
        Total Ambulances: {hospitalData.total_ambulances} <br />
        Created At: {new Date(hospitalData.created_at).toLocaleString()}
      </p>

      <div className="h-96 w-full rounded-md overflow-hidden border border-black/20">
        <HospitalMap
          markerPosition={{
            lat: hospitalData.location_lat,
            lng: hospitalData.location_lng,
          }}
          isReadOnly={true}
        />
      </div>

      {/* Add Ambulance Component */}
      <AddAmbulance hospitalId={hospitalId} />
    </div>
  );
};

export default HospitalAdmin;
