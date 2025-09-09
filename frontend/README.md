# Podoclinic Landing Page

Sistema integral de gestión para clínicas de podología y manicura en Chile.

## Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Animaciones y transiciones
- **React Three Fiber** - Elementos 3D
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Lucide React** - Iconografía

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── globals.css      # Estilos globales
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página principal
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes UI reutilizables
│   │   ├── sections/        # Secciones de la landing page
│   │   └── 3d/              # Componentes 3D
│   ├── lib/                 # Utilidades y constantes
│   │   ├── constants.ts     # Constantes del sistema de diseño
│   │   └── utils.ts         # Funciones utilitarias
│   └── types/               # Definiciones de tipos TypeScript
│       └── index.ts         # Tipos principales
├── public/                  # Archivos estáticos
│   └── assets/              # Imágenes y recursos
└── tailwind.config.ts       # Configuración de Tailwind CSS
```

## Sistema de Diseño

El proyecto utiliza un sistema de diseño basado en `design-01.json` con:

### Colores
- **Primary**: `#2C6145` - Confianza, fondos, títulos
- **Accent**: `#55A05E` - Botones CTA, elementos interactivos
- **Background**: `#FFFFFF` / `#F8F9FA` - Fondos
- **Text**: `#212529` / `#495057` - Texto

### Tipografía
- **Títulos**: Montserrat 700, 2.5rem
- **Subtítulos**: Lato 400, 1.25rem
- **Cuerpo**: Poppins 400, 1rem

### Componentes
- **Botones**: Border radius 8px, hover scale 1.05
- **Tarjetas**: Border radius 12px, sombra sutil

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Inicio en producción
npm run start

# Linting
npm run lint
```

## Configuración

El proyecto está configurado con:
- Tailwind CSS con tokens de diseño personalizados
- Google Fonts (Montserrat, Lato, Poppins)
- TypeScript con configuración estricta
- ESLint para calidad de código
- Soporte para animaciones y 3D

## Próximos Pasos

1. Implementar componentes UI base (Button, Card, Input)
2. Crear secciones de la landing page (Hero, Benefits, Features, etc.)
3. Integrar modelo 3D y animaciones
4. Implementar formulario de contacto
5. Optimizar para dispositivos móviles