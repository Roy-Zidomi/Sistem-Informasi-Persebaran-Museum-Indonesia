import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMuseumById } from '../api/museumApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Tag,
  Globe,
  Moon,
  Sun,
  Landmark,
  CalendarDays,
  Clock3,
  Ticket,
  ExternalLink,
  FileText,
  ScrollText,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const infoValueClass = 'text-base font-semibold text-slate-800 dark:text-slate-200 mt-0.5';

const DetailInfoCard = ({ icon, title, children }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  </div>
);

const MuseumDetailPage = () => {
  const { id } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const text = {
    id: {
      loading: 'Memuat detail museum...',
      notFound: 'Museum tidak ditemukan',
      backToMap: 'Kembali ke Peta',
      themeAria: 'Ganti tema',
      languageAria: 'Pilih bahasa',
      province: 'Provinsi',
      regency: 'Kabupaten / Kota',
      category: 'Kategori',
      uncategorized: 'Tidak dikategorikan',
      coordinates: 'Koordinat',
      yearBuilt: 'Tahun Dibangun',
      openingHours: 'Jam Buka',
      ticketPrice: 'Harga Tiket',
      website: 'Website',
      fullAddress: 'Alamat Lengkap',
      description: 'Deskripsi / Pengertian Museum',
      noDescription: 'Belum ada deskripsi museum.',
      source: 'Sumber Informasi',
      openGoogleMaps: 'Buka di Google Maps',
      translationFallback: '',
    },
    en: {
      loading: 'Loading museum details...',
      notFound: 'Museum not found',
      backToMap: 'Back to Map',
      themeAria: 'Toggle theme',
      languageAria: 'Select language',
      province: 'Province',
      regency: 'Regency / City',
      category: 'Category',
      uncategorized: 'Uncategorized',
      coordinates: 'Coordinates',
      yearBuilt: 'Year Built',
      openingHours: 'Opening Hours',
      ticketPrice: 'Ticket Price',
      website: 'Website',
      fullAddress: 'Full Address',
      description: 'Museum Description',
      noDescription: 'No museum description is available yet.',
      source: 'Information Source',
      openGoogleMaps: 'Open in Google Maps',
      translationFallback: 'English translation is not available yet, so the original Indonesian text is shown.',
    },
  }[language] || {};

  useEffect(() => {
    const fetchMuseum = async () => {
      setLoading(true);
      try {
        const res = await getMuseumById(id);
        setMuseum(res.data);
      } catch {
        setError(text.notFound);
      } finally {
        setLoading(false);
      }
    };
    fetchMuseum();
  }, [id, text.notFound]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !museum) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">{error || text.notFound}</p>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {text.backToMap}
          </Link>
        </div>
      </div>
    );
  }

  const hasCoordinates = museum.latitude && museum.longitude;
  const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps?q=${museum.latitude},${museum.longitude}` : null;
  const localizedValue = (indonesianValue, englishValue) => {
    if (language === 'en') {
      return englishValue || indonesianValue || '-';
    }

    return indonesianValue || '-';
  };
  const localizedDescription =
    language === 'en'
      ? museum.deskripsi_en || museum.deskripsi || text.noDescription
      : museum.deskripsi || text.noDescription;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark size={20} />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={text.themeAria}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div
              className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
              aria-label={text.languageAria}
            >
              <button
                type="button"
                onClick={() => changeLanguage('id')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
                  language === 'id'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                EN
              </button>
            </div>

            <Link
              to="/map"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={text.backToMap}
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{text.backToMap}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {museum.foto_url && (
            <div className="h-56 sm:h-72 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              <img
                src={museum.foto_url}
                alt={museum.nama_museum}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
            </div>
          )}

          {hasCoordinates && (
            <div className="h-64 sm:h-80 w-full relative">
              <MapContainer
                center={[parseFloat(museum.latitude), parseFloat(museum.longitude)]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker
                  position={[parseFloat(museum.latitude), parseFloat(museum.longitude)]}
                  icon={defaultIcon}
                >
                  <Popup>{museum.nama_museum}</Popup>
                </Marker>
              </MapContainer>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-[400] pointer-events-none" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">{museum.nama_museum}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailInfoCard icon={<Globe size={20} />} title={text.province}>
                <p className={infoValueClass}>
                  {localizedValue(museum.nama_provinsi, museum.nama_provinsi_en)}
                </p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Building2 size={20} />} title={text.regency}>
                <p className={infoValueClass}>
                  {localizedValue(museum.nama_kabupaten, museum.nama_kabupaten_en)}
                </p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Tag size={20} />} title={text.category}>
                <p className={infoValueClass}>
                  {localizedValue(museum.nama_kategori || text.uncategorized, museum.nama_kategori_en)}
                </p>
              </DetailInfoCard>

              <DetailInfoCard icon={<MapPin size={20} />} title={text.coordinates}>
                <p className={infoValueClass}>
                  {museum.latitude}, {museum.longitude}
                </p>
              </DetailInfoCard>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailInfoCard icon={<CalendarDays size={20} />} title={text.yearBuilt}>
                <p className={infoValueClass}>{museum.tahun_dibangun || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Clock3 size={20} />} title={text.openingHours}>
                <p className={infoValueClass}>{localizedValue(museum.jam_buka, museum.jam_buka_en)}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Ticket size={20} />} title={text.ticketPrice}>
                <p className={infoValueClass}>{museum.harga_tiket || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<ExternalLink size={20} />} title={text.website}>
                {museum.website ? (
                  <a
                    href={museum.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline break-all mt-0.5 inline-block"
                  >
                    {museum.website}
                  </a>
                ) : (
                  <p className={infoValueClass}>-</p>
                )}
              </DetailInfoCard>
            </div>

            <div className="mt-4 space-y-4">
              <DetailInfoCard icon={<MapPin size={20} />} title={text.fullAddress}>
                <p className={infoValueClass}>
                  {localizedValue(museum.alamat_lengkap, museum.alamat_lengkap_en)}
                </p>
              </DetailInfoCard>

              <DetailInfoCard icon={<ScrollText size={20} />} title={text.description}>
                <p className={`${infoValueClass} whitespace-pre-line font-normal`}>
                  {localizedDescription}
                </p>
                {language === 'en' && !museum.deskripsi_en && museum.deskripsi && (
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {text.translationFallback}
                  </p>
                )}
              </DetailInfoCard>

              <DetailInfoCard icon={<FileText size={20} />} title={text.source}>
                <p className={infoValueClass}>{museum.sumber_informasi || '-'}</p>
              </DetailInfoCard>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                {text.backToMap}
              </Link>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors text-sm shadow-lg shadow-emerald-500/25"
                >
                  <MapPin size={16} />
                  {text.openGoogleMaps}
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MuseumDetailPage;
