'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { typography } from '@/lib/constants';

/**
 * Footer component with company information, legal links, and copyright
 * Implements responsive layout and accessibility compliance
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Legal links data
  const legalLinks = [
    { href: '/privacy', label: 'Política de Privacidad' },
    { href: '/terms', label: 'Términos de Servicio' },
    { href: '/cookies', label: 'Política de Cookies' },
  ];

  // Company contact information
  const companyInfo = {
    name: 'Podoclinic',
    email: 'contacto@podoclinic.cl',
    phone: '+56 9 1234 5678',
  };

  return (
    <footer 
      className="bg-white border-t border-gray-100 py-8 md:py-12"
      role="contentinfo"
      aria-label="Información de la empresa y enlaces legales"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Logo and Company Name */}
          <motion.div 
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-2">
              {/* Logo placeholder - can be replaced with actual logo */}
              <div 
                className="w-8 h-8 bg-gradient-to-br from-[#2C6145] to-[#55A05E] rounded-lg flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h2 
                className="text-xl font-bold text-[#2C6145]"
                style={{ fontFamily: typography.fontFamily.titles }}
              >
                {companyInfo.name}
              </h2>
            </div>
            
            {/* Company contact info */}
            <div className="text-sm text-gray-600 text-center md:text-left space-y-1">
              <p>
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="hover:text-[#55A05E] transition-colors duration-200"
                  aria-label={`Enviar email a ${companyInfo.email}`}
                >
                  {companyInfo.email}
                </a>
              </p>
              <p>
                <a 
                  href={`tel:${companyInfo.phone}`}
                  className="hover:text-[#55A05E] transition-colors duration-200"
                  aria-label={`Llamar al ${companyInfo.phone}`}
                >
                  {companyInfo.phone}
                </a>
              </p>
            </div>
          </motion.div>

          {/* Legal Links */}
          <motion.nav 
            className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            aria-label="Enlaces legales"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm text-gray-600 hover:text-[#55A05E] transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[#55A05E] focus:ring-offset-2 rounded-sm px-1 py-1"
                )}
                style={{ fontFamily: typography.fontFamily.body }}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>

          {/* Copyright */}
          <motion.div 
            className="text-sm text-gray-500 text-center md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p style={{ fontFamily: typography.fontFamily.body }}>
              © {currentYear} {companyInfo.name}. Todos los derechos reservados.
            </p>
            <p className="mt-1 text-xs">
              Hecho con ❤️ en Chile
            </p>
          </motion.div>
        </div>

        {/* Divider line for visual separation */}
        <motion.div 
          className="mt-8 pt-6 border-t border-gray-100"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-gray-400 text-center">
            Sistema integral de gestión para clínicas de podología y manicura
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;