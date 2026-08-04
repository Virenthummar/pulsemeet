import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from '../../types';
import { useApp } from '../../context/AppContext';
import { MapPin, Calendar, Users, Navigation } from 'lucide-react';

interface MapViewProps {
  activities: Activity[];
  onSelectActivity: (id: string) => void;
}

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically re-center map when user location changes
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ activities, onSelectActivity }) => {
  const { userLocation, filters, setFilters } = useApp();

  // Create custom marker icons based on category
  const createCategoryIcon = (category: string) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
      
      {/* Floating Radius Control Bar */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center space-x-3 text-xs text-slate-200">
        <span className="font-semibold text-slate-300 flex items-center space-x-1">
          <Navigation className="h-3.5 w-3.5 text-indigo-400" />
          <span>Radius:</span>
        </span>
        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
          {[5, 15, 30, 50].map((r) => (
            <button
              key={r}
              onClick={() => setFilters(prev => ({ ...prev, maxDistanceKm: r }))}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filters.maxDistanceKm === r 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}km
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-[11px]">
          ({activities.length} nearby)
        </span>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

        {/* Dark Mode Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Distance Radius Circle */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={filters.maxDistanceKm * 1000}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 8'
          }}
        />

        {/* User Current Location Marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-pin',
            html: `
              <div style="
                background: #10b981;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.25);
              "></div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })}
        >
          <Popup className="custom-popup">
            <div className="p-1 text-slate-900 text-xs font-bold">
              📍 You are here ({userLocation.label})
            </div>
          </Popup>
        </Marker>

        {/* Activity Pins */}
        {activities.map((act) => (
          <Marker
            key={act.id}
            position={[act.lat, act.lng]}
            icon={createCategoryIcon(act.category)}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[220px]">
                <img 
                  src={act.coverImage} 
                  alt={act.title} 
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <span className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                  {act.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 flex items-center space-x-1">
                  <Calendar className="h-3 w-3 inline text-indigo-600" />
                  <span>{new Date(act.datetime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(act.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    👥 {act.participants.length}{act.maxParticipants ? `/${act.maxParticipants}` : ''} joined
                  </span>
                  <button
                    onClick={() => onSelectActivity(act.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
