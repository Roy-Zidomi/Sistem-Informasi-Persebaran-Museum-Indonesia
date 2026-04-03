import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Map, Microscope, Fingerprint } from 'lucide-react';
import museumAsiaAfrikaImage from '../assets/museumAsia-Afrikajpeg.jpeg';
import { useLanguage } from '../context/LanguageContext';

const Benefits = () => {
  const { language } = useLanguage();
  const MotionDiv = motion.div;
  const MotionH2 = motion.h2;
  const content = {
    id: {
      badge: 'Dampak',
      title: 'Mengapa Museum Penting',
      visualTitle: 'Jembatan Menuju Pengetahuan',
      visualDesc:
        'Museum menjadi institusi dinamis yang menghubungkan sejarah dengan rasa ingin tahu dunia modern.',
      visualAlt: 'Museum Asia Afrika',
      benefitsList: [
        {
          icon: <ShieldCheck className="w-5 h-5" />,
          title: 'Melestarikan Warisan Budaya',
          description: 'Menjaga harta fisik maupun non-fisik bangsa untuk masa depan.',
        },
        {
          icon: <GraduationCap className="w-5 h-5" />,
          title: 'Ruang Edukasi',
          description: 'Menyediakan pengalaman belajar interaktif dan imersif bagi pelajar.',
        },
        {
          icon: <Map className="w-5 h-5" />,
          title: 'Mendukung Wisata Budaya',
          description: 'Mendorong ekonomi lokal dengan menarik wisatawan domestik dan mancanegara.',
        },
        {
          icon: <Microscope className="w-5 h-5" />,
          title: 'Sumber Riset',
          description: 'Menjadi pusat rujukan penting untuk kajian sejarah, sains, dan seni.',
        },
        {
          icon: <Fingerprint className="w-5 h-5" />,
          title: 'Menguatkan Identitas Bangsa',
          description: 'Menumbuhkan rasa memiliki dan bangga terhadap warisan Indonesia.',
        },
      ],
    },
    en: {
      badge: 'The Impact',
      title: 'Why Museums Matter',
      visualTitle: 'A Bridge to Knowledge',
      visualDesc:
        "Museums serve as dynamic institutions connecting our history to the modern world's endless curiosity.",
      visualAlt: 'Museum Asia Afrika',
      benefitsList: [
        {
          icon: <ShieldCheck className="w-5 h-5" />,
          title: 'Preserving Cultural Heritage',
          description: 'Safeguarding physical and intangible national treasures for the future.',
        },
        {
          icon: <GraduationCap className="w-5 h-5" />,
          title: 'Educational Spaces',
          description: 'Providing interactive and immersive learning environments for students.',
        },
        {
          icon: <Map className="w-5 h-5" />,
          title: 'Supporting Cultural Tourism',
          description: 'Boosting local economies by attracting domestic and international visitors.',
        },
        {
          icon: <Microscope className="w-5 h-5" />,
          title: 'Sources for Research',
          description: 'Serving as vital repositories for historical, scientific, and artistic study.',
        },
        {
          icon: <Fingerprint className="w-5 h-5" />,
          title: 'Introducing National Identity',
          description: 'Fostering a deep sense of belonging and pride in our Indonesian heritage.',
        },
      ],
    },
  };
  const text = content[language] || content.id;

  return (
    <section id="benefits" className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6"
          >
             <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm tracking-wide uppercase">{text.badge}</span>
          </MotionDiv>
          <MotionH2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
          >
            {text.title}
          </MotionH2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Timeline / Feature List */}
          <div className="lg:col-span-7 space-y-8">
            {text.benefitsList.map((item, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 z-10 relative shadow-sm">
                    {item.icon}
                  </div>
                  {/* Subtle connecting line */}
                  {index !== text.benefitsList.length - 1 && (
                    <div className="absolute top-12 bottom-[-2rem] left-1/2 -mt-1 -ml-[1px] w-[2px] bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300"></div>
                  )}
                </div>
                
                <div className="pt-2 pb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base max-w-lg">
                    {item.description}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>

          {/* Decorative Visual */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative h-full min-h-[400px] flex items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-[100px]"></div>
            
            <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden glass-panel border border-white/40 dark:border-slate-700/50 shadow-2xl bg-slate-100 dark:bg-slate-800 group">
              <img
                src={museumAsiaAfrikaImage}
                alt={text.visualAlt}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 [filter:brightness(1.06)_contrast(1.08)_saturate(1.05)] dark:[filter:brightness(0.92)_contrast(1.12)_saturate(1.08)]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/8 via-slate-900/22 to-slate-900/82 dark:from-slate-950/12 dark:via-slate-950/32 dark:to-slate-950/85"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/10 via-transparent to-transparent dark:from-indigo-950/20"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">{text.visualTitle}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{text.visualDesc}</p>
              </div>
            </div>
          </MotionDiv>

        </div>
      </div>
    </section>
  );
};

export default Benefits;
