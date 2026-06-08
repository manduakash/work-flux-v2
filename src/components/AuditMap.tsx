"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// CSS must be imported here
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Next.js
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function FaceAuditMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
    return (
        <MapContainer 
            center={[lat, lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            className="z-0"
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]} icon={markerIcon}>
                <Popup>
                    <div className="font-black text-[10px] uppercase">{label}</div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}