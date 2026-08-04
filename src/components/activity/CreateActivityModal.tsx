import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, Calendar, Clock, Image, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ActivityCategory } from '../../types';
import { useApp } from '../../context/AppContext';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationPicker: React.FC<{
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return <Marker position={position} />;
};

// Component to dynamically re-center map if user location changes
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

const SAMPLE_COVERS = [
  { name: 'Park Stroll', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&q=80&w=800' },
  { name: 'Board Games', url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800' },
  { name: 'Badminton & Sports', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800' },
  { name: 'Coffee & Chat', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800' },
  { name: 'Outdoor Hiking', url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800' },
  { name: 'Co-working Study', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800' }
];

export const CreateActivityModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createActivity, userLocation } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Walking');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState(userLocation.label || 'Your Location');
  const [exactMeetingPoint, setExactMeetingPoint] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>(6);
  const [visibility, setVisibility] = useState<'public' | 'invite_only'>('public');
  const [coverImage, setCoverImage] = useState(SAMPLE_COVERS[0].url);
  
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number}>({ 
    lat: userLocation.lat, 
    lng: userLocation.lng 
  });

  // Keep map center synced with userLocation preset if modal is opened in a new city
  useEffect(() => {
    if (isCreateModalOpen) {
      setSelectedLocation({ lat: userLocation.lat, lng: userLocation.lng });
      setAddress(userLocation.label || 'Your Location');
    }
  }, [userLocation, isCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !time) {
      alert('Please fill out all required fields!');
      return;
    }

    const datetimeStr = new Date(`${date}T${time}`).toISOString();

    createActivity({
      title,
      category,
      description,
      datetime: datetimeStr,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address,
      approxLocation: address.split(',')[0].trim(),
      exactMeetingPoint,
      maxParticipants: maxParticipants === '' ? undefined : Number(maxParticipants),
      visibility,
      requiresApproval: false,
      coverImage,
      weather: (category === 'Walking' || category === 'Outdoors' || category === 'Sports') ? {
        temp: 23,
        condition: 'Clear Sky',
        rainProbability: 15,
        isOutdoorWarning: false
      } : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Post a Hangout</h3>
              <p className="text-xs text-slate-400">Casual, low-stakes activities with nearby people</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Activity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Evening walk in Highland Park"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full bg-slate-800/80 text-slate-200 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="Walking">Walking</option>
                <option value="Sports">Sports</option>
                <option value="Games">Games</option>
                <option value="Food">Food & Drink</option>
                <option value="Fitness">Fitness</option>
                <option value="Study">Co-working / Study</option>
                <option value="Outdoors">Outdoors</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/80 text-slate-200 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Start Time *</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800/80 text-slate-200 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                <span>Public Location / Area Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Highland Park Conservatory Plaza"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-indigo-300 flex items-center space-x-1">
                <span>Exact Meeting Point (Revealed ONLY after joining for safety) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Benches in front of main entrance doors"
                value={exactMeetingPoint}
                onChange={(e) => setExactMeetingPoint(e.target.value)}
                className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-indigo-500/40 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Pinpoint Exact Location on Map *</span>
                <span className="text-xs font-normal text-slate-400">Click to place marker</span>
              </label>
              <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-700 relative z-0">
                <MapContainer
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={14}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                  <LocationPicker position={selectedLocation} setPosition={setSelectedLocation} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Description / Vibe *</label>
            <textarea
              rows={3}
              required
              placeholder="What are we doing? Any gear to bring? Mention skill levels or expectations."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Max Participants & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center space-x-1">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>Max Participants (Blank = Unlimited)</span>
              </label>
              <input
                type="number"
                min="2"
                max="50"
                placeholder="e.g. 6"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Cover Image Style</label>
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {SAMPLE_COVERS.map((cov) => (
                  <img
                    key={cov.name}
                    src={cov.url}
                    alt={cov.name}
                    onClick={() => setCoverImage(cov.url)}
                    className={`h-12 w-16 object-cover rounded-lg cursor-pointer border-2 transition-all flex-shrink-0 ${
                      coverImage === cov.url ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={cov.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              Publish Activity
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
