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
  const requests = useQuery(api.Requests.getHospitalRequests, { hospital_id: hospitalId });

  useEffect(() => {
    const token = localStorage.getItem("hospitalAdminSessionToken");

    setTimeout(() => {
      if (token) setIsAdmin(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">You are not logged in as admin.</p>
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Loading hospital details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{hospitalData.name} Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hospital Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital Info</h2>
          <p className="text-gray-700">Contact: {hospitalData.contact_number}</p>
          <p className="text-gray-700">Total Ambulances: {hospitalData.total_ambulances}</p>
          <p className="text-gray-700">Created At: {new Date(hospitalData.created_at).toLocaleString()}</p>
        </div>

        {/* Map Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          <div className="h-64 w-full rounded-md overflow-hidden border border-gray-200">
            <HospitalMap
              markerPosition={{
                lat: hospitalData.location_lat,
                lng: hospitalData.location_lng,
              }}
              isReadOnly={true}
            />
          </div>
        </div>

        {/* Requests Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Status</h2>
          {requests ? (
            <div className="space-y-2">
              {requests.map((req) => (
                <div key={req._id} className="p-2 bg-gray-50 rounded-md">
                  <p className="text-gray-700">Status: {req.status}</p>
                  <p className="text-gray-700">User Location: ({req.user_lat}, {req.user_lng})</p>
                  {req.ambulance_lat && req.ambulance_lng && (
                    <p className="text-gray-700">Ambulance Location: ({req.ambulance_lat}, {req.ambulance_lng})</p>
                  )}
                  <p className="text-gray-700">Created At: {new Date(req.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">No requests found.</p>
          )}
        </div>

        {/* Add Ambulance Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Ambulances</h2>
          <AddAmbulance hospitalId={hospitalId} />
        </div>
      </div>
    </div>
  );
};

export default HospitalAdmin;