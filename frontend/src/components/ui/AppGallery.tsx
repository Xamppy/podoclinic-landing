'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Datos de ejemplo de las imágenes de la aplicación
const appImages = [
  {
    id: 1,
    src: '/assets/screenshots/dashboard.jpg',
    alt: 'Dashboard Principal',
    title: 'Dashboard Principal',
    description: 'Vista general del panel de control con métricas en tiempo real, próximas citas y resumen de actividades diarias. Permite acceso rápido a todas las funcionalidades principales.',
    features: ['Métricas en tiempo real', 'Próximas citas', 'Resumen de ingresos', 'Accesos rápidos'],
    gridClass: 'col-span-2 row-span-2'
  },
  {
    id: 2,
    src: '/assets/screenshots/calendar.jpg',
    alt: 'Calendario de Citas',
    title: 'Calendario de Citas',
    description: 'Sistema de agenda interactivo con vista mensual, semanal y diaria. Permite gestionar citas, ver disponibilidad y configurar recordatorios automáticos.',
    features: ['Vista múltiple', 'Drag & drop', 'Recordatorios automáticos', 'Sincronización'],
    gridClass: 'col-span-1 row-span-1'
  },
  {
    id: 3,
    src: '/assets/screenshots/patient-profile.jpg',
    alt: 'Perfil de Paciente',
    title: 'Ficha del Paciente',
    description: 'Historial médico completo con fotos de tratamientos, notas de evolución y documentos adjuntos. Interfaz intuitiva para el seguimiento detallado.',
    features: ['Historial completo', 'Fotos antes/después', 'Notas de evolución', 'Documentos'],
    gridClass: 'col-span-1 row-span-2'
  },
  {
    id: 4,
    src: '/assets/screenshots/inventory.jpg',
    alt: 'Control de Inventario',
    title: 'Gestión de Inventario',
    description: 'Control de stock con alertas automáticas, gestión de proveedores y reportes de rotación. Mantén tu inventario siempre actualizado.',
    features: ['Control de stock', 'Alertas automáticas', 'Gestión de proveedores', 'Reportes'],
    gridClass: 'col-span-1 row-span-1'
  },
  {
    id: 5,
    src: '/assets/screenshots/dashboard-alerts.jpg',
    alt: 'Dashboard y Alertas',
    title: 'Dashboard y Alertas',
    description: 'Panel de control con alertas de insumos que se están agotando y visualización de citas del día en curso.',
    features: ['Alertas de stock', 'Citas del día', 'Resumen diario', 'Reportes básicos'],
    gridClass: 'col-span-2 row-span-1'
  },
  {
    id: 6,
    src: '/assets/screenshots/email-notifications.jpg',
    alt: 'Recordatorios por Email',
    title: 'Recordatorios Automáticos',
    description: 'Sistema de notificaciones por email con recordatorios automáticos y plantillas personalizables para mantener informados a tus pacientes.',
    features: ['Email automático', 'Plantillas personalizables', 'Horarios configurables', 'Historial de envíos'],
    gridClass: 'col-span-1 row-span-1'
  },
  {
    id: 7,
    src: '/assets/screenshots/booking-system.jpg',
    alt: 'Sistema de Reservas',
    title: 'Reserva de Horas Online',
    description: 'Permite a tus pacientes reservar citas online para servicios de podología y manicura. Sistema intuitivo con selección de especialidad, fecha y hora disponible.',
    features: ['Reservas 24/7', 'Selección de especialidad', 'Calendario en tiempo real', 'Confirmación automática'],
    gridClass: 'col-span-1 row-span-1'
  }
];

interface AppGalleryProps {}

export function AppGallery({}: AppGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<typeof appImages[0] | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const openModal = (image: typeof appImages[0]) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {appImages.map((image) => (
          <motion.div
            key={image.id}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
              image.gridClass
            } min-h-[150px] md:min-h-[180px]`}
            onMouseEnter={() => setHoveredImage(image.id)}
            onMouseLeave={() => setHoveredImage(null)}
            onClick={() => openModal(image)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Placeholder for image */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#55A05E] to-[#2C6145] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-3 md:p-4">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-sm md:text-base leading-tight">{image.title}</h4>
              </div>
            </div>

            {/* Hover Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredImage === image.id ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-white text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: hoveredImage === image.id ? 1 : 0.8, 
                    opacity: hoveredImage === image.id ? 1 : 0 
                  }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Ver detalles</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col lg:flex-row h-full">
                {/* Image Section */}
                <div className="flex-1 relative bg-gray-100 min-h-[250px] lg:min-h-[450px]">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#55A05E] to-[#2C6145] opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium opacity-90">Vista previa de {selectedImage.title}</p>
                    </div>
                  </div>
                </div>

                {/* Details Section - Instagram Style */}
                <div className="w-full lg:w-80 bg-white flex flex-col max-h-[80vh]">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#55A05E] rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2C6145]">{selectedImage.title}</h3>
                          <p className="text-sm text-gray-500">Podoclinic App</p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 overflow-y-auto min-h-0">
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-[#2C6145] mb-2">Descripción</h4>
                        <p className="text-[#495057] leading-relaxed">{selectedImage.description}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-[#2C6145] mb-3">Características principales</h4>
                        <div className="space-y-2">
                          {selectedImage.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-[#55A05E] rounded-full flex-shrink-0" />
                              <span className="text-sm text-[#495057]">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <h4 className="font-semibold text-[#2C6145] mb-3">Funcionalidad</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedImage.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#55A05E]/10 text-[#55A05E] text-xs font-medium rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Podoclinic © 2024</span>
                      <span>Gestión Integral</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}