'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';


// Zod validation schema
const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .min(1, 'El email es requerido'),
  whatsapp: z
    .string()
    .min(1, 'El número de WhatsApp es requerido')
    .regex(/^(\+56)?[9][0-9]{8}$/, 'Ingresa un número de WhatsApp chileno válido (ej: +56912345678 o 912345678)')
});

type ContactFormInputs = z.infer<typeof contactSchema>;

// Form submission states
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Contact section component with form validation
 * Implements React Hook Form with Zod validation for real-time validation
 */
export const Contact: React.FC = () => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');

  // Initialize React Hook Form with Zod resolver
  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      fullName: '',
      email: '',
      whatsapp: ''
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Form submission handler
  const onSubmit = async (data: ContactFormInputs) => {
    setSubmissionState('submitting');
    setSubmitMessage('');

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we'll just log the data and show success
      console.log('Form submitted:', data);
      
      setSubmissionState('success');
      setSubmitMessage('¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto para coordinar tu demostración gratuita.');
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionState('error');
      setSubmitMessage('Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={itemVariants}
            className="font-section-title text-[#2C6145] mb-4 text-balance"
          >
            Solicita una Demostración Gratuita
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="font-subtitle text-gray-600 max-w-2xl mx-auto text-balance"
          >
            Descubre cómo Podoclinic puede transformar la gestión de tu clínica. 
            Completa el formulario y te contactaremos para agendar tu demostración personalizada.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8" animated>
            {submissionState === 'success' ? (
              <motion.div
                variants={successVariants}
                initial="hidden"
                animate="visible"
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-[#2C6145] mb-4">
                  ¡Solicitud Enviada!
                </h3>
                <p className="text-gray-600 mb-6">
                  {submitMessage}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmissionState('idle');
                    setSubmitMessage('');
                  }}
                >
                  Enviar otra solicitud
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Nombre Completo"
                    type="text"
                    name="fullName"
                    value={watchedValues.fullName}
                    onChange={(value) => {
                      setValue('fullName', value);
                      trigger('fullName'); // Trigger validation
                    }}
                    placeholder="Ingresa tu nombre completo"
                    required
                    error={errors.fullName?.message}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={watchedValues.email}
                    onChange={(value) => {
                      setValue('email', value);
                      trigger('email'); // Trigger validation
                    }}
                    placeholder="tu@email.com"
                    required
                    error={errors.email?.message}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="WhatsApp"
                    type="tel"
                    name="whatsapp"
                    value={watchedValues.whatsapp}
                    onChange={(value) => {
                      setValue('whatsapp', value);
                      trigger('whatsapp'); // Trigger validation
                    }}
                    placeholder="+56912345678 o 912345678"
                    required
                    error={errors.whatsapp?.message}
                  />
                </motion.div>

                {submissionState === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{submitMessage}</p>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submissionState === 'submitting'}
                    disabled={!isValid || !isDirty}
                    className="w-full"
                  >
                    {submissionState === 'submitting' ? (
                      'Enviando solicitud...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Solicitar Demostración Gratuita
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p className="text-sm text-gray-500 text-center">
                    Al enviar este formulario, aceptas que nos contactemos contigo para 
                    coordinar tu demostración. No compartiremos tu información con terceros.
                  </p>
                </motion.div>
              </form>
            )}
          </Card>
        </motion.div>

        {/* Additional CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mt-16"
        >
          <motion.div variants={itemVariants} className="bg-[#2C6145] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Tienes preguntas? ¡Estamos aquí para ayudarte!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Nuestro equipo está disponible para resolver todas tus dudas sobre Podoclinic
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center">
                <span className="text-[#55A05E] mr-2">📧</span>
                <span>contacto@podoclinic.cl</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#55A05E] mr-2">📱</span>
                <span>+56 9 1234 5678</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;