"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../../components/ui/input";
import { 
  Plus, 
  Ambulance, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench,
  Navigation,
  Activity,
  Shield,
  Edit3,
  Trash2,
  MoreVertical
} from "lucide-react";

export default function AddAmbulance({ hospitalId }) {
  const createAmbulance = useMutation(api.Ambulance.createAmbulance);
  const ambulances = useQuery(api.Ambulance.getAmbulancesByHospital, { hospital_id: hospitalId }) || [];

  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddAmbulance = async () => {
    if (!driverName || !driverContact) {
      toast.error("Please fill all required fields!");
      return;
    }

    // Basic phone validation
    if (!/^\d{10,15}$/.test(driverContact.replace(/\s+/g, ''))) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    setLoading(true);
    try {
      await createAmbulance({
        hospital_id: hospitalId,
        driver_name: driverName.trim(),
        driver_contact: driverContact.trim(),
        status,
        location_lat: 0,
        location_lng: 0,
      });
      toast.success("Ambulance added successfully!");
      setDriverName("");
      setDriverContact("");
      setStatus("Available");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding ambulance:", err);
      toast.error("Failed to add ambulance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Available":
      case "Free":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-800"
        };
      case "Busy":
      case "On Duty":
        return {
          icon: Navigation,
          color: "text-blue-600", 
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-800"
        };
      case "Maintenance":
        return {
          icon: Wrench,
          color: "text-orange-600",
          bg: "bg-orange-50", 
          border: "border-orange-200",
          badge: "bg-orange-100 text-orange-800"
        };
      case "Off Duty":
        return {
          icon: AlertCircle,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200", 
          badge: "bg-gray-100 text-gray-800"
        };
      default:
        return {
          icon: Activity,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-800"
        };
    }
  };

  const AmbulanceCard = ({ ambulance }) => {
    const config = getStatusConfig(ambulance.status);
    const StatusIcon = config.icon;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={`bg-white rounded-2xl p-6 shadow-sm border ${config.border} hover:shadow-md transition-all duration-300`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${config.bg}`}>
            <Ambulance className={`w-6 h-6 ${config.color}`} />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{ambulance.driver_name}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.badge}`}>
                {ambulance.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">Ambulance #{ambulance._id.toString().slice(-6).toUpperCase()}</p>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">{ambulance.driver_contact}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <StatusIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${config.color}`} />
            <span>
              {ambulance.status === "Available" || ambulance.status === "Free" ? "Ready for dispatch" :
               ambulance.status === "Busy" ? "Currently responding" :
               ambulance.status === "Maintenance" ? "Under maintenance" : "Off duty"}
            </span>
          </div>

          {ambulance.location_lat !== 0 && ambulance.location_lng !== 0 && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Lat: {ambulance.location_lat?.toFixed(4)}, Lng: {ambulance.location_lng?.toFixed(4)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button className="flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Fleet Overview</h2>
          <p className="text-sm text-gray-600">{ambulances.length} ambulance{ambulances.length !== 1 ? 's' : ''} registered</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Ambulance
        </motion.button>
      </div>

      {/* Add Ambulance Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  Register New Ambulance
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Add a new ambulance and driver to your fleet</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Driver Name *
                    </Label>
                    <Input
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number *
                    </Label>
                    <Input
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      placeholder="Enter phone number"
                      className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Initial Status
                    </Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      onClick={handleAddAmbulance}
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {loading ? "Adding..." : "Add Ambulance"}
                    </Button>
                  </motion.div>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="px-6 h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fleet Status Summary */}
      {ambulances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Available", count: ambulances.filter(a => a.status === "Available" || a.status === "Free").length, color: "text-green-600", bg: "bg-green-50" },
            { label: "On Duty", count: ambulances.filter(a => a.status === "Busy").length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Maintenance", count: ambulances.filter(a => a.status === "Maintenance").length, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Off Duty", count: ambulances.filter(a => a.status === "Off Duty").length, color: "text-gray-600", bg: "bg-gray-50" }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${stat.bg} rounded-xl p-4 border border-opacity-20`}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ambulances Grid */}
      {ambulances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl border border-gray-200"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ambulance className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ambulances Yet</h3>
          <p className="text-gray-600 mb-4">Start building your fleet by adding your first ambulance.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Ambulance
          </Button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {ambulances.map((ambulance) => (
              <AmbulanceCard key={ambulance._id.toString()} ambulance={ambulance} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}