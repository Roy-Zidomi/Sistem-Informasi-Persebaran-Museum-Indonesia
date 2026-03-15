import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#what-is-museum' },
    { name: 'Types', href: '#types' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'Featured', href: '#featured' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-3 lg:px-4">
      <motion.div
        initial={false}
        animate={{ y: isScrolled ? 10 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative mx-auto transition-all duration-500 ${isScrolled
            ? 'w-full max-w-7xl rounded-[2rem] bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(2,6,23,0.65)]'
            : 'w-full max-w-none rounded-none bg-transparent border border-transparent shadow-none'
          }`}
      >
        <div className={`px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 px-3 py-2 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="hidden sm:flex px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5">
                Explore
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-600 dark:text-slate-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 right-0 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2 flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-medium shadow-md">
                    Explore
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
};

export default Navbar;
