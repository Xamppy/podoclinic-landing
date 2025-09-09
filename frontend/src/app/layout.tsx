import type { Metadata } from "next";
import { Montserrat, Lato, Poppins } from "next/font/google";
import "./globals.css";
import { measureWebVitals } from "@/lib/performance";

// Configure Google Fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema Podoclinic - Gestiona tu clínica sin esfuerzo",
  description: "Sistema integral de gestión para clínicas de podología y manicura en Chile. Automatiza tu gestión, mejora la atención al paciente y haz crecer tu negocio.",
  keywords: [
    "podología", 
    "manicura", 
    "gestión clínica", 
    "software médico", 
    "Chile", 
    "agenda citas", 
    "facturación electrónica",
    "sistema podoclinic",
    "gestión pacientes",
    "inventario clínica"
  ],
  authors: [{ name: "Podoclinic" }],
  robots: "index, follow",
  openGraph: {
    title: "Sistema Podoclinic - Gestiona tu clínica sin esfuerzo",
    description: "Sistema integral de gestión para clínicas de podología y manicura en Chile. Automatiza tu gestión, mejora la atención al paciente y haz crecer tu negocio.",
    type: "website",
    locale: "es_CL",
    siteName: "Sistema Podoclinic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema Podoclinic - Gestiona tu clínica sin esfuerzo",
    description: "Sistema integral de gestión para clínicas de podología y manicura en Chile.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize performance monitoring
  if (typeof window !== 'undefined') {
    measureWebVitals();
  }

  return (
    <html lang="es" className={`${montserrat.variable} ${lato.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-poppins antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
