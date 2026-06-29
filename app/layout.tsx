import type { Metadata } from "next";
import { Anton, Archivo, Fraunces, DM_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Archivo & Fraunces are variable fonts: omitting `weight` loads a single
// variable file that covers the full weight range, instead of many static
// weight files — a big reduction in font requests on first load.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dmmono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Matchday Almanac · World Cup 2026",
  description:
    "Pick the score for every Round of 32 match. Stamp your card. Share it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${fraunces.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Noto Color Emoji is large (~MBs) and only needed to render country
            flags on platforms without native flag emoji (e.g. Windows).
            `display=optional` keeps it off the critical render path: the page
            paints immediately and never blocks/late-swaps on this font. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
