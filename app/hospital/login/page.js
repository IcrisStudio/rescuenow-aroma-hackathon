"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";

export default function HospitalLogin() {
  const [selectedHospital, setSelectedHospital] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const hospitals = useQuery(api.Hospital.listHospitals) || [];
  const loginMutation = useMutation(api.Hospital.loginHospital);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHospital) {
      toast.error("Please select your hospital");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const result = await loginMutation({
        name: selectedHospital,
        password,
      });
      toast.success(`Welcome, ${result.name}!`);
      localStorage.setItem("hospitalAdminSessionToken", result._id);
      router.push(`/hospital/admin/${result.hospitalId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-8 font-inter">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-14 border border-gray-100"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">🚑</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Ambulance Admin</h1>
          <p className="text-gray-600 mt-2 text-lg">Login to access the dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full px-5 py-4 text-lg rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition cursor-pointer"
          >
            <option value="">Select your hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital.name}>
                {hospital.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 text-lg rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition cursor-text"
          />

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-semibold rounded-2xl text-white bg-red-500 hover:bg-red-600 transition shadow-md cursor-pointer"
          >
            {loading ? "Logging in..." : "Sign In"}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-gray-500 text-sm">
            Secured with <span className="font-semibold">SSL Encryption</span>
          </p>
          <p className="text-gray-500 text-sm">
            Need help?{" "}
            <span className="font-semibold text-gray-900 cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </motion.div>

      <Toaster position="top-right" />
    </div>
  );
}
