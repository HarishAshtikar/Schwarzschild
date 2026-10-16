import type { Metadata } from "next";
import { Geist, Geist_Mono, Major_Mono_Display, Space_Mono, Gabarito, STIX_Two_Text} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const majorMonoDisplay = Major_Mono_Display({
  subsets: ['latin'], // Specify subsets for the font
  weight: '400', // Define the weight (required)
  variable: '--font-major-mono-display', // Define a CSS variable for the font
});

const spaceMono = Space_Mono({
  subsets: ['latin'], // Specify subsets for the font
  weight: ['400', '700'], // Specify the font weights you need
  variable: '--font-space-mono', // Define a CSS variable for the font
});

const gabarito = Gabarito({
  subsets: ['latin'], // Specify subsets for the font
  weight: ['400', '500', '600', '700', '800', '900'], // Specify the font weights you need
  variable: '--font-gabarito', // Define a CSS variable for the font
});

const stix = STIX_Two_Text({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-stix',
});

export const metadata: Metadata = {
  title: "Schwarzschild",
  description: "Calculate the Schwarzschild radius of anything, then squeeze it into a black hole.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${majorMonoDisplay.variable} ${geistSans.variable} ${geistMono.variable} ${gabarito.variable} ${stix.variable}`}>
      <body>{children}</body>
    </html>
  );
}
