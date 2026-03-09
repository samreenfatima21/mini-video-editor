import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto_Mono, Playfair_Display, Oswald, Dancing_Script, Bebas_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const robotoMono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const dancingScript = Dancing_Script({ variable: "--font-dancing-script", subsets: ["latin"] });
const bebasNeue = Bebas_Neue({ variable: "--font-bebas-neue", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrameCut — Video Editor",
  description: "Professional browser-based video editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl="/sign-in">
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${robotoMono.variable} ${playfair.variable} ${oswald.variable} ${dancingScript.variable} ${bebasNeue.variable} antialiased overflow-hidden`}
          style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
