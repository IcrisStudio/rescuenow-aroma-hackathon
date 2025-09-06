"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function EmergencyMap({ location, setLocation }) {
  const [markerPosition, setMarkerPosition] = useState(location || { lat: 27.6730, lng: 84.4300 });

  const MapClick = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        setLocation(e.latlng);
      },
    });
    return null;
  };

  return (
    <div className="w-full h-96 rounded-md overflow-hidden border border-black/20">
      <MapContainer
        center={markerPosition}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={markerPosition}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              setMarkerPosition(latlng);
              setLocation(latlng);
            },
          }}
        />
        <MapClick />
      </MapContainer>
    </div>
  );
}
