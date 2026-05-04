import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getMuseums, getNearbyMuseums, getProvinces, getRegencies, getCategories } from '../api/museumApi';
import MapView from '../components/map/MapView';
import FilterPanel from '../components/map/FilterPanel';
import LoadingOverlay from '../components/map/LoadingOverlay';
import { Link, useSearchParams } from 'react-router-dom';
import { Landmark, Moon, Sun, ArrowLeft, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MapPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAutoTriggeredNearby = useRef(false);
  const text = {
    id: {
      back: 'Kembali',
      languageAria: 'Pilih bahasa',
      themeAria: 'Ganti tema',
      openSidebar: 'Buka sidebar filter',
      closeSidebar: 'Tutup sidebar filter',
      openSidebarTitle: 'Buka sidebar',
      closeSidebarTitle: 'Tutup sidebar',
      loadError: 'Gagal memuat data museum',
      geoUnsupported: 'Browser tidak mendukung geolokasi',
      nearbyError: 'Gagal mencari museum terdekat',
      locationError: 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.',
    },
    en: {
      back: 'Back',
      languageAria: 'Select language',
      themeAria: 'Toggle theme',
      openSidebar: 'Open filter sidebar',
      closeSidebar: 'Close filter sidebar',
      openSidebarTitle: 'Open sidebar',
      closeSidebarTitle: 'Close sidebar',
      loadError: 'Failed to load museum data',
      geoUnsupported: 'Your browser does not support geolocation',
      nearbyError: 'Failed to find nearby museums',
      locationError: 'Failed to get your location. Please allow location access.',
    },
  }[language] || {};

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
      setError(text.loadError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProvince, selectedRegency, selectedCategory, searchQuery, nearbyMode, text.loadError]);

  useEffect(() => {
    fetchMuseums();
  }, [fetchMuseums]);

  // Handle nearby search
  const handleNearby = useCallback(async () => {
    if (!navigator.geolocation) {
      setError(text.geoUnsupported);
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
          setError(text.nearbyError);
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(text.locationError);
        setLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [nearbyRadius, text.geoUnsupported, text.nearbyError, text.locationError]);

  // Reset nearby and go back to filter mode
  const handleResetNearby = useCallback(() => {
    setNearbyMode(false);
    setUserLocation(null);
    fetchMuseums();
  }, [fetchMuseums]);

  useEffect(() => {
    const shouldRequestNearby = searchParams.get('nearby') === '1';
    if (!shouldRequestNearby || hasAutoTriggeredNearby.current) {
      return;
    }

    hasAutoTriggeredNearby.current = true;
    handleNearby();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('nearby');
    setSearchParams(nextParams, { replace: true });
  }, [handleNearby, searchParams, setSearchParams]);

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

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
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
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{text.back}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar Filter */}
        <div
          className={`absolute lg:relative z-10 h-full transition-all duration-300 ease-in-out ${sidebarOpen
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

        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 z-20 h-14 w-8 items-center justify-center rounded-r-xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-slate-900"
          style={{ left: sidebarOpen ? 'calc(24rem - 0.75rem)' : '0.5rem' }}
          aria-label={sidebarOpen ? text.closeSidebar : text.openSidebar}
          title={sidebarOpen ? text.closeSidebarTitle : text.openSidebarTitle}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

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
            sidebarOpen={sidebarOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
