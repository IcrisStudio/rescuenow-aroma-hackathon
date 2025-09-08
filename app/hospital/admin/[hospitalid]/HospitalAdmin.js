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
  X,
  CheckCircle,
  AlertTriangle,
  Users,
  Star,
  Plus, 
  Phone, 
  Wrench,
  Navigation,
  Activity,
  Shield,
  Edit3,
  Trash2,
  MoreVertical,
  Siren,
  ArrowRight,
  Globe,
  Radio,
  Calendar,
  TrendingUp,
  Building2,
  HeartPulse
} from "lucide-react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from "chart.js";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

// Dynamically import HospitalMap
const HospitalMap = dynamic(() => import("./HospitalMap.js"), { ssr: false });

const HospitalAdmin = () => {
  const params = useParams();
  const hospitalId = params.hospitalid;

  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddAmbulance, setShowAddAmbulance] = useState(false);

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

  // Real-time statistics
  const freeAmbulances = ambulances?.filter(amb => amb.status === "Free").length || 0;
  const busyAmbulances = ambulances?.filter(amb => amb.status === "Busy").length || 0;
  const maintenanceAmbulances = ambulances?.filter(amb => amb.status === "Maintenance").length || 0;
  const totalAmbulances = ambulances?.length || 0;
  
  const pendingRequests = requests?.filter(req => req.status === "Pending").length || 0;
  const acceptedRequests = requests?.filter(req => req.status === "Accepted").length || 0;
  const completedRequests = requests?.filter(req => req.status === "Completed").length || 0;
  const rejectedRequests = requests?.filter(req => req.status === "Rejected").length || 0;
  const totalRequests = requests?.length || 0;

  // Request status distribution data
  const statusDistribution = {
    labels: ["Completed", "Accepted", "Pending", "Rejected"],
    datasets: [{
      data: [completedRequests, acceptedRequests, pendingRequests, rejectedRequests],
      backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
      borderWidth: 0,
      cutout: "70%"
    }]
  };

  // Weekly trends (using actual data from requests)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const weeklyData = {
    labels: last7Days.map(date => date.toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      label: "Requests",
      data: last7Days.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        return requests?.filter(req => {
          const reqDate = new Date(req.created_at);
          return reqDate >= dayStart && reqDate <= dayEnd;
        }).length || 0;
      }),
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#3B82F6"
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { 
          font: { family: "SF Pro Display, -apple-system, system-ui, sans-serif", size: 12 }
        }
      },
      x: { 
        grid: { display: false },
        ticks: { 
          font: { family: "SF Pro Display, -apple-system, system-ui, sans-serif", size: 12 }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    cutout: "70%"
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600 font-medium">Verifying access...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3"
        >
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="text-gray-700 font-medium">Access denied: Admin credentials required.</span>
        </motion.div>
      </div>
    );
  }

  if (!hospitalData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3"
        >
          <AlertCircle className="w-6 h-6 text-blue-500" />
          <span className="text-gray-700 font-medium">Loading hospital information...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 font-['SF_Pro_Display',-apple-system,system-ui,sans-serif]">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-b border-gray-100 px-6 py-5"
        >
          <div className="max-w-9xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{hospitalData.name}</h1>
                <p className="text-sm text-gray-500">Emergency Operations Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-9xl mx-auto p-6 space-y-8">
          {/* Key Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Ambulances</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-1">{freeAmbulances}</p>
                    <p className="text-xs text-green-600 mt-2">Ready for dispatch</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Missions</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-1">{busyAmbulances}</p>
                    <p className="text-xs text-blue-600 mt-2">Currently responding</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-1">{pendingRequests}</p>
                    <p className="text-xs text-amber-600 mt-2">Awaiting response</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Fleet</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-1">{totalAmbulances}</p>
                    <p className="text-xs text-gray-600 mt-2">Ambulances managed</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Ambulance className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics & Real-time Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Trends */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Weekly Activity</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Emergency requests over the past 7 days</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <Line data={weeklyData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Request Status Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-gray-50">
                  <CardTitle className="text-lg font-semibold text-gray-900">Request Status</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Distribution overview</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center relative">
                    <Doughnut data={statusDistribution} options={doughnutOptions} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    {[
                      { label: "Completed", count: completedRequests, color: "bg-green-500" },
                      { label: "Active", count: acceptedRequests, color: "bg-blue-500" },
                      { label: "Pending", count: pendingRequests, color: "bg-amber-500" },
                      { label: "Rejected", count: rejectedRequests, color: "bg-red-500" }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                          <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Emergency Requests & Fleet Management */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Pending Emergency Requests */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Siren className="w-5 h-5 text-red-500" />
                        Emergency Queue
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{pendingRequests} requests awaiting response</p>
                    </div>
                    {pendingRequests > 0 && (
                      <Badge className="bg-red-50 text-red-700 border border-red-200">
                        {pendingRequests} Urgent
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {pendingRequests === 0 ? (
                      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <Shield className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="font-medium">All Clear</p>
                        <p className="text-sm">No pending emergency requests</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {requests?.filter(req => req.status === "Pending").map((req) => (
                          <motion.div
                            key={req._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            className="p-6 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Request #{req._id.slice(-8)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {Math.floor((Date.now() - req.created_at) / 60000)}m ago
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    Location: {req.user_lat.toFixed(4)}, {req.user_lng.toFixed(4)}
                                  </p>
                                  {req.case_details && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <HeartPulse className="w-4 h-4 text-blue-500" />
                                      {req.case_details}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-200">
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fleet Management */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Fleet Management</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{totalAmbulances} ambulances in your fleet</p>
                    </div>
                    <Button 
                      onClick={() => setShowAddAmbulance(!showAddAmbulance)}
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Unit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Fleet Status Overview */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{freeAmbulances}</p>
                      <p className="text-sm text-green-600">Available</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{busyAmbulances}</p>
                      <p className="text-sm text-blue-600">On Duty</p>
                    </div>
                  </div>

                  {/* Add Ambulance Form */}
                  <AnimatePresence>
                    {showAddAmbulance && (
                      <AddAmbulanceForm 
                        hospitalId={hospitalId} 
                        onClose={() => setShowAddAmbulance(false)} 
                      />
                    )}
                  </AnimatePresence>

                  {/* Ambulance List */}
                  <ScrollArea className="h-64">
                    {totalAmbulances === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Ambulance className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="font-medium">No ambulances registered</p>
                        <p className="text-sm">Add your first ambulance to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ambulances?.map((ambulance) => (
                          <motion.div
                            key={ambulance._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                            className="p-4 rounded-lg border border-gray-100 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  ambulance.status === "Free" ? "bg-green-500" :
                                  ambulance.status === "Busy" ? "bg-blue-500" : "bg-orange-500"
                                }`} />
                                <div>
                                  <p className="font-medium text-gray-900">{ambulance.driver_name}</p>
                                  <p className="text-sm text-gray-500">{ambulance.driver_contact}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${
                                  ambulance.status === "Free" ? "bg-green-50 text-green-700 border-green-200" :
                                  ambulance.status === "Busy" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                                  "bg-orange-50 text-orange-700 border-orange-200"
                                }`}>
                                  {ambulance.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Phone className="w-4 h-4 mr-2" />
                                      Contact
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Navigation className="w-4 h-4 mr-2" />
                                      Track
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Live Map */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Live Operations Map
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Real-time tracking of ambulances and emergency locations</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96">
                  <HospitalMap
                    markerPosition={{ lat: hospitalData.location_lat, lng: hospitalData.location_lng }}
                    isReadOnly={true}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const AddAmbulanceForm = ({ hospitalId, onClose }) => {
  const createAmbulance = useMutation(api.Ambulance.createAmbulance);
  
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [status, setStatus] = useState("Free");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!driverName.trim() || !driverContact.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^\d{10,15}$/.test(driverContact.replace(/\s+/g, ''))) {
      toast.error("Please enter a valid phone number");
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
        created_at: Date.now(),
      });
      toast.success("Ambulance added successfully!");
      setDriverName("");
      setDriverContact("");
      setStatus("Free");
      onClose();
    } catch (err) {
      console.error("Error adding ambulance:", err);
      toast.error("Failed to add ambulance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Ambulance</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Driver Name</Label>
          <Input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter driver's full name"
            className="border-gray-200"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Contact Number</Label>
          <Input
            value={driverContact}
            onChange={(e) => setDriverContact(e.target.value)}
            placeholder="Enter phone number"
            className="border-gray-200"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium text-gray-700">Initial Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <option value="Free">Free</option>
            <option value="Busy">Busy</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Adding..." : "Add Ambulance"}
        </Button>
        <Button variant="outline" onClick={onClose} className="border-gray-200">
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

export default HospitalAdmin;