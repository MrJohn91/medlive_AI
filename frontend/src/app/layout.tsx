import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedLive AI | Your AI Health Assistant",
  description:
    "Get personalized health guidance from Dr. Liv, your AI medical triage assistant. Voice-powered symptom assessment with real-time visual analysis.",
  keywords: ["medical triage", "AI health", "symptom checker", "telehealth"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased bg-clinical-bg text-sage-900">
        {children}
      </body>
    </html>
  );
}
