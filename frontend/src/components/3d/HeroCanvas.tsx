'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/lib/webgl';

interface HeroCanvasProps {
  className?: string;
  scrollY?: number;
  mousePosition?: { x: number; y: number };
}

/**
 * Loading fallback component for 3D scene
 */
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50/20 to-green-100/20">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#55A05E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-white/70">Cargando experiencia 3D...</p>
      </div>
    </div>
  );
}

/**
 * Enhanced CSS-based 3D alternative with better animations
 */
function Enhanced3DBackground({ scrollY: propScrollY = 0, mousePosition: propMousePosition = { x: 0.5, y: 0.5 } }: { scrollY?: number; mousePosition?: { x: number; y: number } }) {
  const [scrollY, setScrollY] = useState(propScrollY);
  const [mousePosition, setMousePosition] = useState(propMousePosition);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update internal scrollY when prop changes
  useEffect(() => {
    setScrollY(propScrollY);
  }, [propScrollY]);

  // Update internal mousePosition when prop changes
  useEffect(() => {
    setMousePosition(propMousePosition);
  }, [propMousePosition]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Base static layer for consistent background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C6145] via-[#55A05E] to-[#2C6145] opacity-90" />
      
      {/* Multi-layer background with subtle parallax */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#1A3D2B] via-[#2C6145] to-[#55A05E] opacity-30 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollY * 0.1}px) translateX(${(mousePosition.x - 0.5) * 8}px) scale(${1 + (mousePosition.y - 0.5) * 0.02})`,
        }}
      />
      
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-[#2C6145] via-[#55A05E] to-[#7BC142] opacity-25 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollY * 0.05}px) translateX(${-(mousePosition.x - 0.5) * 6}px) scale(${1 + (mousePosition.x - 0.5) * 0.015})`,
        }}
      />

      {/* Additional animated layer for more depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#55A05E]/15 to-transparent animate-pulse"
        style={{
          transform: `translateY(${scrollY * 0.03}px) translateX(${(mousePosition.x - 0.5) * 4}px) rotate(${(mousePosition.x - 0.5) * 1}deg)`,
        }}
      />

      {/* Animated geometric shapes - Using Tailwind animations */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => {
          const size = 12 + (i % 4) * 8; // Larger, more visible sizes
          const isCircle = i % 3 === 0;
          const isSquare = i % 3 === 1;
          
          return (
            <div
              key={i}
              className={`absolute opacity-60 transition-all duration-300 ease-out ${
                isCircle 
                  ? 'rounded-full bg-[#55A05E] animate-bounce' 
                  : isSquare 
                    ? 'bg-[#7BC142] rotate-45 animate-pulse' 
                    : 'bg-[#2C6145] rounded-lg animate-spin'
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${10 + (i * 8) % 80}%`,
                top: `${15 + (i * 12) % 70}%`,
                transform: `
                  translateY(${scrollY * (0.05 + i * 0.01)}px) 
                  translateX(${(mousePosition.x - 0.5) * (5 + i * 2)}px)
                  rotate(${scrollY * 0.2 + i * 45 + (mousePosition.x - 0.5) * 10}deg)
                  scale(${1 + (mousePosition.y - 0.5) * 0.03})
                `,
                animationDuration: `${2 + i * 0.5}s`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main foot-like shape with enhanced visibility */}
      <div 
        className="absolute right-1/4 top-1/2 opacity-80 transition-all duration-300 ease-out"
        style={{
          transform: `
            translateY(${-50 + scrollY * 0.05 + (mousePosition.y - 0.5) * 5}%) 
            translateX(${(mousePosition.x - 0.5) * 15}px)
            scale(${1.2 + mousePosition.y * 0.3})
            rotate(${(mousePosition.x - 0.5) * 10}deg)
          `,
        }}
      >
        {/* Main shape - larger and more visible */}
        <div className="w-40 h-24 bg-gradient-to-br from-[#55A05E] to-[#7BC142] rounded-full shadow-2xl animate-pulse" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-44 h-28 bg-[#55A05E] rounded-full opacity-30 -translate-x-2 -translate-y-2 blur-lg animate-pulse" />
      </div>

      {/* Floating particles - more visible */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-3 h-3 bg-white rounded-full opacity-70 animate-ping"
            style={{
              left: `${15 + i * 8}%`,
              top: `${25 + (i * 7) % 50}%`,
              transform: `translateY(${scrollY * (0.15 + i * 0.03)}px) translateX(${(mousePosition.x - 0.5) * (3 + i)}px) scale(${1 + (mousePosition.y - 0.5) * 0.05})`,
              animationDuration: `${1.5 + i * 0.4}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>


    </div>
  );
}

/**
 * Simple static fallback for reduced motion
 */
function StaticBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#2C6145] via-[#55A05E] to-[#2C6145] opacity-90">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Static foot shape */}
      <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2">
        <div className="w-32 h-20 bg-[#55A05E] opacity-60 rounded-full shadow-xl" />
      </div>
    </div>
  );
}

/**
 * Main HeroCanvas component with CSS-based 3D implementation
 * Stable and compatible with all React versions
 */
export function HeroCanvas({ className = '', scrollY = 0, mousePosition = { x: 0.5, y: 0.5 } }: HeroCanvasProps) {
  const [isClient, setIsClient] = useState(false);
  const reducedMotion = useReducedMotion();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle retry from parent error boundary
  const handleRetry = useCallback(() => {
    // Simple retry - just force re-render
    window.location.reload();
  }, []);

  // Expose retry function to parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { __heroCanvasRetry?: () => void }).__heroCanvasRetry = handleRetry;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Window & { __heroCanvasRetry?: () => void }).__heroCanvasRetry;
      }
    };
  }, [handleRetry]);

  // Show loading state during initialization
  if (!isClient) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <CanvasLoader />
      </div>
    );
  }

  // Render appropriate scene based on preferences
  const renderScene = () => {
    if (reducedMotion) {
      return <StaticBackground />;
    }
    
    return <Enhanced3DBackground scrollY={scrollY} mousePosition={mousePosition} />;
  };

  return (
    <div className={`absolute inset-0 ${className}`}>
      {renderScene()}
    </div>
  );
}