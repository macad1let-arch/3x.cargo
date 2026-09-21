import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import ChatWidget from "@/components/ChatWidget";

/* ========================================
   FONTS
======================================== */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ========================================
   VIEWPORT
======================================== */

export const viewport: Viewport = {
  width: "device-width",

  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,

  userScalable: false,

  viewportFit: "cover",

  themeColor: "#0A3478",
};

/* ========================================
   METADATA
======================================== */

export const metadata: Metadata = {
  title: {
    default: "Alakel",
    template: "%s | Alakel",
  },

  description:
    "Доставка товаров из Китая в Кыргызстан",

  appleWebApp: {
    capable: true,
    title: "Alakel",

    /*
      На iPhone верхняя системная область
      визуально лучше сливается с TopBar.
    */
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },
};

/* ========================================
   ROOT
======================================== */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        {children}

        <ChatWidget />
      </body>
    </html>
  );
}