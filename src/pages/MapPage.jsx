import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getMuseums, getNearbyMuseums, getProvinces, getRegencies, getCategories } from '../api/museumApi';
import MapView from '../components/map/MapView';
import FilterPanel from '../components/map/FilterPanel';
import LoadingOverlay from '../components/map/LoadingOverlay';
import { Link } from 'react-router-dom';
import { Landmark, Moon, Sun, ArrowLeft, Menu, X } from 'lucide-react';

const MapPage = () => {
  const { theme, toggleTheme } = useTheme();

  // Data state
  const [museums, setMuseums] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Nearby state
  const [nearbyMode, setNearbyMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRadius, setNearbyRadius] = useState(50);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalData, setTotalData] = useState(0);

  // Fetch master data (provinces, categories) on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [provRes, catRes] = await Promise.all([
          getProvinces(),
          getCategories(),
        ]);
        setProvinces(provRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to fetch master data:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch regencies when province changes
  useEffect(() => {
    const fetchRegencies = async () => {
      try {
        if (selectedProvince) {
          const prov = provinces.find(p => p.nama_provinsi === selectedProvince);
          if (prov) {
            const res = await getRegencies(prov.id);
            setRegencies(res.data || []);
          }
        } else {
          const res = await getRegencies();
          setRegencies(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch regencies:', err);
      }
    };
    fetchRegencies();
  }, [selectedProvince, provinces]);

  // Fetch museums when filters change
  const fetchMuseums = useCallback(async () => {
    if (nearbyMode) return; // Skip if in nearby mode
    setLoading(true);
    setError(null);
    try {
      // Mengambil semua data tanpa limit dengan memberikan value yang besar
      const params = { limit: 10000 };
      if (selectedProvince) params.provinsi = selectedProvince;
      if (selectedRegency) params.kabupaten = selectedRegency;
      if (selectedCategory) params.kategori = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await getMuseums(params);
      setMuseums(res.data || []);
      setTotalData(res.pagination?.total_data || res.data?.length || 0);
    } catch (err) {
      setError('Gagal memuat data museum');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProvince, selectedRegency, selectedCategory, searchQuery, nearbyMode]);

  useEffect(() => {
    fetchMuseums();
  }, [fetchMuseums]);

  // Handle nearby search
  const handleNearby = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolokasi');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setNearbyMode(true);

        try {
          const res = await getNearbyMuseums(latitude, longitude, nearbyRadius);
          setMuseums(res.data || []);
          setTotalData(res.data?.length || 0);
        } catch (err) {
          setError('Gagal mencari museum terdekat');
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
        setLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [nearbyRadius]);

  // Reset nearby and go back to filter mode
  const handleResetNearby = useCallback(() => {
    setNearbyMode(false);
    setUserLocation(null);
    fetchMuseums();
  }, [fetchMuseums]);

  // Handle filter changes
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedRegency('');
    setNearbyMode(false);
    setUserLocation(null);
  };

  const handleRegencyChange = (value) => {
    setSelectedRegency(value);
    setNearbyMode(false);
    setUserLocation(null);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setNearbyMode(false);
    setUserLocation(null);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setNearbyMode(false);
    setUserLocation(null);
  };

  const handleResetFilters = () => {
    setSelectedProvince('');
    setSelectedRegency('');
    setSelectedCategory('');
    setSearchQuery('');
    setNearbyMode(false);
    setUserLocation(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Landmark size={22} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
            </span>
          </Link>

          <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
          <span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400">
            Peta Interaktif
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Museum count badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {totalData} Museum
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar Filter */}
        <div
          className={`absolute lg:relative z-10 h-full transition-all duration-300 ease-in-out ${
            sidebarOpen
              ? 'translate-x-0 w-80 lg:w-96'
              : '-translate-x-full lg:-translate-x-full w-80 lg:w-0'
          }`}
        >
          <FilterPanel
            provinces={provinces}
            regencies={regencies}
            categories={categories}
            selectedProvince={selectedProvince}
            selectedRegency={selectedRegency}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            nearbyMode={nearbyMode}
            nearbyRadius={nearbyRadius}
            onProvinceChange={handleProvinceChange}
            onRegencyChange={handleRegencyChange}
            onCategoryChange={handleCategoryChange}
            onSearch={handleSearch}
            onNearby={handleNearby}
            onRadiusChange={setNearbyRadius}
            onResetNearby={handleResetNearby}
            onResetFilters={handleResetFilters}
            onClose={() => setSidebarOpen(false)}
            totalResults={totalData}
          />
        </div>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden absolute inset-0 z-[5] bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {loading && <LoadingOverlay />}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-red-500/90 text-white text-sm rounded-xl backdrop-blur-sm shadow-lg">
              {error}
            </div>
          )}

          <MapView
            museums={museums}
            userLocation={userLocation}
            nearbyRadius={nearbyMode ? nearbyRadius : null}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
