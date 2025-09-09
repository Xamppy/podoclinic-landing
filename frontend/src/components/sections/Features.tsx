'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ParallaxBackground, FloatingElement } from '../ui/ParallaxBackground';
import { useStaggeredAnimation } from '../../hooks/useScrollAnimation';
import { animations } from '../../lib/utils';

const features = [
  {
    id: 1,
    title: 'Agenda de Citas',
    description: 'Gestiona las citas de tus pacientes de forma eficiente con recordatorios automáticos.',
    details: [
      'Calendario interactivo con vista diaria, semanal y mensual',
      'Recordatorios automáticos por WhatsApp y email',
      'Gestión de disponibilidad y horarios flexibles',
      'Integración con Google Calendar'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: 'Fichas de Pacientes',
    description: 'Mantén un registro completo del historial médico y tratamientos de cada paciente.',
    details: [
      'Historial médico completo y seguro',
      'Fotos de antes y después de tratamientos',
      'Notas de evolución y seguimiento',
      'Documentos adjuntos y consentimientos'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    title: 'Control de Inventario',
    description: 'Administra tu stock de productos y materiales con alertas de reposición.',
    details: [
      'Control de stock en tiempo real',
      'Alertas automáticas de stock mínimo',
      'Gestión de proveedores y compras',
      'Reportes de rotación de inventario'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 4,
    title: 'Facturación Electrónica',
    description: 'Genera facturas automáticamente y cumple con la normativa chilena.',
    details: [
      'Facturación electrónica certificada por SII',
      'Generación automática desde citas',
      'Múltiples formas de pago integradas',
      'Reportes financieros detallados'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 5,
    title: 'Reportes y Estadísticas',
    description: 'Obtén insights valiosos sobre tu negocio con reportes detallados.',
    details: [
      'Dashboard con métricas en tiempo real',
      'Reportes de ingresos y rentabilidad',
      'Análisis de pacientes y tratamientos',
      'Exportación a Excel y PDF'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 6,
    title: 'Comunicación con Pacientes',
    description: 'Envía recordatorios y mantén comunicación directa vía WhatsApp.',
    details: [
      'Integración nativa con WhatsApp Business',
      'Recordatorios automáticos de citas',
      'Campañas de marketing personalizadas',
      'Encuestas de satisfacción automáticas'
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export function Features() {
  // Usar Set para permitir múltiples tarjetas expandidas simultáneamente
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { ref: staggerRef, visibleItems } = useStaggeredAnimation(features.length, 100);

  const handleCardClick = (id: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Si ya está expandida, la contraemos
      } else {
        newSet.add(id); // Si no está expandida, la expandimos
      }
      return newSet;
    });
  };

  return (
    <section id="features" className="relative py-20 bg-white overflow-hidden">
      {/* Parallax Background Elements */}
      <ParallaxBackground speed={0.15} direction="down" className="opacity-20">
        <div className="absolute top-20 right-10 w-24 h-24 bg-[#55A05E] opacity-10 rounded-full blur-lg" />
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-[#2C6145] opacity-10 rounded-lg blur-lg" />
      </ParallaxBackground>

      {/* Floating decorative elements */}
      <FloatingElement
        className="top-1/6 right-1/12 w-3 h-3 bg-[#55A05E] opacity-30 rounded-full"
        speed={0.25}
        direction="up"
      />
      <FloatingElement
        className="top-2/3 left-1/12 w-5 h-5 bg-[#2C6145] opacity-20 rounded-lg"
        speed={0.35}
        direction="down"
      />
      <FloatingElement
        className="top-1/2 right-1/6 w-2 h-2 bg-[#55A05E] opacity-40 rounded-full"
        speed={0.2}
        direction="left"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={animations.fadeInUp}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-section-title text-[#2C6145] mb-4 text-balance">
            Funcionalidades Completas
          </h2>
          <p className="font-subtitle text-[#495057] max-w-3xl mx-auto text-balance">
            Todo lo que necesitas para gestionar tu clínica de podología o manicura de manera profesional y eficiente.
          </p>
          <p className="text-sm text-[#55A05E] mt-4 font-medium font-poppins">
            Haz clic en cada tarjeta para ver más detalles
          </p>
        </motion.div>

        {/* Features Grid with Staggered Animation */}
        <motion.div
          ref={staggerRef}
          initial="hidden"
          whileInView="visible"
          variants={animations.staggerFast}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const isExpanded = expandedCards.has(feature.id);
            const isHovered = hoveredCard === feature.id;
            
            return (
              <motion.div
                key={feature.id}
                variants={animations.fadeInUp}
                className={`h-full transition-opacity duration-500 ${
                  visibleItems.has(index) ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className={`relative h-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 cursor-pointer transition-all duration-200 overflow-hidden ${
                    isHovered ? 'shadow-xl border-gray-200 -translate-y-1' : ''
                  } ${
                    isExpanded ? 'ring-2 ring-[#55A05E] ring-opacity-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleCardClick(feature.id)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 ${
                    isHovered ? 'opacity-5' : ''
                  }`} />
                  
                  <div className="relative z-10 flex flex-col items-center text-center h-full">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-4 text-[#55A05E] transition-all duration-200 ${
                        isHovered ? 'scale-105 rotate-2' : ''
                      }`}
                    >
                      {feature.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-card-title text-[#2C6145] mb-3 text-balance">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="font-body text-[#495057] mb-4 flex-grow text-balance">
                      {feature.description}
                    </p>
                    
                    {/* Expand/Collapse Indicator */}
                     <div className="flex items-center text-[#55A05E] text-sm font-medium">
                       <span className="mr-2">
                         {isExpanded ? 'Ver menos' : 'Ver más'}
                       </span>
                       <svg 
                         className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                           isExpanded ? 'rotate-180' : ''
                         }`} 
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                    
                    {/* Expanded Details */}
                    <div 
                      className={`overflow-hidden w-full transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <ul className="space-y-2 text-left">
                          {feature.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className={`flex items-start text-sm text-[#495057] transition-all duration-200 ${
                                isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                              }`}
                              style={{
                                transitionDelay: isExpanded ? `${detailIndex * 50}ms` : '0ms'
                              }}
                            >
                              <svg className="w-4 h-4 text-[#55A05E] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                 </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}