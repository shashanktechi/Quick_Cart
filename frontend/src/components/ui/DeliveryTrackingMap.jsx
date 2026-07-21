import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ── Custom Leaflet Icons ───────────────────────────────────────────────────

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const partnerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Component to dynamically auto-fit map bounds to encompass all active markers
 */
function FitBoundsHelper({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, bounds]);
  return null;
}

/**
 * DeliveryTrackingMap
 * Props:
 *  - order: Order object containing customer, store, and partner location data
 *  - partnerPos: { lat, lng } live coordinates of delivery partner (if available)
 *  - height: CSS height string (default "100%")
 */
export function DeliveryTrackingMap({ order, partnerPos = null, height = '100%' }) {
  // Extract Customer Coordinates
  const customerLoc = useMemo(() => {
    if (order?.customerLat != null && order?.customerLng != null) {
      return [order.customerLat, order.customerLng];
    }
    return null;
  }, [order]);

  // Extract Store Coordinates
  const storeLoc = useMemo(() => {
    if (order?.store?.location?.coordinates) {
      // GeoJSON Point is [lng, lat]
      return [order.store.location.coordinates[1], order.store.location.coordinates[0]];
    }
    if (order?.store?.lat != null && order?.store?.lng != null) {
      return [order.store.lat, order.store.lng];
    }
    return null;
  }, [order]);

  // Determine Delivery Partner Position
  const partnerLoc = useMemo(() => {
    if (partnerPos?.lat != null && partnerPos?.lng != null) {
      return [partnerPos.lat, partnerPos.lng];
    }
    // Interpolated midway position if order is OUT_FOR_DELIVERY or ACCEPTED and both store & customer exist
    if (storeLoc && customerLoc) {
      const isOut = order?.status === 'OUT_FOR_DELIVERY';
      const ratio = isOut ? 0.65 : 0.2; // 65% en-route or 20% near store
      const lat = storeLoc[0] + (customerLoc[0] - storeLoc[0]) * ratio;
      const lng = storeLoc[1] + (customerLoc[1] - storeLoc[1]) * ratio;
      return [lat, lng];
    }
    return storeLoc;
  }, [partnerPos, storeLoc, customerLoc, order?.status]);

  // Calculate Map Bounds
  const bounds = useMemo(() => {
    const points = [];
    if (storeLoc) points.push(storeLoc);
    if (customerLoc) points.push(customerLoc);
    if (partnerLoc) points.push(partnerLoc);
    return points.length > 0 ? points : [[17.3850, 78.4867]]; // Default Hyderabad fallback
  }, [storeLoc, customerLoc, partnerLoc]);

  // Center position for Map initial render
  const defaultCenter = bounds[0] || [17.3850, 78.4867];

  // Polyline path from delivery partner to customer destination
  const polylinePath = useMemo(() => {
    if (partnerLoc && customerLoc) {
      return [partnerLoc, customerLoc];
    }
    if (storeLoc && customerLoc) {
      return [storeLoc, customerLoc];
    }
    return [];
  }, [partnerLoc, customerLoc, storeLoc]);

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsHelper bounds={bounds} />

        {/* 1. Store Marker */}
        {storeLoc && (
          <Marker position={storeLoc} icon={storeIcon}>
            <Popup>
              <strong>🏬 {order?.store?.name || 'Pickup Store'}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                {order?.store?.address || 'Store Location'}
              </p>
            </Popup>
          </Marker>
        )}

        {/* 2. Customer Delivery Destination Marker */}
        {customerLoc && (
          <Marker position={customerLoc} icon={customerIcon}>
            <Popup>
              <strong>📍 Delivery Address</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                {order?.deliveryAddress || 'Your location'}
              </p>
            </Popup>
          </Marker>
        )}

        {/* 3. Delivery Partner Marker */}
        {partnerLoc && (
          <Marker position={partnerLoc} icon={partnerIcon}>
            <Popup>
              <strong>🏍️ Delivery Partner</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#f97316', fontWeight: 600 }}>
                {order?.deliveryPartner?.fullName || 'En Route to Delivery'}
              </p>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline (Partner -> Destination) */}
        {polylinePath.length === 2 && (
          <Polyline
            positions={polylinePath}
            pathOptions={{
              color: '#0F9D6E',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default DeliveryTrackingMap;
