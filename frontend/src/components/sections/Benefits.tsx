'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, Package, Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { useCountUp } from '../../hooks/useCountUp';
import { animations } from '../../lib/utils';

const benefits = [
  {
    id: 1,
    title: 'Ahorra hasta 5 horas semanales',
    description: 'Automatiza tareas repetitivas y enfócate en lo que realmente importa: tus pacientes.',
    statValue: 5,
    statSuffix: 'h',
    statLabel: 'semanales ahorradas',
    icon: Clock,
  },
  {
    id: 2,
    title: 'Reduce pérdidas por mal inventario',
    description: 'Control preciso de stock con alertas automáticas de reposición.',
    statValue: 30,
    statSuffix: '%',
    statLabel: 'reducción en pérdidas',
    icon: Package,
  },
  {
    id: 3,
    title: 'Mejora la satisfacción del paciente',
    description: 'Recordatorios automáticos y mejor organización de citas.',
    statValue: 95,
    statSuffix: '%',
    statLabel: 'satisfacción del paciente',
    icon: Heart,
  },
];



// Componente individual para cada tarjeta de beneficio con animación de conteo
function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  const IconComponent = benefit.icon;
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Hook para animar el conteo de la estadística
  const countUp = useCountUp({
    end: benefit.statValue,
    duration: 2000,
    suffix: benefit.statSuffix,
    delay: index * 200, // Delay escalonado para cada tarjeta
  });

  // Ref para detectar cuando la tarjeta entra en vista
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  // Iniciar animación cuando la tarjeta entra en vista (solo una vez)
  useEffect(() => {
    if (isInView && !hasAnimated) {
      countUp.start();
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, countUp]);

  return (
    <div ref={cardRef} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.2,
          ease: "easeOut"
        }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <Card className="h-full p-8">
          {/* Icon with consistent styling */}
          <div className="w-20 h-20 bg-[#55A05E] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#55A05E]">
            <IconComponent size={48} strokeWidth={1.5} />
          </div>

          {/* Stat with animated counting */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-[#2C6145] font-montserrat leading-none">
              {countUp.value}
            </div>
            <div className="text-sm text-[#495057] font-lato mt-1">
              {benefit.statLabel}
            </div>
          </div>

          {/* Content with consistent spacing */}
          <h3 className="font-card-title text-[#2C6145] mb-4 text-balance">
            {benefit.title}
          </h3>
          <p className="font-body text-[#495057] leading-relaxed text-balance">
            {benefit.description}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

export function Benefits() {

  return (
    <section className="relative py-20 bg-gradient-to-br from-[#F8F9FA] to-white overflow-hidden">
      {/* Static Background Elements - No infinite animations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#55A05E] opacity-10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#2C6145] opacity-10 rounded-full blur-xl" />
      </div>

      {/* Static decorative elements - No infinite animations */}
      <div className="absolute top-1/4 left-1/12 w-4 h-4 bg-[#55A05E] opacity-20 rounded-full" />
      <div className="absolute top-3/4 right-1/12 w-6 h-6 bg-[#2C6145] opacity-15 rounded-lg" />

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
            Beneficios Comprobados
          </h2>
          <p className="font-subtitle text-[#495057] max-w-3xl mx-auto text-balance">
            Más de 500 clínicas en Chile ya confían en nuestro sistema para optimizar su gestión diaria.
          </p>
        </motion.div>

        {/* Benefits Grid - Single animation trigger */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={animations.stagger}
          viewport={{ once: true }}
          className="grid grid-responsive-3 space-responsive"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              variants={animations.fadeInUp}
            >
              <BenefitCard benefit={benefit} index={index} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={animations.scaleIn}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div
            className="bg-[#2C6145] rounded-2xl p-8 text-white relative overflow-hidden"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-16 h-16 border border-white rounded-full" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-lg" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 font-montserrat">
                ¿Listo para transformar tu clínica?
              </h3>
              <p className="text-lg mb-6 opacity-90 font-lato">
                Únete a las clínicas que ya están optimizando su gestión con Podoclinic.
              </p>
              <motion.button
                className="bg-[#55A05E] text-white px-8 py-3 rounded-lg font-medium font-poppins"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                Solicita tu Demo Gratuita
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}