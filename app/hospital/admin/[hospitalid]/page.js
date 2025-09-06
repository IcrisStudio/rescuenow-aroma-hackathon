"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HospitalAdmin from "./HospitalAdmin";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check localStorage for admin token
    const token = localStorage.getItem("hospitalAdminSessionToken");

    // Simulate async check / delay for smooth loader
    setTimeout(() => {
      if (token) {
        setIsAdmin(true);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  // Loader while checking localStorage
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
        <p className="ml-4 text-gray-700">Checking credentials...</p>
      </div>
    );
  }

  // Render components based on state
  return (
    <div className="min-h-screen bg-white p-6">
      {isAdmin ? <HospitalAdmin /> : "No adin"}
    </div>
  );
}
