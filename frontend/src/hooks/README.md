# Hooks Personalizados

## useCountUp

Hook personalizado para animar números con efecto de conteo progresivo.

### Características

- ✅ Animación suave con easing personalizado (easeOutCubic)
- ✅ Soporte para prefijos y sufijos (%, $, h, etc.)
- ✅ Formateo de números con separadores de miles
- ✅ Control de decimales
- ✅ Delay configurable para animaciones escalonadas
- ✅ Métodos de control (start, reset)
- ✅ Optimización de performance con requestAnimationFrame

### Uso Básico

```typescript
import { useCountUp } from '@/hooks/useCountUp';

function MyComponent() {
  const countUp = useCountUp({
    end: 95,
    duration: 2000,
    suffix: '%'
  });

  useEffect(() => {
    countUp.start();
  }, []);

  return <div>{countUp.value}</div>; // Muestra: "95%"
}
```

### Opciones Disponibles

```typescript
interface UseCountUpOptions {
  start?: number;        // Valor inicial (default: 0)
  end: number;          // Valor final (requerido)
  duration?: number;    // Duración en ms (default: 2000)
  decimals?: number;    // Número de decimales (default: 0)
  suffix?: string;      // Sufijo (ej: '%', 'h')
  prefix?: string;      // Prefijo (ej: '$', '+')
  separator?: string;   // Separador de miles (ej: ',')
  delay?: number;       // Delay antes de iniciar (default: 0)
}
```

### Ejemplos de Uso

#### Porcentaje con decimales
```typescript
const percentage = useCountUp({
  end: 95.5,
  decimals: 1,
  suffix: '%'
});
// Resultado: "95.5%"
```

#### Dinero con separador de miles
```typescript
const money = useCountUp({
  end: 1500000,
  prefix: '$',
  separator: ','
});
// Resultado: "$1,500,000"
```

#### Animación con delay
```typescript
const delayed = useCountUp({
  end: 100,
  delay: 500, // Espera 500ms antes de iniciar
  duration: 1000
});
```

### Métodos de Control

```typescript
const countUp = useCountUp({ end: 100 });

// Iniciar animación
countUp.start();

// Resetear a valor inicial
countUp.reset();

// Obtener valor actual formateado
console.log(countUp.value); // "0" -> "100"
```

### Integración con Framer Motion

```typescript
import { useInView } from 'framer-motion';

function AnimatedStat() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const countUp = useCountUp({
    end: 95,
    suffix: '%'
  });

  useEffect(() => {
    if (isInView) {
      countUp.start();
    }
  }, [isInView]);

  return (
    <div ref={ref}>
      <span>{countUp.value}</span>
    </div>
  );
}
```

### Performance

- Utiliza `requestAnimationFrame` para animaciones suaves
- Función de easing optimizada (easeOutCubic)
- Limpieza automática de animaciones al desmontar
- Previene múltiples animaciones simultáneas

### Testing

El hook incluye tests completos que cubren:
- Formateo de números
- Animaciones con diferentes configuraciones
- Métodos de control (start/reset)
- Manejo de delays
- Limpieza de recursos