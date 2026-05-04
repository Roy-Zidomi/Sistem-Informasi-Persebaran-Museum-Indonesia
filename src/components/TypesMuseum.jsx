import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Palette, Users, Atom, Sword, Globe2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TypesMuseum = () => {
  const { language } = useLanguage();
  const MotionDiv = motion.div;
  const MotionH2 = motion.h2;
  const MotionP = motion.p;
  const content = {
    id: {
      title: 'Ragam Kategori Museum',
      description:
        'Indonesia memiliki banyak jenis museum, masing-masing menjaga sisi unik dari identitas bangsa. Hari ini kamu ingin menjelajah yang mana?',
      categories: [
        {
          icon: <Palette className="w-8 h-8" />,
          title: 'Seni & Budaya',
          description: 'Nikmati karya seni, tradisi, dan ekspresi budaya yang mencerminkan kekayaan nusantara.',
          color: 'from-pink-500 to-rose-500',
          bgLight: 'bg-pink-50',
          bgDark: 'dark:bg-pink-950/30',
        },
        {
          icon: <Landmark className="w-8 h-8" />,
          title: 'Sejarah',
          description: 'Telusuri jejak masa lalu, dari kerajaan kuno hingga perjalanan kemerdekaan Indonesia.',
          color: 'from-amber-400 to-orange-500',
          bgLight: 'bg-amber-50',
          bgDark: 'dark:bg-amber-950/30',
        },
        {
          icon: <Atom className="w-8 h-8" />,
          title: 'Sains & Teknologi',
          description: 'Pelajari inovasi ilmiah dan kemajuan teknologi melalui koleksi interaktif edukatif.',
          color: 'from-blue-400 to-indigo-500',
          bgLight: 'bg-blue-50',
          bgDark: 'dark:bg-blue-950/30',
        },
        {
          icon: <Globe2 className="w-8 h-8" />,
          title: 'Alam',
          description: 'Temukan kekayaan flora, fauna, geologi, dan keajaiban lingkungan dari seluruh Indonesia.',
          color: 'from-emerald-400 to-teal-500',
          bgLight: 'bg-emerald-50',
          bgDark: 'dark:bg-emerald-950/30',
        },
        {
          icon: <Sword className="w-8 h-8" />,
          title: 'Militer',
          description: 'Pahami sejarah pertahanan dan perjuangan melalui artefak, strategi, dan kisah heroik.',
          color: 'from-slate-500 to-slate-700',
          bgLight: 'bg-slate-100',
          bgDark: 'dark:bg-slate-800/50',
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: 'Khusus',
          description: 'Jelajahi tema unik seperti transportasi, musik, olahraga, dan koleksi tematik lainnya.',
          color: 'from-purple-400 to-fuchsia-500',
          bgLight: 'bg-purple-50',
          bgDark: 'dark:bg-purple-950/30',
        },
      ],
    },
    en: {
      title: 'Diverse Museum Categories',
      description:
        'Indonesia is home to a vast array of museums, each dedicated to preserving a unique facet of our national identity. What will you explore today?',
      categories: [
        {
          icon: <Palette className="w-8 h-8" />,
          title: 'Art & Culture',
          description: 'Enjoy artistic works, traditions, and cultural expressions that reflect the richness of the archipelago.',
          color: 'from-pink-500 to-rose-500',
          bgLight: 'bg-pink-50',
          bgDark: 'dark:bg-pink-950/30',
        },
        {
          icon: <Landmark className="w-8 h-8" />,
          title: 'History',
          description: "Explore the traces of the past, from ancient kingdoms to Indonesia's road to independence.",
          color: 'from-amber-400 to-orange-500',
          bgLight: 'bg-amber-50',
          bgDark: 'dark:bg-amber-950/30',
        },
        {
          icon: <Atom className="w-8 h-8" />,
          title: 'Science & Technology',
          description: 'Learn about scientific innovation and technological progress through educational interactive collections.',
          color: 'from-blue-400 to-indigo-500',
          bgLight: 'bg-blue-50',
          bgDark: 'dark:bg-blue-950/30',
        },
        {
          icon: <Globe2 className="w-8 h-8" />,
          title: 'Nature',
          description: 'Discover rich flora, fauna, geology, and environmental wonders from across Indonesia.',
          color: 'from-emerald-400 to-teal-500',
          bgLight: 'bg-emerald-50',
          bgDark: 'dark:bg-emerald-950/30',
        },
        {
          icon: <Sword className="w-8 h-8" />,
          title: 'Military',
          description: 'Understand the history of defense and struggle through military artifacts, strategy, and heroic stories.',
          color: 'from-slate-500 to-slate-700',
          bgLight: 'bg-slate-100',
          bgDark: 'dark:bg-slate-800/50',
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: 'Special',
          description: 'Explore unique themes such as transportation, music, sports, or other curated thematic collections.',
          color: 'from-purple-400 to-fuchsia-500',
          bgLight: 'bg-purple-50',
          bgDark: 'dark:bg-purple-950/30',
        },
      ],
    },
  };
  const text = content[language] || content.id;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="types" className="py-24 bg-slate-50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <MotionH2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
          >
            {text.title}
          </MotionH2>
          <MotionP
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 text-lg"
          >
            {text.description}
          </MotionP>
        </div>

        {/* CSS Grid for Cards */}
        <MotionDiv 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {text.categories.map((cat, idx) => (
            <MotionDiv 
              key={idx}
              variants={cardVariants}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden hover-card-effect"
            >
              {/* Background Accent Glow on Hover */}
              <div className={`absolute top-0 right-0 p-32 bg-gradient-to-bl ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-full blur-[80px] -mr-16 -mt-16`}></div>

              <div className={`w-16 h-16 rounded-2xl ${cat.bgLight} ${cat.bgDark} flex items-center justify-center mb-6 text-slate-700 dark:text-slate-200 transition-transform group-hover:scale-110 duration-300`}>
                {cat.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {cat.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {cat.description}
              </p>
              
              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-300 ease-out" style={{ backgroundImage: `linear-gradient(to right, ${cat.color.replace('from-', 'var(--tw-gradient-from)').replace('to-', 'var(--tw-gradient-to)')})` }}>
                {/* Note: In tailwind v4, this gradient approach might need to just use a fixed class or a standard layout. We'll rely on an overlay border instead. */}
              </div>
              
            </MotionDiv>
          ))}
        </MotionDiv>

      </div>
    </section>
  );
};

export default TypesMuseum;
