import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next"; // Import necesario para el tipo Metadata
import { Analytics } from "@vercel/analytics/react"; // Import para Analytics
import Toaster from "@/components/ui/Toaster";
import ProfileSync from "@/components/providers/ProfileSync";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Generador de Facturas",
  description: "Generador de facturas minimalista",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProfileSync />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
        <Analytics /> {/* Componente de Analytics añadido aquí */}
      </body>
    </html>
  );
}