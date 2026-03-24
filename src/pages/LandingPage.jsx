import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutMuseum from '../components/AboutMuseum';
import TypesMuseum from '../components/TypesMuseum';
import Benefits from '../components/Benefits';
import FeaturedMuseums from '../components/FeaturedMuseums';
import Facts from '../components/Facts';
import AboutPlatform from '../components/AboutPlatform';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 selection:bg-emerald-500/30">
      <Navbar />
      <main>
        <Hero />
        <AboutMuseum />
        <TypesMuseum />
        <Benefits />
        <FeaturedMuseums />
        <Facts />
        <AboutPlatform />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
