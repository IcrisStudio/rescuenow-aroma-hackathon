"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/@/components/ui/card";
import { Input } from "@/@/components/ui/input";
import { Label } from "@/@/components/ui/label";
import { Button } from "@/@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function RegisterHospital() {
  const registerHospital = useMutation(api.hospital.registerHospital);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [totalAmbulances, setTotalAmbulances] = useState(1);

  const [markerPosition, setMarkerPosition] = useState({ lat: 27.6730, lng: 84.4300 });
  const [loading, setLoading] = useState(false);

  function DraggableMarker() {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
      },
    });

    return (
      <Marker
        position={markerPosition}
        draggable
        eventHandlers={{
          dragend: (e) => setMarkerPosition(e.target.getLatLng()),
        }}
      />
    );
  }

  function LocationSearch({ setMarkerPosition }) {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        showMarker: false,
        autoClose: true,
        retainZoomLevel: false,
      });

      map.addControl(searchControl);

      const handleSearch = (e) => {
        const { location } = e;
        setMarkerPosition({ lat: location.y, lng: location.x });
        map.flyTo([location.y, location.x], 15);
      };

      map.on("geosearch/showlocation", handleSearch);

      return () => {
        map.removeControl(searchControl);
        map.off("geosearch/showlocation", handleSearch);
      };
    }, [map, setMarkerPosition]);

    return null;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !phone || !password || !totalAmbulances) {
      toast.error("Please fill all fields correctly!");
      setLoading(false);
      return;
    }

    try {
      const hospitalId = await registerHospital({
        name,
        password,
        location_lat: markerPosition.lat,
        location_lng: markerPosition.lng,
        contact_number: phone,
        total_ambulances: totalAmbulances,
      });
      toast.success("Hospital Registered Successfully!");

      localStorage.setItem("hospitalSessionToken", hospitalId);

      setName("");
      setPhone("");
      setPassword("");
      setTotalAmbulances(1);
      setMarkerPosition({ lat: 27.6730, lng: 84.4300 });
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0e0e0e] dark:to-[#1c1c1e] px-4 font-[-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
      >
        <Card className="col-span-1 shadow-lg rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Register Your Hospital
            </CardTitle>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
              Provide details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <AnimatePresence>
                <motion.div
                  key="name"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                    Hospital Name
                  </Label>
                  <Input
                    id="name"
                    className="h-12 rounded-2xl bg-gray-100/50 dark:bg-[#2c2c2e]/50 border border-gray-300/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all cursor-text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="h-12 rounded-2xl bg-gray-100/50 dark:bg-[#2c2c2e]/50 border border-gray-300/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all cursor-text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-12 rounded-2xl bg-gray-100/50 dark:bg-[#2c2c2e]/50 border border-gray-300/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all cursor-text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>
                <motion.div
                  key="totalAmbulances"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="totalAmbulances" className="text-gray-700 dark:text-gray-300 font-medium">
                    Total Ambulances
                  </Label>
                  <Input
                    id="totalAmbulances"
                    type="number"
                    className="h-12 rounded-2xl bg-gray-100/50 dark:bg-[#2c2c2e]/50 border border-gray-300/50 dark:border-gray-600/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all cursor-text"
                    value={totalAmbulances}
                    min={1}
                    onChange={(e) => setTotalAmbulances(Number(e.target.value))}
                    required
                  />
                </motion.div>
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white font-medium hover:opacity-90 transition-all cursor-pointer shadow-md"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-lg rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Hospital Location
            </CardTitle>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
              Pin your location on the map
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative h-96 w-full rounded-b-3xl overflow-hidden"
            >
              <MapContainer
                center={markerPosition}
                zoom={15}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <DraggableMarker />
                <LocationSearch setMarkerPosition={setMarkerPosition} />
              </MapContainer>
            </motion.div>
            <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-4 px-6 pb-6">
              Latitude: {markerPosition.lat.toFixed(6)}, Longitude: {markerPosition.lng.toFixed(6)}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}