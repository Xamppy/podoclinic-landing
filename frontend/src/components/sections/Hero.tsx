'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { ThreeDErrorBoundary } from '@/components/error/ThreeDErrorBoundary';

// Dynamically import HeroCanvas to prevent SSR issues with 3D animations
const HeroCanvas = dynamic(
  () => import('@/components/3d/HeroCanvas').then((mod) => ({ default: mod.HeroCanvas })),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C6145] via-[#55A05E] to-[#2C6145] opacity-90">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>
    )
  }
);

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);

  // Handle mouse movement across the entire Hero section
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleCTAClick = useCallback(() => {
    try {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try to scroll to bottom of page
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const handleFeaturesClick = useCallback(() => {
    try {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: scroll down by viewport height
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  }, []);

  const handleCanvasRetry = useCallback(() => {
    // Trigger retry through global function if available
    if (typeof window !== 'undefined') {
      const windowWithRetry = window as unknown as Window & { __heroCanvasRetry?: () => void };
      if (windowWithRetry.__heroCanvasRetry) {
        windowWithRetry.__heroCanvasRetry();
      }
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* HeroCanvas 3D Background with comprehensive error handling */}
      <ThreeDErrorBoundary
        onRetry={handleCanvasRetry}
        enableRetry={true}
        maxRetries={3}
      >
        <HeroCanvas className="z-0" mousePosition={mousePosition} />
      </ThreeDErrorBoundary>

      {/* Content Overlay - Positioned above 3D Canvas */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            >
              Sistema Podoclinic:{' '}
              <span className="block mt-2">
                Gestiona tu clínica sin esfuerzo
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-lg text-gray-100 mb-6 max-w-2xl mx-auto lg:mx-0 drop-shadow-md"
            >
              La solución integral para clínicas de podología y manicura en Chile. 
              Automatiza tu gestión, mejora la atención al paciente y haz crecer tu negocio.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleCTAClick}
                className="transform transition-transform duration-200 hover:scale-105 shadow-xl"
              >
                Solicita una Demostración Gratis
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={handleFeaturesClick}
                className="shadow-xl bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-[#2C6145]"
              >
                Ver Funcionalidades
              </Button>
            </motion.div>

            {/* Key benefits preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center lg:text-left"
            >
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-md">Ahorra Tiempo</h3>
                <p className="text-xs text-gray-200 drop-shadow-sm">Automatización completa</p>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-md">Evita Pérdidas</h3>
                <p className="text-xs text-gray-200 drop-shadow-sm">Control de inventario</p>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 drop-shadow-md">Mejora tu Servicio</h3>
                <p className="text-xs text-gray-200 drop-shadow-sm">Atención personalizada</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Space for 3D interaction */}
          <div className="hidden lg:block relative h-96">
            {/* This space allows interaction with the 3D scene */}
          </div>
        </div>
      </div>

      {/* Scroll indicator - Positioned above all content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex flex-col items-center text-white">
          <span className="text-sm mb-2 drop-shadow-md">Descubre más</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}