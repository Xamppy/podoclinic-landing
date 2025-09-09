'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ParallaxBackground, FloatingElement } from '../ui/ParallaxBackground';
import { useStaggeredAnimation } from '../../hooks/useScrollAnimation';
import { animations } from '../../lib/utils';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  features: string[];
  limitations?: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basico',
    name: 'Plan Básico',
    price: 'Gratuito',
    period: '',
    description: 'Ideal para profesionales independientes',
    features: [
      '1 usuario',
      'Hasta 20 pacientes',
      'Agenda de citas básica',
      'Fichas de pacientes digitales',
      'Recordatorios por email',
      'Soporte por email'
    ],
    limitations: [
      'Sin control de inventario',
      'Sin facturación electrónica',
      'Sin reportes avanzados'
    ]
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    price: '$29.990',
    period: '/mes',
    description: 'Perfecto para clínicas en crecimiento',
    isPopular: true,
    features: [
      'Hasta 5 usuarios',
      'Pacientes ilimitados',
      'Todas las funciones del plan básico',
      'Control de inventario completo',
      'Gestión de gastos',
      'Alertas de stock bajo',
      'Recordatorios SMS y WhatsApp',
      'Soporte prioritario',
      'Reportes básicos'
    ]
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: '$49.990',
    period: '/mes',
    description: 'Para clínicas establecidas que buscan máxima eficiencia',
    features: [
      'Usuarios ilimitados',
      'Todo lo del Plan Pro',
      'Facturación electrónica (SII)',
      'Reportes avanzados y analytics',
      'Integración con sistemas contables',
      'API personalizada',
      'Soporte telefónico 24/7',
      'Capacitación personalizada',
      'Backup automático diario'
    ]
  }
];

/**
 * Pricing Section Component
 * Displays three subscription plans with responsive layout
 * Highlights the Pro plan as most popular
 */
export const Pricing: React.FC = () => {
  const { ref: staggerRef, visibleItems } = useStaggeredAnimation(pricingPlans.length, 120);

  return (
    <section className="relative py-16 px-6 bg-gray-50 overflow-hidden">
      {/* Parallax Background Elements */}
      <ParallaxBackground speed={0.1} direction="up" className="opacity-20">
        <div className="absolute top-32 left-16 w-28 h-28 bg-[#55A05E] opacity-10 rounded-full blur-xl" />
        <div className="absolute bottom-24 right-12 w-36 h-36 bg-[#2C6145] opacity-10 rounded-lg blur-xl" />
      </ParallaxBackground>

      {/* Floating decorative elements */}
      <FloatingElement
        className="top-1/5 left-1/12 w-4 h-4 bg-[#55A05E] opacity-25 rounded-full"
        speed={0.3}
        direction="up"
      />
      <FloatingElement
        className="top-4/5 right-1/12 w-5 h-5 bg-[#2C6145] opacity-20 rounded-lg"
        speed={0.25}
        direction="down"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={animations.fadeInUp}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-section-title text-[#2C6145] mb-4 text-balance">
            Elige el plan que se ajuste a tu clínica
          </h2>
          <p className="font-subtitle text-gray-600 max-w-2xl mx-auto text-balance">
            Planes flexibles diseñados para clínicas de todos los tamaños. 
            Comienza gratis y escala según tus necesidades.
          </p>
        </motion.div>

        {/* Pricing Cards Grid with Staggered Animation */}
        <motion.div
          ref={staggerRef}
          initial="hidden"
          whileInView="visible"
          variants={animations.stagger}
          viewport={{ once: true }}
          className="grid grid-responsive-3 space-responsive max-w-6xl mx-auto"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={animations.fadeInUp}
              className={`relative transition-opacity duration-500 ${
                visibleItems.has(index) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-[#55A05E] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Más Popular
                  </div>
                </div>
              )}

              <motion.div
                whileHover={plan.isPopular ? { y: -5, transition: { duration: 0.2 } } : { y: -2 }}
                className="h-full"
              >
                <Card 
                  className={`h-full relative ${
                    plan.isPopular 
                      ? 'border-2 border-[#55A05E] shadow-lg scale-105' 
                      : 'border border-gray-200'
                  }`}
                  animated
                >
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="font-card-title text-[#2C6145] mb-2 text-balance">
                    {plan.name}
                  </h3>
                  <p className="font-body text-gray-600 mb-4 text-balance">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#2C6145]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#55A05E] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations (for basic plan) */}
                  {plan.limitations && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">No incluye:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-xs text-gray-400">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={plan.isPopular ? 'primary' : 'outline'}
                        size="lg"
                        className="w-full"
                      >
                        {plan.id === 'basico' ? 'Comenzar Gratis' : 'Solicitar Demo'}
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={animations.fadeIn}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 text-sm">
            Todos los planes incluyen actualizaciones gratuitas y migración de datos sin costo. 
            <br />
            Puedes cambiar de plan en cualquier momento.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;