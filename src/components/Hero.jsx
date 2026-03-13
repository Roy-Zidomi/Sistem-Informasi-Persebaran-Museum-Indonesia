import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, ArrowRight, Landmark } from 'lucide-react';
import nationalMuseumImg from '../assets/museumNasional.jpg';


const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-16 pb-12 flex items-start overflow-hidden"
    >
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col space-y-8 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Explore Indonesia&apos;s{' '}
            <span className="museum-gradient-text">Museums</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            Your ultimate platform for mapping and discovering museum distributions across the archipelago. Filter by province, category, and find the nearest cultural treasures.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
          >
            <button className="px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:-translate-y-1 transition-transform shadow-xl shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-2 group">
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Find Near Me
            </button>
          </motion.div>
        </div>

        {/* Right Visuals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Abstract map or card composition */}
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Main large card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 dark:from-emerald-500/10 dark:to-indigo-500/10 rounded-3xl backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden glass-panel rotate-3 transform transition-transform hover:rotate-0 duration-500">
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl shadow-sm">
                    <Compass className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Featured
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">National Museum</h3>
                  <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" /> Jakarta Pusat, DKI Jakarta
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decorative card 1 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-12 top-1/4 p-4 rounded-2xl glass-panel hidden sm:block w-48 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">400+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Museums Mapped</p>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative card 2 */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 bottom-1/4 p-4 rounded-2xl glass-panel hidden sm:block w-56 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Discover Nearest</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 w-2/3 h-full rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
