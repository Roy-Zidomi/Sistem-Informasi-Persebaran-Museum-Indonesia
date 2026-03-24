import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';
import { createCategoryIcon, userLocationIcon } from './CategoryMarker';
import MapController from './MapController';
import { MapPin, Tag, Building2, Globe, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ museums = [], userLocation = null, nearbyRadius = null }) => {
  // Memoize markers to avoid re-creating icons on every render
  const markers = useMemo(() => {
    return museums
      .filter((m) => m.latitude && m.longitude)
      .map((museum) => ({
        ...museum,
        position: [parseFloat(museum.latitude), parseFloat(museum.longitude)],
        icon: createCategoryIcon(museum.nama_kategori),
      }));
  }, [museums]);

  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      className="h-full w-full z-0"
      zoomControl={true}
      minZoom={4}
      maxZoom={18}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Auto-zoom controller */}
      <MapController museums={museums} userLocation={userLocation} />

      {/* Museum markers with clustering */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        iconCreateFunction={(cluster) => {
          const count = cluster.getChildCount();
          let size = 'small';
          let dimension = 36;
          if (count >= 50) { size = 'large'; dimension = 48; }
          else if (count >= 10) { size = 'medium'; dimension = 42; }

          return L.divIcon({
            html: `<div style="
              width: ${dimension}px;
              height: ${dimension}px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #10B981, #6366F1);
              color: white;
              font-weight: 700;
              font-size: ${size === 'large' ? '14px' : '12px'};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            ">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(dimension, dimension),
          });
        }}
      >
        {markers.map((museum) => (
          <Marker
            key={museum.id}
            position={museum.position}
            icon={museum.icon}
          >
            <Popup className="museum-popup" maxWidth={280} minWidth={220}>
              <div className="p-1">
                <h3 className="font-bold text-base text-slate-900 mb-2 leading-tight">
                  {museum.nama_museum}
                </h3>

                <div className="space-y-1.5 mb-3">
                  {museum.nama_provinsi && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Globe size={12} className="text-blue-500 shrink-0" />
                      <span>{museum.nama_provinsi}</span>
                    </div>
                  )}
                  {museum.nama_kabupaten && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 size={12} className="text-purple-500 shrink-0" />
                      <span>{museum.nama_kabupaten}</span>
                    </div>
                  )}
                  {museum.nama_kategori && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Tag size={12} className="text-amber-500 shrink-0" />
                      <span>{museum.nama_kategori}</span>
                    </div>
                  )}
                  {museum.distance_km !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <Navigation size={12} className="shrink-0" />
                      <span>{museum.distance_km} km dari lokasi Anda</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/museum/${museum.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors w-full justify-center"
                >
                  <MapPin size={12} />
                  Lihat Detail
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-sm text-slate-900">📍 Lokasi Anda</p>
              <p className="text-xs text-slate-500 mt-1">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Nearby radius circle */}
      {userLocation && nearbyRadius && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={nearbyRadius * 1000}
          pathOptions={{
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '8 4',
          }}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
