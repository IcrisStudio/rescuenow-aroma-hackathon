"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet"; // Static import: Works in "use client" components without SSR issues
import "leaflet/dist/leaflet.css";

export default function AmbulanceMap({ clientLat, clientLng, ambulanceLat, ambulanceLng, mapId }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure client-side

    if (!mapRef.current) {
      mapRef.current = L.map(mapId, {
        center: [clientLat || 27.7172, clientLng || 85.3240],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const markers = [];

    if (clientLat && clientLng) {
      const clientMarker = L.marker([clientLat, clientLng], {
        title: "Client Location",
      }).addTo(map);
      clientMarker.bindPopup("Client Location");
      markers.push(clientMarker);
    }

    if (ambulanceLat && ambulanceLng) {
      const ambulanceMarker = L.marker([ambulanceLat, ambulanceLng], {
        title: "Ambulance Location",
        icon: L.icon({
          iconUrl: "/ambulance-icon.png", // Ensure this file exists in /public
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
      }).addTo(map);
      ambulanceMarker.bindPopup("Ambulance Location");
      markers.push(ambulanceMarker);
    }

    // Draw polyline (direction)
    if (clientLat && clientLng && ambulanceLat && ambulanceLng) {
      const line = L.polyline(
        [
          [ambulanceLat, ambulanceLng],
          [clientLat, clientLng],
        ],
        { color: "blue" }
      ).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [50, 50] });
    } else if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove(); // Cleanup on unmount
        mapRef.current = null;
      }
    };
  }, [clientLat, clientLng, ambulanceLat, ambulanceLng, mapId]);

  return <div id={mapId} style={{ height: "400px", width: "100%" }} />;
}