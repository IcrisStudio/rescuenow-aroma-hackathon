import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Siren, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "../../../convex/_generated/api";

// Dynamically import AmbulanceMap
const AmbulanceMap = dynamic(() => import("./AmbulanceMap"), { ssr: false });

export default function HospitalDashboard({ hospitalId }) {
  const requests = useQuery(api.Requests.getHospitalRequests, { hospital_id: hospitalId });
  const updateStatus = useMutation(api.Requests.updateRequestStatus);
  const [activeTab, setActiveTab] = useState("Pending");

  const handleUpdate = async (requestId, status) => {
    try {
      await updateStatus({ requestId, status });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Filter requests based on active tab
  const filteredRequests = requests?.filter((r) => r.status === activeTab) || [];

  if (requests === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-lg"
        >
          No requests found.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Siren className="w-8 h-8 text-blue-600" />
          Hospital Requests Dashboard
        </h2>
        <p className="text-gray-500 mt-1">Manage and track ambulance requests in real-time</p>
      </motion.header>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          {["Pending", "Accepted", "Completed", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <AnimatePresence>
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 py-10"
          >
            No {activeTab.toLowerCase()} requests found.
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((r, index) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-500" />
                    Request ID: {r._id.slice(0, 8)}...
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : r.status === "Accepted"
                        ? "bg-blue-100 text-blue-800"
                        : r.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Hospital:</strong> {r.hospital_name || r.hospital_id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Driver:</strong> {r.ambulance_id?.driver_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Rides:</strong> {r.ambulance_id?.total_rides || 0}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Case Details:</strong> {r.case_details || "N/A"}
                </p>

                {/* Map */}
                <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-200">
                  <AmbulanceMap
                    mapId={`map-${index}`}
                    clientLat={r.user_lat}
                    clientLng={r.user_lng}
                    ambulanceLat={r.ambulance_lat}
                    ambulanceLng={r.ambulance_lng}
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  {r.status === "Pending" && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdate(r._id, "Accepted")}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdate(r._id, "Rejected")}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    </>
                  )}
                  {r.status === "Accepted" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdate(r._id, "Completed")}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}