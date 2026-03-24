import React from 'react';
import { motion } from 'framer-motion';
import { History, BookOpen, Globe, Shapes } from 'lucide-react';
import museumPasifikaImage from '../assets/museumPasifika.jpg';

const AboutMuseum = () => {
  const features = [
    {
      icon: <History className="w-6 h-6" />,
      title: "Preserving History",
      description: "Safeguarding invaluable artifacts and telling stories of civilizations past."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Educational Spaces",
      description: "Interactive environments where learning comes alive beyond the classroom."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Cultural Identity",
      description: "Connecting present generations with their ancestral roots and diverse heritage."
    },
    {
      icon: <Shapes className="w-6 h-6" />,
      title: "Art & Science",
      description: "Showcasing human creativity, innovation, and our understanding of the universe."
    }
  ];

  return (
    <section id="what-is-museum" className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              The Foundation
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              What is a <span className="text-emerald-600 dark:text-emerald-400">Museum</span>?
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              A museum goes beyond simply being a building filled with ancient objects. It is a living, breathing institution that preserves our collective memory, safeguards our cultural heritage, and inspires future generations through human discovery.
            </p>

            <div className="pt-8 grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual Content */}
          <div className="relative">
            {/* Background decorative blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 dark:from-emerald-500/10 dark:to-indigo-500/10 rounded-full blur-3xl transform -rotate-6 scale-110"></div>

            {/* Image/Illustration container */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden glass-panel border border-white/50 dark:border-slate-700/50 shadow-2xl aspect-[4/3] bg-slate-200 dark:bg-slate-800"
            >
              <img
                src={museumPasifikaImage}
                alt="Museum Pasifika"
                className="absolute inset-0 w-full h-full object-cover object-center [filter:brightness(0.95)_contrast(0.95)_saturate(0.9)_blur(0.2px)] dark:[filter:brightness(0.82)_contrast(0.92)_saturate(0.86)_blur(0.3px)]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/82 via-slate-900/24 to-slate-900/8 dark:from-slate-950/86 dark:via-slate-950/34 dark:to-slate-950/14"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/12 via-transparent to-indigo-950/18 dark:from-emerald-950/16 dark:to-indigo-950/26"></div>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="glass-panel rounded-2xl p-6 bg-white/10 dark:bg-black/30 backdrop-blur-md">
                  <p className="text-white font-medium text-lg italic">
                    "Museums are managers of consciousness. They give us an interpretation of history, of how to view the world and locate ourselves in it."
                  </p>
                  <p className="text-emerald-300 font-semibold mt-4 text-sm uppercase tracking-wider">
                    - Hans Haacke
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutMuseum;
