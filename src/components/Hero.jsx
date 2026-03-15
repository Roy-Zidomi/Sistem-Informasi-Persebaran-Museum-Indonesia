import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import nationalMuseumImg from '../assets/museumAgungRai.jpg';


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
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 via-cyan-200/30 to-indigo-200/35 blur-3xl dark:from-emerald-500/15 dark:via-cyan-500/10 dark:to-indigo-500/15" />
            <motion.div
              initial={{ rotate: 2, y: 0, scale: 1 }}
              whileHover={{ rotate: 0, y: -10, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-white/30 dark:border-slate-700/60 shadow-2xl cursor-pointer"
            >
              <motion.img
                src={nationalMuseumImg}
                alt="National Museum"
                className="w-full h-full object-cover object-center [filter:brightness(0.96)_contrast(0.94)_saturate(0.9)_blur(0.2px)] dark:[filter:brightness(0.8)_contrast(0.92)_saturate(0.86)_blur(0.3px)]"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-slate-900/18 to-indigo-900/35 dark:from-slate-950/20 dark:via-slate-950/32 dark:to-indigo-950/45" />
              <div className="absolute inset-0 ring-1 ring-white/20 dark:ring-slate-700/50 rounded-3xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
