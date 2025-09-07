"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  MapPin, 
  Ambulance, 
  BarChart2, 
  Clock, 
  User, 
  AlertCircle,
  PlusCircle,
  X
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dynamically import HospitalMap
const HospitalMap = dynamic(() => import("./HospitalMap.js"), { ssr: false });

const HospitalAdmin = () => {
  const params = useParams();
  const hospitalId = params.hospitalid;

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({ driver_name: "", status: "Free" });

  const hospitalData = useQuery(api.Hospital.getHospitalById, { hospitalId });
  const requests = useQuery(api.Requests.getHospitalRequests, { hospital_id: hospitalId });
  const ambulances = useQuery(api.Ambulance.getAmbulancesByHospital, { hospital_id: hospitalId });
  const addAmbulance = useMutation(api.Ambulance.addAmbulance);

  useEffect(() => {
    const token = localStorage.getItem("hospitalAdminSessionToken");
    setTimeout(() => {
      if (token) setIsAdmin(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    try {
      await addAmbulance({ hospitalId, ...newAmbulance });
      setIsModalOpen(false);
      setNewAmbulance({ driver_name: "", status: "Free" });
    } catch (error) {
      console.error("Failed to add ambulance:", error);
    }
  };

  // Prepare data for status chart
  const statusCounts = requests?.reduce(
    (acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Accepted: 0, Completed: 0, Rejected: 0 }
  ) || { Pending: 0, Accepted: 0, Completed: 0, Rejected: 0 };

  const chartData = {
    labels: ["Pending", "Accepted", "Completed", "Rejected"],
    datasets: [
      {
        label: "Request Status",
        data: [
          statusCounts.Pending,
          statusCounts.Accepted,
          statusCounts.Completed,
          statusCounts.Rejected,
        ],
        backgroundColor: [
          "rgba(255, 193, 7, 0.6)",  // Yellow for Pending
          "rgba(59, 130, 246, 0.6)", // Blue for Accepted
          "rgba(34, 197, 94, 0.6)",  // Green for Completed
          "rgba(239, 68, 68, 0.6)",  // Red for Rejected
        ],
        borderColor: [
          "rgba(255, 193, 7, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Request Status Overview", font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-600 text-lg">Checking admin credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-lg flex items-center gap-2"
        >
          <AlertCircle className="w-6 h-6 text-red-500" />
          You are not logged in as admin.
        </motion.div>
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-lg flex items-center gap-2"
        >
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          Loading hospital details...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Ambulance className="w-8 h-8 text-blue-600" />
          {hospitalData.name} Admin Panel
        </h1>
        <p className="text-gray-500 mt-1">Manage ambulance services and track requests in real-time</p>
      </motion.header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-min">
        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 lg:col-span-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Hospital Location
          </h2>
          <div className="h-80 w-full rounded-md overflow-hidden border border-gray-200">
            <HospitalMap
              markerPosition={{
                lat: hospitalData.location_lat,
                lng: hospitalData.location_lng,
              }}
              isReadOnly={true}
            />
          </div>
        </motion.div>

        {/* Request Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 lg:col-span-4"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Request Status Overview
          </h2>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Ambulances List Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 lg:col-span-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-blue-500" />
              Ambulances
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Ambulance
            </motion.button>
          </div>
          <AnimatePresence>
            {ambulances && ambulances.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {ambulances.map((amb) => (
                  <motion.div
                    key={amb._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Ambulance className="w-4 h-4 text-gray-500" />
                        {amb.driver_name} (ID: {amb._id.slice(0, 8)}...)
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          amb.status === "Free"
                            ? "bg-green-100 text-green-800"
                            : amb.status === "Busy"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {amb.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Total Rides:</strong> {amb.total_rides || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Last Updated:</strong>{" "}
                      {new Date(amb.updated_at).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No ambulances found.</p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Requests List Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 lg:col-span-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Requests
          </h2>
          <AnimatePresence>
            {requests && requests.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {requests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Request ID: {req._id.slice(0, 8)}...
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          req.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : req.status === "Accepted"
                            ? "bg-blue-100 text-blue-800"
                            : req.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Ambulance:</strong>{" "}
                      {req.ambulance_id?.driver_name || "Unassigned"} (ID: {req.ambulance_id?._id?.slice(0, 8) || "N/A"})
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>User Location:</strong> ({req.user_lat}, {req.user_lng})
                    </p>
                    {req.ambulance_lat && req.ambulance_lng && (
                      <p className="text-sm text-gray-600">
                        <strong>Ambulance Location:</strong> ({req.ambulance_lat}, {req.ambulance_lng})
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Created At:</strong>{" "}
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No requests found.</p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add Ambulance Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Ambulance</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddAmbulance}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={newAmbulance.driver_name}
                    onChange={(e) =>
                      setNewAmbulance({ ...newAmbulance, driver_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newAmbulance.status}
                    onChange={(e) =>
                      setNewAmbulance({ ...newAmbulance, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Free">Free</option>
                    <option value="Busy">Busy</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    Add Ambulance
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalAdmin;