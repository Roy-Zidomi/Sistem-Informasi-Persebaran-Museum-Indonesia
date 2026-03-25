import React from 'react';
import { motion } from 'framer-motion';
import { Map, Filter, Navigation, Compass, MapPin } from 'lucide-react';

const AboutPlatform = () => {
  const features = [
    {
      icon: <Filter className="w-6 h-6" />,
      title: "Smart Filtering",
      description: "Easily search by province, regency, or museum category."
    },
    {
      icon: <Navigation className="w-6 h-6" />,
      title: "Location Based",
      description: "Find the nearest museums based on your current location instantly."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Interactive Maps",
      description: "Visual exploration of museum distributions across Indonesia."
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Detailed Guides",
      description: "Get ticket prices, opening hours, and collection highlights."
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6 bg-indigo-50 dark:bg-indigo-900/30">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">Platform Vision</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              A New Way to Discover <br/> <span className="museum-gradient-text">Our Heritage</span>
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              We are building the most comprehensive platform to map and explore museum distributions in Indonesia. While currently an informational hub, upcoming features will transform how you plan your cultural journeys.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="text-indigo-600 dark:text-indigo-400 mb-4">{item.icon}</div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
            
          </motion.div>

          {/* Abstract mockup representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-slate-900 overflow-hidden shadow-2xl relative border border-slate-800">
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="p-8 pt-16 h-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                
                {/* Floating UI Elements mocking the app map */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-20 left-10 glass-panel bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20"
                >
                  <MapPin className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Museum Fatahillah</p>
                    <p className="text-[10px] text-slate-500">0.5 km away</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                  className="absolute bottom-20 right-10 glass-panel bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl shadow-xl border border-white/20"
                >
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">Art</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">DKI Jakarta</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default AboutPlatform;
