import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Toaster from "@/components/ui/Toaster";
import ProfileSync from "@/components/providers/ProfileSync";
import SupabaseConfigBanner from "@/components/providers/SupabaseConfigBanner";
import Footer from "@/components/layout/Footer";
import { PRODUCT_NAME, PRODUCT_TITLE } from "@/utils/brand";
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
  title: PRODUCT_TITLE,
  description: `${PRODUCT_NAME} — Commercial Invoice Generator for B2B service exporters. Operated by Sirapp Studio.`,
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
        <SupabaseConfigBanner />
        <ProfileSync />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
        <Analytics /> {/* Componente de Analytics añadido aquí */}
      </body>
    </html>
  );
}