"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

// Load map dynamically (avoids SSR errors)
const EmergencyMap = dynamic(() => import("../client/EmergencyMap"), { ssr: false });

export default function ClientPage() {
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const [location, setLocation] = useState(null);
  const [caseDetails, setCaseDetails] = useState("");
  const [status, setStatus] = useState("");
  const [nearestHospital, setNearestHospital] = useState(null);
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Queries
  const hospitalsWithAmbulances = useQuery(api.Hospital.listHospitalsWithAmbulances);

  const userEmail = useQuery(
    api.Users.getUserByEmail,
    user ? { email: user.primaryEmailAddress?.emailAddress } : "skip"
  );

  const userRequests = useQuery(
    api.Users.getUserRequests,
    userId ? { user_id: userId } : "skip"
  );

  // Mutations
  const registerUser = useMutation(api.Users.registerUser);
  const createRequest = useMutation(api.Requests.createRequest);

  // Handle user registration
  useEffect(() => {
    if (!user) return;

    if (userEmail) {
      setUserId(userEmail._id);
    } else if (userEmail === undefined) {
      registerUser({
        name: user.firstName || user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.phoneNumber || "",
        created_at: Date.now(),
      }).then((newId) => setUserId(newId));
    }
  }, [user, userEmail, registerUser]);

  // Send ambulance request
  const handleSendRequest = async () => {
    if (!location) {
      toast.error("Please select your location on the map!");
      return;
    }
    if (!userId) {
      toast.error("User registration not completed yet!");
      return;
    }

    setLoading(true);
    setStatus("Finding nearest hospital with free ambulance...");

    try {
      if (!hospitalsWithAmbulances || hospitalsWithAmbulances.length === 0) {
        setStatus("No hospitals available.");
        setLoading(false);
        return;
      }

      let nearest = null;
      let minDistance = Infinity;
      let selectedAmbulance = null;

      hospitalsWithAmbulances.forEach((h) => {
        const freeAmb = h.ambulances.find(a => a.status === "Free");
        if (!freeAmb) return;
        const d = Math.hypot(location.lat - h.location_lat, location.lng - h.location_lng);
        if (d < minDistance) {
          nearest = h;
          minDistance = d;
          selectedAmbulance = freeAmb;
        }
      });

      if (!nearest) {
        setStatus("No free ambulances available nearby.");
        setLoading(false);
        return;
      }

      setNearestHospital(nearest);
      setAmbulance(selectedAmbulance);
      setStatus(`Free ambulance found at ${nearest.name}. Sending request...`);

      await createRequest({
        user_id: userId,
        hospital_id: nearest._id,
        ambulance_id: selectedAmbulance._id,
        user_lat: location.lat,
        user_lng: location.lng,
        case_details: caseDetails,
        status: "Pending",
        created_at: Date.now(),
      });

      setStatus("Request sent! Ambulance is on the way.");
      toast.success("Ambulance request sent successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error sending request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please sign in to request an ambulance.</div>;

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.firstName}!</h1>

      {status && <p className="mb-4 text-gray-700">{status}</p>}

      <EmergencyMap location={location} setLocation={setLocation} />

      <textarea
        className="w-full border rounded-md p-2 mt-4"
        placeholder="Case details (optional)"
        value={caseDetails}
        onChange={(e) => setCaseDetails(e.target.value)}
      />

      <button
        className={`mt-4 w-full py-3 bg-black text-white rounded-md hover:opacity-90 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleSendRequest}
        disabled={loading}
      >
        {loading ? "Processing..." : "Request Ambulance"}
      </button>

      {ambulance && nearestHospital && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h2 className="font-bold text-lg mb-2">Ambulance Details</h2>
          <p><strong>Hospital:</strong> {nearestHospital.name}</p>
          <p><strong>Driver:</strong> {ambulance.driver_name || "N/A"}</p>
          <p><strong>Contact:</strong> {ambulance.driver_contact || "N/A"}</p>
          <a
            href={`tel:${ambulance.driver_contact}`}
            className="mt-2 inline-block py-2 px-4 bg-green-600 text-white rounded-md hover:opacity-90 transition"
          >
            Call Ambulance
          </a>
        </div>
      )}

      {/* User Requests Tables */}
      {userRequests && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Requests</h2>

          {/* Active Requests */}
          <h3 className="text-xl font-semibold mb-2">Active Requests</h3>
          {userRequests.active.length === 0 ? (
            <p>No active requests.</p>
          ) : (
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Hospital</th>
                  <th className="border px-2 py-1">Ambulance</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Requested At</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.active.map((r) => (
                  <tr key={r._id}>
                    <td className="border px-2 py-1">{r.hospital?.name}</td>
                    <td className="border px-2 py-1">{r.ambulance?.driver_name || "N/A"}</td>
                    <td className="border px-2 py-1">{r.status}</td>
                    <td className="border px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Completed Requests */}
          <h3 className="text-xl font-semibold mb-2">Completed Requests</h3>
          {userRequests.completed.length === 0 ? (
            <p>No completed requests.</p>
          ) : (
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Hospital</th>
                  <th className="border px-2 py-1">Ambulance</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Requested At</th>
                  <th className="border px-2 py-1">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.completed.map((r) => (
                  <tr key={r._id}>
                    <td className="border px-2 py-1">{r.hospital?.name}</td>
                    <td className="border px-2 py-1">{r.ambulance?.driver_name || "N/A"}</td>
                    <td className="border px-2 py-1">{r.status}</td>
                    <td className="border px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="border px-2 py-1">{r.completed_at ? new Date(r.completed_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
