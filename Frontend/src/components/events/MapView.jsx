import { useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Category color palette (consistent with category badges)
const CATEGORY_COLORS = {
  'Technology':       '#3b82f6',
  'Sports':           '#ef4444',
  'Arts':             '#8b5cf6',
  'Music':            '#ec4899',
  'Food & Drink':     '#f59e0b',
  'Education':        '#10b981',
  'Health & Wellness':'#14b8a6',
  'Community':        '#6366f1',
};

const getCategoryColor = (category) => CATEGORY_COLORS[category] || '#64748b';

const createCustomIcon = (category) => {
  const color = getCategoryColor(category);
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 1.5rem; height: 1.5rem;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      transition: transform 0.15s ease;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

// Re-center the map when the user's location changes
const LocationCentering = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapView = memo(({ events = [], userLocation }) => {
  const defaultCenter = [39.8283, -98.5795]; // geographic center of the US
  const center = userLocation || defaultCenter;
  const zoom = userLocation ? 12 : 4;

  return (
    <div className="h-full w-full bg-slate-100 rounded-xl overflow-hidden ring-1 ring-slate-200 shadow-sm z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div style="
                background-color: #3b82f6;
                width: 1rem; height: 1rem;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 12px rgba(59,130,246,0.8);
              "></div>`,
              iconSize: [16, 16],
            })}
          >
            <Popup><div className="text-sm font-medium">You are here</div></Popup>
          </Marker>
        )}

        {userLocation && <LocationCentering center={userLocation} />}

        {/* Clustered event markers */}
        <MarkerClusterGroup chunkedLoading>
          {events.map((event) => {
            if (!event.location?.lat || !event.location?.lng) return null;
            return (
              <Marker
                key={event._id}
                position={[event.location.lat, event.location.lng]}
                icon={createCustomIcon(event.category)}
              >
                <Popup className="event-popup">
                  <div className="font-sans min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight mb-1">{event.title}</h3>
                    <p className="text-xs text-slate-500 mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      👥 {event.attendeeCount || 0} attending
                    </p>
                    <Link
                      to={`/events/${event._id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;

