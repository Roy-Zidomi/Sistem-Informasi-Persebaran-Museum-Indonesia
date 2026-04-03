import React from 'react';
import { Landmark, Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();
  const content = {
    id: {
      description:
        'Gerbang untuk menjelajahi kekayaan sejarah, seni, dan budaya Indonesia melalui museum-museum terbaiknya.',
      explore: 'Jelajah',
      home: 'Home',
      aboutMuseums: 'Tentang Museum',
      categories: 'Kategori',
      featuredList: 'Daftar Unggulan',
      platform: 'Platform',
      interactiveMap: 'Peta Interaktif',
      museumDirectory: 'Direktori Museum',
      faq: 'FAQ',
      contactUs: 'Hubungi Kami',
      connect: 'Terhubung',
      rightsReserved: 'Hak cipta dilindungi.',
      privacyPolicy: 'Kebijakan Privasi',
      termsOfService: 'Syarat Layanan',
    },
    en: {
      description:
        'Your gateway to exploring the rich historical, artistic, and cultural heritage of Indonesia through its magnificent museums.',
      explore: 'Explore',
      home: 'Home',
      aboutMuseums: 'About Museums',
      categories: 'Categories',
      featuredList: 'Featured List',
      platform: 'Platform',
      interactiveMap: 'Interactive Map',
      museumDirectory: 'Museum Directory',
      faq: 'FAQ',
      contactUs: 'Contact Us',
      connect: 'Connect',
      rightsReserved: 'All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
  };
  const text = content[language] || content.id;

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {text.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{text.explore}</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.home}</a></li>
              <li><a href="#what-is-museum" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.aboutMuseums}</a></li>
              <li><a href="#types" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.categories}</a></li>
              <li><a href="#featured" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.featuredList}</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{text.platform}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.interactiveMap}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.museumDirectory}</a></li>
              <li><a href="#faq" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.faq}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors text-sm">{text.contactUs}</a></li>
            </ul>
          </div>

          {/* Social connections */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{text.connect}</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <a href="mailto:hello@museumnesia.id" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Mail className="w-4 h-4" /> hello@museumnesia.id
            </a>
          </div>

        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} MuseumNesia. {text.rightsReserved}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">{text.privacyPolicy}</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">{text.termsOfService}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
