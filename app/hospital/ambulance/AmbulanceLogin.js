// components/AmbulanceLogin.js
"use client";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AmbulanceLogin({ onLogin }) {
  const hospitals = useQuery(api.Hospital.listHospitals);
  const verifyDriver = useMutation(api.Ambulance.verifyAmbulanceDriver);

  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [hospitalId, setHospitalId] = useState("");

  const handleLogin = async () => {
    if (!driverName || !driverContact || !hospitalId) return alert("All fields required!");

    const result = await verifyDriver({
      driver_name: driverName.toLowerCase(),
      driver_contact: driverContact.toLowerCase(),
      hospital_id: hospitalId
    });

    if (result?.success) {
      localStorage.setItem("ambulanceAuth", JSON.stringify(result.driver));
      onLogin(result.driver);
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Ambulance Login</h2>
      <select className="w-full mb-2 p-2 border rounded" value={hospitalId} onChange={e => setHospitalId(e.target.value)}>
        <option value="">Select Hospital</option>
        {hospitals?.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
      </select>
      <input className="w-full mb-2 p-2 border rounded" placeholder="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} />
      <input className="w-full mb-2 p-2 border rounded" placeholder="Driver Contact" value={driverContact} onChange={e => setDriverContact(e.target.value)} />
      <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={handleLogin}>Login</button>
    </div>
  );
}
