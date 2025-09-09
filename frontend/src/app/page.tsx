'use client';

import { useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';

// Import Hero directly for immediate loading
import { Hero } from '@/components/sections/Hero';

// Import components directly for better performance
import { Benefits } from '@/components/sections/Benefits';
import { Features } from '@/components/sections/Features';
import { Pricing } from '@/components/sections/Pricing';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  useEffect(() => {
    // Ensure smooth scrolling is enabled
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optimize scroll performance
    const handleScroll = () => {
      // Use requestAnimationFrame for smooth scroll handling
      requestAnimationFrame(() => {
        // Any scroll-based calculations can go here
      });
    };

    // Add passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup on unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section id="hero" className="relative">
          <Hero />
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="relative py-16 md:py-24">
          <Benefits />
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-16 md:py-24 bg-gray-50">
          <Features />
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-16 md:py-24">
          <Pricing />
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative py-16 md:py-24 bg-gray-50">
          <Contact />
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
    </>
  );
}