import type { Metadata } from "next";
import {
  Fraunces,
  Inter_Tight,
  JetBrains_Mono,
  Caveat,
} from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MediScript AI — Your prescription, finally readable",
    template: "%s | MediScript AI",
  },
  description:
    "Upload a handwritten prescription. Get structured medicines, dosages, and safety checks — with confidence scores. Not a substitute for professional medical advice.",
  openGraph: {
    title: "MediScript AI — Your prescription, finally readable",
    description:
      "Upload a handwritten prescription. Get structured medicines, dosages, and safety checks — with confidence scores.",
    type: "website",
    siteName: "MediScript AI",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
    >
      <body className="bg-paper text-ink antialiased min-h-screen flex flex-col font-body">
        <Header />
        <main className="flex-1 flex flex-col" id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
