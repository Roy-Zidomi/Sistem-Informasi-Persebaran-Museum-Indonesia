import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Landmark, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const MotionDiv = motion.div;
  const MotionAside = motion.aside;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

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
      <MotionDiv
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
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Landmark size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                Museum<span className="text-emerald-600 dark:text-emerald-400">Nesia</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={isLandingPage ? link.href : `/${link.href}`}
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
                className="hidden md:flex p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/map"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                <Map size={16} />
                Explore Map
              </Link>

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
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MotionAside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -340 }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                className="h-full w-[84%] max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-800 dark:text-white">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="px-4 py-4 space-y-2 flex-1 overflow-y-auto">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={isLandingPage ? link.href : `/${link.href}`}
                      className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <Link
                    to="/map"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-medium shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Map size={16} />
                    Explore Map
                  </Link>
                </div>
              </MotionAside>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionDiv>
    </nav>
  );
};

export default Navbar;
