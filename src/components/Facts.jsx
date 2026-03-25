import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, GlobeX } from 'lucide-react';

const Facts = () => {
  const stats = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      value: "600+",
      label: "Museums in Indonesia",
      description: "Scattered across the archipelago, preserving local and national histories."
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "Millions",
      label: "Annual Visitors",
      description: "Domestic and international tourists enriching their minds."
    },
    {
      icon: <GlobeX className="w-8 h-8" />,
      value: "7+",
      label: "Diverse Categories",
      description: "From maritime to aviation, fine arts to natural history."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-100 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.14]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/45 via-cyan-100/30 to-transparent dark:from-indigo-500/18 dark:via-cyan-500/10 dark:to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/35 via-transparent to-transparent dark:from-slate-900/70 dark:via-transparent dark:to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Did You Know?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-300 text-lg"
          >
            Museums hold incredible stories and facts that shape our understanding of the world. Here are just a few glimpses into Indonesia's museum landscape.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="glass-panel bg-white/70 dark:bg-slate-900/55 border-slate-200/60 dark:border-slate-700/60 text-center p-8 rounded-3xl hover:bg-white/80 dark:hover:bg-slate-900/65 transition-colors shadow-lg shadow-slate-300/25 dark:shadow-none"
            >
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/45 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-300 mb-6 shadow-inner">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{stat.value}</h3>
              <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4">{stat.label}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facts;
