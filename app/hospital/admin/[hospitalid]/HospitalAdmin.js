"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { toast } from "sonner";
import { 
  MapPin, 
  Ambulance, 
  BarChart3, 
  Clock, 
  User, 
  AlertCircle,
  PlusCircle,
  Activity,
  TrendingUp,
  Shield,
  Phone,
  Navigation,
  Users,
  Calendar,
  Bell,
  Settings,
  Heart,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Building2,
  Plus,
  Wrench,
  Edit3,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  PointElement,
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement,
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend
);

// Dynamically import HospitalMap
const HospitalMap = dynamic(() => import("./HospitalMap.js"), { ssr: false });

// Premium Ambulance Management Component
const AmbulanceManager = ({ hospitalId }) => {
  const createAmbulance = useMutation(api.Ambulance.createAmbulance);
  const ambulances = useQuery(api.Ambulance.getAmbulancesByHospital, { hospital_id: hospitalId }) || [];

  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [status, setStatus] = useState("Free");
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
      setStatus("Free");
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
      case "Free":
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
                      <option value="Available">Free</option>
                      <option value="Busy">Busy</option>
                      <option value="Maintenance">Maintenance</option>
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
            { label: "Free", count: ambulances.filter(a => a.status === "Free" || a.status === "Free").length, color: "text-green-600", bg: "bg-green-50" },
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
};

// Main Hospital Admin Dashboard Component
const HospitalAdmin = () => {
  const params = useParams();
  const hospitalId = params.hospitalid;

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Convex queries - all your original backend calls
  const hospitalData = useQuery(api.Hospital.getHospitalById, { hospitalId });
  const requests = useQuery(api.Requests.getHospitalRequests, { hospital_id: hospitalId });
  const ambulances = useQuery(api.Ambulance.getAmbulancesByHospital, { hospital_id: hospitalId });

  useEffect(() => {
    const token = localStorage.getItem("hospitalAdminSessionToken");
    setTimeout(() => {
      if (token) setIsAdmin(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate metrics from real data
  const totalRequests = requests?.length || 0;
  const activeAmbulances = ambulances?.filter(amb => amb.status === 'Free' || amb.status === 'Free')?.length || 0;
  const pendingRequests = requests?.filter(req => req.status === 'Pending')?.length || 0;
  const completedToday = requests?.filter(req => 
    req.status === 'Completed' && 
    new Date(req.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  // Prepare chart data from real backend data
  const statusCounts = requests?.reduce(
    (acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Accepted: 0, Completed: 0, Rejected: 0 }
  ) || { Pending: 0, Accepted: 0, Completed: 0, Rejected: 0 };

  const doughnutData = {
    labels: ["Completed", "Pending", "Accepted", "Rejected"],
    datasets: [
      {
        data: [statusCounts.Completed, statusCounts.Pending, statusCounts.Accepted, statusCounts.Rejected],
        backgroundColor: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  };

  // Generate weekly data from requests (simplified example)
  const getWeeklyData = () => {
    if (!requests || requests.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    
    requests.forEach(req => {
      const reqDate = new Date(req.created_at);
      const daysDiff = Math.floor((today - reqDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        weekData[6 - daysDiff]++;
      }
    });
    
    return weekData;
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Requests",
        data: getWeeklyData(),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderWidth: 0,
      },
    ],
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  // Loading states
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <motion.div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 text-lg font-medium">Initializing Dashboard...</p>
      </motion.div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4"
      >
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
      </motion.div>
    </div>
  );

  if (!hospitalData) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Building2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600 text-lg font-medium">Loading Hospital Data...</p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {hospitalData.name}
                </h1>
                <p className="text-sm text-gray-600">Emergency Response Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={totalRequests}
            change={`${totalRequests > 10 ? '+12% vs last week' : 'Getting started'}`}
            icon={Activity}
            color="bg-blue-600"
            trend="up"
          />
          <StatCard
            title="Active Ambulances"
            value={activeAmbulances}
            change={`${ambulances?.length || 0} total registered`}
            icon={Ambulance}
            color="bg-green-600"
            trend="up"
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            change={pendingRequests > 0 ? 'Need attention' : 'All clear'}
            icon={Clock}
            color="bg-orange-500"
            trend={pendingRequests > 5 ? 'up' : 'down'}
          />
          <StatCard
            title="Completed Today"
            value={completedToday}
            change={`${statusCounts.Completed} total completed`}
            icon={CheckCircle2}
            color="bg-emerald-600"
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart - Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Weekly Overview</h2>
                  <p className="text-sm text-gray-600">Emergency requests trend</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="h-64">
                <Line 
                  data={lineData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { display: false } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              </div>
            </motion.div>

            {/* Recent Requests - Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-600">Latest emergency requests</p>
                </div>
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {requests?.slice(0, 5).map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        req.status === 'Completed' ? 'bg-green-100' :
                        req.status === 'Pending' ? 'bg-yellow-100' :
                        req.status === 'Accepted' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {req.status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                         req.status === 'Pending' ? <Timer className="w-4 h-4 text-yellow-600" /> :
                         req.status === 'Accepted' ? <Navigation className="w-4 h-4 text-blue-600" /> :
                         <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">#{req._id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {req.ambulance_id?.driver_name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        req.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "Accepted" ? "bg-blue-100 text-blue-800" :
                        req.status === "Completed" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {req.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(req.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!requests || requests.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No requests yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ambulance Management Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <AmbulanceManager hospitalId={hospitalId} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Distribution - Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request Status</h2>
                  <p className="text-sm text-gray-600">Distribution overview</p>
                </div>
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              {totalRequests > 0 ? (
                <>
                  <div className="h-48 flex items-center justify-center">
                    <Doughnut 
                      data={doughnutData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                      }} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Completed</span>
                      </div>
                      <p className="font-bold text-gray-900">{statusCounts.Completed}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <p className="font-bold text-gray-900">{statusCounts.Pending}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Accepted</span>
                      </div>
                      <p className="font-bold text-gray-900">{statusCounts.Accepted}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Rejected</span>
                      </div>
                      <p className="font-bold text-gray-900">{statusCounts.Rejected}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No data available</p>
                  <p className="text-xs">Charts will appear when you have requests</p>
                </div>
              )}
            </motion.div>

            {/* Hospital Location - Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Location</h2>
                  <p className="text-sm text-gray-600">Hospital coordinates</p>
                </div>
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200">
                <HospitalMap
                  markerPosition={{
                    lat: hospitalData.location_lat,
                    lng: hospitalData.location_lng,
                  }}
                  isReadOnly={true}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>Latitude:</strong> {hospitalData.location_lat}</p>
                  <p><strong>Longitude:</strong> {hospitalData.location_lng}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
                  <p className="text-sm text-gray-600">Hospital metrics</p>
                </div>
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">
                    {totalRequests > 0 ? Math.round(((statusCounts.Completed + statusCounts.Accepted) / totalRequests) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fleet Utilization</span>
                  <span className="font-semibold text-gray-900">
                    {ambulances?.length > 0 ? Math.round((ambulances.filter(a => a.status === 'Busy').length / ambulances.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold text-gray-900">~8 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {totalRequests > 0 ? Math.round((statusCounts.Completed / totalRequests) * 100) : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdmin;