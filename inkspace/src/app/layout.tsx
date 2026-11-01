import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "InkSpace — Minimalist Editorial Publishing",
    template: "%s | InkSpace",
  },
  description:
    "A minimalist editorial journal for architecture, artificial intelligence, design systems, and modern culture.",
  openGraph: {
    type: "website",
    siteName: "InkSpace",
    title: "InkSpace — Minimalist Editorial Publishing",
    description:
      "Long-form essays and deeply researched criticism on technology, design, and craft.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#FAF9F6] text-[#191919] selection:bg-[#2D4A3E]/15">
        {children}
      </body>
    </html>
  );
}
