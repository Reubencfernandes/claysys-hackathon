"use client";

import { motion } from "framer-motion";
import { Plus, Maximize2, ZoomIn, ZoomOut, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon in Leaflet + Next.js
const ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, {
      duration: 1.5
    });
  }, [lat, lng, map]);
  return null;
}

export function InteractiveMapView({ place }: { place: any }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to Paris if no place is selected
  const center = place?.location ? [place.location.lat, place.location.lng] : [48.8566, 2.3522];
  const position: [number, number] = [center[0], center[1]];

  if (!mounted) return (
    <div className="flex-1 bg-[#0a0a0a] flex items-center justify-center text-white/20 uppercase text-[10px] font-bold tracking-widest">
      Loading Maps...
    </div>
  );

  return (
    <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex flex-col h-full z-0">
      <MapContainer 
        center={position} 
        zoom={12} 
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapRecenter lat={position[0]} lng={position[1]} />
        <Marker position={position} icon={ICON} />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Floating Controls Overlay (Z-indexed) */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-[1000]">
        <MapControlButton icon={<Maximize2 size={18} />} />
      </div>

      <div className="absolute bottom-6 left-6 z-[1000]">
         <MapControlButton icon={<Navigation size={18} />} />
      </div>

      {/* Map Content Overlay */}
      <div className="absolute top-6 left-6 z-[1000]">
         <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 pl-4 pr-1 flex items-center gap-4">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">
              {place?.title || "Exploring Map"}
            </span>
            <div className="bg-white rounded-full p-2 text-black"><Plus size={14} /></div>
         </div>
      </div>
    </div>
  );
}

function MapControlButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="h-10 w-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all shadow-xl">
      {icon}
    </button>
  );
}
