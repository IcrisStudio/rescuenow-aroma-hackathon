import React from "react";
import { useQuery, useMutation } from "convex/react";
import dynamic from "next/dynamic";
import { api } from "../../../convex/_generated/api";

// Dynamically import AmbulanceMap
const AmbulanceMap = dynamic(() => import("./AmbulanceMap"), { ssr: false });

export default function HospitalDashboard({ hospitalId }) {
  const requests = useQuery(api.Requests.getHospitalRequests, { hospital_id: hospitalId });
  const updateStatus = useMutation(api.Requests.updateRequestStatus);

  const handleUpdate = async (requestId, status) => {
    try {
      await updateStatus({ requestId, status });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optionally show toast/error message here
    }
  };

  if (requests === undefined) return <p>Loading...</p>; // Handle undefined explicitly

  if (!requests || requests.length === 0) return <p>No requests found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Hospital Requests Dashboard</h2>

      {requests.map((r, index) => (
        <div key={r._id} className="border p-4 rounded mb-3 bg-gray-50">
          <h3 className="font-bold">Request ID: {r._id}</h3>
          {/* Assuming schema has hospital_name; if not, use hospital_id or fetch separately */}
          <p><strong>Hospital:</strong> {r.hospital_name || r.hospital_id}</p>
          <p><strong>Ambulance Driver:</strong> {r.ambulance_id?.driver_name || "N/A"}</p>
          <p><strong>Total Rides:</strong> {r.ambulance_id?.total_rides || 0}</p>
          <p><strong>Status:</strong> {r.status}</p>
          <p><strong>Case Details:</strong> {r.case_details || "N/A"}</p>

          <div className="mt-4">
            <AmbulanceMap
              mapId={`map-${index}`} // unique ID per map instance
              clientLat={r.user_lat}
              clientLng={r.user_lng}
              ambulanceLat={r.ambulance_lat}
              ambulanceLng={r.ambulance_lng}
            />
          </div>

          <div className="mt-2 space-x-2">
            {r.status === "Pending" && (
              <>
                <button 
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" 
                  onClick={() => handleUpdate(r._id, "Accepted")}
                >
                  Accept
                </button>
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" 
                  onClick={() => handleUpdate(r._id, "Rejected")}
                >
                  Reject
                </button>
              </>
            )}
            {r.status === "Accepted" && (
              <button 
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" 
                onClick={() => handleUpdate(r._id, "Completed")}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}