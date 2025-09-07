// app/hospital/ambulance/page.js (or rename to /hospital/page.js if appropriate)
"use client";
import React, { useEffect, useState } from "react";
import AmbulanceLogin from "./AmbulanceLogin"; // Assuming this is actually HospitalLogin; rename if needed
import HospitalDashboard from "./AmbulanceDashboard"; // Adjusted import to match file name/export

export default function HospitalPage() { // Renamed for clarity
  const [hospital, setHospital] = useState(null); // Renamed from ambulance

  useEffect(() => {
    const saved = localStorage.getItem("hospitalAuth"); // Renamed key
    if (saved) setHospital(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hospitalAuth");
    setHospital(null);
  };

  if (!hospital) return <AmbulanceLogin onLogin={setHospital} />; // Update AmbulanceLogin to handle hospital creds if needed

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-xl font-bold">Hospital Dashboard</h1>
        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <HospitalDashboard hospitalId={hospital.id || hospital.hospital_id} /> {/* Use appropriate ID field */}
    </div>
  );
}