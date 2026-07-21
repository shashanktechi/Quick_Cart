import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from './Button';

// Custom Pin Icon
const pinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AddressMapModal({ isOpen, onClose, onConfirm, initialLat = 13.5532, initialLng = 78.5028 }) {
  const [selectedPos, setSelectedPos] = useState({ lat: initialLat, lng: initialLng });
  const [addressText, setAddressText] = useState('');

  useEffect(() => {
    if (initialLat && initialLng) {
      setSelectedPos({ lat: initialLat, lng: initialLng });
      setAddressText(`Selected Location (${initialLat.toFixed(4)}, ${initialLng.toFixed(4)})`);
    }
  }, [initialLat, initialLng, isOpen]);

  const handleSelect = (lat, lng) => {
    setSelectedPos({ lat, lng });
    setAddressText(`Delivery Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      lat: selectedPos.lat,
      lng: selectedPos.lng,
      address: addressText || `Lat: ${selectedPos.lat.toFixed(4)}, Lng: ${selectedPos.lng.toFixed(4)}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg text-ink">Select Delivery Location on Map</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-ink/5 text-ink-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="w-full h-[380px] relative z-0">
          <MapContainer
            center={[selectedPos.lat, selectedPos.lng]}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleSelect} />
            <Marker position={[selectedPos.lat, selectedPos.lng]} icon={pinIcon} />
          </MapContainer>
          <div className="absolute top-3 left-3 z-[400] bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-ink shadow-sm border border-border">
            💡 Click anywhere on the map to place your delivery pin
          </div>
        </div>

        {/* Address & Confirm Footer */}
        <div className="p-4 bg-surface border-t border-border space-y-3">
          <div>
            <label className="text-xs font-mono font-bold text-ink-muted uppercase block mb-1">Location Details</label>
            <input
              type="text"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="Detailed house/street name..."
              className="w-full h-11 bg-background border border-border rounded-lg px-3.5 font-body text-sm text-ink outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs font-mono text-ink-muted">
              Lat: {selectedPos.lat.toFixed(5)}, Lng: {selectedPos.lng.toFixed(5)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleConfirm} className="bg-primary text-white flex items-center gap-2">
                <Check className="w-4 h-4" /> Confirm Destination
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressMapModal;
