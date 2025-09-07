"use client";

import React, { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  // Get current step for timeline based on status
  const steps = ["Preparing Request", "Finding Hospital", "Sending Request", "Request Sent"];
  const getStep = () => {
    if (!status) return 0;
    if (status.includes("Finding")) return 1;
    if (status.includes("found")) return 2;
    if (status.includes("sent")) return 3;
    return 0;
  };
  const currentStep = getStep();

  // Status badge function for requests
  const getStatusBadge = (status) => {
    let color = "";
    switch (status) {
      case "Pending":
        color = "bg-yellow-400 text-yellow-900";
        break;
      case "Accepted":
        color = "bg-blue-400 text-blue-900";
        break;
      case "On the way":
        color = "bg-purple-400 text-purple-900";
        break;
      case "Completed":
        color = "bg-green-400 text-green-900";
        break;
      case "Cancelled":
        color = "bg-red-400 text-red-900";
        break;
      default:
        color = "bg-gray-400 text-gray-900";
    }
    return <span className={`${color} px-3 py-1 rounded-full text-sm font-medium`}>{status}</span>;
  };

  // Mock leaderboard data (since no convex change allowed)
  const leaderboard = [
    { name: "John Doe", credits: 25, profile: "/placeholder-profile1.jpg" },
    { name: "Jane Smith", credits: 18, profile: "/placeholder-profile2.jpg" },
    { name: "Alex Johnson", credits: 12, profile: "/placeholder-profile3.jpg" },
  ];

  // Calculate user credits (based on completed requests)
  const userCredits = userRequests ? userRequests.completed.length : 0;

  // SVG Loader
  const Loader = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Handle request click (show confirmation)
  const handleRequestClick = () => {
    if (!location) {
      toast.error("Please select your location on the map!");
      return;
    }
    if (!userId) {
      toast.error("User registration not completed yet!");
      return;
    }
    setShowConfirmation(true);
  };

  // Send ambulance request
  const handleSendRequest = async () => {
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
        const freeAmb = h.ambulances.find((a) => a.status === "Free");
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

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <p className="text-lg text-gray-600">Please sign in to request an ambulance.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
        >
          Rescue Now
        </motion.h1>
        <UserButton />
        </div>
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                {steps.map((label, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div
                        className={`rounded-full w-6 h-6 flex items-center justify-center text-white text-sm font-bold ${
                          index < currentStep
                            ? "bg-green-500"
                            : index === currentStep
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {index < currentStep ? "✓" : index + 1}
                      </div>
                      <p className="text-xs mt-2 text-center text-gray-600">{label}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 ${
                          index < currentStep ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
        >
          <EmergencyMap location={location} setLocation={setLocation} />
        </motion.div>

        <motion.textarea
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full h-32 p-4 text-gray-700 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 resize-none shadow-sm"
          placeholder="Case details (optional)"
          value={caseDetails}
          onChange={(e) => setCaseDetails(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`mt-6 w-full py-3 px-6 bg-blue-600 text-white rounded-2xl font-semibold text-lg transition duration-200 shadow-md ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 cursor-pointer"
          }`}
          onClick={handleRequestClick}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader />
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            "Request Ambulance"
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-3 px-6 bg-red-600 text-white rounded-2xl font-semibold text-lg transition duration-200 shadow-md hover:bg-red-700"
          onClick={() => (window.location.href = "tel:911")}
        >
          Call Police
        </motion.button>

        <AnimatePresence>
          {ambulance && nearestHospital && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
            >
              <h2 className="font-bold text-xl text-gray-900 mb-4">Ambulance Details</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong className="font-semibold">Hospital:</strong> {nearestHospital.name}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold">Driver:</strong> {ambulance.driver_name || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong className="font-semibold">Contact:</strong> {ambulance.driver_contact || "N/A"}
                </p>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`tel:${ambulance.driver_contact}`}
                  className="inline-block py-2 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition duration-200 shadow-sm"
                >
                  Call Ambulance
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {userRequests && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Requests</h2>
            <p className="text-lg font-semibold text-gray-700 mb-6">Your Credits: {userCredits}</p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Requests</h3>
              {userRequests.active.length === 0 ? (
                <p className="text-gray-600">No active requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl shadow-lg">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-left">
                        <th className="p-4 font-semibold">Hospital</th>
                        <th className="p-4 font-semibold">Ambulance</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Requested At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRequests.active.map((r) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200"
                        >
                          <td className="p-4 text-gray-700">{r.hospital?.name}</td>
                          <td className="p-4 text-gray-700">{r.ambulance?.driver_name || "N/A"}</td>
                          <td className="p-4">{getStatusBadge(r.status)}</td>
                          <td className="p-4 text-gray-700">{new Date(r.created_at).toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Completed Requests</h3>
              {userRequests.completed.length === 0 ? (
                <p className="text-gray-600">No completed requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl shadow-lg">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-left">
                        <th className="p-4 font-semibold">Hospital</th>
                        <th className="p-4 font-semibold">Ambulance</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Requested At</th>
                        <th className="p-4 font-semibold">Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRequests.completed.map((r) => (
                        <motion.tr
                          key={r._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200"
                        >
                          <td className="p-4 text-gray-700">{r.hospital?.name}</td>
                          <td className="p-4 text-gray-700">{r.ambulance?.driver_name || "N/A"}</td>
                          <td className="p-4">{getStatusBadge(r.status)}</td>
                          <td className="p-4 text-gray-700">{new Date(r.created_at).toLocaleString()}</td>
                          <td className="p-4 text-gray-700">
                            {r.completed_at ? new Date(r.completed_at).toLocaleString() : "-"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Leaderboard</h2>
          <p className="text-gray-600 mb-4">Top reporters encouraged to report accidents for credits!</p>
          <div className="space-y-4">
            {leaderboard.map((u, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center bg-white p-4 rounded-2xl shadow-md"
              >
                <img
                  src={u.profile}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-600">{u.credits} credits</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Critical Action</h2>
              <p className="text-gray-600 mb-6">
                I hereby send this request as a verified request. If this is fake, I am ready to take legal action.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                  onClick={() => {
                    setShowConfirmation(false);
                    handleSendRequest();
                  }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}