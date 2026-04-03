import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMuseumById } from '../api/museumApi';
import { useTheme } from '../context/ThemeContext';
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
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMuseum = async () => {
      setLoading(true);
      try {
        const res = await getMuseumById(id);
        setMuseum(res.data);
      } catch {
        setError('Museum tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchMuseum();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Memuat detail museum...</p>
        </div>
      </div>
    );
  }

  if (error || !museum) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">{error || 'Museum tidak ditemukan'}</p>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Kembali ke Peta
          </Link>
        </div>
      </div>
    );
  }

  const hasCoordinates = museum.latitude && museum.longitude;
  const googleMapsUrl = hasCoordinates ? `https://www.google.com/maps?q=${museum.latitude},${museum.longitude}` : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/map"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark size={20} />
              </div>
              <span className="font-bold text-lg hidden sm:block">
                Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
              </span>
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
              <DetailInfoCard icon={<Globe size={20} />} title="Provinsi">
                <p className={infoValueClass}>{museum.nama_provinsi || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Building2 size={20} />} title="Kabupaten / Kota">
                <p className={infoValueClass}>{museum.nama_kabupaten || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Tag size={20} />} title="Kategori">
                <p className={infoValueClass}>{museum.nama_kategori || 'Tidak dikategorikan'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<MapPin size={20} />} title="Koordinat">
                <p className={infoValueClass}>
                  {museum.latitude}, {museum.longitude}
                </p>
              </DetailInfoCard>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailInfoCard icon={<CalendarDays size={20} />} title="Tahun Dibangun">
                <p className={infoValueClass}>{museum.tahun_dibangun || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Clock3 size={20} />} title="Jam Buka">
                <p className={infoValueClass}>{museum.jam_buka || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<Ticket size={20} />} title="Harga Tiket">
                <p className={infoValueClass}>{museum.harga_tiket || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<ExternalLink size={20} />} title="Website">
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
              <DetailInfoCard icon={<MapPin size={20} />} title="Alamat Lengkap">
                <p className={infoValueClass}>{museum.alamat_lengkap || '-'}</p>
              </DetailInfoCard>

              <DetailInfoCard icon={<ScrollText size={20} />} title="Deskripsi / Pengertian Museum">
                <p className={`${infoValueClass} whitespace-pre-line font-normal`}>
                  {museum.deskripsi || 'Belum ada deskripsi museum.'}
                </p>
              </DetailInfoCard>

              <DetailInfoCard icon={<FileText size={20} />} title="Sumber Informasi">
                <p className={infoValueClass}>{museum.sumber_informasi || '-'}</p>
              </DetailInfoCard>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Kembali ke Peta
              </Link>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors text-sm shadow-lg shadow-emerald-500/25"
                >
                  <MapPin size={16} />
                  Buka di Google Maps
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
