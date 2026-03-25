import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Controller component untuk auto-zoom peta ke bounds semua marker.
 * Menggunakan useMap() hook dari react-leaflet.
 */
const MapController = ({ museums, userLocation, sidebarOpen }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const frameId = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 320);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [map, sidebarOpen]);

  useEffect(() => {
    if (!map) return;

    // Jika ada lokasi user, center ke sana
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 12, { animate: true });
      return;
    }

    // Jika ada museum, fit bounds ke semua marker
    if (museums && museums.length > 0) {
      const validMuseums = museums.filter(
        (m) => m.latitude && m.longitude
      );

      if (validMuseums.length === 0) return;

      if (validMuseums.length === 1) {
        map.setView(
          [parseFloat(validMuseums[0].latitude), parseFloat(validMuseums[0].longitude)],
          14,
          { animate: true }
        );
      } else {
        const bounds = L.latLngBounds(
          validMuseums.map((m) => [parseFloat(m.latitude), parseFloat(m.longitude)])
        );
        map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 16 });
      }
    } else {
      // Default: tampilkan seluruh Indonesia
      map.setView([-2.5, 118], 5, { animate: true });
    }
  }, [museums, userLocation, map]);

  return null;
};

export default MapController;
