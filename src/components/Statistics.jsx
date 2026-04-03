import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMuseums } from '../api/museumApi';
import { useLanguage } from '../context/LanguageContext';

const CHART_PRIMARY_COLOR = '#10b981';
const PAGE_SIZE = 500;

const normalizeName = (value, fallback) => {
  const name = typeof value === 'string' ? value.trim() : '';
  return name || fallback;
};

const aggregateMuseums = (museums = [], unknownProvince = 'Provinsi Tidak Diketahui', sortLocale = 'id') => {
  const provinceMap = new Map();

  museums.forEach((museum) => {
    const provinceName = normalizeName(
      museum?.nama_provinsi ?? museum?.provinsi?.nama_provinsi ?? museum?.provinsi,
      unknownProvince
    );

    provinceMap.set(provinceName, (provinceMap.get(provinceName) || 0) + 1);
  });

  const byCountDesc = (a, b) => b.total - a.total || a.name.localeCompare(b.name, sortLocale);

  return Array.from(provinceMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort(byCountDesc);
};

const StatsTooltip = ({ active, payload, label, metricLabel }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl shadow-lg">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-slate-200 text-sm">
        {metricLabel}: {payload[0].value}
      </p>
    </div>
  );
};

const Statistics = () => {
  const MotionDiv = motion.div;
  const { language } = useLanguage();
  const text = {
    id: {
      title: 'Statistik',
      titleHighlight: 'Museum',
      subtitle: 'Menampilkan seluruh data museum berdasarkan provinsi.',
      totalLabel: 'Total museum terhitung',
      loading: 'Memuat data statistik...',
      error: 'Gagal memuat data statistik. Silakan coba lagi nanti.',
      empty: 'Belum ada data museum untuk ditampilkan statistik.',
      chartAria: 'Grafik batang jumlah museum untuk semua provinsi',
      unknownProvince: 'Provinsi Tidak Diketahui',
      tooltipLabel: 'Jumlah museum',
      sortLocale: 'id',
      museumUnit: 'museum',
    },
    en: {
      title: 'Museum',
      titleHighlight: 'Statistics',
      subtitle: 'Showing all museum data grouped by province.',
      totalLabel: 'Total museums counted',
      loading: 'Loading statistics...',
      error: 'Failed to load statistics. Please try again later.',
      empty: 'No museum data available to display.',
      chartAria: 'Bar chart showing museum count for all provinces',
      unknownProvince: 'Unknown Province',
      tooltipLabel: 'Museum count',
      sortLocale: 'en',
      museumUnit: 'museums',
    },
  }[language] || {
    title: 'Statistik',
    titleHighlight: 'Museum',
    subtitle: 'Menampilkan seluruh data museum berdasarkan provinsi.',
    totalLabel: 'Total museum terhitung',
    loading: 'Memuat data statistik...',
    error: 'Gagal memuat data statistik. Silakan coba lagi nanti.',
    empty: 'Belum ada data museum untuk ditampilkan statistik.',
    chartAria: 'Grafik batang jumlah museum untuk semua provinsi',
    unknownProvince: 'Provinsi Tidak Diketahui',
    tooltipLabel: 'Jumlah museum',
    sortLocale: 'id',
    museumUnit: 'museum',
  };

  const [dataProvinsi, setDataProvinsi] = useState([]);
  const [totalMuseum, setTotalMuseum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllMuseums = async () => {
      let page = 1;
      let totalPages = 1;
      const allMuseums = [];

      do {
        const response = await getMuseums({ page, limit: PAGE_SIZE, sort: 'id', order: 'ASC' });
        const pageData = Array.isArray(response?.data) ? response.data : [];
        const pagination = response?.pagination || {};
        const responseTotalPages = Number(pagination.total_pages);

        if (pageData.length > 0) {
          allMuseums.push(...pageData);
        }

        if (Number.isFinite(responseTotalPages) && responseTotalPages > 0) {
          totalPages = responseTotalPages;
        } else if (pageData.length < PAGE_SIZE) {
          totalPages = page;
        }

        page += 1;
      } while (page <= totalPages);

      return allMuseums;
    };

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const museums = await fetchAllMuseums();
        const provinceStats = aggregateMuseums(museums, text.unknownProvince, text.sortLocale);
        setDataProvinsi(provinceStats);
        setTotalMuseum(museums.length);
      } catch (err) {
        console.error('Failed to load statistics', err);
        setError(text.error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [text.error, text.sortLocale, text.unknownProvince]);

  const barSize = dataProvinsi.length > 34 ? 8 : dataProvinsi.length > 24 ? 10 : 12;

  return (
    <section id="statistics" className="scroll-mt-28 md:scroll-mt-32 py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {text.title} <span className="text-emerald-600 dark:text-emerald-400">{text.titleHighlight}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{text.subtitle}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {text.totalLabel}: <span className="font-semibold">{totalMuseum}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">{text.loading}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center shadow-sm border border-red-100 dark:border-red-800/30">
            <p>{error}</p>
          </div>
        ) : dataProvinsi.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 p-8 rounded-3xl text-center shadow-sm border border-slate-200 dark:border-slate-800">
            <p>{text.empty}</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-2 md:p-4"
              role="img"
              aria-label={text.chartAria}
            >
              <div className="w-full h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataProvinsi} margin={{ top: 16, right: 12, left: 4, bottom: 16 }} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.45} />
                    <XAxis dataKey="name" interval={0} height={10} tick={false} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} width={34} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={<StatsTooltip metricLabel={text.tooltipLabel} />}
                      formatter={(value) => `${value} ${text.museumUnit}`}
                      labelFormatter={(label) => label}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                    />
                    <Bar dataKey="total" radius={[5, 5, 0, 0]} barSize={barSize} minPointSize={2} fill={CHART_PRIMARY_COLOR} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </MotionDiv>
          </div>
        )}
      </div>
    </section>
  );
};

export default Statistics;
