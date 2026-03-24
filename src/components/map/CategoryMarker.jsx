import L from 'leaflet';

/**
 * Mapping warna berdasarkan kategori museum.
 * Jika kategori tidak dikenali, gunakan warna default abu-abu.
 */
const CATEGORY_COLORS = {
  'Sejarah': { bg: '#3B82F6', border: '#2563EB' },      // blue
  'Seni': { bg: '#EC4899', border: '#DB2777' },           // pink
  'Umum': { bg: '#10B981', border: '#059669' },            // emerald
  'Khusus': { bg: '#F59E0B', border: '#D97706' },         // amber
  'Arkeologi': { bg: '#8B5CF6', border: '#7C3AED' },      // violet
  'Memorial': { bg: '#EF4444', border: '#DC2626' },        // red
  'Alam': { bg: '#14B8A6', border: '#0D9488' },            // teal
  'Ilmu Pengetahuan': { bg: '#6366F1', border: '#4F46E5' }, // indigo
  'Teknologi': { bg: '#06B6D4', border: '#0891B2' },       // cyan
};

const DEFAULT_COLOR = { bg: '#64748B', border: '#475569' }; // slate

/**
 * Buat Leaflet DivIcon kustom berdasarkan kategori museum
 * @param {string|null} category - Nama kategori museum
 * @returns {L.DivIcon}
 */
export const createCategoryIcon = (category) => {
  const color = CATEGORY_COLORS[category] || DEFAULT_COLOR;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative; 
        width: 30px; 
        height: 38px;
      ">
        <div style="
          width: 30px;
          height: 30px;
          background: ${color.bg};
          border: 3px solid ${color.border};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 13px;
            font-weight: bold;
            line-height: 1;
          ">🏛</div>
        </div>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38],
  });
};

/**
 * Icon khusus untuk lokasi user
 */
export const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      position: relative; 
      width: 24px; 
      height: 24px;
    ">
      <div style="
        width: 24px;
        height: 24px;
        background: #3B82F6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0,0,0,0.3);
      "></div>
      <div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: 32px;
        height: 32px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: userPulse 2s ease-in-out infinite;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export { CATEGORY_COLORS, DEFAULT_COLOR };
