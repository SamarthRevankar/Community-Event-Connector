import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Reusing icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const ClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const LocationPicker = ({ initialLocation, onLocationChange }) => {
  const [position, setPosition] = useState(
    initialLocation && initialLocation.lat && initialLocation.lng 
      ? [parseFloat(initialLocation.lat), parseFloat(initialLocation.lng)]
      : null
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
  const mapRef = useRef(null);

  const defaultCenter = [39.8283, -98.5795]; // Center of US
  const center = position || defaultCenter;
  const zoom = position ? 13 : 4;

  const handleLocationSelect = async (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    setIsLoading(true);
    
    try {
      // Reverse geocoding via Nominatim
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      const name = data.display_name || 'Selected Location';
      
      onLocationChange({
        name,
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6)
      });
    } catch (error) {
      console.error('Reverse geocoding failed', error);
      onLocationChange({
        name: 'Selected Location',
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          handleLocationSelect(latlng);
          if (mapRef.current) {
            mapRef.current.setView([latlng.lat, latlng.lng], 14);
          }
        },
        (err) => {
          console.error(err);
          setIsLoading(false);
          alert('Could not get your location. Please ensure location permissions are granted.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background-color: #ef4444; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700">
          Pick Location from Map
        </label>
        <button
          type="button"
          onClick={getUserLocation}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          disabled={isLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </button>
      </div>
      
      <div className="h-64 w-full bg-slate-100 rounded-lg overflow-hidden ring-1 ring-slate-200 shadow-inner relative z-0">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} icon={markerIcon} />}
        </MapContainer>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 italic">Click anywhere on the map to set the venue location.</p>
    </div>
  );
};

export default LocationPicker;
